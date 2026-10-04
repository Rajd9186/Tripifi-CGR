export interface Station {
  code: string;
  city: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const STATIONS: Station[] = [
  { code: "HWH", city: "Kolkata", name: "Howrah Junction", state: "West Bengal", lat: 22.58, lng: 88.34 },
  { code: "SDAH", city: "Kolkata", name: "Sealdah Station", state: "West Bengal", lat: 22.57, lng: 88.37 },
  { code: "KOAA", city: "Kolkata", name: "Kolkata Terminal", state: "West Bengal", lat: 22.61, lng: 88.28 },
  { code: "NDLS", city: "New Delhi", name: "New Delhi Junction", state: "Delhi", lat: 28.64, lng: 77.22 },
  { code: "DLI", city: "Delhi", name: "Old Delhi Junction", state: "Delhi", lat: 28.66, lng: 77.23 },
  { code: "NZM", city: "Delhi", name: "Hazrat Nizamuddin", state: "Delhi", lat: 28.59, lng: 77.25 },
  { code: "MMCT", city: "Mumbai", name: "Mumbai Central", state: "Maharashtra", lat: 18.97, lng: 72.82 },
  { code: "CSMT", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj Terminus", state: "Maharashtra", lat: 18.94, lng: 72.84 },
  { code: "LTT", city: "Mumbai", name: "Lokmanya Tilak Terminus", state: "Maharashtra", lat: 19.07, lng: 72.9 },
  { code: "MAS", city: "Chennai", name: "Chennai Central", state: "Tamil Nadu", lat: 13.08, lng: 80.28 },
  { code: "SBC", city: "Bengaluru", name: "KSR Bengaluru City", state: "Karnataka", lat: 12.98, lng: 77.57 },
  { code: "HYB", city: "Hyderabad", name: "Hyderabad Deccan", state: "Telangana", lat: 17.38, lng: 78.49 },
  { code: "SC", city: "Secunderabad", name: "Secunderabad Junction", state: "Telangana", lat: 17.43, lng: 78.5 },
  { code: "JP", city: "Jaipur", name: "Jaipur Junction", state: "Rajasthan", lat: 26.92, lng: 75.79 },
  { code: "ADI", city: "Ahmedabad", name: "Ahmedabad Junction", state: "Gujarat", lat: 23.02, lng: 72.57 },
  { code: "LKO", city: "Lucknow", name: "Lucknow Charbagh", state: "Uttar Pradesh", lat: 26.83, lng: 80.92 },
  { code: "BSB", city: "Varanasi", name: "Varanasi Junction", state: "Uttar Pradesh", lat: 25.33, lng: 82.97 },
  { code: "PNBE", city: "Patna", name: "Patna Junction", state: "Bihar", lat: 25.6, lng: 85.14 },
  { code: "NJP", city: "New Jalpaiguri", name: "New Jalpaiguri Junction", state: "West Bengal", lat: 26.69, lng: 88.42 },
  { code: "GHY", city: "Guwahati", name: "Guwahati Junction", state: "Assam", lat: 26.18, lng: 91.75 },
  { code: "BBS", city: "Bhubaneswar", name: "Bhubaneswar Station", state: "Odisha", lat: 20.27, lng: 85.84 },
  { code: "ERS", city: "Kochi", name: "Ernakulam Junction", state: "Kerala", lat: 9.97, lng: 76.28 },
  { code: "TVC", city: "Trivandrum", name: "Thiruvananthapuram Central", state: "Kerala", lat: 8.49, lng: 76.95 },
  { code: "MAO", city: "Madgaon", name: "Madgaon Junction (Goa)", state: "Goa", lat: 15.27, lng: 73.96 },
  { code: "THVM", city: "Thivim", name: "Thivim Station (Goa)", state: "Goa", lat: 15.62, lng: 73.79 },
  { code: "JU", city: "Jodhpur", name: "Jodhpur Junction", state: "Rajasthan", lat: 26.29, lng: 73.03 },
  { code: "UDZ", city: "Udaipur", name: "Udaipur City", state: "Rajasthan", lat: 24.59, lng: 73.71 },
  { code: "AII", city: "Ajmer", name: "Ajmer Junction", state: "Rajasthan", lat: 26.46, lng: 74.62 },
  { code: "CDG", city: "Chandigarh", name: "Chandigarh Junction", state: "Punjab", lat: 30.71, lng: 76.79 },
  { code: "ASR", city: "Amritsar", name: "Amritsar Junction", state: "Punjab", lat: 31.63, lng: 74.87 },
  { code: "DDN", city: "Dehradun", name: "Dehradun Station", state: "Uttarakhand", lat: 30.32, lng: 78.03 },
  { code: "KGM", city: "Kathgodam", name: "Kathgodam Station", state: "Uttarakhand", lat: 29.26, lng: 79.53 },
  { code: "NGP", city: "Nagpur", name: "Nagpur Junction", state: "Maharashtra", lat: 21.15, lng: 79.09 },
  { code: "INDB", city: "Indore", name: "Indore Junction", state: "Madhya Pradesh", lat: 22.72, lng: 75.86 },
  { code: "RNC", city: "Ranchi", name: "Ranchi Junction", state: "Jharkhand", lat: 23.37, lng: 85.33 },
  { code: "R", city: "Raipur", name: "Raipur Junction", state: "Chhattisgarh", lat: 21.25, lng: 81.63 },
  { code: "MDU", city: "Madurai", name: "Madurai Junction", state: "Tamil Nadu", lat: 9.92, lng: 78.12 },
  { code: "JAT", city: "Jammu", name: "Jammu Tawi", state: "Jammu & Kashmir", lat: 32.7, lng: 74.86 },
  { code: "SVDK", city: "Katra", name: "Shri Mata Vaishno Devi Katra", state: "Jammu & Kashmir", lat: 32.98, lng: 74.95 },
  { code: "PNVL", city: "Pune", name: "Pune Junction", state: "Maharashtra", lat: 18.53, lng: 73.87 },
  { code: "GKP", city: "Gorakhpur", name: "Gorakhpur Junction", state: "Uttar Pradesh", lat: 26.76, lng: 83.37 },
  { code: "MLDT", city: "Malda Town", name: "Malda Town Station", state: "West Bengal", lat: 25.01, lng: 88.14 },
];

export function findStation(code: string): Station | undefined {
  const c = code.trim().toUpperCase();
  return STATIONS.find((s) => s.code === c || s.city.toLowerCase() === c);
}

export function searchStations(q: string): Station[] {
  const s = q.trim().toLowerCase();
  if (!s) return STATIONS.slice(0, 8);
  return STATIONS.filter(
    (st) =>
      st.city.toLowerCase().includes(s) ||
      st.code.toLowerCase().includes(s) ||
      st.name.toLowerCase().includes(s) ||
      st.state.toLowerCase().includes(s)
  ).slice(0, 8);
}

/** Approx rail distance in km (rail routes are longer than air) */
export function stationDistance(a: Station, b: Station): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(1.28 * 2 * R * Math.asin(Math.sqrt(h)));
}
