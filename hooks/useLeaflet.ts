import { useEffect, useState } from 'react';

// Loads Leaflet (CSS + JS) from a CDN once and exposes the global `L`.
// This avoids adding a build-time dependency while still giving us a real,
// interactive OpenStreetMap. Requires internet access at runtime (for tiles).

let leafletPromise: Promise<any> | null = null;

const LEAFLET_VERSION = '1.9.4';
const CSS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const JS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CSS_URL;
      document.head.appendChild(link);
    }
    // JS
    const existing = document.querySelector(`script[src="${JS_URL}"]`) as HTMLScriptElement | null;
    if (existing && (window as any).L) {
      resolve((window as any).L);
      return;
    }
    const script = document.createElement('script');
    script.src = JS_URL;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.body.appendChild(script);
  });
  return leafletPromise;
}

export function useLeaflet() {
  const [L, setL] = useState<any>(typeof window !== 'undefined' ? (window as any).L : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadLeaflet()
      .then(lib => { if (mounted) setL(lib); })
      .catch(() => { if (mounted) setError('Unable to load the map.'); });
    return () => { mounted = false; };
  }, []);

  return { L, error };
}
