import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, AtSign, Phone, Lock, Sparkles, MapPin, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { LocationPicker } from '../components/LocationPicker';
import { EmailVerification } from '../components/auth/EmailVerification';
import { UserLocation } from '../types';

const LOCATION_REQUIRED_MSG =
  'Location selection is required. Please choose your location on the map or use "Use My Current Location".';

const emptyLocation = (): UserLocation => ({
  latitude: null, longitude: null, country: '', city: '', address: '',
  governorate: '', locationVerified: false, updatedAt: null,
});

export function SignUp() {
  const { signUp } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: '', username: '', phone: '', email: '', password: '', confirmPassword: '',
  });
  const [location, setLocation] = useState<UserLocation>(emptyLocation());
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [locError, setLocError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const hasVerifiedLocation = Boolean(location.latitude != null && location.longitude != null && location.address);

  // Validate step 1 then advance. Never submits the form (type="button").
  const goToLocation = () => {
    setError('');
    if (!form.name.trim() || !form.username.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all the fields.');
      return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!emailVerified) { setError('Please verify your email address to continue.'); return; }
    setStep(2);
  };

  // Only the final step's button is type="submit"; we still guard here so an
  // autofill+Enter on step 1 can never create an account without a location.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2) { goToLocation(); return; }
    setError('');
    setLocError(null);
    if (!hasVerifiedLocation) { setLocError(LOCATION_REQUIRED_MSG); return; }
    if (!emailVerified) { setStep(1); setError('Please verify your email address to continue.'); return; }

    setIsSubmitting(true);
    const result = await signUp({
      name: form.name.trim(),
      username: form.username.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
      location,
      emailVerified,
      emailVerifiedAt,
    });
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message || 'Could not create the account');
      if (/location/i.test(result.message || '')) { setLocError(result.message || LOCATION_REQUIRED_MSG); }
      return;
    }
    navigate('/browse');
  };

  const inputWrap =
    'flex items-center gap-2 mt-1 w-full px-3 py-2.5 border border-luxury-border rounded-xl bg-white focus-within:ring-2 focus-within:ring-luxury-gold/40 focus-within:border-luxury-gold transition';

  return (
    <div className="min-h-screen bg-luxury-app flex items-center justify-center px-4 py-12">
      <div className={`w-full ${step === 2 ? 'max-w-3xl' : 'max-w-md'} bg-white p-6 sm:p-8 rounded-2xl shadow-luxury border border-luxury-border transition-all`}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-luxury-gold" />
          <h1 className="text-2xl font-bold text-luxury-navy">Create your account</h1>
        </div>
        <p className="text-sm text-gray-600 mb-5">Sign up and start posting lost &amp; found reports.</p>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6" aria-label={`Step ${step} of 2`}>
          {[{ n: 1, label: 'Account' }, { n: 2, label: 'Location' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border ${
                  step >= (s.n as 1 | 2) ? 'aurora-gradient text-[#0a0d18] border-transparent' : 'border-luxury-border text-gray-500'
                }`}>
                  {step > s.n ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : s.n}
                </span>
                <span className={`text-sm font-medium ${step >= (s.n as 1 | 2) ? 'text-luxury-navy' : 'text-gray-500'}`}>{s.label}</span>
              </div>
              {i === 0 && <div className="flex-1 h-px bg-luxury-border" />}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 rounded-xl text-sm" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-sm font-medium text-gray-700">Full name</label>
                <div className={inputWrap}>
                  <User className="w-4 h-4 text-luxury-gold" aria-hidden="true" />
                  <input value={form.name} onChange={(e) => update('name', e.target.value)} type="text" required className="flex-1 outline-none bg-transparent" placeholder="e.g., John Smith" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                <div className={inputWrap}>
                  <AtSign className="w-4 h-4 text-luxury-gold" aria-hidden="true" />
                  <input value={form.username} onChange={(e) => update('username', e.target.value)} type="text" required className="flex-1 outline-none bg-transparent" placeholder="username" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone number</label>
                <div className={inputWrap}>
                  <Phone className="w-4 h-4 text-luxury-gold" aria-hidden="true" />
                  <input value={form.phone} onChange={(e) => update('phone', e.target.value)} type="tel" inputMode="tel" autoComplete="tel" required className="flex-1 outline-none bg-transparent" placeholder="01012345678" />
                </div>
              </div>
              {/* Email + 6-digit OTP verification (Brevo). Keeps form.email in sync
                  and flips emailVerified on a successful, server-validated OTP. */}
              <EmailVerification
                defaultEmail={form.email}
                onEmailChange={(value, valid) => {
                  update('email', value);
                  if (!valid && emailVerified) setEmailVerified(false);
                }}
                onVerified={({ email, verifiedAt }) => {
                  update('email', email);
                  setEmailVerified(true);
                  setEmailVerifiedAt(verifiedAt);
                }}
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className={inputWrap}>
                  <Lock className="w-4 h-4 text-luxury-gold" aria-hidden="true" />
                  <input value={form.password} onChange={(e) => update('password', e.target.value)} type="password" required className="flex-1 outline-none bg-transparent" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Confirm password</label>
                <div className={inputWrap}>
                  <Lock className="w-4 h-4 text-luxury-gold" aria-hidden="true" />
                  <input value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} type="password" required className="flex-1 outline-none bg-transparent" />
                </div>
              </div>

              <button type="button" onClick={goToLocation} className="btn-luxury w-full">
                Continue to location <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-luxury-border" style={{ background: 'rgba(201,169,97,0.08)' }}>
                <ShieldCheck className="w-5 h-5 text-luxury-gold flex-none mt-0.5" aria-hidden="true" />
                <p className="text-sm text-luxury-navy">
                  A verified location is <strong>required</strong> to register. Search, tap the map, or use your current location.
                </p>
              </div>

              <LocationPicker value={location} onChange={setLocation} error={locError} idPrefix="signup-loc" height={360} />

              <div className="flex items-center gap-2.5">
                <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-ghost !py-3">
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
                </button>
                <button type="submit" disabled={isSubmitting} aria-disabled={!hasVerifiedLocation} className="btn-luxury flex-1" style={!hasVerifiedLocation ? { filter: 'grayscale(0.35)', opacity: 0.85 } : undefined}>
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  {isSubmitting ? 'Creating account…' : 'Create account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account? <Link to="/signin" className="text-luxury-gold font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
