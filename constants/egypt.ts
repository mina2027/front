// The 27 Egyptian governorates with approximate centre coordinates.
// Used for the governorate selector, filtering and map defaults.

export interface Governorate {
  name: string;       // English
  nameAr: string;     // Arabic
  lat: number;
  lng: number;
}

export const GOVERNORATES: Governorate[] = [
  { name: 'Cairo', nameAr: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { name: 'Giza', nameAr: 'الجيزة', lat: 30.0131, lng: 31.2089 },
  { name: 'Alexandria', nameAr: 'الإسكندرية', lat: 31.2001, lng: 29.9187 },
  { name: 'Qalyubia', nameAr: 'القليوبية', lat: 30.4044, lng: 31.2336 },
  { name: 'Port Said', nameAr: 'بورسعيد', lat: 31.2653, lng: 32.3019 },
  { name: 'Suez', nameAr: 'السويس', lat: 29.9668, lng: 32.5498 },
  { name: 'Dakahlia', nameAr: 'الدقهلية', lat: 31.0409, lng: 31.3785 },
  { name: 'Sharqia', nameAr: 'الشرقية', lat: 30.5877, lng: 31.5020 },
  { name: 'Gharbia', nameAr: 'الغربية', lat: 30.8754, lng: 31.0335 },
  { name: 'Monufia', nameAr: 'المنوفية', lat: 30.5972, lng: 30.9876 },
  { name: 'Beheira', nameAr: 'البحيرة', lat: 30.8481, lng: 30.3436 },
  { name: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', lat: 31.1117, lng: 30.9398 },
  { name: 'Damietta', nameAr: 'دمياط', lat: 31.4165, lng: 31.8133 },
  { name: 'Ismailia', nameAr: 'الإسماعيلية', lat: 30.5965, lng: 32.2715 },
  { name: 'Fayoum', nameAr: 'الفيوم', lat: 29.3084, lng: 30.8428 },
  { name: 'Beni Suef', nameAr: 'بني سويف', lat: 29.0661, lng: 31.0994 },
  { name: 'Minya', nameAr: 'المنيا', lat: 28.1099, lng: 30.7503 },
  { name: 'Assiut', nameAr: 'أسيوط', lat: 27.1809, lng: 31.1837 },
  { name: 'Sohag', nameAr: 'سوهاج', lat: 26.5569, lng: 31.6948 },
  { name: 'Qena', nameAr: 'قنا', lat: 26.1551, lng: 32.7160 },
  { name: 'Luxor', nameAr: 'الأقصر', lat: 25.6872, lng: 32.6396 },
  { name: 'Aswan', nameAr: 'أسوان', lat: 24.0889, lng: 32.8998 },
  { name: 'Red Sea', nameAr: 'البحر الأحمر', lat: 26.0000, lng: 33.8000 },
  { name: 'New Valley', nameAr: 'الوادي الجديد', lat: 25.4477, lng: 30.5582 },
  { name: 'Matrouh', nameAr: 'مطروح', lat: 31.3543, lng: 27.2373 },
  { name: 'North Sinai', nameAr: 'شمال سيناء', lat: 31.1316, lng: 33.8000 },
  { name: 'South Sinai', nameAr: 'جنوب سيناء', lat: 28.5000, lng: 33.9000 },
];

export const EGYPT_CENTER = { lat: 26.8206, lng: 30.8025 };

// Find the nearest governorate to a coordinate (used after the user drops a map pin).
export function nearestGovernorate(lat: number, lng: number): Governorate {
  let best = GOVERNORATES[0];
  let bestDist = Infinity;
  for (const gov of GOVERNORATES) {
    const d = (gov.lat - lat) ** 2 + (gov.lng - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = gov;
    }
  }
  return best;
}

// Great-circle distance between two coordinates in kilometres (Haversine).
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function governorateByName(name?: string): Governorate | undefined {
  if (!name) return undefined;
  return GOVERNORATES.find(g => g.name === name || g.nameAr === name);
}
