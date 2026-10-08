"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, Star, Shield, Heart, Check, ChevronDown, Tag, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { PriceText } from "@/components/ui/PriceText";
export { PriceText } from "@/components/ui/PriceText";

// Flight Result Card
interface FlightResultCardProps {
  flight: {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    durationMinutes: number;
    stops: number;
    cabin: string;
    baggageKg: number;
    fare: number | null;
    price: number | null;
    currency: string;
    refundable?: boolean | null;
    isDemo: boolean;
    status: "LIVE" | "DEMO" | "UNAVAILABLE";
  };
  selected?: boolean;
  onSelect?: (flight: FlightResultCardProps["flight"]) => void;
  onAddToTrip?: (flight: FlightResultCardProps["flight"]) => void;
  index?: number;
}

export function FlightResultCard({ flight, selected, onSelect, onAddToTrip, index = 0 }: FlightResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        selected ? "ring-2 ring-saffron" : ""
      )}
    >
      <Card variant={selected ? "elevated" : "glass-hover"} padding="none" className="relative">
        {/* Demo/Live badge */}
        <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
          <Badge variant={flight.isDemo ? "default" : "success"} className="text-xs">
            {flight.status === "LIVE" ? "Live availability" : flight.status === "DEMO" ? "Demo availability" : "Unavailable"}
          </Badge>
          {flight.refundable && (
            <Badge variant="success" className="text-xs">
              <Shield className="mr-1 h-3 w-3" />
              Refundable
            </Badge>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            {/* Airline info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-cyan flex items-center justify-center text-bg font-semibold text-sm">
                  {flight.airline.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-text">{flight.airline}</div>
                  <div className="text-sm text-text-muted">{flight.flightNumber} · {flight.cabin}</div>
                </div>
              </div>

              {/* Route timeline */}
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-text">{flight.departure}</div>
                  <div className="text-sm text-text-muted">{flight.origin}</div>
                </div>

                <div className="flex flex-col items-center flex-1 px-4">
                  <div className="text-sm text-text-muted">{formatDuration(flight.durationMinutes)}</div>
                  <div className="relative w-full my-2">
                    <div className="h-px bg-border"></div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-cyan"></div>
                    {flight.stops > 0 && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="text-xs text-text-muted bg-surface px-1">{flight.stops} stop{flight.stops > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-text-muted">{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-semibold text-text">{flight.arrival}</div>
                  <div className="text-sm text-text-muted">{flight.destination}</div>
                </div>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6 flex flex-col lg:items-end gap-3 w-full lg:w-auto">
              <div className="flex items-center justify-between lg:flex-col lg:items-end w-full lg:w-auto">
                <div className="text-right">
                  <div className="text-xs text-text-muted">Total fare</div>
                  <div className="text-3xl font-semibold text-text">
                    <PriceText value={flight.price} />
                  </div>
                  <div className="text-xs text-text-muted">per traveller</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="default">{flight.baggageKg} kg baggage</Badge>
                {flight.refundable && <Badge variant="success">Refundable</Badge>}
                <Badge variant={flight.status === "LIVE" ? "success" : "default"}>
                  {flight.status === "LIVE" ? "Live" : "Demo"}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
                <Button
                  onClick={() => onSelect?.(flight)}
                  variant={selected ? "secondary" : "primary"}
                  size="lg"
                  className="w-full lg:min-w-[180px] justify-center"
                  disabled={flight.status === "UNAVAILABLE"}
                  whileTap={{ scale: 0.98 }}
                >
                  {selected ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
                <Button
                  onClick={() => onAddToTrip?.(flight)}
                  variant="ghost"
                  size="lg"
                  className="w-full lg:min-w-[180px] justify-center text-sm"
                  disabled={flight.status === "UNAVAILABLE"}
                  whileTap={{ scale: 0.98 }}
                >
                  Add to Trip
                </Button>
              </div>
            </div>
          </div>

          {/* Expandable details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl bg-surface/50 p-3">
                    <div className="text-text-muted">Airline</div>
                    <div className="font-medium text-text">{flight.airline}</div>
                  </div>
                  <div className="rounded-xl bg-surface/50 p-3">
                    <div className="text-text-muted">Flight</div>
                    <div className="font-medium text-text">{flight.flightNumber}</div>
                  </div>
                  <div className="rounded-xl bg-surface/50 p-3">
                    <div className="text-text-muted">Cabin</div>
                    <div className="font-medium text-text">{flight.cabin}</div>
                  </div>
                  <div className="rounded-xl bg-surface/50 p-3">
                    <div className="text-text-muted">Baggage</div>
                    <div className="font-medium text-text">{flight.baggageKg} kg</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle details button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-surface/80 backdrop-blur-xl border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-all duration-200"
          aria-label={showDetails ? "Show less details" : "Show more details"}
          aria-expanded={showDetails}
        >
          <ChevronDown className={cn("h-5 w-5 transition-transform", showDetails && "rotate-180")} />
        </button>
      </Card>
    </motion.div>
  );
}

// Hotel Result Card
interface HotelResultCardProps {
  hotel: {
    id: string;
    name: string;
    destination: string;
    location: string;
    rating: number | null;
    roomType?: string | null;
    amenities: string[];
    breakfast?: boolean | null;
    cancellation?: string | null;
    nightlyPrice: number | null;
    totalPrice: number | null;
    currency: string;
    isDemo: boolean;
    status: "LIVE" | "DEMO" | "UNAVAILABLE";
    images?: string[];
  };
  nights?: number;
  selected?: boolean;
  onSelect?: (hotel: HotelResultCardProps["hotel"]) => void;
  onAddToTrip?: (hotel: HotelResultCardProps["hotel"]) => void;
  index?: number;
}

export function HotelResultCard({ hotel, nights = 3, selected, onSelect, onAddToTrip, index = 0 }: HotelResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const images = hotel.images && hotel.images.length > 0 ? hotel.images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"];

  const total = hotel.totalPrice ?? (hotel.nightlyPrice != null ? hotel.nightlyPrice * nights : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("relative overflow-hidden transition-all duration-300", selected ? "ring-2 ring-saffron" : "")}
    >
      <Card variant={selected ? "elevated" : "glass-hover"} padding="none" className="relative">
        {/* Image carousel */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={imageIndex}
              src={images[imageIndex]}
              alt={`${hotel.name} - Image ${imageIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
          
          {/* Demo/Live badge */}
          <div className="absolute top-3 left-3 flex gap-1">
            <Badge variant={hotel.isDemo ? "default" : "success"} className="text-xs">
              {hotel.status === "LIVE" ? "Live" : "Demo"}
            </Badge>
            {hotel.breakfast && (
              <Badge variant="success" className="text-xs">
                Breakfast
              </Badge>
            )}
          </div>

          {/* Rating badge — hidden when the provider reports no rating */}
          {hotel.rating != null && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-bg-elevated/95 px-2.5 py-1 text-xs font-semibold text-text shadow-sm backdrop-blur">
                <Star className="w-3 h-3 text-saffron" />
                {hotel.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 backdrop-blur-xl border border-border text-text-muted hover:text-text transition-colors"
                aria-label="Previous image"
              >
                <ChevronDown className="h-5 w-5 rotate-180" />
              </button>
              <button
                onClick={() => setImageIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 backdrop-blur-xl border border-border text-text-muted hover:text-text transition-colors"
                aria-label="Next image"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-text">{hotel.name}</h3>
              <p className="text-sm text-text-muted mt-1">{hotel.location} · {hotel.destination}</p>
            </div>
          </div>

          <div className="text-sm text-text-muted mb-3">
            {[hotel.roomType, hotel.breakfast ? "Breakfast included" : hotel.breakfast === false ? "Room only" : null]
              .filter(Boolean)
              .join(" · ") || "Details on request"}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.amenities.slice(0, 4).map((a) => (
              <Badge key={a} variant="default" className="text-xs">{a}</Badge>
            ))}
            {hotel.cancellation && <Badge variant="success" className="text-xs">{hotel.cancellation}</Badge>}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3 border-t border-border pt-4">
            <div className="flex-1">
              <div className="text-xs text-text-muted">Price per night</div>
              <div className="text-2xl font-semibold text-text">
                <PriceText value={hotel.nightlyPrice} />
              </div>
              <div className="text-sm text-text-muted">
                {total != null ? (
                  <>{formatCurrency(total)} total for {nights} night{nights > 1 ? "s" : ""}</>
                ) : (
                  <>Total price on request</>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => onSelect?.(hotel)}
                variant={selected ? "secondary" : "primary"}
                size="lg"
                className="w-full sm:min-w-[150px] justify-center"
                disabled={hotel.status === "UNAVAILABLE"}
                whileTap={{ scale: 0.98 }}
              >
                {selected ? "Selected ✓" : "Select"}
              </Button>
              <Button
                onClick={() => onAddToTrip?.(hotel)}
                variant="ghost"
                size="lg"
                className="w-full sm:min-w-[150px] justify-center text-sm"
                disabled={hotel.status === "UNAVAILABLE"}
                whileTap={{ scale: 0.98 }}
              >
                Add to Trip
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Cab Result Card
interface CabResultCardProps {
  cab: {
    id: string;
    vehicleType: string;
    vehicleModel: string;
    capacity: number;
    luggage: number;
    includedKm: number;
    extraKmPrice: number;
    driverRating?: number | null;
    baseFare: number;
    tollEstimate: number;
    taxes: number;
    totalPrice: number;
    price: number;
    currency: string;
    cancellationPolicy: string;
    isDemo: boolean;
    status: "LIVE" | "DEMO" | "UNAVAILABLE";
  };
  selected?: boolean;
  onSelect?: (cab: CabResultCardProps["cab"]) => void;
  onAddToTrip?: (cab: CabResultCardProps["cab"]) => void;
  index?: number;
}

export function CabResultCard({ cab, selected, onSelect, onAddToTrip, index = 0 }: CabResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("relative overflow-hidden transition-all duration-300", selected ? "ring-2 ring-saffron" : "")}
    >
      <Card variant={selected ? "elevated" : "glass-hover"} padding="none" className="relative">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text">{cab.vehicleModel}</h3>
                  <p className="text-sm text-text-muted mt-1">
                    {cab.vehicleType} • Up to {cab.capacity} passengers
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted">Estimated fare</div>
                  <div className="text-2xl font-semibold text-text">{formatCurrency(cab.totalPrice)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="default">{cab.includedKm} km included</Badge>
                <Badge variant="default">₹{cab.extraKmPrice}/km extra</Badge>
                {cab.driverRating != null && cab.driverRating > 4.5 && <Badge variant="success">Highly rated</Badge>}
                {cab.isDemo && <Badge variant="default">Estimated fare</Badge>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
                <div className="rounded-xl bg-surface/50 p-2">
                  <div className="text-text-muted">Base fare</div>
                  <div className="font-semibold text-text">{formatCurrency(cab.baseFare)}</div>
                </div>
                <div className="rounded-xl bg-surface/50 p-2">
                  <div className="text-text-muted">Tolls</div>
                  <div className="font-semibold text-text">{formatCurrency(cab.tollEstimate)}</div>
                </div>
                <div className="rounded-xl bg-surface/50 p-2">
                  <div className="text-text-muted">Taxes</div>
                  <div className="font-semibold text-text">{formatCurrency(cab.taxes)}</div>
                </div>
                <div className="rounded-xl bg-surface/50 p-2">
                  <div className="text-text-muted">Total</div>
                  <div className="font-semibold text-text">{formatCurrency(cab.totalPrice)}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t border-border pt-4">
                <div className="text-sm text-text-muted flex-1">
                  {cab.cancellationPolicy}
                  {cab.driverRating != null && <> • Driver rating: {cab.driverRating}/5</>}
                </div>
                <Button
                  onClick={() => onSelect?.(cab)}
                  variant={selected ? "secondary" : "primary"}
                  size="lg"
                  className="w-full sm:min-w-[150px] justify-center"
                  disabled={cab.status === "UNAVAILABLE"}
                  whileTap={{ scale: 0.98 }}
                >
                  {selected ? "Selected ✓" : "Select"}
                </Button>
                <Button
                  onClick={() => onAddToTrip?.(cab)}
                  variant="ghost"
                  size="lg"
                  className="w-full sm:min-w-[150px] justify-center text-sm"
                  disabled={cab.status === "UNAVAILABLE"}
                  whileTap={{ scale: 0.98 }}
                >
                  Add to Trip
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Skeleton loaders
export function FlightResultSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.05, duration: 0.4 }}
    >
      <Card padding="none" className="relative">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-1">
              <Skeleton variant="text" width="120" />
              <Skeleton variant="text" width="80" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <Skeleton variant="text" width={50} height={28} />
              <Skeleton variant="text" width={60} height={14} />
            </div>
            <div className="flex flex-col items-center flex-1">
              <Skeleton variant="text" width={50} />
              <Skeleton variant="rectangular" className="h-px w-full my-2" />
            </div>
            <div className="text-center">
              <Skeleton variant="text" width={50} height={28} />
              <Skeleton variant="text" width={60} height={14} />
            </div>
          </div>
          <Skeleton variant="text" width={80} height={28} />
          <div className="flex gap-2">
            <Skeleton variant="default" width={120} height={40} />
            <Skeleton variant="default" width={120} height={40} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function HotelResultSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.05, duration: 0.4 }}
    >
      <Card padding="none" className="relative">
        <Skeleton variant="rectangular" className="h-48 w-full" />
        <div className="p-5 space-y-3">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="80%" />
          <div className="flex flex-wrap gap-2">
            <Skeleton variant="default" width={80} height={24} />
            <Skeleton variant="default" width={100} height={24} />
            <Skeleton variant="default" width={80} height={24} />
          </div>
          <div className="flex items-end justify-between border-t border-border pt-4">
            <div>
              <Skeleton variant="text" width={80} height={12} />
              <Skeleton variant="text" width={100} height={28} />
            </div>
            <div className="flex gap-2">
              <Skeleton variant="default" width={120} height={40} />
              <Skeleton variant="default" width={120} height={40} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function CabResultSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.05, duration: 0.4 }}
    >
      <Card padding="none" className="relative">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton variant="text" width="120" />
              <Skeleton variant="text" width="100" />
            </div>
            <div className="text-right">
              <Skeleton variant="text" width={80} height={12} />
              <Skeleton variant="text" width={100} height={28} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton variant="default" width={100} height={24} />
            <Skeleton variant="default" width={100} height={24} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Skeleton variant="rectangular" className="h-20" />
            <Skeleton variant="rectangular" className="h-20" />
            <Skeleton variant="rectangular" className="h-20" />
            <Skeleton variant="rectangular" className="h-20" />
          </div>
          <div className="flex items-end justify-between border-t border-border pt-4">
            <Skeleton variant="text" width={150} />
            <div className="flex gap-2">
              <Skeleton variant="default" width={120} height={40} />
              <Skeleton variant="default" width={120} height={40} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}