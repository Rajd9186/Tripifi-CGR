"use client";

import { useEffect, useState } from "react";
import { geoApi, type WeatherResponse } from "@/lib/api/geo";

/** Live weather chips for a destination. Hides gracefully on any failure. */
export default function WeatherChips({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    geoApi.weather(lat, lng, 3).then((w) => {
      if (!cancelled && w && w.state === "SUCCESS") setWeather(w);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (!weather) return null;
  const { current_temp_c, current_condition, daily } = weather.data;
  const today = daily[0];

  return (
    <div className="mt-4 border-t border-ink-100 pt-4" aria-label={`Current weather in ${name}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Live weather</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {current_temp_c != null && (
          <span className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-navy-50 px-3 text-xs font-medium text-ink-800">
            {Math.round(current_temp_c)}°C · {current_condition}
          </span>
        )}
        {today && today.tmax_c != null && (
          <span className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-navy-50 px-3 text-xs font-medium text-ink-800">
            Today {Math.round(today.tmax_c)}° / {today.tmin_c != null ? `${Math.round(today.tmin_c)}°` : "—"}
          </span>
        )}
        {today && today.precip_prob_pct != null && (
          <span className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-navy-50 px-3 text-xs font-medium text-ink-800">
            Rain {today.precip_prob_pct}%
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-ink-400">{weather.attribution}</p>
    </div>
  );
}
