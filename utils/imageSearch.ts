// ============================================================
// Image Search client helper — uploads a query image to the backend, which
// embeds it via the existing CLIP service and returns ranked, scored matches.
// ============================================================

import { apiRequest } from './api';
import { Report, ImageSearchResult } from '../types';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

// Client-side upload validation (the server re-validates too).
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please use JPG, PNG or WEBP.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image is too large. Maximum size is 10 MB.';
  }
  if (file.size === 0) {
    return 'The selected file is empty.';
  }
  return null;
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(file);
  });
}

export interface ImageSearchParams {
  image: string;          // data URL
  query?: string;
  category?: string;
  type?: string;          // 'lost' | 'found'
  governorate?: string;
  threshold?: number;     // 0..1 backend floor
}

export type ImageSearchResponse =
  | { ok: true; results: ImageSearchResult[]; corpus: number }
  | { ok: false; status: number; message: string };

// Ensures the report shape is consistent with the rest of the app (id + ISO dates).
function normalize(raw: any): ImageSearchResult {
  const r = raw.report || {};
  const report: Report = {
    ...r,
    id: r.id || r._id,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    dateLostFound: r.dateLostFound ? new Date(r.dateLostFound).toISOString() : new Date().toISOString(),
  };
  return {
    report,
    imageSimilarity: Number(raw.imageSimilarity) || 0,
    finalScore: Number(raw.finalScore) || 0,
    categoryMatch: Number(raw.categoryMatch) || 0,
    textSimilarity: Number(raw.textSimilarity) || 0,
    locationRelevance: Number(raw.locationRelevance) || 0,
  };
}

export async function searchByImage(params: ImageSearchParams): Promise<ImageSearchResponse> {
  const result = await apiRequest<{ results: any[]; corpus: number }>('/api/reports/search-by-image', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (result.ok && result.data && Array.isArray(result.data.results)) {
    return { ok: true, results: result.data.results.map(normalize), corpus: result.data.corpus || 0 };
  }
  return {
    ok: false,
    status: result.status,
    message: result.message || 'Image search failed. Please try again.',
  };
}

// Map an image-similarity percentage to a tier label (matches the spec examples).
export function similarityTier(percent: number): { label: string; tone: 'strong' | 'good' | 'related' } {
  if (percent >= 90) return { label: 'Potential Match', tone: 'strong' };
  if (percent >= 80) return { label: 'Possible Match', tone: 'good' };
  return { label: 'Related Item', tone: 'related' };
}
