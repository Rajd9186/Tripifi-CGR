"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { validateFlightSearch, type FieldErrors } from "@/lib/validation";
import { useApp } from "@/lib/store";
import { todayISO } from "@/lib/utils";
import { searchAirports } from "@/data/autocomplete";

export default function FlightSearchForm({ initial }: { initial?: Record<string, string | undefined> }) {
  const router = useRouter();
  const { updateSearchState } = useApp();
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [departure, setDeparture] = useState(initial?.date ?? todayISO());
  const [travellers, setTravellers] = useState("1 Traveller, Economy");
  const [tripType, setTripType] = useState("One Way");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [fromOptions, setFromOptions] = useState(() => searchAirports(initial?.from ?? ""));
  const [toOptions, setToOptions] = useState(() => searchAirports(initial?.to ?? ""));

  const handleFromChange = (option: { label: string }) => {
    setFrom(option.label);
    setFromOptions(searchAirports(option.label));
  };

  const handleToChange = (option: { label: string }) => {
    setTo(option.label);
    setToOptions(searchAirports(option.label));
  };

  const handleFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFrom(value);
    setFromOptions(searchAirports(value));
  };

  const handleToInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTo(value);
    setToOptions(searchAirports(value));
  };

  const submit = () => {
    const count = parseInt(travellers, 10) || 1;
    const errs = validateFlightSearch({ from, to, departure, travellers: count });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const cabin = travellers.includes("Business") ? "Business" : "Economy";
    updateSearchState({ flights: { from, to, departure, travellers, class: cabin, tripType } });
    const params = new URLSearchParams({ from, to, date: departure, travellers: String(count), class: cabin, trip: tripType === "Round Trip" ? "round" : "oneway" });
    router.push(`/flights/results?${params.toString()}`);
  };

  return (
    <Card padding="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <AutocompleteInput
            label="From"
            placeholder="Delhi (DEL)"
            value={from}
            onChange={handleFromInput}
            onSelect={handleFromChange}
            options={fromOptions}
            error={errors.from}
            id="sf-from"
          />
        </div>
        <div className="lg:col-span-2">
          <AutocompleteInput
            label="To"
            placeholder="Mumbai (BOM)"
            value={to}
            onChange={handleToInput}
            onSelect={handleToChange}
            options={toOptions}
            error={errors.to}
            id="sf-to"
          />
        </div>
        <div>
          <Input label="Departure" type="date" value={departure} min={todayISO()} onChange={(e) => setDeparture(e.target.value)} error={errors.departure} id="sf-date" />
        </div>
        <div className="lg:col-span-2">
          <Select label="Travellers & Class" value={travellers} onChange={(e) => setTravellers(e.target.value)}>
            <option>1 Traveller, Economy</option>
            <option>2 Travellers, Economy</option>
            <option>3 Travellers, Economy</option>
            <option>1 Traveller, Business</option>
          </Select>
        </div>
        <div>
          <Select label="Trip Type" value={tripType} onChange={(e) => setTripType(e.target.value)}>
            <option>One Way</option>
            <option>Round Trip</option>
          </Select>
        </div>
        <div className="flex items-end">
          <button onClick={submit} className="btn-primary min-h-[52px] w-full justify-center">
            Search Flights
          </button>
        </div>
      </div>
    </Card>
  );
}

