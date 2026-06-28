import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Camera, Trash2, User as UserIcon, AtSign, Mail, Phone, MapPin,
  ShieldCheck, BadgeCheck, CheckCircle2, AlertCircle, Activity as ActivityIcon,
  Calendar, Wallet, Lock, Sun, Moon, Save, Navigation, Globe, Building2,
  KeyRound, Star, ChevronRight, Fingerprint, Bell, BellRing,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { LocationPicker } from '../components/LocationPicker';
import { PhoneVerification } from '../components/auth/PhoneVerification';
import { IdVerificationSection } from '../components/IdVerificationSection';
import { isFirebaseConfigured } from '../firebase';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { formatDate } from '../utils/dateUtils';
import { UserLocation } from '../types';

const RADIUS_OPTIONS = [5, 10, 25, 50];

const MAX_BIO = 300;
const MAX_AVATAR_BYTES = 512 * 1024; // 512 KB before base64 encoding
const LOCATION_REQUIRED_MSG =
  'Location selection is required. Please choose your location on the map or use "Use My Current Location".';
const APPEARANCE_KEY = 'profile_appearance';

const emptyLocation = (): UserLocation => ({
  latitude: null, longitude: null, country: '', city: '', address: '',
  governorate: '', locationVerified: false, updatedAt: null,
});

