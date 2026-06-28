// ============================================================
// Notification deep-link helpers — shared by the bell dropdown (and any future
// notification center) so every entry navigates the same, predictable way.
// ============================================================

import { Notification } from '../types';

/**
 * Resolve the in-app path a notification should open. Prefers the stored
 * targetUrl; falls back to the report it references. Returns null when there is
 * nothing to open (caller shows a graceful message — never a blank page).
 */
export function resolveNotificationTarget(n: Notification): string | null {
  const url = (n.targetUrl && n.targetUrl.trim()) || (n.reportId ? `/report/${n.reportId}` : '');
  return url || null;
}

/**
 * Append `highlight=1` to a target path (preserving any existing query/hash) so
 * the destination page can briefly highlight + scroll to the relevant content.
 */
export function withHighlight(url: string): string {
  const hashIdx = url.indexOf('#');
  const hash = hashIdx !== -1 ? url.slice(hashIdx) : '';
  const path = hashIdx !== -1 ? url.slice(0, hashIdx) : url;
  if (/[?&]highlight=1\b/.test(path)) return url; // already present
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}highlight=1${hash}`;
}
