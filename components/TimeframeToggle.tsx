"use client";

import type { Timeframe } from "@/lib/types";

interface Props {
  value: Timeframe;
  onChange: (t: Timeframe) => void;
}

const OPTIONS: { key: Timeframe; label: string }[] = [
  { key: "30d", label: "30 Days" },
  { key: "5y", label: "5 Years" },
  { key: "50y", label: "50 Years" },
];

export default function TimeframeToggle({ value, onChange }: Props) {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] gap-1 px-4">
        {OPTIONS.map((opt) => {
          const active = value === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-[3px] px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "border-[#ff6b00] text-[#0b3a5d]"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
