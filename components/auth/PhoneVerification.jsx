import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Phone, ShieldCheck, CheckCircle2, AlertCircle, Loader2, RefreshCw, Pencil } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../firebase';
import { normalizeEgyptPhone } from '../../utils/egyptPhone';

const RESEND_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;

// Map Firebase Auth error codes → friendly, actionable messages.
function mapFirebaseError(err) {
  const code = (err && err.code) || '';
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'That phone number is invalid. Please check it and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait a while and try again.';
    case 'auth/invalid-verification-code':
      return 'The code you entered is incorrect. Please try again.';
    case 'auth/code-expired':
      return 'This code has expired. Please request a new one.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/invalid-app-credential':
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. This usually means the current domain isn’t in Firebase Authorized Domains, the API key is restricted, or a test number is needed. (See setup notes.)';
    case 'auth/missing-phone-number':
      return 'Please enter your phone number.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later.';
    default:
      return (err && err.message) ? err.message.replace('Firebase: ', '') : 'Something went wrong. Please try again.';
  }
}

/**
 * Firebase Phone Authentication (SMS OTP) verification widget.
 *
 * Props:
 *   - defaultPhone:   initial phone value
 *   - onPhoneChange:  (e164OrRaw, isValid) => void — fires as the user types
 *   - onVerified:     ({ phone, phoneVerified, verifiedAt }) => void — on OTP success
 *   - compact:        tighter layout (used on the Profile page)
 */
