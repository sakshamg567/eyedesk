import { useDataStore } from "../../data/DataStore";
import { useEffect, useMemo, useState } from "react";

export function SummaryTab() {
  const { derived, sessions, focus } = useDataStore();
  const {
    totalDurationSec,
    topApp,
    focusSummary: { focusedSec, unfocusedSec, focusRatio },
    interruptions,
    byApp,
  } = derived;

  const topThree = byApp.slice(0, 3);
  const toHrs = (sec: number) => (sec / 3600).toFixed(1);

  // Filters for app timeline
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minDur, setMinDur] = useState(5); // minutes

  const inRange = (d: Date) => {
    const t = d.getTime();
    const f = from ? new Date(from).getTime() : -Infinity;
    const tt = to ? new Date(to).getTime() + 24 * 3600 * 1000 - 1 : Infinity;
    return t >= f && t <= tt;
  };

  // Build per-app lanes for top 3 apps only
  const lanes = useMemo(() => {
    const result = topThree.map((a) => ({ app: a.app, items: [] as { id: number; start: Date; end: Date; dur: number }[] }));
    for (const s of sessions) {
      if (!topThree.some((t) => t.app === s.app_name)) continue;
      const start = new Date(s.start_time);
      if (!inRange(start)) continue;
      const dur = s.duration_seconds || 0;
      if (dur < minDur * 60) continue;
      const end = s.end_time ? new Date(s.end_time) : new Date(start.getTime() + dur * 1000);
      const lane = result.find((r) => r.app === s.app_name)!;
      lane.items.push({ id: s.id, start, end, dur });
    }
    // Sort inside lanes
    for (const l of result) l.items.sort((a, b) => a.start.getTime() - b.start.getTime());
    return result;
  }, [sessions, topThree, from, to, minDur]);

  // Global range across shown lanes
  const [rangeStart, rangeEnd] = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let max = 0;
    for (const l of lanes) {
      for (const it of l.items) {
        min = Math.min(min, it.start.getTime());
        max = Math.max(max, it.end.getTime());
      }
    }
    if (!isFinite(min) || max === 0) {
      const now = new Date();
      return [now, now] as const;
    }
    return [new Date(min), new Date(max)] as const;
  }, [lanes]);

  const totalRangeMs = Math.max(rangeEnd.getTime() - rangeStart.getTime(), 1);

  const totalFocus = focusedSec + unfocusedSec || 1;
  const efficiencyRatio = totalDurationSec ? focusedSec / totalDurationSec : 0;

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <Kpi title="Total Time (hrs)" value={toHrs(totalDurationSec)} />
        <Kpi title="Top App" value={topApp?.app ?? "—"} />
        <Kpi title="Focus Ratio" value={`${Math.round(focusRatio * 100)}%`} />
        <Kpi title="Interruptions" value={interruptions.length.toString()} />
        <Kpi title="Efficiency" value={`${Math.round(efficiencyRatio * 100)}%`} />
      </div>

      {/* Top Apps */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Top Applications</h3>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          {topThree.map(a => (
            <div
              key={a.app}
              className="p-3 rounded-md border border-border bg-muted/30 flex flex-col gap-1"
            >
              <div className="font-medium truncate">{a.app}</div>
              <div className="text-xs text-muted-foreground">
                {Math.round(a.totalSec / 60)} min • {a.count} sessions
              </div>
              <div className="h-1.5 bg-muted rounded">
                <div
                  className="h-full bg-primary rounded"
                  style={{
                    width: `${
                      (a.totalSec / (topThree[0]?.totalSec || 1)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
          {topThree.length === 0 && (
            <div className="text-sm text-muted-foreground">No data.</div>
          )}
        </div>
      </section>

      {/* Focus Overview */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Focus Overview</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 rounded-full overflow-hidden border border-border flex">
            {focus.map(f => (
              <div
                key={f.id}
                className={
                  f.state === "focused" ? "bg-emerald-500" : "bg-rose-500"
                }
                style={{ width: `${(f.duration / totalFocus) * 100}%` }}
                title={`${f.state} • ${Math.round(f.duration / 60)} min`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(focusRatio * 100)}% focused
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {toHrs(focusedSec)}h focused • {toHrs(unfocusedSec)}h unfocused
        </p>
      </section>

      {/* Session Timeline (per-app lanes) */}
      <section className="space-y-3">
        <div className="flex items-end flex-wrap gap-3 justify-between">
          <h3 className="text-lg font-semibold">Session Timeline</h3>
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs text-muted-foreground">From</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-2 py-1 border border-border rounded bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground">To</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-2 py-1 border border-border rounded bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground">Min dur (min)</label>
              <input type="number" min={0} value={minDur} onChange={(e) => setMinDur(Number(e.target.value || 0))} className="w-20 px-2 py-1 border border-border rounded bg-background text-sm" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
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
                  const leftPct = ((t.start.getTime() - rangeStart.getTime()) / totalRangeMs) * 100;
                  const widthPct = ((t.end.getTime() - t.start.getTime()) / totalRangeMs) * 100;
                  return (
                    <div
                      key={t.id}
                      className="absolute top-1 h-6 rounded bg-primary/70 hover:bg-primary text-xs text-primary-foreground flex items-center justify-center"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
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
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{rangeStart.toLocaleTimeString()}</span>
          <span>{rangeEnd.toLocaleTimeString()}</span>
        </div>
      </section>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-3 rounded-md border border-border bg-muted/30">
      <div className="text-xs text-muted-foreground uppercase">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
