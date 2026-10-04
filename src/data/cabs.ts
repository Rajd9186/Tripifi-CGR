export interface Vehicle {
  id: string;
  category: "Sedan" | "SUV" | "Premium SUV" | "Luxury";
  model: string;
  similar: string;
  seats: number;
  luggage: number;
  ac: boolean;
  ratePerKm: number;
  image: string;
  driver: { name: string; rating: number; trips: number; languages: string };
  includedKmLocal: number;
  includedKmDay: number;
}

export const VEHICLES: Vehicle[] = [
  {
    id: "dzire",
    category: "Sedan",
    model: "Swift Dzire",
    similar: "Hyundai Aura or similar",
    seats: 4,
    luggage: 2,
    ac: true,
    ratePerKm: 12,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=640&q=80",
    driver: { name: "Ramesh K.", rating: 4.8, trips: 3240, languages: "Hindi, English, Bengali" },
    includedKmLocal: 40,
    includedKmDay: 250,
  },
  {
    id: "etios",
    category: "Sedan",
    model: "Toyota Etios",
    similar: "Honda Amaze or similar",
    seats: 4,
    luggage: 3,
    ac: true,
    ratePerKm: 13,
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=640&q=80",
    driver: { name: "Suresh P.", rating: 4.7, trips: 2810, languages: "Hindi, English" },
    includedKmLocal: 40,
    includedKmDay: 250,
  },
  {
    id: "ertiga",
    category: "SUV",
    model: "Maruti Ertiga",
    similar: "Renault Triber XL or similar",
    seats: 6,
    luggage: 3,
    ac: true,
    ratePerKm: 15,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=640&q=80",
    driver: { name: "Imran S.", rating: 4.9, trips: 4105, languages: "Hindi, English, Urdu" },
    includedKmLocal: 40,
    includedKmDay: 250,
  },
  {
    id: "innova",
    category: "SUV",
    model: "Toyota Innova",
    similar: "Mahindra Marazzo or similar",
    seats: 7,
    luggage: 4,
    ac: true,
    ratePerKm: 16,
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=640&q=80",
    driver: { name: "Vikram R.", rating: 4.8, trips: 5120, languages: "Hindi, English, Marathi" },
    includedKmLocal: 40,
    includedKmDay: 250,
  },
  {
    id: "crysta",
    category: "Premium SUV",
    model: "Innova Crysta",
    similar: "Toyota Fortuner or similar",
    seats: 7,
    luggage: 5,
    ac: true,
    ratePerKm: 19,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=640&q=80",
    driver: { name: "Arjun T.", rating: 4.9, trips: 2210, languages: "Hindi, English, Tamil" },
    includedKmLocal: 40,
    includedKmDay: 250,
  },
  {
    id: "luxury",
    category: "Luxury",
    model: "Mercedes-Benz E-Class",
    similar: "BMW 5 Series or similar",
    seats: 4,
    luggage: 3,
    ac: true,
    ratePerKm: 28,
    image: "https://images.unsplash.com/photo-1549927681-0b673b8243ab?w=640&q=80",
    driver: { name: "Deepak M. (Chauffeur)", rating: 5.0, trips: 980, languages: "Hindi, English" },
    includedKmLocal: 40,
    includedKmDay: 250,
  },
];

/** Road distance estimates between major Indian cities/regions (km) */
const ROAD_KM: Record<string, number> = {
  "kolkata-digha": 185, "kolkata-shantiniketan": 165, "kolkata-darjeeling": 620,
  "kolkata-gangtok": 680, "kolkata-pelling": 745, "kolkata-puri": 500,
  "delhi-jaipur": 270, "delhi-agra": 230, "delhi-manali": 540, "delhi-shimla": 350,
  "delhi-rishikesh": 240, "delhi-nainital": 320, "delhi-mussoorie": 280,
  "mumbai-goa": 590, "mumbai-pune": 150, "mumbai-nashik": 170, "mumbai-shirdi": 240,
  "bangalore-mysore": 145, "bangalore-coorg": 265, "bangalore-ooty": 280,
  "chennai-pondicherry": 165, "chennai-mahabalipuram": 60, "hyderabad-warangal": 150,
  "jaipur-udaipur": 400, "jaipur-jodhpur": 340, "jodhpur-udaipur": 250,
  "srinagar-gulmarg": 50, "srinagar-pahalgam": 90, "srinagar-sonamarg": 80,
  "leh-pangong": 160, "leh-nubra": 120, "bagdogra-gangtok": 120, "bagdogra-darjeeling": 70,
  "gangtok-pelling": 135, "gangtok-darjeeling": 100, "guwahati-shillong": 100,
  "guwahati-cherrapunji": 150, "kochi-munnar": 130, "kochi-alleppey": 55,
  "trivandrum-kanyakumari": 90, "coimbatore-ooty": 90, "dehradun-haridwar": 55,
};

export function roadKm(from: string, to: string): number {
  const key = `${from.toLowerCase().trim()}-${to.toLowerCase().trim()}`;
  if (ROAD_KM[key]) return ROAD_KM[key];
  const rev = `${to.toLowerCase().trim()}-${from.toLowerCase().trim()}`;
  return ROAD_KM[rev] ?? 300;
}

export const LOCAL_RIDES = [
  { id: "hourly", name: "Hourly Rental", desc: "Keep the cab for a few hours, multi-stop", icon: "⏱" },
  { id: "fullday", name: "Full-Day Rental", desc: "8 hrs / 80 km city sightseeing", icon: "🗓" },
  { id: "airport", name: "Airport Transfer", desc: "Pickup or drop, fixed fare", icon: "✈" },
  { id: "point", name: "Point-to-Point", desc: "One direct drop across the city", icon: "📍" },
];

export const OUTSTATION_RIDES = [
  { id: "oneway", name: "One Way", desc: "Single drop, pay for one side", icon: "➡" },
  { id: "round", name: "Round Trip", desc: "Return with the same driver", icon: "⇄" },
  { id: "multi", name: "Multi-Day Trip", desc: "Tour multiple cities over days", icon: "🗓" },
];
