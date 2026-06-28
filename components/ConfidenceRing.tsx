import React from 'react';

interface ConfidenceRingProps {
  /** 0..1 (e.g. 0.87) or 0..100 (e.g. 87) — both accepted */
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Signature Aurora confidence visual used for AI match scoring.
 * Renders a circular ring whose color tier auto-applies:
 *   0–40 %  gray   → "Possible"
 *  40–70 %  cyan   → "Likely"
 *  70–90 %  violet → "Strong"
 *  90–100 % aurora animated → "Almost certain"
 */
export function ConfidenceRing({ score, size = 52, label, className = '' }: ConfidenceRingProps) {
  const pct = Math.max(0, Math.min(100, score > 1 ? score : score * 100));
  const tier =
    pct >= 90 ? 'certain'
    : pct >= 70 ? 'strong'
    : pct >= 40 ? 'likely'
    : 'possible';

  return (
    <div
      className={`confidence-ring ${className}`}
      data-tier={tier}
      style={{
        width: size,
        height: size,
        ['--pct' as never]: pct,
      } as React.CSSProperties}
      role="img"
      aria-label={label ?? `Match confidence ${Math.round(pct)} percent`}
      title={label ?? `${Math.round(pct)}% match`}
    >
      <span>{Math.round(pct)}%</span>
    </div>
  );
}
