import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export interface Train {
  id: string;
  number: string;
  name: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  duration: string;
  days: string[];
  classes: Array<{
    type: string;
    availability: string;
    price: number;
  }>;
}

interface TrainCardProps {
  train: Train;
}

export default function TrainCard({ train }: TrainCardProps) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-ink-900">
              {train.number} • {train.name}
            </div>
            <div className="text-sm text-ink-600 mt-1">
              {train.from} ({train.fromCode}) → {train.to} ({train.toCode})
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {train.days.map((day) => (
              <span
                key={day}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-ink-200 bg-white text-[10px] font-medium text-ink-700"
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-semibold text-ink-900">
              {train.departure}
            </div>
            <div className="text-sm text-ink-600">{train.fromCode}</div>
          </div>

          <div className="flex flex-col items-center flex-1 px-4">
            <div className="text-sm text-ink-600">{train.duration}</div>
            <div className="relative w-full my-2">
              <div className="h-0.5 bg-ink-200"></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold text-ink-900">
              {train.arrival}
            </div>
            <div className="text-sm text-ink-600">{train.toCode}</div>
          </div>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {train.classes.map((cls) => (
              <div
                key={cls.type}
                className="border border-ink-100 rounded-lg p-2 text-center"
              >
                <div className="text-xs font-medium text-ink-900">{cls.type}</div>
                <div className="text-xs text-ink-600 mt-1">{cls.availability}</div>
                <div className="text-sm font-semibold text-ink-900 mt-1">
                  ₹{cls.price.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="default">Simulated availability</Badge>
          <Button href="/checkout" size="sm">
            Check & Book
          </Button>
        </div>
      </div>
    </div>
  );
}
