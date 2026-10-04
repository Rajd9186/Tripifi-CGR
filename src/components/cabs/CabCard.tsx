import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export interface Cab {
  id: string;
  type: string;
  category: "sedan" | "suv" | "premium" | "luxury";
  name: string;
  capacity: number;
  price: number;
  extraKm: number;
  includedKm: number;
  driverRating: number;
  cancellationPolicy: string;
  image: string;
  features: string[];
}

interface CabCardProps {
  cab: Cab;
}

export default function CabCard({ cab }: CabCardProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-56 h-48 sm:h-auto bg-ink-50">
          <img
            src={cab.image}
            alt={cab.name}
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-ink-900">{cab.name}</h3>
              <p className="text-sm text-ink-600 mt-1">
                {cab.type} • Up to {cab.capacity} passengers
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-ink-500">Starting from</div>
              <div className="text-2xl font-semibold text-ink-900">
                ₹{cab.price.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default">{cab.includedKm} km included</Badge>
            <Badge variant="default">₹{cab.extraKm}/km extra</Badge>
            {cab.driverRating > 4.5 && <Badge variant="success">Highly rated</Badge>}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {cab.features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center rounded-lg bg-ink-50 px-2 py-1 text-xs text-ink-700"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-ink-100 pt-4">
            <div className="text-sm text-ink-600">
              Driver rating: {cab.driverRating}/5 • {cab.cancellationPolicy}
            </div>
            <Button href="/checkout" size="sm">
              Book Cab
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