// ---- small presentational helpers ----
function SectionHeader({ icon: Icon, title, desc, right }: { icon: any; title: string; desc?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,97,0.12)' }}>
          <Icon className="w-5 h-5 profile-gold" aria-hidden="true" />
        </span>
        <div>
          <h2 className="profile-title text-lg">{title}</h2>
          {desc && <p className="profile-help !mt-0.5">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function ReadonlyField({ label, value, icon: Icon, note }: { label: string; value: string; icon: any; note?: React.ReactNode }) {
  return (
    <div>
      <span className="profile-label">{label}</span>
      <div className="profile-readonly">
        <span className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 profile-gold flex-none" aria-hidden="true" />
          <span className="truncate">{value || '—'}</span>
        </span>
        {note}
      </div>
    </div>
  );
}

function VerifyRow({ label, desc, ok, okText, pendingText }: { label: string; desc: string; ok: boolean; okText: string; pendingText: string }) {
  return (
    <div className="profile-verify-item">
      <span className={`profile-verify-ic ${ok ? 'ok' : 'pending'}`}>
        {ok ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <AlertCircle className="w-5 h-5" aria-hidden="true" />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>{label}</p>
        <p className="profile-help !mt-0">{desc}</p>
      </div>
      <span className={`pill ${ok ? 'pill-success' : 'pill-warning'}`}>{ok ? okText : pendingText}</span>
    </div>
  );
}

export function Profile() {
  const { currentUser, updateProfile, getUserReports, signOut } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationSectionRef = useRef<HTMLElement>(null);
  const pushAlerts = usePushNotifications();

  const [appearance, setAppearance] = useState<'dark' | 'light'>(
    () => (typeof localStorage !== 'undefined' && localStorage.getItem(APPEARANCE_KEY) === 'light' ? 'light' : 'dark')
  );

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [location, setLocation] = useState<UserLocation>(emptyLocation());
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [avatarErr, setAvatarErr] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [locErr, setLocErr] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/signin'); return; }
    setName(currentUser.name || '');
    setBio(currentUser.bio || '');
    setAvatarUrl(currentUser.avatarUrl || '');
    setLocation(currentUser.location ? { ...emptyLocation(), ...currentUser.location } : emptyLocation());
    setRadiusKm(RADIUS_OPTIONS.includes(currentUser.notificationRadiusKm as number) ? (currentUser.notificationRadiusKm as number) : 10);
  }, [currentUser, navigate]);

  useEffect(() => {
    try { localStorage.setItem(APPEARANCE_KEY, appearance); } catch { /* ignore */ }
  }, [appearance]);

  if (!currentUser) return null;

  // Activity statistics derived from already-loaded reports (no extra fetch).
  const myReports = getUserReports(currentUser.id);
  const stats = {
    total: myReports.length,
    lost: myReports.filter((r) => r.type === 'lost').length,
    found: myReports.filter((r) => r.type === 'found').length,
    resolved: myReports.filter((r) => r.status === 'resolved').length,
  };
  const recentReports = [...myReports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // The client gate derives purely from coordinates + a resolved address; it
  // never trusts a client-set verified flag (the server re-verifies anyway).
  const hasVerifiedLocation = Boolean(location.latitude != null && location.longitude != null && location.address);
  const init = currentUser.location;
  const locationChanged =
    (location.latitude ?? null) !== (init?.latitude ?? null) ||
    (location.longitude ?? null) !== (init?.longitude ?? null) ||
    (location.address || '') !== (init?.address || '');
  const isDirty =
    name.trim() !== (currentUser.name || '') ||
    bio.trim() !== (currentUser.bio || '') ||
    avatarUrl !== (currentUser.avatarUrl || '') ||
    radiusKm !== (RADIUS_OPTIONS.includes(currentUser.notificationRadiusKm as number) ? currentUser.notificationRadiusKm : 10) ||
    locationChanged;
  const canSave = name.trim().length >= 2 && hasVerifiedLocation;

  const completionChecks = [
    { done: !!avatarUrl, label: 'Add a profile picture' },
    { done: name.trim().length >= 2, label: 'Add your full name' },
    { done: hasVerifiedLocation, label: 'Verify your location' },
    { done: bio.trim().length > 0, label: 'Write a short bio' },
  ];
  const completedCount = completionChecks.filter((c) => c.done).length;
  const pct = Math.round((completedCount / completionChecks.length) * 100);
  const nextStep = completionChecks.find((c) => !c.done)?.label;

  const legacyUnverified = !currentUser.location?.locationVerified;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarErr('');
    if (!file.type.startsWith('image/')) { setAvatarErr('Please choose an image file for your profile picture.'); return; }
    if (file.size > MAX_AVATAR_BYTES) { setAvatarErr('Profile picture must be under 512 KB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDiscard = () => {
    setName(currentUser.name || '');
    setBio(currentUser.bio || '');
    setAvatarUrl(currentUser.avatarUrl || '');
    setLocation(currentUser.location ? { ...emptyLocation(), ...currentUser.location } : emptyLocation());
    setRadiusKm(RADIUS_OPTIONS.includes(currentUser.notificationRadiusKm as number) ? (currentUser.notificationRadiusKm as number) : 10);
    setNameErr(''); setLocErr(null); setAvatarErr('');
  };

  const scrollToLocation = () => {
    locationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Move focus to the section so assistive tech lands on the error.
    requestAnimationFrame(() => locationSectionRef.current?.focus?.());
  };

  const handleSave = async () => {
    setNameErr('');
    setLocErr(null);
    if (name.trim().length < 2) { setNameErr('Please enter your full name.'); return; }
    if (!hasVerifiedLocation) {
      setLocErr(LOCATION_REQUIRED_MSG);
      scrollToLocation();
      return;
    }
    setIsSaving(true);
    const result = await updateProfile({ name: name.trim(), bio: bio.trim(), avatarUrl, location, notificationRadiusKm: radiusKm });
    setIsSaving(false);
    if (result.success) {
      toast.success('Profile updated successfully.');
    } else {
      toast.error(result.message || 'Could not save your profile. Please try again.');
      if (/location/i.test(result.message || '')) { setLocErr(result.message || LOCATION_REQUIRED_MSG); scrollToLocation(); }
    }
  };

  const handlePhoneVerified = async () => {
    const result = await updateProfile({ phoneVerified: true });
    if (result.success) {
      toast.success('Phone verified successfully.');
      setShowPhoneVerify(false);
    } else {
      toast.error(result.message || 'Could not save your verification. Please try again.');
    }
  };

  const handleEnablePush = async () => {
    const result = await pushAlerts.enable();
    if (result.ok) { toast.success('Nearby alerts enabled on this device.'); return; }
    const reasons: Record<string, string> = {
      unsupported: 'This browser does not support push notifications.',
      'server-disabled': 'Push delivery is not configured on the server yet.',
      denied: 'Notifications are blocked. Enable them in your browser settings.',
      'no-sw': 'Could not start the notification service worker.',
      'save-failed': 'Could not save your subscription. Please try again.',
    };
    toast.error(reasons[result.reason || 'save-failed'] || 'Could not enable alerts.');
  };

  const pushStatusText = !pushAlerts.supported
    ? 'This browser does not support push notifications.'
    : !pushAlerts.serverEnabled
    ? 'Live push is not configured on the server yet — in-app alerts still work.'
    : pushAlerts.permission === 'denied'
    ? 'Notifications are blocked in your browser settings.'
    : pushAlerts.subscribed
    ? 'Enabled on this device — you’ll get instant alerts.'
    : 'Enable instant alerts on this device.';

  const initial = (currentUser.name || '?').charAt(0).toUpperCase();
  const memberSince = currentUser.createdAt ? formatDate(currentUser.createdAt) : null;

  return (
    <div className="profile-shell" data-appearance={appearance}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm profile-text-2 hover:text-[var(--p-gold)] transition">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
          </button>
          <div className="profile-appearance" role="group" aria-label="Appearance">
            <button type="button" aria-pressed={appearance === 'dark'} aria-label="Dark appearance" onClick={() => setAppearance('dark')}>
              <Moon className="w-4 h-4" aria-hidden="true" />
            </button>
            <button type="button" aria-pressed={appearance === 'light'} aria-label="Light appearance" onClick={() => setAppearance('light')}>
              <Sun className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 1 — HERO */}
        <header className="profile-hero p-6 sm:p-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative">
              <div className="profile-avatar w-24 h-24 text-4xl">
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-full bg-[#0a0d18] border border-[#c9a961]/40 text-luxury-gold flex items-center justify-center shadow-lg hover:scale-105 transition"
                title="Change profile picture"
                aria-label="Change profile picture"
              >
                <Camera className="w-4 h-4" aria-hidden="true" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="profile-eyebrow">Profile</p>
              <h1 className="profile-title text-2xl sm:text-3xl truncate">{currentUser.name}</h1>
              <p className="text-sm profile-muted">@{currentUser.username}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="pill pill-brand">{currentUser.role === 'admin' ? <Star className="w-3 h-3" aria-hidden="true" /> : <UserIcon className="w-3 h-3" aria-hidden="true" />} {currentUser.role}</span>
                <span className="pill pill-success"><Mail className="w-3 h-3" aria-hidden="true" /> Email verified</span>
                {hasVerifiedLocation
                  ? <span className="pill pill-success"><MapPin className="w-3 h-3" aria-hidden="true" /> Location verified</span>
                  : <span className="pill pill-warning"><MapPin className="w-3 h-3" aria-hidden="true" /> Location required</span>}
                {memberSince && <span className="pill pill-info"><Calendar className="w-3 h-3" aria-hidden="true" /> Member since {memberSince}</span>}
              </div>
            </div>

            {avatarErr && <p className="text-xs text-[#e3a4ad] sm:self-start" role="alert">{avatarErr}</p>}
          </div>
        </header>

        {/* Legacy / unverified location banner */}
        {legacyUnverified && (
          <div className="profile-card !rounded-xl p-4 mt-5 flex items-start gap-3" style={{ borderColor: 'var(--p-card-border-strong)' }} role="status">
            <MapPin className="w-5 h-5 profile-gold flex-none mt-0.5" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-semibold" style={{ color: 'var(--p-text)' }}>Verify your location to keep your profile up to date.</p>
              <p className="profile-help !mt-1">We now require every member to confirm a real location on the map. Set yours below — it only takes a moment and helps reunite items faster.</p>
            </div>
          </div>
        )}

        {/* 2 — COMPLETENESS STRIP */}
        {pct < 100 && (
          <div className="profile-card is-hover p-5 mt-5 flex items-center gap-5">
            <div className="profile-ring relative" style={{ ['--pct' as any]: pct }}>
              <span>{pct}%</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="profile-title text-base">Complete your profile</p>
              <p className="profile-help !mt-0.5">{nextStep ? `Next: ${nextStep}` : 'Almost there!'}</p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {completionChecks.map((c) => (
                  <span key={c.label} className={`pill ${c.done ? 'pill-success' : 'pill-warning'} !text-[0.62rem]`}>
                    {c.done ? <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> : null}{c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3 — STAT TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { num: stats.total, label: 'Total reports', color: 'var(--p-text)' },
            { num: stats.resolved, label: 'Resolved', color: 'var(--p-stat-resolved)' },
            { num: stats.lost, label: 'Lost', color: 'var(--p-stat-lost)' },
            { num: stats.found, label: 'Found', color: 'var(--p-stat-found)' },
          ].map((s) => (
            <div key={s.label} className="profile-stat">
              <p className="profile-stat__num" style={{ color: s.color }}>{s.num}</p>
              <p className="profile-stat__label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 4 — ADDRESS & LOCATION (hero feature) */}
        <section
          ref={locationSectionRef}
          id="location"
          tabIndex={-1}
          className="profile-card p-5 sm:p-7 mt-6 outline-none scroll-mt-20"
          aria-labelledby="location-heading"
        >
          <SectionHeader
            icon={MapPin}
            title="Address & Location"
            desc="Pin your exact location — required to use the platform."
            right={hasVerifiedLocation
              ? <span className="pill pill-success"><BadgeCheck className="w-3 h-3" aria-hidden="true" /> Verified</span>
              : <span className="pill pill-warning">Required</span>}
          />
          <span id="location-heading" className="sr-only">Address and Location</span>

          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <LocationPicker value={location} onChange={setLocation} error={locErr} idPrefix="profile-loc" height={400} />

            <div className="space-y-4">
              {/* 5 — LOCATION VERIFICATION STATUS */}
              <div className="profile-card is-hover p-4" style={hasVerifiedLocation ? { borderColor: 'rgba(20,163,127,0.4)' } : undefined}>
                <p className="profile-eyebrow mb-3">Location Verification Status</p>
                <div className="flex items-center gap-3">
                  <span className={`profile-verify-ic ${hasVerifiedLocation ? 'ok' : 'pending'}`}>
                    {hasVerifiedLocation ? <ShieldCheck className="w-5 h-5" aria-hidden="true" /> : <MapPin className="w-5 h-5" aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>
                      {hasVerifiedLocation ? 'Location verified' : 'Location not set'}
                    </p>
                    <p className="profile-help !mt-0">
                      {hasVerifiedLocation ? 'Your coordinates and address are confirmed.' : 'Choose a point on the map to verify.'}
                    </p>
                  </div>
                </div>
                {location.governorate && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="pill pill-brand"><MapPin className="w-3 h-3" aria-hidden="true" /> Detected: {location.governorate}</span>
                  </div>
                )}
              </div>

              <div className="profile-card p-4">
                <p className="profile-eyebrow mb-2">Why we ask</p>
                <ul className="space-y-2 text-sm profile-text-2">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 profile-gold flex-none mt-0.5" aria-hidden="true" /> Faster matches for lost &amp; found items near you.</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 profile-gold flex-none mt-0.5" aria-hidden="true" /> Your precise address is private and never shown publicly.</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 profile-gold flex-none mt-0.5" aria-hidden="true" /> Coordinates are validated on our servers.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] mt-6 items-start">
          {/* MAIN COLUMN */}
          <div className="space-y-6">
            {/* 6 — PERSONAL INFORMATION */}
            <section className="profile-card p-5 sm:p-7">
              <SectionHeader icon={UserIcon} title="Personal Information" desc="Your identity on the platform." />
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="pf-name" className="profile-label">Full Name <span className="text-[#c4596d]">*</span></label>
                  <input
                    id="pf-name" type="text" value={name} onChange={(e) => { setName(e.target.value); if (nameErr) setNameErr(''); }}
                    className="profile-input" aria-invalid={!!nameErr} aria-describedby={nameErr ? 'pf-name-err' : undefined}
                    placeholder="e.g. John Smith"
                  />
                  {nameErr && <p id="pf-name-err" className="text-xs text-[#e3a4ad] mt-1.5" role="alert">{nameErr}</p>}
                </div>

                <ReadonlyField label="Username" value={`@${currentUser.username}`} icon={AtSign}
                  note={<span className="pill pill-info !text-[0.6rem]">Cannot be changed</span>} />
                <ReadonlyField label="Phone Number" value={currentUser.phone} icon={Phone}
                  note={<span className="pill pill-success !text-[0.6rem]">On file</span>} />
                <div className="sm:col-span-2">
                  <ReadonlyField label="Email" value={currentUser.email} icon={Mail}
                    note={<span className="pill pill-success !text-[0.6rem]"><CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Verified</span>} />
                  <p className="profile-help">Your email is private and managed securely — it can't be changed here.</p>
                </div>
              </div>
            </section>

            {/* 7 — ABOUT / BIO */}
            <section className="profile-card p-5 sm:p-7">
              <SectionHeader icon={ActivityIcon} title="About You" desc="A short description shown on your activity." />
              <label htmlFor="pf-bio" className="sr-only">About you</label>
              <textarea
                id="pf-bio" rows={4} value={bio} maxLength={MAX_BIO}
                onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
                className="profile-textarea resize-none" placeholder="Tell the community a little about yourself…"
                aria-describedby="pf-bio-count"
              />
              <p id="pf-bio-count" className="profile-help text-right">{bio.length}/{MAX_BIO}</p>
            </section>

            {/* 8 — ACCOUNT DETAILS */}
            <section className="profile-card p-5 sm:p-7">
              <SectionHeader icon={Building2} title="Account Details" desc="Read-only account metadata." />
              <div className="grid sm:grid-cols-2 gap-4">
                <ReadonlyField label="Role" value={currentUser.role} icon={Star} />
                <ReadonlyField label="Member Since" value={memberSince || '—'} icon={Calendar} />
                <ReadonlyField label="Country" value={location.country || '—'} icon={Globe} />
                <ReadonlyField label="Governorate" value={location.governorate || '—'} icon={MapPin} />
                <div className="rounded-xl p-4" style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid var(--p-card-border)' }}>
                  <p className="profile-help !mt-0">Points balance</p>
                  <p className="profile-title text-xl profile-gold">{currentUser.points ?? 0} pts</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(20,163,127,0.08)', border: '1px solid var(--p-card-border)' }}>
                  <p className="profile-help !mt-0">Wallet balance</p>
                  <p className="profile-title text-xl" style={{ color: 'var(--p-stat-resolved)' }}>{currentUser.balance ?? 0} EGP</p>
                </div>
              </div>
            </section>

            {/* IDENTITY VERIFICATION */}
            <section className="profile-card p-5 sm:p-7">
              <SectionHeader
                icon={BadgeCheck}
                title="Identity Verification"
                desc="Verify your Egyptian National ID to earn a trusted badge."
                right={currentUser.idVerified ? <span className="pill pill-success"><BadgeCheck className="w-3 h-3" aria-hidden="true" /> Verified</span> : <span className="pill pill-warning">Unverified</span>}
              />
              <IdVerificationSection />
            </section>

            {/* ACTIVITY */}
            <section className="profile-card p-5 sm:p-7">
              <SectionHeader icon={ActivityIcon} title="Activity" desc="Your most recent reports."
                right={<Link to="/my-reports" className="text-sm profile-gold inline-flex items-center gap-1 hover:underline">View all <ChevronRight className="w-4 h-4" aria-hidden="true" /></Link>} />
              {recentReports.length === 0 ? (
                <p className="profile-text-2 text-sm">You haven't posted any reports yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recentReports.map((r) => (
                    <li key={r.id}>
                      <Link to={`/report/${r.id}`} className="profile-readonly hover:border-[var(--p-card-border-strong)] transition">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className={`pill ${r.type === 'lost' ? 'pill-danger' : 'pill-success'} !text-[0.6rem]`}>{r.type}</span>
                          <span className="truncate text-sm">{r.title}</span>
                        </span>
                        <span className="profile-help !mt-0 flex-none">{formatDate(r.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* RAIL COLUMN */}
          <div className="space-y-6">
            {/* 9 — VERIFICATION STATUS */}
            <section className="profile-card p-5 sm:p-6">
              <SectionHeader icon={ShieldCheck} title="Verification" desc="Account trust signals." />
              <VerifyRow label="Email address" desc="Used for account recovery" ok okText="Verified" pendingText="Pending" />
              <VerifyRow
                label="Phone number"
                desc={currentUser.phone || 'Not provided'}
                ok={!!currentUser.phoneVerified}
                okText="✅ Verified"
                pendingText="⚪ Not verified"
              />
              <VerifyRow label="Map location" desc={hasVerifiedLocation ? (location.address || 'Confirmed') : 'Not set yet'} ok={hasVerifiedLocation} okText="Verified" pendingText="Required" />
              <VerifyRow
                label="Identity (National ID)"
                desc={currentUser.idVerified ? (currentUser.maskedNationalId || 'Government ID verified') : 'Government ID verification'}
                ok={!!currentUser.idVerified}
                okText="✓ Verified"
                pendingText="Not verified"
              />

              {/* Verify-later: confirm phone ownership via SMS OTP from Profile. */}
              {!currentUser.phoneVerified && isFirebaseConfigured && (
                showPhoneVerify ? (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--p-hairline)' }}>
                    <PhoneVerification
                      compact
                      defaultPhone={currentUser.phone}
                      onVerified={handlePhoneVerified}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPhoneVerify(true)}
                    className="btn-luxury !py-2 mt-4 w-full"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Verify my phone
                  </button>
                )
              )}
            </section>

            {/* NEARBY ALERTS */}
            <section className="profile-card p-5 sm:p-6">
              <SectionHeader icon={Bell} title="Nearby Alerts" desc="Lost items reported around you." />
              <label htmlFor="pf-radius" className="profile-label">Alert radius</label>
              <select
                id="pf-radius"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="profile-input"
              >
                {RADIUS_OPTIONS.map((km) => (
                  <option key={km} value={km}>Within {km} km</option>
                ))}
              </select>
              <p className="profile-help">
                You'll be alerted when a lost item is reported within this distance of your verified location. Saved with your profile changes.
              </p>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--p-hairline)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--p-text)' }}>
                      <BellRing className="w-4 h-4 profile-gold" aria-hidden="true" /> Browser push
                    </p>
                    <p className="profile-help !mt-0.5">{pushStatusText}</p>
                  </div>
                  {pushAlerts.supported && pushAlerts.serverEnabled && pushAlerts.permission !== 'denied' ? (
                    pushAlerts.subscribed ? (
                      <button type="button" onClick={() => void pushAlerts.disable()} disabled={pushAlerts.busy} className="btn-ghost !py-2 flex-none">
                        {pushAlerts.busy ? '…' : 'Turn off'}
                      </button>
                    ) : (
                      <button type="button" onClick={handleEnablePush} disabled={pushAlerts.busy} className="btn-luxury !py-2 flex-none">
                        {pushAlerts.busy ? '…' : 'Enable'}
                      </button>
                    )
                  ) : (
                    <span className="pill pill-warning flex-none">
                      {!pushAlerts.supported ? 'Unsupported' : pushAlerts.permission === 'denied' ? 'Blocked' : 'Unavailable'}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* 10 — SECURITY SETTINGS */}
            <section className="profile-card p-5 sm:p-6">
              <SectionHeader icon={Lock} title="Security" desc="Keep your account protected." />
              <p className="text-sm profile-text-2 mb-4">Email &amp; password are managed securely and never shared with other users.</p>
              <div className="space-y-2.5">
                <button type="button" disabled className="profile-readonly w-full text-left opacity-70 cursor-not-allowed" aria-disabled="true">
                  <span className="flex items-center gap-2"><KeyRound className="w-4 h-4 profile-gold" aria-hidden="true" /> Change password</span>
                  <span className="pill pill-info !text-[0.6rem]">Coming soon</span>
                </button>
                <button type="button" disabled className="profile-readonly w-full text-left opacity-70 cursor-not-allowed" aria-disabled="true">
                  <span className="flex items-center gap-2"><Fingerprint className="w-4 h-4 profile-gold" aria-hidden="true" /> Two-factor authentication</span>
                  <span className="pill pill-info !text-[0.6rem]">Coming soon</span>
                </button>
                {avatarUrl && (
                  <button type="button" onClick={handleRemoveAvatar} className="profile-readonly w-full text-left hover:border-[#a83246]/50 transition">
                    <span className="flex items-center gap-2 text-[#d28494]"><Trash2 className="w-4 h-4" aria-hidden="true" /> Remove profile picture</span>
                  </button>
                )}
                <button type="button" onClick={() => { signOut(); navigate('/signin'); }} className="profile-readonly w-full text-left hover:border-[#a83246]/50 transition">
                  <span className="flex items-center gap-2 text-[#d28494]"><Lock className="w-4 h-4" aria-hidden="true" /> Sign out everywhere</span>
                </button>
              </div>
            </section>

            {/* Rewards shortcut */}
            <Link to="/rewards" className="profile-card is-hover p-5 flex items-center justify-between group">
              <span className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,97,0.12)' }}>
                  <Wallet className="w-5 h-5 profile-gold" aria-hidden="true" />
                </span>
                <span>
                  <span className="block profile-title text-base">Rewards &amp; Wallet</span>
                  <span className="profile-help !mt-0">{currentUser.points ?? 0} pts · {currentUser.balance ?? 0} EGP</span>
                </span>
              </span>
              <ChevronRight className="w-5 h-5 profile-muted group-hover:translate-x-0.5 transition" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* 11 — STICKY SAVE BAR */}
      {isDirty && (
        <div className="profile-savebar" data-appearance={appearance}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {canSave
                ? <CheckCircle2 className="w-5 h-5 flex-none" style={{ color: '#34b894' }} aria-hidden="true" />
                : <AlertCircle className="w-5 h-5 flex-none profile-gold" aria-hidden="true" />}
              <span className="text-sm truncate" style={{ color: 'var(--p-text)' }}>
                {canSave ? 'You have unsaved changes.' : 'Verify your location to save.'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-none">
              <button type="button" onClick={handleDiscard} className="btn-ghost !py-2.5">Discard</button>
              <button
                type="button" onClick={handleSave} disabled={isSaving}
                aria-disabled={!canSave}
                className="btn-luxury !py-2.5 disabled:opacity-60"
                style={!canSave ? { filter: 'grayscale(0.35)', opacity: 0.85 } : undefined}
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
