export interface LightDome {
  name: string;
  lat: number;
  lng: number;
  maxBortle: number;
  radiusKm: number;
}

export const VIETNAM_LIGHT_DOMES: LightDome[] = [
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, maxBortle: 8.8, radiusKm: 65 },
  { name: 'TP.HCM', lat: 10.7769, lng: 106.7009, maxBortle: 9.0, radiusKm: 75 },
  { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881, maxBortle: 7.8, radiusKm: 38 },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, maxBortle: 7.8, radiusKm: 36 },
  { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, maxBortle: 7.4, radiusKm: 34 },
  { name: 'Biên Hòa · Bình Dương', lat: 10.9574, lng: 106.8426, maxBortle: 8.4, radiusKm: 45 },
  { name: 'Hạ Long', lat: 20.9599, lng: 107.0425, maxBortle: 7.0, radiusKm: 28 },
  { name: 'Nha Trang', lat: 12.2388, lng: 109.1967, maxBortle: 7.2, radiusKm: 28 },
  { name: 'Vinh', lat: 18.6796, lng: 105.6813, maxBortle: 6.8, radiusKm: 26 },
  { name: 'Huế', lat: 16.4637, lng: 107.5909, maxBortle: 6.8, radiusKm: 26 },
  { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, maxBortle: 6.9, radiusKm: 24 },
  { name: 'Buôn Ma Thuột', lat: 12.6667, lng: 108.05, maxBortle: 6.5, radiusKm: 24 },
  { name: 'Quy Nhơn', lat: 13.7829, lng: 109.2196, maxBortle: 6.6, radiusKm: 22 },
  { name: 'Thái Nguyên', lat: 21.5942, lng: 105.8481, maxBortle: 6.8, radiusKm: 25 },
];

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateBortleAtCoords(lat: number, lng: number): { bortle: number; sqm: number; label: string } {
  let maxContribution = 2.8;
  for (const dome of VIETNAM_LIGHT_DOMES) {
    const dist = haversineKm(lat, lng, dome.lat, dome.lng);
    if (dist <= dome.radiusKm * 1.6) {
      const ratio = Math.max(0, 1 - dist / (dome.radiusKm * 1.6));
      const contrib = 2.6 + (dome.maxBortle - 2.6) * (ratio ** 1.35);
      if (contrib > maxContribution) maxContribution = contrib;
    }
  }
  const bortle = Number(Math.max(1.8, Math.min(9.0, maxContribution)).toFixed(1));
  const sqm = Number((22.05 - (bortle - 1) * 0.44).toFixed(2));
  const label =
    bortle <= 2.5 ? 'Trời tối nguyên bản' :
    bortle <= 4.0 ? 'Nông thôn tối · Săn Ngân Hà tốt' :
    bortle <= 5.5 ? 'Bán ngoại ô · Trung bình' : 'Ánh sáng đô thị cao';
  return { bortle, sqm, label };
}
