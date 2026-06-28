import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MapPin, Crosshair, Search, CheckCircle2, AlertCircle, X, Navigation, Loader2,
} from 'lucide-react';
import { useLeaflet } from '../hooks/useLeaflet';
import { useDebounce } from '../hooks/useDebounce';
import { reverseGeocode, searchLocations, GeocodingError, SearchResult } from '../utils/geocoding';
import { EGYPT_CENTER, nearestGovernorate } from '../constants/egypt';
import { UserLocation } from '../types';

interface LocationPickerProps {
  value: UserLocation | null;
  onChange: (location: UserLocation) => void;
  height?: number;
  /** External validation error to surface (e.g. "Location is required"). */
  error?: string | null;
  /** Prefix to keep DOM ids unique when multiple pickers are on a page. */
  idPrefix?: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading'; msg: string }
  | { kind: 'success'; msg: string }
  | { kind: 'error'; msg: string };

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

// Gold teardrop marker rendered as a DivIcon — avoids depending on Leaflet's
// default marker image assets and keeps the pin on-brand.
const PIN_HTML = `
<svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="lpg" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f0e5c8"/><stop offset="0.5" stop-color="#c9a961"/><stop offset="1" stop-color="#8b6914"/>
    </linearGradient>
  </defs>
  <path d="M15 0C7 0 0 6.4 0 15c0 10.2 13.1 23.6 14.2 24.7a1.1 1.1 0 0 0 1.6 0C16.9 38.6 30 25.2 30 15 30 6.4 23 0 15 0Z" fill="url(#lpg)" stroke="#5d4509" stroke-width="1"/>
  <circle cx="15" cy="14.5" r="5.4" fill="#0a0d18"/>
</svg>`;

export function LocationPicker({ value, onChange, height = 380, error, idPrefix = 'lp' }: LocationPickerProps) {
  const { L, error: leafletError } = useLeaflet();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  // Tracks pin moves that originated inside this component, so the
  // "sync from prop" effect doesn't fight (or re-center on) them.
  const internalUpdateRef = useRef(false);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [geoBusy, setGeoBusy] = useState(false);

  // Manual coordinate entry — the guaranteed keyboard / no-mouse path (WCAG 2.1.1).
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualErr, setManualErr] = useState('');

