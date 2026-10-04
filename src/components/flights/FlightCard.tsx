import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  price: number;
  classType: string;
  baggage: string;
  meals: string;
  refundable: boolean;
}

interface FlightCardProps {
  flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded bg-navy-50 flex items-center justify-center text-navy-900 font-semibold text-xs">
              {flight.airline.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-ink-900">{flight.airline}</div>
              <div className="text-xs text-ink-500">{flight.flightNumber}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-semibold text-ink-900">
                {flight.departure}
              </div>
              <div className="text-sm text-ink-600">{flight.fromCode}</div>
              <div className="text-xs text-ink-500 mt-1 truncate max-w-[80px] sm:max-w-none">
                {flight.from}
              </div>
            </div>

            <div className="flex flex-col items-center flex-1 px-4">
              <div className="text-sm text-ink-600">{flight.duration}</div>
              <div className="relative w-full my-2">
                <div className="h-0.5 bg-ink-200"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-ink-400"></div>
              </div>
              <div className="text-sm text-ink-600">{flight.stops}</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-semibold text-ink-900">
                {flight.arrival}
              </div>
              <div className="text-sm text-ink-600">{flight.toCode}</div>
              <div className="text-xs text-ink-500 mt-1 truncate max-w-[80px] sm:max-w-none">
                {flight.to}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-ink-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col lg:items-end gap-3">
          <div className="flex items-center justify-between lg:flex-col lg:items-end w-full lg:w-auto">
            <div>
              <div className="text-xs text-ink-500">Starting from</div>
              <div className="text-3xl font-semibold text-ink-900">
                ₹{flight.price.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-ink-500">{flight.classType}</div>
            </div>
            <div className="flex lg:hidden">
              <Button href="/checkout" size="sm">Book</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {flight.refundable && <Badge variant="success">Refundable</Badge>}
            <Badge variant="default">{flight.baggage}</Badge>
            <Badge variant="default">{flight.meals}</Badge>
          </div>

          <div className="hidden lg:flex">
            <Button href="/checkout">Book Flight</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
