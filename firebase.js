// ============================================================
// Firebase initialization — uses the EXISTING Firebase project.
//
// The config values are read from Vite env vars (src/.env) rather than hardcoded,
// so no credentials are committed and the same code runs on localhost and in
// production. Paste your project's web config (Firebase console → Project
// settings → "Your apps" → SDK setup → Config) into src/.env as:
//
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
//   VITE_FIREBASE_PROJECT_ID=your-app
//   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
//   VITE_FIREBASE_MESSAGING_SENDER_ID=...
//   VITE_FIREBASE_APP_ID=...
//   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX   (optional, for Analytics)
//
// This file does NOT create a new project — it points the SDK at your existing one.
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// True only when the minimum required keys are present. The UI uses this to keep
// existing registration working (and show a clear notice) when Firebase isn't
// configured yet, instead of crashing on a phone-verification attempt.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Reuse an already-initialized app (safe under HMR / multiple imports).
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Localized SMS / reCAPTCHA where supported.
try { auth.useDeviceLanguage(); } catch (_) { /* no-op */ }

// Analytics is browser-only, needs a measurementId, and throws in unsupported
// environments — load it lazily and never let it break the app.
export let analytics = null;
if (typeof window !== 'undefined' && isFirebaseConfigured && firebaseConfig.measurementId) {
  analyticsIsSupported()
    .then((supported) => { if (supported) { try { analytics = getAnalytics(app); } catch (_) { /* ignore */ } } })
    .catch(() => { /* ignore */ });
}

export default app;
