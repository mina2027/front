import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck, UploadCloud, X, Loader2, CheckCircle2, AlertCircle, ScanLine,
  ScanFace, Camera, GitCompareArrows, BadgeCheck, RotateCcw,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  validateIdImageFile, readFileAsDataURL, analyzeId, checkId, confirmId,
} from '../utils/idVerification';

type Phase = 'upload' | 'processing' | 'selfie' | 'review' | 'done';
type StageKey = 'id-validation' | 'id-face' | 'selfie' | 'face-match';
type StageStatus = 'pending' | 'active' | 'done' | 'error';

const STAGES: { key: StageKey; label: string; icon: any }[] = [
  { key: 'id-validation', label: 'ID card validation (CLIP)', icon: ScanLine },
  { key: 'id-face', label: 'Face detection on ID', icon: ScanFace },
  { key: 'selfie', label: 'Selfie capture', icon: Camera },
  { key: 'face-match', label: 'Face comparison', icon: GitCompareArrows },
];

// Map a server `analyze` failure stage → which rows are done vs. errored.
const ANALYZE_STAGE_MAP: Record<string, { done: StageKey[]; error: StageKey }> = {
  upload: { done: [], error: 'id-validation' },
  vision: { done: [], error: 'id-validation' },
  'duplicate-image': { done: [], error: 'id-validation' },
  'duplicate-side': { done: [], error: 'id-validation' },
  'clip-validation': { done: [], error: 'id-validation' },
  'side-front': { done: [], error: 'id-validation' },
  'side-back': { done: [], error: 'id-validation' },
  'face-service': { done: ['id-validation'], error: 'id-face' },
  'id-face': { done: ['id-validation'], error: 'id-face' },
};
// Map a server `check` (face-match) failure stage → rows.
const CHECK_STAGE_MAP: Record<string, { done: StageKey[]; error: StageKey }> = {
  selfie: { done: ['id-validation', 'id-face'], error: 'selfie' },
  'selfie-face': { done: ['id-validation', 'id-face'], error: 'selfie' },
  'selfie-quality': { done: ['id-validation', 'id-face'], error: 'selfie' },
  'face-service': { done: ['id-validation', 'id-face', 'selfie'], error: 'face-match' },
  'face-match': { done: ['id-validation', 'id-face', 'selfie'], error: 'face-match' },
  'duplicate-face': { done: ['id-validation', 'id-face', 'selfie'], error: 'face-match' },
  'id-face': { done: ['id-validation'], error: 'id-face' },
};

const PENDING: Record<StageKey, StageStatus> = {
  'id-validation': 'pending', 'id-face': 'pending', selfie: 'pending', 'face-match': 'pending',
};

function UploadField({
  label, preview, error, onPick, onClear,
}: { label: string; preview: string | null; error: string | null; onPick: (f: File | undefined) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-1">
      <p className="profile-label">{label} <span className="text-[#c4596d]">*</span></p>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border bg-black/30 flex items-center justify-center" style={{ borderColor: 'var(--p-card-border)' }}>
          <img src={preview} alt={label} className="w-full max-h-60 object-contain" />
          <button
            type="button" onClick={onClear} aria-label={`Remove ${label}`}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button" onClick={() => inputRef.current?.click()}
          className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition hover:border-[var(--p-gold)]"
          style={{ borderColor: 'var(--p-card-border)' }}
        >
          <UploadCloud className="w-7 h-7 profile-gold" aria-hidden="true" />
          <span className="text-sm profile-text-2">Upload {label.toLowerCase()}</span>
          <span className="text-xs profile-muted">JPG / PNG · ≤ 10 MB</span>
        </button>
      )}
      <input
        ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      {error && <p className="text-xs text-[#e3a4ad] mt-1.5" role="alert">{error}</p>}
    </div>
  );
}