export function PhoneVerification({ defaultPhone = '', onPhoneChange, onVerified, compact = false }) {
  const [phone, setPhone] = useState(defaultPhone || '');
  const [otp, setOtp] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | codeSent | verified
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const containerRef = useRef(null);
  const recaptchaRef = useRef(null);
  const confirmationRef = useRef(null);
  const timerRef = useRef(null);

  const norm = normalizeEgyptPhone(phone);

  // Keep the parent form in sync with the typed phone (E.164 when valid).
  useEffect(() => {
    if (onPhoneChange) onPhoneChange(norm.ok ? norm.e164 : phone, norm.ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const clearTimer = () => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startResendTimer = useCallback(() => {
    clearTimer();
    setResendIn(RESEND_SECONDS);
    timerRef.current = window.setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) { clearTimer(); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear(); } catch (_) { /* ignore */ }
      recaptchaRef.current = null;
    }
  };

  // Fresh invisible reCAPTCHA per send (robust against a consumed/expired widget).
  const buildRecaptcha = () => {
    resetRecaptcha();
    recaptchaRef.current = new RecaptchaVerifier(auth, containerRef.current, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => resetRecaptcha(),
    });
    return recaptchaRef.current;
  };

  // Clean up on unmount.
  useEffect(() => () => { clearTimer(); resetRecaptcha(); }, []);

  const sendOtp = async () => {
    setError('');
    setInfo('');
    if (!norm.ok) { setError(norm.error || 'Please enter a valid Egyptian phone number.'); return; }
    if (!isFirebaseConfigured) {
      setError('Phone verification is not configured on this site yet.');
      return;
    }
    setLoading(true);
    try {
      const verifier = buildRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, norm.e164, verifier);
      confirmationRef.current = confirmation;
      setAttempts(0);
      setPhase('codeSent');
      setInfo(`A 6-digit code was sent to ${norm.e164}.`);
      startResendTimer();
    } catch (err) {
      setError(mapFirebaseError(err));
      resetRecaptcha(); // allow a clean retry
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    if (!confirmationRef.current) { setError('Please request a code first.'); return; }
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      setError('Too many incorrect attempts. Please resend a new code.');
      return;
    }
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code from the SMS.'); return; }

    setLoading(true);
    try {
      const cred = await confirmationRef.current.confirm(code);
      const verifiedPhone = (cred && cred.user && cred.user.phoneNumber) || norm.e164;
      clearTimer();
      setPhase('verified');
      setInfo('Phone verified successfully.');
      if (onVerified) {
        onVerified({ phone: verifiedPhone, phoneVerified: true, verifiedAt: new Date().toISOString() });
      }
    } catch (err) {
      setAttempts((a) => a + 1);
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const changeNumber = () => {
    confirmationRef.current = null;
    resetRecaptcha();
    clearTimer();
    setResendIn(0);
    setOtp('');
    setAttempts(0);
    setError('');
    setInfo('');
    setPhase('idle');
  };

  // ---------- Verified state ----------
  if (phase === 'verified') {
    return (
      <div className={compact ? '' : 'space-y-1'}>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 animate-fade-in" role="status">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none" aria-hidden="true" />
          <span className="text-sm font-semibold text-emerald-700">✅ Phone Verified Successfully</span>
          <span className="text-sm text-emerald-700/80 ml-auto truncate">{norm.ok ? norm.e164 : phone}</span>
        </div>
      </div>
    );
  }

  const notConfigured = !isFirebaseConfigured;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Mobile number <span className="text-red-500">*</span>
      </label>

      {/* Phone input + Send OTP */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 flex-1 px-3 py-2.5 border border-luxury-border rounded-xl bg-white focus-within:ring-2 focus-within:ring-luxury-gold/40 focus-within:border-luxury-gold transition">
          <Phone className="w-4 h-4 text-luxury-gold flex-none" aria-hidden="true" />
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={phase === 'codeSent' || loading}
            placeholder="01012345678"
            className="flex-1 outline-none bg-transparent disabled:opacity-60"
            aria-invalid={Boolean(phone) && !norm.ok}
          />
          {norm.ok && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-none" aria-hidden="true" />}
        </div>

        {phase !== 'codeSent' && !notConfigured && (
          <button
            type="button"
            onClick={sendOtp}
            disabled={loading || !norm.ok}
            className="btn-luxury !py-2.5 whitespace-nowrap disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="w-4 h-4" aria-hidden="true" />}
            Send OTP
          </button>
        )}
      </div>

      {/* Helper / validity hint */}
      {phase === 'idle' && phone && !norm.ok && (
        <p className="text-xs text-[#e3a4ad]">{norm.error}</p>
      )}
      {phase === 'idle' && !notConfigured && (
        <p className="text-xs text-gray-500">We’ll text you a one-time code to confirm this number.</p>
      )}

      {/* Graceful notice when Firebase isn't configured (registration still works) */}
      {notConfigured && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5" role="status">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-none mt-0.5" aria-hidden="true" />
          <p className="text-xs text-amber-800">
            SMS verification isn’t configured yet, so this number can’t be verified right now. You can still continue.
          </p>
        </div>
      )}

      {/* OTP input + Verify + Resend */}
      {phase === 'codeSent' && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="flex-1 px-4 py-2.5 border border-luxury-border rounded-xl bg-white outline-none text-center text-lg tracking-[0.5em] font-mono focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold transition"
              aria-label="6-digit verification code"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="btn-luxury !py-2.5 whitespace-nowrap disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
              Verify
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button type="button" onClick={changeNumber} className="inline-flex items-center gap-1 text-gray-500 hover:text-luxury-gold">
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Change number
            </button>
            {resendIn > 0 ? (
              <span className="text-gray-400">Resend OTP in {resendIn}s</span>
            ) : (
              <button type="button" onClick={sendOtp} disabled={loading} className="inline-flex items-center gap-1 text-luxury-gold font-medium hover:underline disabled:opacity-60">
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alerts */}
      {info && !error && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5" role="status">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-none" aria-hidden="true" />
          <span className="text-xs text-blue-800">{info}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5" role="alert">
          <AlertCircle className="w-4 h-4 text-red-600 flex-none" aria-hidden="true" />
          <span className="text-xs text-red-700">{error}</span>
        </div>
      )}

      {/* Invisible reCAPTCHA mounts here */}
      <div ref={containerRef} id="recaptcha-container" />
    </div>
  );
}

export default PhoneVerification;
