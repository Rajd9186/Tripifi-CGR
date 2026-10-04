"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { validateCabSearch, type FieldErrors } from "@/lib/validation";
import { useApp } from "@/lib/store";
import { todayISO } from "@/lib/utils";

export default function CabSearchForm({ initial }: { initial?: Record<string, string | undefined> }) {
  const router = useRouter();
  const { updateSearchState } = useApp();
  const [pickup, setPickup] = useState(initial?.pickup ?? "");
  const [drop, setDrop] = useState(initial?.drop ?? "");
  const [datetime, setDatetime] = useState(initial?.datetime ?? "");
  const [tripType, setTripType] = useState(initial?.trip ?? "oneway");
  const [vehicle, setVehicle] = useState(initial?.vehicle ?? "All Vehicles");
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = () => {
    const errs = validateCabSearch({ pickup, drop, date: datetime ? datetime.slice(0, 10) : "" });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateSearchState({ cabs: { pickup, drop, datetime, tripType, vehicle } });
    const params = new URLSearchParams({ pickup, drop, trip: tripType, vehicle });
    if (datetime) params.set("datetime", datetime);
    router.push(`/cabs/results?${params.toString()}`);
  };

  return (
    <Card padding="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Input label="Pickup Location" placeholder="Kolkata Airport" value={pickup} onChange={(e) => setPickup(e.target.value)} error={errors.pickup} id="cs-pickup" />
        </div>
        <div className="lg:col-span-2">
          <Input label="Drop Location" placeholder="Park Street" value={drop} onChange={(e) => setDrop(e.target.value)} error={errors.drop} id="cs-drop" />
        </div>
        <div>
          <Input label="Pickup Date & Time" type="datetime-local" value={datetime} min={todayISO()} onChange={(e) => setDatetime(e.target.value)} id="cs-dt" />
        </div>
        <div>
          <Select label="Trip Type" value={tripType} onChange={(e) => setTripType(e.target.value)}>
            <option value="oneway">One Way</option>
            <option value="round">Round Trip</option>
            <option value="local">Local</option>
            <option value="multiday">Multi-Day</option>
          </Select>
        </div>
        <div>
          <Select label="Vehicle Type" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            <option>All Vehicles</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Premium SUV</option>
            <option>Luxury</option>
          </Select>
        </div>
        <div className="md:col-span-3 flex items-end">
          <button onClick={submit} className="btn-primary min-h-[52px] w-full md:w-auto justify-center">
            Search Cabs
          </button>
        </div>
      </div>
    </Card>
  );
}