// Live selfie capture via the device camera, with a file-upload fallback.
function SelfieCapture({ onCapture, busy }: { onCapture: (dataUrl: string) => void; busy: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [camErr, setCamErr] = useState<string | null>(null);

  const stop = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
      } catch {
        setCamErr('Could not access the camera. You can upload a selfie photo instead.');
      }
    })();
    return () => { cancelled = true; stop(); };
  }, []);

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    let dataUrl: string;
    try { dataUrl = canvas.toDataURL('image/jpeg', 0.92); } catch { return; }
    stop();
    onCapture(dataUrl);
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    const err = validateIdImageFile(f);
    if (err) { setCamErr(err); return; }
    stop();
    onCapture(await readFileAsDataURL(f));
  };

  return (
    <div className="mt-1">
      <p className="profile-help !mt-0 mb-3">
        Look straight at the camera in good lighting, then capture a selfie. We compare it to the photo on your ID.
      </p>
      {!camErr && (
        <div className="rounded-xl overflow-hidden border bg-black/40" style={{ borderColor: 'var(--p-card-border)' }}>
          {/* mirror the preview so it feels natural */}
          <video ref={videoRef} playsInline muted className="w-full max-h-72 object-contain" style={{ transform: 'scaleX(-1)' }} />
        </div>
      )}
      {camErr && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-50/10 px-3 py-2.5 mb-2" role="alert">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-none" aria-hidden="true" />
          <span className="text-sm" style={{ color: 'var(--p-text-2)' }}>{camErr}</span>
        </div>
      )}
      <div className="flex items-center gap-2.5 mt-3">
        {!camErr ? (
          <button type="button" onClick={capture} disabled={busy} className="btn-luxury !py-2.5 flex-1 disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Camera className="w-4 h-4" aria-hidden="true" />}
            Capture selfie
          </button>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="btn-luxury !py-2.5 flex-1 disabled:opacity-60">
            <UploadCloud className="w-4 h-4" aria-hidden="true" /> Upload selfie
          </button>
        )}
      </div>
      <input
        ref={fileRef} type="file" accept="image/*" capture="user" className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}

