// ============================================================
// National ID verification client helpers — uploads to the server pipeline, plus
// file validation, image compression (keeps payloads small; CLIP downsizes to 224
// and PaddleOCR re-upscales server-side anyway) and display masking.
//
// The full pipeline runs server-side now: CLIP duplicate-detection + CLIP ID-card
// validation + CLIP front/back side detection, then PaddleOCR (Arabic+English) with
// rule-based semantic extraction of Full Name / National ID / Address. The browser
// only uploads the two card images and renders the masked result — no on-device OCR.
// ============================================================

import { apiRequest } from './api';

export const ALLOWED_ID_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const MAX_ID_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateIdImageFile(file: File): string | null {
  if (!ALLOWED_ID_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please use JPG, JPEG or PNG.';
  }
  if (file.size > MAX_ID_BYTES) return 'Image is too large. Maximum size is 10 MB.';
  if (file.size === 0) return 'The selected file is empty.';
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

// Downscale a data URL for upload (full-res original is kept for on-device OCR).
export function compressImage(dataUrl: string, maxDim = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, w, h);
      try { resolve(canvas.toDataURL('image/jpeg', quality)); } catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export interface IdStageResult {
  ok: boolean;
  stage?: string;
  message?: string;
  token?: string;
  maskedNationalId?: string;
  fullName?: string;
  verifiedAt?: string;
  frontConfidence?: number;
  backConfidence?: number;
  nameConfidence?: number;
  idConfidence?: number;
  idFaceDetected?: boolean;
  faceSimilarity?: number | null;
  similarity?: number;
}

async function postStage(path: string, body: Record<string, unknown>): Promise<IdStageResult> {
  const r = await apiRequest<IdStageResult>(path, { method: 'POST', body: JSON.stringify(body) });
  if (r.data && typeof r.data.ok === 'boolean') return r.data;
  return { ok: false, stage: 'network', message: r.message || 'Network error. Please try again.' };
}

// Step 1: validate the ID (CLIP) + detect the ID portrait face (InsightFace).
// Only the FRONT is required for face verification; backImage is optional.
export const analyzeId = (frontImage: string, backImage?: string) =>
  postStage('/api/verify-id/analyze', backImage ? { frontImage, backImage } : { frontImage });

// Step 2: face match — send the live selfie; the server compares it to the ID face.
export const checkId = (token: string, selfieImage: string) =>
  postStage('/api/verify-id/check', { token, selfieImage });

export const confirmId = (token: string) =>
  postStage('/api/verify-id/confirm', { token });

// Client-side helpers mirroring the server (for instant UX; server is authoritative).
export function cleanNationalId(raw: string): string {
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  const latin = String(raw || '').replace(/[٠-٩۰-۹]/g, (d) => {
    const a = AR.indexOf(d);
    if (a >= 0) return String(a);
    const f = FA.indexOf(d);
    return f >= 0 ? String(f) : d;
  });
  return latin.replace(/\D/g, '');
}

export function maskNationalId(id: string): string {
  if (!id || id.length < 4) return 'XXXX XXXX XXXXXX';
  return `XXXX XXXX XX${id.slice(-4)}`;
}
