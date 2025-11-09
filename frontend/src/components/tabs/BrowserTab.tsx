import { useMemo, useState, useEffect } from "react";
import { useDataStore } from "../../data/DataStore";

export function BrowserTab() {
  const { sessions } = useDataStore();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // New filters
  const [minDur, setMinDur] = useState(5); // minutes
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  const inRange = (d: Date) => {
    const t = d.getTime();
    const f = from ? new Date(from).getTime() : -Infinity;
    const tt = to ? new Date(to).getTime() + 24 * 3600 * 1000 - 1 : Infinity;
    return t >= f && t <= tt;
  };

  const filtered = useMemo(
    () =>
      sessions.filter((s) => {
        const match =
          !q ||
          s.app_name.toLowerCase().includes(q.toLowerCase()) ||
          (s.window_title || "").toLowerCase().includes(q.toLowerCase());
        return match && inRange(new Date(s.start_time));
      }),
    [sessions, q, from, to]
  );

  const byApp = useMemo(() => {
    const map = new Map<string, { app: string; totalSec: number; count: number; samples: string[] }>();
    for (const s of filtered) {
      const key = s.app_name;
      const prev = map.get(key) || { app: key, totalSec: 0, count: 0, samples: [] };
      prev.totalSec += s.duration_seconds || 0;
      prev.count += 1;
      if (s.window_title && prev.samples.length < 3) prev.samples.push(s.window_title);
      map.set(key, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.totalSec - a.totalSec);
  }, [filtered]);

  // Initialize selected apps to top 5 of current filter
  useEffect(() => {
    if (selectedApps.length === 0 && byApp.length) {
      setSelectedApps(byApp.slice(0, 5).map((a) => a.app));
    }
  }, [byApp, selectedApps.length]);

  const max = byApp[0]?.totalSec || 1;

  // Multi-lane timeline data based on selected apps and min duration
  const lanes = useMemo(() => {
    const map = new Map<string, { app: string; items: { id: number; start: Date; end: Date; dur: number }[] }>();
    for (const s of filtered) {
      if (selectedApps.length && !selectedApps.includes(s.app_name)) continue;
      const dur = s.duration_seconds || 0;
      if (dur < minDur * 60) continue;
      const start = new Date(s.start_time);
      const end = s.end_time ? new Date(s.end_time) : new Date(start.getTime() + dur * 1000);
      const lane = map.get(s.app_name) || { app: s.app_name, items: [] };
      lane.items.push({ id: s.id, start, end, dur });
      map.set(s.app_name, lane);
    }
    const rows = Array.from(map.values());
    rows.forEach((r) => r.items.sort((a, b) => a.start.getTime() - b.start.getTime()));
    return rows.sort((a, b) => (byApp.findIndex((x) => x.app === a.app) - byApp.findIndex((x) => x.app === b.app)));
  }, [filtered, selectedApps, minDur, byApp]);

  // Global range across lanes
  const [tStart, tEnd] = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let maxTs = 0;
    for (const l of lanes) {
      for (const it of l.items) {
        min = Math.min(min, it.start.getTime());
        maxTs = Math.max(maxTs, it.end.getTime());
      }
    }
    if (!isFinite(min) || maxTs === 0) {
      const now = new Date();
      return [now, now] as const;
    }
    return [new Date(min), new Date(maxTs)] as const;
  }, [lanes]);
  const tRange = Math.max(tEnd.getTime() - tStart.getTime(), 1);

  return (
    <div className="space-y-6">
      {/* Header with base filters */}
      <header className="flex flex-col md:flex-row gap-2 md:items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Search</label>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Filter apps or windows..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md bg-background" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md bg-background" />
        </div>
      </header>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Applications (aggregated)</h3>
        <ul className="space-y-2">
          {byApp.map(a => (
            <li
              key={a.app}
              className="p-3 border border-border rounded-md flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{a.app}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(a.totalSec / 60)} min • {a.count} sessions
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(a.totalSec / max) * 100}%` }}
                />
              </div>
              {a.samples.length > 0 && (
                <div className="text-xs text-muted-foreground truncate">
                  e.g. {a.samples.join(" • ")}
                </div>
              )}
            </li>
          ))}
          {byApp.length === 0 && (
            <li className="text-sm text-muted-foreground">
              No sessions for filters.
            </li>
          )}
        </ul>

        {/* Usage Timeline with filters */}
        <div className="space-y-3 mt-4">
          <div className="flex flex-wrap items-end gap-2 justify-between">
            <h4 className="text-md font-semibold">Usage Timeline</h4>
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-xs text-muted-foreground">Min dur (min)</label>
                <input type="number" min={0} value={minDur} onChange={(e) => setMinDur(Number(e.target.value || 0))} className="w-20 px-2 py-1 border border-border rounded bg-background text-sm" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {byApp.slice(0, 8).map((a) => {
              const active = selectedApps.includes(a.app);
              return (
                <button
                  key={a.app}
                  onClick={() =>
                    setSelectedApps((prev) =>
                      active ? prev.filter((x) => x !== a.app) : [...prev, a.app]
                    )
                  }
                  className={
                    "px-2 py-1 text-sm rounded border " +
                    (active ? "bg-primary text-primary-foreground border-border" : "bg-muted text-foreground border-border hover:bg-muted/70")
                  }
                >
                  {a.app}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {lanes.map((lane) => (
              <div key={lane.app} className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-sm text-muted-foreground truncate">{lane.app}</div>
                <div className="relative flex-1 h-8 border border-border rounded bg-muted/40 overflow-hidden">
                  {/* vertical grid */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex-1 border-r last:border-r-0 border-border/40" />
                    ))}
                  </div>
                  {/* items */}
                  {lane.items.map((t) => {
                    const left = ((t.start.getTime() - tStart.getTime()) / tRange) * 100;
                    const width = ((t.end.getTime() - t.start.getTime()) / tRange) * 100;
                    return (
                      <div
                        key={t.id}
                        className="absolute top-1 h-6 rounded bg-primary/70 hover:bg-primary text-xs text-primary-foreground flex items-center justify-center"
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${lane.app} • ${Math.round(t.dur / 60)} min`}
                      >
                        <span className="px-1 truncate">{Math.round(t.dur / 60)}m</span>
                      </div>
                    );
                  })}
                  {lane.items.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">No sessions</div>
                  )}
                </div>
              </div>
            ))}
            {lanes.length === 0 && <div className="text-sm text-muted-foreground">No sessions in range</div>}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{tStart.toLocaleTimeString()}</span>
            <span>{tEnd.toLocaleTimeString()}</span>
          </div>
        </div>
      </section>

      {/* Raw Sessions */}
      <section className="space-y-2">
        <h4 className="text-md font-semibold">Raw Sessions</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-3">App</th>
                <th className="py-2 pr-3">Window</th>
                <th className="py-2 pr-3">Start</th>
                <th className="py-2 pr-3">Dur (min)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-2 pr-3">{s.app_name}</td>
                  <td className="py-2 pr-3 truncate max-w-[12rem]">
                    {s.window_title || "—"}
                  </td>
                  <td className="py-2 pr-3">
                    {new Date(s.start_time).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3">
                    {Math.round((s.duration_seconds || 0) / 60)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
