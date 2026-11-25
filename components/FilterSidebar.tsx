"use client";

import type { QuakeFilters } from "@/lib/types";

interface Props {
  filters: QuakeFilters;
  onChange: (filters: QuakeFilters) => void;
  availableDistricts: string[];
  totalCount: number;
  filteredCount: number;
}

export default function FilterSidebar({
  filters,
  onChange,
  availableDistricts,
  totalCount,
  filteredCount,
}: Props) {
  const update = (patch: Partial<QuakeFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const toggleDistrict = (name: string) => {
    const next = filters.districts.includes(name)
      ? filters.districts.filter((d) => d !== name)
      : [...filters.districts, name];
    update({ districts: next });
  };

  const reset = () => {
    onChange({
      minMagnitude: 0,
      maxMagnitude: 10,
      districts: [],
      startDate: null,
      endDate: null,
    });
  };

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-bold text-[#0b3a5d]">Refine</h2>
        <button
          onClick={reset}
          className="cursor-pointer text-xs font-semibold text-[#ff6b00] hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="rounded bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Showing{" "}
          <span className="font-bold text-slate-900">
            {filteredCount.toLocaleString()}
          </span>{" "}
          of {totalCount.toLocaleString()} events
        </div>

        {/* Magnitude */}
        <div className="mt-4">
          <label className="mb-2 block text-[11px] font-bold tracking-wide text-slate-700 uppercase">
            Magnitude
          </label>
          <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
            <span>M {filters.minMagnitude.toFixed(1)}</span>
            <span>M {filters.maxMagnitude.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={filters.minMagnitude}
            aria-label="Minimum magnitude"
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              update({
                minMagnitude: v,
                maxMagnitude: Math.max(v, filters.maxMagnitude),
              });
            }}
            className="w-full accent-[#ff6b00]"
          />
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={filters.maxMagnitude}
            aria-label="Maximum magnitude"
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              update({
                maxMagnitude: v,
                minMagnitude: Math.min(v, filters.minMagnitude),
              });
            }}
            className="w-full accent-[#ff6b00]"
          />
        </div>

        {/* Date range */}
        <div className="mt-4">
          <label className="mb-2 block text-[11px] font-bold tracking-wide text-slate-700 uppercase">
            Date range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.startDate?.slice(0, 10) ?? ""}
              aria-label="Start date"
              onChange={(e) =>
                update({
                  startDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
            />
            <input
              type="date"
              value={filters.endDate?.slice(0, 10) ?? ""}
              aria-label="End date"
              onChange={(e) =>
                update({
                  endDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
            />
          </div>
        </div>

        {/* Districts */}
        <div className="mt-4">
          <label className="mb-2 block text-[11px] font-bold tracking-wide text-slate-700 uppercase">
            Districts ({filters.districts.length > 0 ? filters.districts.length : "all"})
          </label>
          <div className="max-h-48 overflow-y-auto rounded border border-slate-200 p-1">
            {availableDistricts.map((name) => (
              <label
                key={name}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
              >
                <input
                  type="checkbox"
                  checked={filters.districts.includes(name)}
                  onChange={() => toggleDistrict(name)}
                  className="accent-[#ff6b00]"
                />
                <span className="line-clamp-1">{name}</span>
              </label>
            ))}
            {availableDistricts.length === 0 && (
              <div className="p-2 text-xs text-slate-500">
                No districts in current data
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
