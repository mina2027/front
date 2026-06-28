import React, { useEffect, useRef } from 'react';
import { MapPin, Crosshair } from 'lucide-react';
import { useLeaflet } from '../hooks/useLeaflet';
import { EGYPT_CENTER, nearestGovernorate } from '../constants/egypt';

interface MapPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number, governorate: string) => void;
  height?: number;
}

// Interactive map: the user clicks (or uses GPS) to drop a pin and we report
// back the coordinates + the nearest Egyptian governorate.
export function MapPicker({ lat, lng, onChange, height = 320 }: MapPickerProps) {
  const { L, error } = useLeaflet();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;

    const startLat = typeof lat === 'number' ? lat : EGYPT_CENTER.lat;
    const startLng = typeof lng === 'number' ? lng : EGYPT_CENTER.lng;
    const startZoom = typeof lat === 'number' ? 13 : 6;

    const map = L.map(containerRef.current).setView([startLat, startLng], startZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const placeMarker = (la: number, ln: number) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([la, ln]);
      } else {
        markerRef.current = L.marker([la, ln], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          const gov = nearestGovernorate(pos.lat, pos.lng);
          onChangeRef.current(pos.lat, pos.lng, gov.name);
        });
      }
    };

    if (typeof lat === 'number' && typeof lng === 'number') {
      placeMarker(lat, lng);
    }

    map.on('click', (e: any) => {
      const { lat: la, lng: ln } = e.latlng;
      placeMarker(la, ln);
      const gov = nearestGovernorate(la, ln);
      onChangeRef.current(la, ln, gov.name);
    });

    mapRef.current = map;
    // Ensure correct sizing after layout settles.
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  // Keep marker in sync if the parent updates coordinates externally.
  useEffect(() => {
    if (!L || !mapRef.current || typeof lat !== 'number' || typeof lng !== 'number') return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
    }
    mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 12));
  }, [lat, lng, L]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const la = pos.coords.latitude;
      const ln = pos.coords.longitude;
      const gov = nearestGovernorate(la, ln);
      onChangeRef.current(la, ln, gov.name);
      if (mapRef.current) mapRef.current.setView([la, ln], 14);
    });
  };

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-amber-300 bg-amber-50 text-amber-700 text-sm p-4"
        style={{ height }}
      >
        Unable to load the map. Check your internet connection, or enter the location manually.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          Click on the map to set the lost / found location
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900"
        >
          <Crosshair className="w-4 h-4" />
          Use my location
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full rounded-xl overflow-hidden border border-gray-200 z-0"
      />
      {typeof lat === 'number' && typeof lng === 'number' && (
        <p className="text-xs text-gray-500">
          Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}
