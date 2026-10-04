# Tripifi CGR

Tripifi CGR — Your trip. Your way. 

A premium Indian travel platform that lets you discover, plan, customize and book complete journeys in one place. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

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
- Next.js 14.2.35 (App Router)
- React 18.3.1
- TypeScript 5.5.4
- Tailwind CSS 3.4.10

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
No required env vars for current mock data. Ready for future API integrations.

## License
MIT
