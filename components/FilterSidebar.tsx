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
    <aside className="absolute top-4 right-4 z-[1000] w-72 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">Filters</h2>
        <button
          onClick={reset}
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          Reset
        </button>
      </div>

      <div className="mb-3 rounded bg-slate-50 p-2 text-xs text-slate-600">
        Showing <span className="font-semibold text-slate-900">{filteredCount.toLocaleString()}</span>{" "}
        of {totalCount.toLocaleString()} events
      </div>

      {/* Magnitude */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Magnitude range
        </label>
        <div className="mb-1 flex justify-between text-[10px] text-slate-500">
          <span>M {filters.minMagnitude.toFixed(1)}</span>
          <span>M {filters.maxMagnitude.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={filters.minMagnitude}
          onChange={(e) => update({ minMagnitude: parseFloat(e.target.value) })}
          className="w-full"
        />
        <input
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={filters.maxMagnitude}
          onChange={(e) => update({ maxMagnitude: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Date range */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Date range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.startDate?.slice(0, 10) ?? ""}
            onChange={(e) =>
              update({
                startDate: e.target.value ? new Date(e.target.value).toISOString() : null,
              })
            }
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <input
            type="date"
            value={filters.endDate?.slice(0, 10) ?? ""}
            onChange={(e) =>
              update({
                endDate: e.target.value ? new Date(e.target.value).toISOString() : null,
              })
            }
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* Districts */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Districts ({filters.districts.length > 0 ? filters.districts.length : "all"})
        </label>
        <div className="max-h-60 overflow-y-auto rounded border border-slate-200 p-1">
          {availableDistricts.map((name) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-slate-100"
            >
              <input
                type="checkbox"
                checked={filters.districts.includes(name)}
                onChange={() => toggleDistrict(name)}
              />
              <span>{name}</span>
            </label>
          ))}
          {availableDistricts.length === 0 && (
            <div className="p-2 text-xs text-slate-500">
              No districts in current data
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}