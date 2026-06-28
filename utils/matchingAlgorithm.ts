import { Report, MatchResult, MatchExplanation } from '../types';
import { apiRequest } from './api';

/**
 * AI-style matching engine (client side).
 *
 * Mirrors the server's NLP heuristic so the UI can show instant matches:
 * TF-IDF style token cosine similarity + Jaccard token overlap, blended with
 * category, governorate/geo and date-proximity signals.
 * For the authoritative score (optionally LLM-reranked) we call the backend
 * via `fetchAIMatches`.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'of', 'to', 'with', 'for', 'my',
  'is', 'was', 'it', 'this', 'that', 'i', 'me', 'near', 'lost', 'found', 'color',
  'في', 'من', 'الى', 'إلى', 'على', 'عن', 'مع', 'هو', 'هي', 'هذا', 'هذه', 'كان',
  'فقدت', 'وجدت', 'لون', 'قرب', 'عند', 'يوم', 'كنت',
]);

function tokenize(text: string): string[] {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
  return tf;
}

function cosineSimilarity(a: string[], b: string[]): number {
  const tfA = termFrequency(a);
  const tfB = termFrequency(b);
  const vocab = new Set([...tfA.keys(), ...tfB.keys()]);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  vocab.forEach(term => {
    const x = tfA.get(term) || 0;
    const y = tfB.get(term) || 0;
    dot += x * y;
    magA += x * x;
    magB += y * y;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach(t => { if (setB.has(t)) intersection += 1; });
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function dateProximity(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0.3;
  const days = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
  if (days <= 1) return 1;      // same day
  if (days <= 3) return 0.85;   // within 1–3 days
  if (days <= 7) return 0.7;    // within a week
  if (days <= 14) return 0.55;  // within two weeks
  if (days <= 31) return 0.4;   // within a month
  if (days <= 90) return 0.25;  // within a quarter
  return 0.15;                  // very far apart
}

function geoProximity(a: Report, b: Report): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const dist = 2 * R * Math.asin(Math.sqrt(h));
  if (dist <= 1) return 1;
  if (dist <= 5) return 0.85;
  if (dist <= 15) return 0.65;
  if (dist <= 50) return 0.4;
  return 0.2;
}

// No-image weights (mirror of the backend's degraded model: the 40% image weight
// is removed and text/category/location/date renormalise to sum to 1). The client
// has no decoded pixels, so it always scores via this "missing image" path; the
// authoritative image-aware score comes from the backend.
const WEIGHTS_NO_IMAGE = { text: 0.5, category: 0.1667, location: 0.1667, date: 0.0833 };
// Matches the backend combiner so preview percentages never contradict the
// authoritative score (see server/utils/aiMatching.js).
const ENV_A = 0.40;
const ENV_B = 0.60;
const K_LD = 0.30;
const TEXT_LOW = 0.40;
const TXT_DIFF_CAP = 0.65;
const CAT_MISMATCH_CAP = 0.50;
const DEGRADED_CAP = 0.85;

interface BaseFactors {
  textSimilarity: number;
  categoryScore: number;
  locationScore: number;
  dateScore: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const round3 = (v: number) => Math.round(v * 1000) / 1000;

function computeBaseFactors(a: Report, b: Report): BaseFactors {
  const textA = tokenize(`${a.title} ${a.description}`);
  const textB = tokenize(`${b.title} ${b.description}`);
  const textSimilarity = clamp01(0.6 * cosineSimilarity(textA, textB) + 0.4 * jaccard(textA, textB));
  const categoryScore = a.category && a.category === b.category ? 1 : 0;

  let locationScore = geoProximity(a, b);
  if (locationScore === null) {
    if (a.governorate && b.governorate) {
      locationScore = a.governorate === b.governorate ? 0.85 : 0.15;
    } else {
      locationScore = 0.2 + 0.8 * jaccard(tokenize(a.location), tokenize(b.location));
    }
  }

  const dateScore = dateProximity(a.dateLostFound, b.dateLostFound);
  return { textSimilarity, categoryScore, locationScore: clamp01(locationScore), dateScore };
}

// No-image combiner — same non-linear model as the backend's degraded path:
// weighted base, capped by a text-driven identity envelope and a location/date
// plausibility discount, then the contradiction ceilings. Without a photo the
// score can never assert a perfect match (DEGRADED_CAP).
function combineNoImage(f: BaseFactors): number {
  const C = f.categoryScore >= 1 ? 1 : 0;
  const T = clamp01(f.textSimilarity);
  const L = clamp01(f.locationScore);
  const D = clamp01(f.dateScore);
  const w = WEIGHTS_NO_IMAGE;
  const base = T * w.text + C * w.category + L * w.location + D * w.date;
  const identity = T; // text alone carries identity when there is no image
  const ld = (L + D) / 2;
  const envelope = ENV_A + ENV_B * identity;
  const plausibility = 1 - K_LD * identity * (1 - ld);
  let overall = Math.min(base, envelope) * plausibility;
  if (T < TEXT_LOW) overall = Math.min(overall, TXT_DIFF_CAP);
  if (C < 1) overall = Math.min(overall, CAT_MISMATCH_CAP);
  overall = Math.min(overall, DEGRADED_CAP);
  return clamp01(overall);
}

// Client preview explanation. The browser has no embeddings, so the image is
// never compared here — the authoritative, vision-aware scores come from the
// backend (open the report detail page for those).
function buildExplanation(f: BaseFactors, overall: number): MatchExplanation {
  let text: string;
  if (f.textSimilarity >= 0.85) text = 'Descriptions are almost identical';
  else if (f.textSimilarity >= 0.6) text = 'High semantic similarity between descriptions';
  else if (f.textSimilarity >= 0.3) text = 'Some overlap between descriptions';
  else text = 'Descriptions are quite different';

  const category = f.categoryScore >= 1 ? 'Same category match' : 'Different categories';
  const location =
    f.locationScore >= 0.8 ? 'Nearby location match' : f.locationScore >= 0.4 ? 'Same region / governorate' : 'Different locations';
  const date =
    f.dateScore >= 0.8 ? 'Same day match' : f.dateScore >= 0.4 ? 'Reported within a few days' : 'Reported far apart in time';

  return {
    image: 'Image not compared in preview — open the report for full AI vision matching',
    text,
    category,
    location,
    date,
    summary: `Preview match (${Math.round(overall * 100)}%) from text and details — image not verified here`,
  };
}

export function similarityScore(a: Report, b: Report): number {
  return combineNoImage(computeBaseFactors(a, b));
}

/**
 * Local instant matching (image-blind preview / offline fallback). Mirrors the
 * backend's Stage-1 metadata filtering (type + category must match — visual
 * validation needs CLIP and so only runs server-side) and its no-image scoring
 * model, so preview percentages never contradict the authoritative result.
 */
