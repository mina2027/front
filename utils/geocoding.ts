// ============================================================
// Geocoding client — talks to OUR backend proxy (/api/geo/*), never Nominatim
// directly. The proxy adds the policy-required User-Agent/Referer headers,
// enforces the 1 req/sec limit and caches results for everyone (see
// server/routes/geo.js). Calling Nominatim straight from the browser is against
// OSM policy and risks shared-IP bans.
//
//   • reverseGeocode(lat, lng) — coordinates → full address / city / country
//   • searchLocations(query)   — text query → ranked place suggestions
//
// Every request accepts an AbortSignal so a stale, slow lookup can be cancelled
// before its (late) response overwrites a newer pin — the classic geocode race.
// ============================================================

import { apiUrl } from './api';

export interface GeocodeAddress {
  latitude: number;
  longitude: number;
  address: string; // human-readable full address (may be '' when unresolved)
  city: string;
  country: string;
  countryCode: string;
  postcode: string;
}

export interface SearchResult {
  latitude: number;
  longitude: number;
  label: string;
  type: string;
}

export class GeocodingError extends Error {
  constructor(message: string, readonly kind: 'network' | 'rate-limit' | 'empty' | 'aborted' = 'network') {
    super(message);
    this.name = 'GeocodingError';
  }
}

async function getJson(path: string, signal?: AbortSignal): Promise<any> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path), { signal, headers: { Accept: 'application/json' } });
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new GeocodingError('Lookup cancelled.', 'aborted');
    throw new GeocodingError('Network error while contacting the location service.', 'network');
  }
  if (res.status === 429) {
    throw new GeocodingError('The location service is busy. Please wait a moment and try again.', 'rate-limit');
  }
  if (!res.ok) {
    throw new GeocodingError('The location service is temporarily unavailable.', 'network');
  }
  return res.json();
}

/**
 * Convert coordinates into a structured address. Returns null when no address
 * could be resolved (open sea, sparse coverage, upstream failure) — the caller
 * keeps the coordinates but cannot mark the location verified.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<GeocodeAddress | null> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lng) });
  const data = await getJson(`/api/geo/reverse?${params.toString()}`, signal);
  if (!data || !data.address) return null;
  return {
    latitude: typeof data.latitude === 'number' ? data.latitude : lat,
    longitude: typeof data.longitude === 'number' ? data.longitude : lng,
    address: String(data.address),
    city: data.city || '',
    country: data.country || '',
    countryCode: data.countryCode || '',
    postcode: data.postcode || '',
  };
}

/**
 * Free-text place search. Returns up to a handful of ranked suggestions (empty
 * array when nothing matches).
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];
  const params = new URLSearchParams({ q: trimmed });
  const data = await getJson(`/api/geo/search?${params.toString()}`, signal);
  if (!Array.isArray(data)) return [];
  return data
    .filter((d: any) => d && Number.isFinite(d.latitude) && Number.isFinite(d.longitude) && d.label)
    .map((d: any) => ({
      latitude: d.latitude,
      longitude: d.longitude,
      label: String(d.label),
      type: d.type || 'place',
    }));
}