export function IdVerificationSection() {
  const { currentUser, refreshMe } = useApp();

  const [frontData, setFrontData] = useState<string | null>(null);
  const [frontErr, setFrontErr] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>('upload');
  const [stageStatus, setStageStatus] = useState<Record<StageKey, StageStatus>>({ ...PENDING });
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [matching, setMatching] = useState(false);
  const [review, setReview] = useState<{ maskedNationalId: string; fullName: string; similarity: number | null; token: string } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const setStage = (key: StageKey, status: StageStatus) => setStageStatus((prev) => ({ ...prev, [key]: status }));

  const pickFront = async (file: File | undefined) => {
    if (!file) return;
    const err = validateIdImageFile(file);
    if (err) { setFrontErr(err); return; }
    setFrontErr(null);
    setFrontData(await readFileAsDataURL(file));
  };

  const resetAll = () => {
    setPhase('upload');
    setStageStatus({ ...PENDING });
    setError(null);
    setReview(null);
    setToken(null);
    setMatching(false);
  };

  // Step 1: validate the ID (CLIP) + detect the ID portrait face (InsightFace).
  const startVerification = async () => {
    if (!frontData) return;
    setPhase('processing');
    setError(null);
    setStageStatus({ ...PENDING });
    setStage('id-validation', 'active');

    try {
      const analysis = await analyzeId(frontData);
      if (!analysis.ok) {
        const map = ANALYZE_STAGE_MAP[analysis.stage || ''] || { done: [], error: 'id-validation' as StageKey };
        map.done.forEach((k) => setStage(k, 'done'));
        setStage(map.error, 'error');
        setError(analysis.message || 'Verification failed.');
        return;
      }
      setStage('id-validation', 'done');
      setStage('id-face', 'done');
      setToken(analysis.token as string);
      setStage('selfie', 'active');
      setPhase('selfie');
    } catch {
      setStage('id-validation', 'error');
      setError('Verification failed. Please try again.');
    }
  };

  // Step 2: face match — selfie vs ID portrait.
  const onSelfie = async (selfie: string) => {
    if (!token) return;
    setMatching(true);
    setError(null);
    setStage('selfie', 'done');
    setStage('face-match', 'active');
    setPhase('processing');
    try {
      const checked = await checkId(token, selfie);
      if (!checked.ok) {
        const map = CHECK_STAGE_MAP[checked.stage || ''] || { done: ['id-validation', 'id-face'], error: 'face-match' as StageKey };
        map.done.forEach((k) => setStage(k, 'done'));
        setStage(map.error, 'error');
        setError(checked.message || 'Face verification failed.');
        // Recoverable selfie/match errors return the user to the camera. A
        // duplicate-face rejection is TERMINAL — retaking the selfie won't help.
        const recoverable = ['selfie', 'selfie-face', 'selfie-quality', 'face-match'].includes(checked.stage || '');
        if (recoverable) {
          setStage('selfie', 'active');
          setStage('face-match', 'pending');
          setPhase('selfie');
        }
        return;
      }
      setStage('face-match', 'done');
      setReview({
        maskedNationalId: checked.maskedNationalId || '',
        fullName: checked.fullName || '',
        similarity: checked.faceSimilarity ?? null,
        token,
      });
      setPhase('review');
    } catch {
      setStage('face-match', 'error');
      setError('Face verification failed. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  const confirmVerification = async () => {
    if (!review) return;
    setConfirming(true);
    const result = await confirmId(review.token);
    setConfirming(false);
    if (result.ok) {
      setPhase('done');
      await refreshMe();
    } else {
      setError(result.message || 'Could not complete verification. Please try again.');
    }
  };

  // ---- Already verified ----
  if (currentUser?.idVerified) {
    return (
      <div className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: 'rgba(20,163,127,0.4)', background: 'rgba(20,163,127,0.08)' }}>
        <span className="profile-verify-ic ok"><BadgeCheck className="w-5 h-5" aria-hidden="true" /></span>
        <div className="min-w-0">
          <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--p-text)' }}>
            ✓ Verified User
            <span className="pill pill-success !text-[0.6rem]">Identity verified</span>
          </p>
          <p className="profile-help !mt-0.5">
            {currentUser.maskedNationalId || 'XXXX XXXX XX••••'}
            {currentUser.idVerifiedAt ? ` · ${new Date(currentUser.idVerifiedAt).toLocaleDateString()}` : ''}
          </p>
        </div>
      </div>
    );
  }

  // ---- Success ----
  if (phase === 'done') {
    return (
      <div className="text-center py-6 animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(20,163,127,0.14)' }}>
          <CheckCircle2 className="w-9 h-9" style={{ color: '#14a37f' }} aria-hidden="true" />
        </div>
        <p className="profile-title text-lg">Your identity has been successfully verified.</p>
        <p className="profile-help !mt-1">Your face matched the photo on your National ID. You now have a verified badge.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="profile-help !mt-0 mb-4">
        Upload the front of your Egyptian National ID, then take a quick selfie. We confirm it's a real ID (CLIP)
        and that your face matches the ID photo (InsightFace) — all processed on our secure AI service. We never
        store your raw ID number or face photos publicly.
      </p>

      {/* Step 1: front upload */}
      {phase === 'upload' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <UploadField label="Front ID card" preview={frontData} error={frontErr} onPick={pickFront} onClear={() => setFrontData(null)} />
          </div>
          <button
            type="button" onClick={startVerification} disabled={!frontData}
            className="btn-luxury w-full mt-4 disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Start Verification
          </button>
        </>
      )}

      {/* Stepper */}
      {(phase === 'processing' || phase === 'selfie' || phase === 'review') && (
        <div className="space-y-2.5" aria-live="polite">
          {STAGES.map((s) => {
            const st = stageStatus[s.key];
            return (
              <div key={s.key} className="flex items-center gap-3">
                <span className={`profile-verify-ic ${st === 'done' ? 'ok' : st === 'error' ? '' : 'pending'}`} style={st === 'error' ? { background: 'rgba(168,50,70,0.15)', color: '#e3a4ad' } : undefined}>
                  {st === 'active' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    : st === 'done' ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    : st === 'error' ? <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    : <s.icon className="w-4 h-4" aria-hidden="true" />}
                </span>
                <p className="text-sm flex-1 min-w-0" style={{ color: st === 'pending' ? 'var(--p-muted)' : 'var(--p-text)' }}>{s.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 2: selfie capture */}
      {phase === 'selfie' && token && (
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'var(--p-card-border)', background: 'var(--p-readonly-bg)' }}>
          <SelfieCapture onCapture={onSelfie} busy={matching} />
        </div>
      )}

      {/* Error */}
      {error && phase !== 'review' && (
        <div className="mt-4">
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5" role="alert">
            <AlertCircle className="w-4 h-4 text-red-600 flex-none" aria-hidden="true" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
          {phase !== 'selfie' && (
            <button type="button" onClick={resetAll} className="btn-ghost !py-2 mt-3">
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Try again
            </button>
          )}
        </div>
      )}

      {/* Review */}
      {phase === 'review' && review && (
        <div className="mt-5 rounded-xl border p-4 animate-fade-in" style={{ borderColor: 'var(--p-card-border)', background: 'var(--p-readonly-bg)' }}>
          <p className="profile-eyebrow mb-3">Review your details</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="profile-help !mt-0">Full name</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>{review.fullName || '—'}</p>
            </div>
            <div>
              <p className="profile-help !mt-0">National ID (masked)</p>
              <p className="lp-coord text-sm font-semibold" style={{ color: 'var(--p-text)' }}>{review.maskedNationalId || 'XXXX XXXX XX----'}</p>
            </div>
            {review.similarity != null && (
              <div>
                <p className="profile-help !mt-0">Face match</p>
                <p className="text-sm font-semibold" style={{ color: '#14a37f' }}>
                  {Math.round(review.similarity * 100)}% match
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-4">
            <button type="button" onClick={resetAll} className="btn-ghost !py-2.5">Cancel</button>
            <button type="button" onClick={confirmVerification} disabled={confirming} className="btn-luxury !py-2.5 flex-1 disabled:opacity-60">
              {confirming ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <BadgeCheck className="w-4 h-4" aria-hidden="true" />}
              Confirm Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
