"use client";

import { ALL_REGIONS } from "@/lib/quake-data";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  province: string;
  onProvinceChange: (p: string) => void;
  provinces: string[];
}

export default function SiteHeader({
  query,
  onQueryChange,
  province,
  onProvinceChange,
  provinces,
}: Props) {
  return (
    <header className="sticky top-0 z-[1100] bg-[#0b3a5d] text-white shadow-md">
      {/* Wraps below sm: logo + region on one row, search on its own */}
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b00]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M2 12h3.5l2-6 3.5 13 3-16 3 15 2-6H22"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">
            Quake<span className="text-[#ff9d4d]">Watch</span>
          </span>
        </div>

        <div className="relative order-last w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search a place, district or province"
            aria-label="Search earthquakes by location"
            className="w-full rounded-full bg-white py-2 pr-3 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff6b00] focus:outline-none"
          />
        </div>

        <label className="sr-only" htmlFor="province-select">
          Region
        </label>
        <select
          id="province-select"
          value={province}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="ml-auto max-w-[60%] shrink-0 cursor-pointer rounded-full border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-[#ff6b00] focus:outline-none sm:ml-0 sm:max-w-none"
        >
          {[ALL_REGIONS, ...provinces].map((p) => (
            <option key={p} value={p} className="text-slate-800">
              {p}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
