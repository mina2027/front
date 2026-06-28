import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, AlertTriangle, EyeOff, ChevronDown, Check, X } from 'lucide-react';
import { Report, MatchResult, MatchExplanation } from '../types';
import { ConfidenceRing } from './ConfidenceRing';

interface MatchCardProps {
  /** Preferred: pass the full match result for the rich AI breakdown. */
  match?: MatchResult;
  /** Backward-compatible simple props. */
  report?: Report;
  score?: number;
  explanation?: MatchExplanation | string;
}

// Color tier for the final percentage: green ≥90, yellow 70–89, red <70.
function tierClasses(pct: number) {
  if (pct >= 90) return { text: 'text-emerald-700', bg: 'bg-emerald-500', soft: 'bg-emerald-50', label: 'Strong match' };
  if (pct >= 70) return { text: 'text-amber-700', bg: 'bg-amber-500', soft: 'bg-amber-50', label: 'Moderate match' };
  return { text: 'text-rose-700', bg: 'bg-rose-500', soft: 'bg-rose-50', label: 'Weak match' };
}

function Bar({ label, value, tone }: { label: string; value: number | null | undefined; tone: string }) {
  const pct = value == null ? 0 : Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-0.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{value == null ? 'N/A' : `${pct}%`}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Indicator({
  ok,
  label,
  points,
  max,
}: {
  ok: boolean;
  label: string;
  points?: number | null;
  max?: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
        ok ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
      {points != null && max != null && (
        <span className="opacity-70 font-semibold">+{points}/{max}</span>
      )}
    </span>
  );
}

export function MatchCard(props: MatchCardProps) {
  const report = props.match?.report ?? props.report;
  if (!report) return null;

  const m = props.match;
  const score = m?.score ?? props.score ?? 0;
  const pct = m?.finalScore ?? Math.round(score * 100);
  const tier = tierClasses(pct);
  const explanation = m?.explanation ?? props.explanation;
  const isStructured = explanation != null && typeof explanation === 'object';

  const imageSim = m?.imageSimilarity ?? null;
  const c = m?.contributions;
  const visionAvailable = m?.visionAvailable ?? m?.visionUsed ?? false;
  // Warning when the AI vision couldn't run, or when it ran and the photos differ.
  const imageMismatch = visionAvailable && imageSim != null && imageSim < 0.4;
  const visionUnavailable = !!m && !visionAvailable;
  // Exact, user-facing reason image comparison did not happen (from the backend).
  const imageNote =
    visionUnavailable && isStructured ? (explanation as MatchExplanation).image : null;

  const isLost = report.type === 'lost';
  const typeLabel = isLost ? 'LOST' : 'FOUND';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Clickable header */}
      <Link to={`/report/${report.id}`} className="group block focus:outline-none">
        <div className="flex items-start gap-4 p-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-100 to-fuchsia-100">
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt={report.title}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-violet-400 font-medium">
                No image
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span
                className={`text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded-md ${
                  isLost ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'
                }`}
              >
                {typeLabel}
              </span>
              <ConfidenceRing score={score} size={44} />
            </div>
            <h4 className="font-semibold text-sm text-luxury-navy line-clamp-1">{report.title}</h4>
            <p className="text-xs text-gray-600 line-clamp-1 mb-1">{report.description}</p>
            <p className="text-xs text-gray-500 inline-flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 text-cyan-600 flex-shrink-0" />
              <span className="truncate">{report.location}</span>
            </p>
          </div>
        </div>
      </Link>

      {/* AI breakdown (only when we have the structured match) */}
      {m && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${tier.text}`}>{pct}% · {tier.label}</span>
            {(imageMismatch || visionUnavailable) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">
                {visionUnavailable ? <EyeOff className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {visionUnavailable ? 'Vision unavailable' : 'Images differ'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Bar label={`Image${c?.image != null ? ` · +${c.image}/${c.max?.image ?? 40}` : ''}`} value={imageSim} tone="bg-violet-500" />
            <Bar label={`Text${c?.text != null ? ` · +${c.text}/${c.max?.text ?? 30}` : ''}`} value={m.textSimilarity} tone="bg-cyan-500" />
          </div>

          {imageNote && (
            <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1.5 text-[11px]">
              <EyeOff className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{imageNote}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <Indicator ok={(m.categoryMatch ?? 0) >= 1} label="Category" points={c?.category} max={c?.max?.category} />
            <Indicator ok={(m.locationMatch ?? 0) >= 0.4} label="Location" points={c?.location} max={c?.max?.location} />
            <Indicator ok={(m.dateMatch ?? 0) >= 0.4} label="Date" points={c?.date} max={c?.max?.date} />
            {m.textEngine === 'embedding' && (
              <span className="inline-flex items-center rounded-full bg-violet-50 text-violet-700 px-2 py-0.5 text-[10px] font-medium">
                AI semantic
              </span>
            )}
          </div>

          {isStructured && (
            <details className="group/expl rounded-lg bg-gray-50 border border-gray-100">
              <summary className="flex items-center justify-between cursor-pointer list-none px-3 py-2 text-xs font-medium text-gray-700">
                <span>{(explanation as MatchExplanation).summary}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open/expl:rotate-180" />
              </summary>
              <div className="px-3 pb-3 pt-0 space-y-1 text-[11px] text-gray-600">
                <p><span className="font-semibold text-gray-700">Image:</span> {(explanation as MatchExplanation).image}</p>
                <p><span className="font-semibold text-gray-700">Text:</span> {(explanation as MatchExplanation).text}</p>
                <p><span className="font-semibold text-gray-700">Category:</span> {(explanation as MatchExplanation).category}</p>
                <p><span className="font-semibold text-gray-700">Location:</span> {(explanation as MatchExplanation).location}</p>
                <p><span className="font-semibold text-gray-700">Date:</span> {(explanation as MatchExplanation).date}</p>
              </div>
            </details>
          )}

          <Link
            to={`/report/${report.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
          >
            Open report <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
