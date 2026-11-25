"use client";

interface RegionCount {
  name: string;
  count: number;
}

interface Props {
  regions: RegionCount[];
  onSelect: (name: string) => void;
}

export default function RegionBreakdown({ regions, onSelect }: Props) {
  if (regions.length === 0) return null;

  const busiest = Math.max(...regions.map((r) => r.count));

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-bold text-[#0b3a5d]">By region</h2>
      </div>

      <ul className="divide-y divide-slate-100">
        {regions.map((r) => (
          <li key={r.name}>
            <button
              onClick={() => onSelect(r.name)}
              className="w-full cursor-pointer px-4 py-2.5 text-left transition hover:bg-slate-50"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="line-clamp-1 text-sm text-slate-700">
                  {r.name}
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  {r.count.toLocaleString()}
                </span>
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-[#0b3a5d]"
                  style={{ width: `${Math.max((r.count / busiest) * 100, 3)}%` }}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
