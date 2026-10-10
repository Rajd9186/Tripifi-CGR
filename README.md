# Tripifi CGR

Tripifi CGR — Your trip. Your way. 

A premium Indian travel platform that lets you discover, plan, customize and book complete journeys in one place. Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS v4.

## Live Demo
Visit: [Tripifi CGR](https://tripifi-cgr.onrender.com)

## Features
- **Destination Discovery** - Explore India with rich editorial content
- **Flights, Trains & Cabs** - Search with realistic mock data (ready for API integration)
- **Curated Packages** - Handcrafted itineraries for every traveler
- **Trip Builder** - Flagship journey planner with live budget & itinerary
- **Tripifi AI** - AI travel concierge (architecture ready for LLM integration)
- **Unified Trips** - Complete journey view across all bookings
- **Responsive Design** - Mobile-first, works across all devices

## Tech Stack
- Next.js 15 (App Router)
- React 18.3.1
- TypeScript 5.5
- Tailwind CSS v4 (CSS-first `@theme` tokens in `src/app/globals.css`)

## Theme
Golden Hour Day light theme by default with a dark-mode toggle (header sun/moon button, persisted via `next-themes`). Design tokens live in one place (`@theme` + `.dark` overrides in `src/app/globals.css`).

## Getting Started

### Development
```bash
npm install
npm run dev
```
App runs on http://localhost:3000

### Build
```bash
npm run build
npm start
```

## Deploy to Render

### Option 1: Deploy from GitHub (Recommended)

1. Push this repo to GitHub
2. Go to [Render](https://render.com/) and sign in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository `Rajd9186/Tripifi-CGR`
5. Configure:
   - **Name**: `tripifi-cgr`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Region**: Choose closest to you
6. Click "Create Web Service"
7. Wait for build to complete - you'll get a URL like `https://tripifi-cgr.onrender.com`

### Option 2: Render Blueprint (render.yaml)

This project can also be deployed using the included render.yaml if needed.

## Environment Variables
Frontend works with no backend (demo data, clearly marked `is_demo`).
To connect the FastAPI backend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 npm run dev
```

See `backend/README.md` and `backend/.env.example` for backend setup
(PostgreSQL, migrations, seed, auth, providers). Never commit `.env`.

## Phase 5 — Free APIs + Booking Assistance

**Rule:** live flow only when a legitimate provider supports the operation;
otherwise the product creates an assisted booking enquiry (`TFC-YYYY-000001`).
No fake availability, bookings, or payments — ever.

- **Maps:** MapLibre-ready `MapProvider`; OSM Nominatim geocoding (server-side,
  rate-limited, cached, attributed) + OSRM routing behind `/api/v1/geo/*`.
- **Cabs:** internal `CabPricingService` (base + included km + extra km +
  driver/night/toll + tax) — always labeled **Estimated fare**.
- **Flights:** Aviationstack dev adapter (non-commercial free tier, key stays
  server-side). Schedules only — booking falls back to assistance.
- **Trains/hotels:** demo data for planning; booking via enquiry.
- **Customer flow:** `/assistance?type=…` (prefilled from search) →
  `POST /api/v1/enquiries` → `/assistance/success?ref=` → `/assistance/track`.
- **Admin:** `/admin/enquiries` (queue + provider health) → detail
  (status workflow, assign, private notes, history).
- **AI:** `aiApi.createBookingEnquiry()` + backend `app/ai/tools.py`
  (`create_booking_enquiry` requires details + consent).

**Free-tier licensing (must verify before commercial use):** Nominatim (strict
usage policy), OSRM public server (no SLA), GraphHopper free (non-commercial
only), Aviationstack free (100 req/mo, non-commercial). See
`backend/.env.example` (`*_PROVIDER` selectors).

## License
MIT
