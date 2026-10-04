"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { validateTrainSearch, type FieldErrors } from "@/lib/validation";
import { useApp } from "@/lib/store";
import { todayISO } from "@/lib/utils";

export default function TrainSearchForm({ initial }: { initial?: Record<string, string | undefined> }) {
  const router = useRouter();
  const { updateSearchState } = useApp();
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [trainClass, setTrainClass] = useState(initial?.class ?? "All Classes");
  const [quota, setQuota] = useState(initial?.quota ?? "General");
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = () => {
    const errs = validateTrainSearch({ from, to, date, travellers: 1 });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateSearchState({ trains: { from, to, date, class: trainClass, quota } });
    router.push(`/trains/results?${new URLSearchParams({ from, to, date, class: trainClass, quota }).toString()}`);
  };

  return (
    <Card padding="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Input label="From Station" placeholder="Howrah (HWH)" value={from} onChange={(e) => setFrom(e.target.value)} error={errors.from} id="ts-from" />
        </div>
        <div>
          <Input label="To Station" placeholder="New Delhi (NDLS)" value={to} onChange={(e) => setTo(e.target.value)} error={errors.to} id="ts-to" />
        </div>
        <div>
          <Input label="Departure Date" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} error={errors.date} id="ts-date" />
        </div>
        <div>
          <Select label="Class" value={trainClass} onChange={(e) => setTrainClass(e.target.value)}>
            <option>All Classes</option>
            <option>1A</option>
            <option>2A</option>
            <option>3A</option>
            <option>SL</option>
            <option>CC</option>
            <option>EC</option>
          </Select>
        </div>
        <div>
          <Select label="Quota" value={quota} onChange={(e) => setQuota(e.target.value)}>
            <option>General</option>
            <option>Tatkal</option>
            <option>Ladies</option>
            <option>Premium Tatkal</option>
          </Select>
        </div>
        <div className="md:col-span-5 flex justify-end">
          <button onClick={submit} className="btn-primary min-h-[52px] w-full md:w-auto justify-center">
            Search Trains
          </button>
        </div>
      </div>
    </Card>
  );
}

