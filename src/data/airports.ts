export interface Airport {
  code: string;
  city: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const AIRPORTS: Airport[] = [
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose Intl", state: "West Bengal", lat: 22.65, lng: 88.45 },
  { code: "DEL", city: "Delhi", name: "Indira Gandhi Intl", state: "Delhi", lat: 28.56, lng: 77.1 },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj Intl", state: "Maharashtra", lat: 19.09, lng: 72.87 },
  { code: "MAA", city: "Chennai", name: "Chennai Intl", state: "Tamil Nadu", lat: 12.99, lng: 80.17 },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda Intl", state: "Karnataka", lat: 13.2, lng: 77.71 },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi Intl", state: "Telangana", lat: 17.24, lng: 78.43 },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel Intl", state: "Gujarat", lat: 23.07, lng: 72.63 },
  { code: "PNQ", city: "Pune", name: "Lohegaon Airport", state: "Maharashtra", lat: 18.58, lng: 73.92 },
  { code: "JAI", city: "Jaipur", name: "Jaipur Intl", state: "Rajasthan", lat: 26.82, lng: 75.81 },
  { code: "GOI", city: "Goa", name: "Dabolim Airport", state: "Goa", lat: 15.38, lng: 73.83 },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh Intl", state: "Uttar Pradesh", lat: 26.76, lng: 80.88 },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam Intl", state: "Jammu & Kashmir", lat: 33.99, lng: 74.77 },
  { code: "IXL", city: "Leh", name: "Kushok Bakula Rimpochee", state: "Ladakh", lat: 34.14, lng: 77.55 },
  { code: "IXB", city: "Bagdogra", name: "Bagdogra Airport", state: "West Bengal", lat: 26.68, lng: 88.33 },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi Intl", state: "Assam", lat: 26.11, lng: 91.59 },
  { code: "IXZ", city: "Port Blair", name: "Veer Savarkar Intl", state: "Andaman & Nicobar", lat: 11.64, lng: 92.73 },
  { code: "COK", city: "Kochi", name: "Cochin Intl", state: "Kerala", lat: 10.15, lng: 76.4 },
  { code: "TRV", city: "Trivandrum", name: "Trivandrum Intl", state: "Kerala", lat: 8.48, lng: 76.92 },
  { code: "NAG", city: "Nagpur", name: "Dr. Babasaheb Ambedkar Intl", state: "Maharashtra", lat: 21.09, lng: 79.05 },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri Intl", state: "Uttar Pradesh", lat: 25.45, lng: 82.86 },
  { code: "BBI", city: "Bhubaneswar", name: "Biju Patnaik Intl", state: "Odisha", lat: 20.24, lng: 85.82 },
  { code: "IDR", city: "Indore", name: "Devi Ahilya Bai Holkar", state: "Madhya Pradesh", lat: 22.72, lng: 75.8 },
  { code: "IXC", city: "Chandigarh", name: "Chandigarh Intl", state: "Punjab", lat: 30.67, lng: 76.79 },
  { code: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee Intl", state: "Punjab", lat: 31.71, lng: 74.8 },
  { code: "DED", city: "Dehradun", name: "Jolly Grant Airport", state: "Uttarakhand", lat: 30.19, lng: 78.18 },
  { code: "JDH", city: "Jodhpur", name: "Jodhpur Airport", state: "Rajasthan", lat: 26.25, lng: 73.05 },
  { code: "UDR", city: "Udaipur", name: "Maharana Pratap Airport", state: "Rajasthan", lat: 24.62, lng: 73.89 },
  { code: "PAT", city: "Patna", name: "Jay Prakash Narayan Airport", state: "Bihar", lat: 25.59, lng: 85.09 },
  { code: "IXR", city: "Ranchi", name: "Birsa Munda Airport", state: "Jharkhand", lat: 23.31, lng: 85.32 },
  { code: "RPR", city: "Raipur", name: "Swami Vivekananda Airport", state: "Chhattisgarh", lat: 21.3, lng: 81.74 },
  { code: "STV", city: "Surat", name: "Surat Airport", state: "Gujarat", lat: 21.11, lng: 72.74 },
  { code: "BDQ", city: "Vadodara", name: "Vadodara Airport", state: "Gujarat", lat: 22.34, lng: 73.23 },
  { code: "IXM", city: "Madurai", name: "Madurai Airport", state: "Tamil Nadu", lat: 9.83, lng: 78.09 },
  { code: "IMF", city: "Imphal", name: "Bir Tikendrajit Intl", state: "Manipur", lat: 24.76, lng: 93.9 },
  { code: "IXA", city: "Agartala", name: "Maharaja Bir Bikram Airport", state: "Tripura", lat: 23.89, lng: 91.24 },
  { code: "IXJ", city: "Jammu", name: "Jammu Airport", state: "Jammu & Kashmir", lat: 32.69, lng: 74.84 },
  { code: "CCJ", city: "Kozhikode", name: "Calicut Intl", state: "Kerala", lat: 11.14, lng: 75.96 },
  { code: "RXL", city: "Raxaul", name: "Raxaul Airport", state: "Bihar", lat: 26.98, lng: 84.85 },
];

export function findAirport(code: string): Airport | undefined {
  const c = code.trim().toUpperCase();
  return AIRPORTS.find((a) => a.code === c || a.city.toLowerCase() === c);
}

export function searchAirports(q: string): Airport[] {
  const s = q.trim().toLowerCase();
  if (!s) return AIRPORTS.slice(0, 8);
  return AIRPORTS.filter(
    (a) =>
      a.city.toLowerCase().includes(s) ||
      a.code.toLowerCase().includes(s) ||
      a.name.toLowerCase().includes(s) ||
      a.state.toLowerCase().includes(s)
  ).slice(0, 8);
}

/** Approx great-circle distance in km */
export function airportDistance(a: Airport, b: Airport): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
