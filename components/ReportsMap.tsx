import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeaflet } from '../hooks/useLeaflet';
import { EGYPT_CENTER } from '../constants/egypt';
import { Report } from '../types';

interface ReportsMapProps {
  reports: Report[];
  height?: number;
  /** When provided, clicking the map calls this with the chosen coordinates. */
  onPickPoint?: (lat: number, lng: number) => void;
  /** The currently selected search origin (a pin + radius circle is drawn). */
  searchPoint?: { lat: number; lng: number } | null;
  /** Radius (km) of the proximity circle drawn around the search point. */
  radiusKm?: number;
}

// Read-only map that plots every geolocated report. Lost items are red,
// found items are emerald. Clicking a marker opens the report. When a point is
// picked it also draws a search origin pin and a radius circle.
export function ReportsMap({ reports, height = 480, onPickPoint, searchPoint, radiusKm = 10 }: ReportsMapProps) {
  const { L, error } = useLeaflet();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const searchLayerRef = useRef<any>(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const onPickRef = useRef(onPickPoint);
  onPickRef.current = onPickPoint;

  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([EGYPT_CENTER.lat, EGYPT_CENTER.lng], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    searchLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on('click', (e: any) => {
      if (onPickRef.current) {
        onPickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    setTimeout(() => map.invalidateSize(), 200);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      searchLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  // Plot the report markers.
  useEffect(() => {
    if (!L || !mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    const geoReports = reports.filter(r => typeof r.lat === 'number' && typeof r.lng === 'number');
    const bounds: [number, number][] = [];

    geoReports.forEach(report => {
      const color = report.type === 'lost' ? '#dc2626' : '#059669';
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${color};width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 18],
      });
      const marker = L.marker([report.lat, report.lng], { icon });
      const safeTitle = String(report.title).replace(/</g, '&lt;');
      const label = report.type === 'lost' ? 'Lost' : 'Found';
      marker.bindPopup(
        `<div style="min-width:160px">
           <strong>${safeTitle}</strong><br/>
           <span style="color:${color};font-weight:600">${label}</span> &middot; ${String(report.governorate || report.location).replace(/</g, '&lt;')}<br/>
           <a href="#" data-id="${report.id}" class="reports-map-link" style="color:#4f46e5;font-weight:600">View details</a>
         </div>`
      );
      marker.addTo(layerRef.current);
      bounds.push([report.lat as number, report.lng as number]);
    });

    // Only auto-fit to reports when there is no active search point.
    if (bounds.length > 0 && !searchPoint) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }

    const handler = (e: any) => {
      const link = e.target.closest?.('.reports-map-link');
      if (link) {
        e.preventDefault();
        navigateRef.current(`/report/${link.getAttribute('data-id')}`);
      }
    };
    const node = containerRef.current;
    node?.addEventListener('click', handler);
    return () => node?.removeEventListener('click', handler);
  }, [reports, L, searchPoint]);

  // Draw / update the search origin pin and radius circle.
  useEffect(() => {
    if (!L || !mapRef.current || !searchLayerRef.current) return;
    searchLayerRef.current.clearLayers();
    if (!searchPoint) return;

    const pinIcon = L.divIcon({
      className: '',
      html: `<div style="background:#4f46e5;width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.45)"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([searchPoint.lat, searchPoint.lng], { icon: pinIcon })
      .bindPopup('<strong>Search location</strong><br/>Showing nearby reports')
      .addTo(searchLayerRef.current);

    const circle = L.circle([searchPoint.lat, searchPoint.lng], {
      radius: radiusKm * 1000,
      color: '#4f46e5',
      weight: 1.5,
      fillColor: '#6366f1',
      fillOpacity: 0.1,
    }).addTo(searchLayerRef.current);

    mapRef.current.fitBounds(circle.getBounds(), { padding: [30, 30] });
  }, [searchPoint, radiusKm, L]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-indigo-300 bg-indigo-50 text-indigo-700 text-sm p-4"
        style={{ height }}
      >
        Unable to load the map. Please check your internet connection.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-gray-200 z-0"
    />
  );
}
