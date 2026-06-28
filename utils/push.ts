// ============================================================
// Web Push client helpers — register the service worker, subscribe/unsubscribe
// with the backend's VAPID key, and report capability. All network calls go
// through the existing apiRequest wrapper (auth + JSON handled centrally).
// ============================================================

import { apiRequest } from './api';

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

// VAPID public keys are URL-safe base64; the browser needs them as a Uint8Array.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

export async function fetchPushConfig(): Promise<{ enabled: boolean; publicKey: string }> {
  const res = await apiRequest<{ enabled: boolean; publicKey: string }>('/api/push/public-key');
  return res.ok && res.data ? res.data : { enabled: false, publicKey: '' };
}

export type SubscribeResult = { ok: boolean; reason?: 'unsupported' | 'server-disabled' | 'denied' | 'no-sw' | 'save-failed' };

export async function subscribeToPush(): Promise<SubscribeResult> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };

  const { enabled, publicKey } = await fetchPushConfig();
  if (!enabled || !publicKey) return { ok: false, reason: 'server-disabled' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, reason: 'denied' };

  const reg = await getRegistration();
  if (!reg) return { ok: false, reason: 'no-sw' };
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      // Cast: lib.dom's typed-array generics reject Uint8Array<ArrayBufferLike>,
      // but a Uint8Array is a valid BufferSource for applicationServerKey.
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }

  const res = await apiRequest('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });
  return res.ok ? { ok: true } : { ok: false, reason: 'save-failed' };
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) {
    await apiRequest('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe().catch(() => {});
  }
}

export async function isCurrentlySubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return Boolean(sub);
}
