import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, Loader2, RefreshCw, Pencil } from 'lucide-react';
import { apiRequest } from '../../utils/api';

const RESEND_SECONDS = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface OtpResponse {
  message?: string;
  code?: string;
  verified?: boolean;
}

interface EmailVerificationProps {
  defaultEmail?: string;
  /** Fires as the user types: (email, isValid). */
  onEmailChange?: (email: string, valid: boolean) => void;
  /** Fires once the code is verified server-side. */
  onVerified?: (info: { email: string; verifiedAt: string }) => void;
  compact?: boolean;
}

/**
 * Email OTP verification widget (Brevo-backed).
 *
 * Flow: enter email → Send Verification Code → enter 6-digit code → Verify → Verified.
 * All validation is enforced by the backend (/api/auth/{send,verify,resend}-email-otp);
 * this component only reflects status and gates the parent form.
 */
export function EmailVerification({ defaultEmail = '', onEmailChange, onVerified, compact = false }: EmailVerificationProps) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [otp, setOtp] = useState('');
  const [phase, setPhase] = useState<'idle' | 'codeSent' | 'verified'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const timerRef = useRef<number | null>(null);
  const emailValid = EMAIL_REGEX.test(email.trim());

  // Keep the parent form's email in sync.
  useEffect(() => {
    if (onEmailChange) onEmailChange(email.trim(), emailValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

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

  useEffect(() => () => clearTimer(), []);

  // Shared call for both the initial send and a resend.
  const requestCode = async (path: '/api/auth/send-email-otp' | '/api/auth/resend-email-otp') => {
    setError('');
    setInfo('');
    if (!emailValid) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    setInfo('Sending…');
    const result = await apiRequest<OtpResponse>(path, {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
    setLoading(false);
    if (!result.ok) {
      setInfo('');
      setError(result.message || 'Could not send the verification code.');
      return;
    }
    setPhase('codeSent');
    setOtp('');
    setInfo('Verification code sent.');
    startResendTimer();
  };

  const verifyOtp = async () => {
    setError('');
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code from your email.'); return; }
    setLoading(true);
    const result = await apiRequest<OtpResponse>('/api/auth/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), otp: code }),
    });
    setLoading(false);
    if (!result.ok || !result.data?.verified) {
      // Surface friendly status text for the well-known error codes.
      const code2 = result.data?.code;
      if (code2 === 'OTP_EXPIRED') setError('Expired code. Please request a new one.');
      else if (code2 === 'OTP_TOO_MANY_ATTEMPTS') setError('Too many attempts. Please request a new code.');
      else setError(result.message || 'Invalid code.');
      return;
    }
    clearTimer();
    setResendIn(0);
    setInfo('Verified ✓');
    setPhase('verified');
    if (onVerified) onVerified({ email: email.trim(), verifiedAt: new Date().toISOString() });
  };

  const changeEmail = () => {
    clearTimer();
    setResendIn(0);
    setOtp('');
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
          <span className="text-sm font-semibold text-emerald-700">Email Verified ✓</span>
          <span className="text-sm text-emerald-700/80 ml-auto truncate">{email.trim()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Email <span className="text-red-500">*</span>
      </label>

      {/* Email input + Send Verification Code */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 flex-1 px-3 py-2.5 border border-luxury-border rounded-xl bg-white focus-within:ring-2 focus-within:ring-luxury-gold/40 focus-within:border-luxury-gold transition">
          <Mail className="w-4 h-4 text-luxury-gold flex-none" aria-hidden="true" />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={phase === 'codeSent' || loading}
            placeholder="you@example.com"
            className="flex-1 outline-none bg-transparent disabled:opacity-60"
            aria-invalid={Boolean(email) && !emailValid}
          />
          {emailValid && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-none" aria-hidden="true" />}
        </div>

        {phase !== 'codeSent' && (
          <button
            type="button"
            onClick={() => requestCode('/api/auth/send-email-otp')}
            disabled={loading || !emailValid}
            className="btn-luxury !py-2.5 whitespace-nowrap disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="w-4 h-4" aria-hidden="true" />}
            Send Verification Code
          </button>
        )}
      </div>

      {/* Helper / validity hint */}
      {phase === 'idle' && email && !emailValid && (
        <p className="text-xs text-[#e3a4ad]">Please enter a valid email address.</p>
      )}
      {phase === 'idle' && (
        <p className="text-xs text-gray-500">We’ll email you a one-time 6-digit code to confirm this address.</p>
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
            <button type="button" onClick={changeEmail} className="inline-flex items-center gap-1 text-gray-500 hover:text-luxury-gold">
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Change email
            </button>
            {resendIn > 0 ? (
              <span className="text-gray-400">Resend available in {resendIn}s</span>
            ) : (
              <button
                type="button"
                onClick={() => requestCode('/api/auth/resend-email-otp')}
                disabled={loading}
                className="inline-flex items-center gap-1 text-luxury-gold font-medium hover:underline disabled:opacity-60"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Resend code
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
    </div>
  );
}

export default EmailVerification;