  const errorNodeId = `${idPrefix}-error`;
  const manualErrId = `${idPrefix}-manual-err`;

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 450);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const listboxId = `${idPrefix}-suggest`;

  // -------- core: resolve a clicked / dropped / searched coordinate --------
  const resolvePoint = useCallback(async (lat: number, lng: number) => {
    reverseAbortRef.current?.abort();
    const controller = new AbortController();
    reverseAbortRef.current = controller;
    setStatus({ kind: 'loading', msg: 'Resolving address for this location…' });

    const governorate = nearestGovernorate(lat, lng).name;
    let geo = null;
    try {
      geo = await reverseGeocode(lat, lng, controller.signal);
    } catch (err) {
      // Drop superseded/unmounted requests (the controller was aborted) regardless
      // of how the rejection is shaped, so a stale failure can never overwrite a
      // newer pin or fire onChange/setState after unmount.
      if (controller.signal.aborted || (err instanceof GeocodingError && err.kind === 'aborted')) return;
      const location: UserLocation = {
        latitude: round6(lat), longitude: round6(lng),
        country: '', city: governorate, address: '', governorate,
        locationVerified: false, updatedAt: new Date().toISOString(),
      };
      internalUpdateRef.current = true;
      onChangeRef.current(location);
      setStatus({
        kind: 'error',
        msg: err instanceof GeocodingError
          ? err.message
          : 'We could not resolve an address. Please try another point.',
      });
      return;
    }

    if (controller.signal.aborted) return;

    const address = geo?.address || '';
    const location: UserLocation = {
      latitude: round6(lat),
      longitude: round6(lng),
      country: geo?.country || '',
      city: geo?.city || governorate,
      address,
      governorate,
      locationVerified: Boolean(address),
      updatedAt: new Date().toISOString(),
    };
    internalUpdateRef.current = true;
    onChangeRef.current(location);

    setStatus(
      address
        ? { kind: 'success', msg: `Location confirmed — ${address}` }
        : { kind: 'error', msg: 'No address found for that exact point. Please pick a more precise spot.' }
    );
  }, []);

  // -------- place / move the draggable marker --------
  const placeMarker = useCallback((lat: number, lng: number) => {
    if (!L || !mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({ className: 'lp-pin', html: PIN_HTML, iconSize: [30, 40], iconAnchor: [15, 40] });
      const marker = L.marker([lat, lng], { draggable: true, icon, keyboard: false, title: 'Drag to fine-tune your location' });
      marker.addTo(mapRef.current);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        void resolvePoint(pos.lat, pos.lng);
      });
      markerRef.current = marker;
    }
  }, [L, resolvePoint]);

  // -------- init the map once Leaflet is ready --------
  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;

    const v = valueRef.current;
    const hasCoords = typeof v?.latitude === 'number' && typeof v?.longitude === 'number';
    const startLat = hasCoords ? (v!.latitude as number) : EGYPT_CENTER.lat;
    const startLng = hasCoords ? (v!.longitude as number) : EGYPT_CENTER.lng;

    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true })
      .setView([startLat, startLng], hasCoords ? 15 : 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    if (hasCoords) placeMarker(startLat, startLng);

    map.on('click', (e: any) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
      void resolvePoint(e.latlng.lat, e.latlng.lng);
    });

    // Leaflet mis-measures inside animated / flex containers — recompute size.
    const fix = () => map.invalidateSize();
    const t = setTimeout(fix, 200);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fix) : null;
    ro?.observe(containerRef.current);

    return () => {
      clearTimeout(t);
      ro?.disconnect();
      reverseAbortRef.current?.abort();
      searchAbortRef.current?.abort();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  // -------- sync marker when the value changes EXTERNALLY (not from a click) --------
  useEffect(() => {
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      return;
    }
    if (!L || !mapRef.current) return;
    if (typeof value?.latitude !== 'number' || typeof value?.longitude !== 'number') return;
    placeMarker(value.latitude, value.longitude);
    mapRef.current.setView([value.latitude, value.longitude], Math.max(mapRef.current.getZoom(), 14));
  }, [value?.latitude, value?.longitude, L, placeMarker]);

  // -------- search (Nominatim) --------
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearching(true);
    searchLocations(q, controller.signal)
      .then((r) => {
        if (controller.signal.aborted) return;
        setResults(r);
        setActiveIndex(-1);
        setSuggestOpen(true);
      })
      .catch((err) => {
        // A superseded query must not wipe the newer query's results.
        if (controller.signal.aborted) return;
        if (err instanceof GeocodingError && err.kind === 'aborted') return;
        setResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });
  }, [debouncedQuery]);

  const selectResult = (r: SearchResult) => {
    setSuggestOpen(false);
    setResults([]);
    setQuery('');
    if (mapRef.current) mapRef.current.setView([r.latitude, r.longitude], 16);
    placeMarker(r.latitude, r.longitude);
    void resolvePoint(r.latitude, r.longitude);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); selectResult(results[activeIndex]); }
    else if (e.key === 'Escape') { setSuggestOpen(false); }
  };

  // -------- "Use My Current Location" --------
  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus({ kind: 'error', msg: 'Your browser does not support location access. Search above, tap the map, or enter coordinates manually.' });
      return;
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setStatus({ kind: 'error', msg: 'Location access needs a secure (https) connection. Search above, tap the map, or enter coordinates manually.' });
      return;
    }
    setGeoBusy(true);
    setStatus({ kind: 'loading', msg: 'Getting your current location…' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoBusy(false);
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) mapRef.current.setView([latitude, longitude], 16);
        placeMarker(latitude, longitude);
        void resolvePoint(latitude, longitude);
      },
      (err) => {
        setGeoBusy(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission is blocked. Enable it in your browser settings, or search / tap the map / enter coordinates instead.'
            : err.code === err.TIMEOUT
            ? 'Locating timed out. Try again, or search / tap the map / enter coordinates instead.'
            : "We couldn't determine your position. Try again, or search / tap the map / enter coordinates instead.";
        setStatus({ kind: 'error', msg });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const placeManualPin = () => {
    const la = Number(manualLat);
    const ln = Number(manualLng);
    if (!Number.isFinite(la) || !Number.isFinite(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) {
      setManualErr('Enter a valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }
    setManualErr('');
    if (mapRef.current) mapRef.current.setView([la, ln], 16);
    placeMarker(la, ln);
    void resolvePoint(la, ln);
  };

  const hasCoords = typeof value?.latitude === 'number' && typeof value?.longitude === 'number';
  const verified = Boolean(value?.locationVerified && value?.address);

  return (
    <div className="lp-root">
      {/* Action bar: search + use-my-location */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="lp-search flex-1">
          <label htmlFor={`${idPrefix}-search`} className="lp-sr-only">Search for a place or address</label>
          <div className="relative">
            <Search className="w-4 h-4 text-luxury-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id={`${idPrefix}-search`}
              type="text"
              role="combobox"
              aria-expanded={suggestOpen && results.length > 0}
              aria-controls={suggestOpen && results.length > 0 ? listboxId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
              autoComplete="off"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSuggestOpen(true); }}
              onKeyDown={onSearchKeyDown}
              onFocus={() => { if (results.length) setSuggestOpen(true); }}
              placeholder="Search a city, street or landmark…"
              className="w-full rounded-xl border pl-9 pr-9 py-3 text-sm focus:outline-none"
            />
            {(searching || query) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {searching ? (
                  <Loader2 className="w-4 h-4 text-luxury-gold animate-spin" aria-hidden="true" />
                ) : (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setResults([]); setSuggestOpen(false); }}
                    aria-label="Clear search"
                    className="text-ink-400 hover:text-luxury-gold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </span>
            )}
          </div>

          {suggestOpen && results.length > 0 && (
            <ul className="lp-suggest" id={listboxId} role="listbox" aria-label="Location suggestions">
              {results.map((r, i) => (
                <li
                  key={`${r.latitude}-${r.longitude}-${i}`}
                  id={`${listboxId}-opt-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className="lp-suggest__item"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => { e.preventDefault(); selectResult(r); }}
                >
                  <MapPin className="w-4 h-4 mt-0.5 text-luxury-gold flex-none" aria-hidden="true" />
                  <span className="leading-snug">{r.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={useMyLocation}
          disabled={geoBusy}
          className="btn-luxury !py-3 whitespace-nowrap disabled:opacity-60"
        >
          {geoBusy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Crosshair className="w-4 h-4" aria-hidden="true" />}
          Use My Current Location
        </button>
      </div>

      {/* The map (or a fallback if Leaflet fails — search & manual entry still work) */}
      {leafletError ? (
        <div className="lp-map is-error flex items-center justify-center text-center p-6" style={{ height }} role="alert">
          <p className="text-sm text-[#e3a4ad] max-w-sm">
            The map could not be loaded. You can still search for a place above or enter coordinates manually below to set your location.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={containerRef}
            style={{ height }}
            className={`lp-map ${error ? 'is-error' : ''}`}
            role="application"
            aria-label="Interactive map. Click to drop a pin, or use the search box, the Use My Current Location button, or the manual coordinate fields to set your location."
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorNodeId : undefined}
          />
          {!L && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none" aria-hidden="true">
              <span className="lp-spin" />
              <span className="text-sm text-ink-300">Loading map…</span>
            </div>
          )}
        </div>
      )}

      <p className="mt-2 text-xs text-ink-300 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-luxury-gold" aria-hidden="true" />
        Click anywhere on the map to drop a pin, then drag it to fine-tune.
      </p>

      {/* Keyboard / no-mouse path: enter coordinates manually */}
      <details className="mt-2 group">
        <summary className="text-xs text-ink-300 cursor-pointer select-none hover:text-luxury-gold inline-flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
          Enter coordinates manually
        </summary>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label htmlFor={`${idPrefix}-mlat`} className="block text-xs text-ink-300 mb-1">Latitude</label>
            <input
              id={`${idPrefix}-mlat`} type="number" inputMode="decimal" step="any" placeholder="30.0444"
              value={manualLat} onChange={(e) => setManualLat(e.target.value)}
              aria-invalid={manualErr ? true : undefined}
              aria-describedby={manualErr ? manualErrId : undefined}
              className="w-full rounded-xl border px-3 py-2.5 text-sm lp-coord focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label htmlFor={`${idPrefix}-mlng`} className="block text-xs text-ink-300 mb-1">Longitude</label>
            <input
              id={`${idPrefix}-mlng`} type="number" inputMode="decimal" step="any" placeholder="31.2357"
              value={manualLng} onChange={(e) => setManualLng(e.target.value)}
              aria-invalid={manualErr ? true : undefined}
              aria-describedby={manualErr ? manualErrId : undefined}
              className="w-full rounded-xl border px-3 py-2.5 text-sm lp-coord focus:outline-none"
            />
          </div>
          <button type="button" onClick={placeManualPin} className="btn-ghost !py-2.5 whitespace-nowrap">
            <MapPin className="w-4 h-4" aria-hidden="true" /> Place pin
          </button>
        </div>
        {manualErr && <p id={manualErrId} className="mt-2 text-xs text-[#e3a4ad]" role="alert">{manualErr}</p>}
      </details>

      {/* Live status (announced to assistive tech) */}
      <div aria-live="polite" className="mt-3">
        {status.kind === 'loading' && (
          <div className="lp-status lp-status--loading"><span className="lp-spin" aria-hidden="true" /><span>{status.msg}</span></div>
        )}
        {status.kind === 'error' && (
          <div className="lp-status lp-status--error"><AlertCircle className="w-4 h-4 flex-none" aria-hidden="true" /><span>{status.msg}</span></div>
        )}
        {status.kind === 'success' && (
          <div className="lp-status lp-status--success"><CheckCircle2 className="w-4 h-4 flex-none" aria-hidden="true" /><span>{status.msg}</span></div>
        )}
      </div>

      {/* External validation error (referenced by the map's aria-describedby) */}
      {error && (
        <div id={errorNodeId} className="lp-status lp-status--error mt-3" role="alert">
          <AlertCircle className="w-4 h-4 flex-none" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview cards: address + coordinates */}
      {hasCoords && (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div className={`lp-preview p-4 ${verified ? 'is-verified' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider text-ink-300">Resolved Address</p>
              {verified ? (
                <span className="pill pill-success"><CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Verified</span>
              ) : (
                <span className="pill pill-warning">Unconfirmed</span>
              )}
            </div>
            <p className="text-sm text-ink-100 leading-snug">
              {value?.address || 'Pick a precise point to resolve the address.'}
            </p>
            {(value?.city || value?.country) && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {value?.governorate && <span className="pill pill-brand">{value.governorate}</span>}
                {value?.city && value.city !== value.governorate && <span className="pill pill-info">{value.city}</span>}
                {value?.country && <span className="pill pill-info">{value.country}</span>}
              </div>
            )}
          </div>

          <div className="lp-preview p-4">
            <p className="text-xs uppercase tracking-wider text-ink-300 mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-luxury-gold" aria-hidden="true" /> Coordinates
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-300">Latitude</span>
                <span className="lp-coord text-sm text-ink-100">{value!.latitude!.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-300">Longitude</span>
                <span className="lp-coord text-sm text-ink-100">{value!.longitude!.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