export function findMatches(
  currentReport: Report,
  allReports: Report[],
  threshold: number = 0.7
): MatchResult[] {
  const oppositeType = currentReport.type === 'lost' ? 'found' : 'lost';
  const candidates = allReports.filter(
    r =>
      r.type === oppositeType &&
      r.id !== currentReport.id &&
      // Stage-1 Rule 2: categories must match, else reject before scoring.
      !!r.category && !!currentReport.category && r.category === currentReport.category
  );
  return candidates
    .map(candidate => {
      const f = computeBaseFactors(currentReport, candidate);
      const overall = combineNoImage(f);
      return {
        report: candidate,
        score: overall,
        overallConfidence: overall,
        finalScore: Math.round(overall * 100),
        imageSimilarity: null,
        textSimilarity: round3(f.textSimilarity),
        categoryMatch: round3(f.categoryScore),
        locationMatch: round3(f.locationScore),
        dateMatch: round3(f.dateScore),
        visionUsed: false,
        imageComputed: false,
        explanation: buildExplanation(f, overall),
      } as MatchResult;
    })
    .filter(m => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/**
 * Authoritative hybrid AI matches from the backend (image-aware: full two-stage
 * filtering + CLIP vision). On request failure it falls back to the local,
 * image-blind engine ONLY when `fallback` is true.
 *
 * For NOTIFICATIONS pass `fallback: false`: the local engine cannot run the
 * Stage-1 visual object check, so notifying from it could surface false
 * positives (e.g. a cat vs a dog with similar text). When the vision-aware
 * backend is unavailable we prefer to send no notification at all.
 */
export async function fetchAIMatches(
  reportId: string,
  fallbackReport: Report,
  allReports: Report[],
  threshold = 0.7,
  { fallback = true }: { fallback?: boolean } = {}
): Promise<MatchResult[]> {
  const result = await apiRequest<any[]>(`/api/reports/${reportId}/matches?threshold=${threshold}`);
  if (result.ok && Array.isArray(result.data)) {
    return result.data.map(item => ({
      report: {
        ...item.report,
        id: item.report.id || item.report._id,
      } as Report,
      score: item.score ?? item.overallConfidence ?? (item.finalScore != null ? item.finalScore / 100 : 0),
      overallConfidence: item.overallConfidence,
      finalScore: item.finalScore,
      imageSimilarity: item.imageSimilarity ?? null,
      textSimilarity: item.textSimilarity,
      categoryMatch: item.categoryMatch,
      locationMatch: item.locationMatch,
      dateMatch: item.dateMatch,
      contributions: item.contributions,
      visionAvailable: item.visionAvailable ?? item.visionUsed,
      visionUsed: item.visionUsed,
      imageComputed: item.imageComputed,
      visualValidation: item.visualValidation,
      textEngine: item.textEngine,
      explanation: item.explanation,
    }));
  }
  // Backend unavailable: only the image-blind local engine is left. Never use it
  // to drive notifications (no visual validation → false-positive risk).
  if (!fallback) return [];
  return findMatches(fallbackReport, allReports, threshold);
}
