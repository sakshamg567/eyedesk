import { useMemo, useState } from "react";
import { useDataStore } from "../../data/DataStore";

export function GraphTab() {
  const { focus, derived } = useDataStore();
  const { focusSummary, interruptions } = derived;

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minDur, setMinDur] = useState(1); // minutes
  const [showFocused, setShowFocused] = useState(true);
  const [showUnfocused, setShowUnfocused] = useState(true);

  const inRange = (d: Date) => {
    const t = d.getTime();
    const f = from ? new Date(from).getTime() : -Infinity;
    const tt = to ? new Date(to).getTime() + 24 * 3600 * 1000 - 1 : Infinity;
    return t >= f && t <= tt;
  };

  const data = useMemo(
    () =>
      focus.filter(
        (f) =>
          ((f.state === "focused" && showFocused) ||
            (f.state === "unfocused" && showUnfocused)) &&
          f.duration >= minDur * 60 &&
          inRange(new Date(f.timestamp))
      ),
    [focus, from, to, minDur, showFocused, showUnfocused]
  );

  const segments = useMemo(() => {
    const total = data.reduce((acc, f) => acc + f.duration, 0) || 1;
    return data.map((f) => ({
      key: f.id,
      label: f.state,
      widthPct: (f.duration / total) * 100,
      color: f.state === "focused" ? "bg-emerald-500" : "bg-rose-500",
    }));
  }, [data]);

  const hoursScale = (() => {
    if (!data.length) return [];
    const times = data.map((f) => new Date(f.timestamp).getTime());
    const min = Math.min(...times);
    const max = Math.max(...times);
    const spanMs = max - min || 1;
    const hours = Math.ceil(spanMs / 3600000);
    return Array.from({ length: hours + 1 }, (_, i) => new Date(min + i * 3600000));
  })();

  const avgFocusedStreakMin = (() => {
    let streak = 0;
    let total = 0;
    let count = 0;
    for (const f of data) {
      if (f.state === "focused") {
        streak += f.duration;
      } else if (streak > 0) {
        total += streak;
        count++;
        streak = 0;
      }
    }
    if (streak > 0) {
      total += streak;
      count++;
    }
    return count ? Math.round(total / count / 60) : 0;
  })();

  const efficiencyRatio = derived.totalDurationSec
    ? derived.focusSummary.focusedSec / derived.totalDurationSec
    : focusSummary.focusRatio;

  // Longest streaks from filtered data
  let longestFocused = { dur: 0, start: null as Date | null };
  let longestUnfocused = { dur: 0, start: null as Date | null };
  let curDur = 0;
  let curStart: Date | null = null;
  let curState: string | null = null;
  for (const f of data) {
    const ts = new Date(f.timestamp);
    if (curState === f.state) {
      curDur += f.duration;
    } else {
      if (curState === "focused" && curDur > longestFocused.dur) {
        longestFocused = { dur: curDur, start: curStart };
      }
      if (curState === "unfocused" && curDur > longestUnfocused.dur) {
        longestUnfocused = { dur: curDur, start: curStart };
      }
      curState = f.state;
      curDur = f.duration;
      curStart = ts;
    }
  }
  if (curState === "focused" && curDur > longestFocused.dur) {
    longestFocused = { dur: curDur, start: curStart };
  }
  if (curState === "unfocused" && curDur > longestUnfocused.dur) {
    longestUnfocused = { dur: curDur, start: curStart };
  }

  // Focus intensity dot points (midpoint of each segment over cumulative minutes)
  const dotPoints = useMemo(() => {
    let cum = 0;
    return data.map((f) => {
      const start = cum;
      cum += f.duration;
      const midSec = start + f.duration / 2;
      return {
        xMin: midSec / 60,
        value: f.state === "focused" ? 1 : 0,
        state: f.state,
        durMin: f.duration / 60,
        ts: new Date(f.timestamp),
      };
    });
  }, [data]);

  const maxXMin = dotPoints.at(-1)?.xMin || 1;

  const focusedStreakMin = Math.round(longestFocused.dur / 60);
  const unfocusedStreakMin = Math.round(longestUnfocused.dur / 60);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-muted-foreground">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-2 py-1 border border-border rounded bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-2 py-1 border border-border rounded bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground">Min segment (min)</label>
          <input type="number" min={0} value={minDur} onChange={(e) => setMinDur(Number(e.target.value || 0))} className="w-24 px-2 py-1 border border-border rounded bg-background text-sm" />
        </div>
        <div className="flex items-center gap-3 text-xs">
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={showFocused} onChange={(e) => setShowFocused(e.target.checked)} />
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Focused</span>
          </label>
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={showUnfocused} onChange={(e) => setShowUnfocused(e.target.checked)} />
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Unfocused</span>
          </label>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Focus ratio {Math.round(focusSummary.focusRatio * 100)}% • Efficiency {Math.round(efficiencyRatio * 100)}% • Focused {mins(focusSummary.focusedSec)} min • Unfocused {mins(focusSummary.unfocusedSec)} min
        </p>
        <div className="relative">
          <div className="absolute inset-0 flex">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-1 border-r last:border-r-0 border-border/40" />
            ))}
          </div>
          <div className="w-full h-6 rounded-full overflow-hidden border border-border flex relative">
            {segments.map((s) => (
              <div key={s.key} className={`${s.color} h-full`} style={{ width: `${s.widthPct}%` }} title={s.label} />
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-1">
          <span>
            Max focus streak: {focusedStreakMin} min {longestFocused.start ? "@" + longestFocused.start.toLocaleTimeString() : ""}
          </span>
          <span>
            Max unfocused streak: {unfocusedStreakMin} min {longestUnfocused.start ? "@" + longestUnfocused.start.toLocaleTimeString() : ""}
          </span>
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-md font-semibold">Focus loss events</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          {interruptions.length === 0 && <li>No interruptions detected.</li>}
          {interruptions
            .filter((ev) => inRange(ev.at))
            .map((ev) => (
              <li key={ev.at.toISOString()}>Lost focus at {fmtTime(ev.at)} for ~{mins(ev.durationSec)} min</li>
            ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="text-md font-semibold">Raw focus entries</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">State</th>
                <th className="py-2 pr-3">Duration (min)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((f) => (
                <tr key={f.id} className="border-b border-border/50">
                  <td className="py-2 pr-3">{fmtTime(new Date(f.timestamp))}</td>
                  <td className="py-2 pr-3">
                    <span className={"px-2 py-0.5 rounded text-xs " + (f.state === "focused" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                      {f.state}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{mins(f.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-md font-semibold">Timeline scale</h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {hoursScale.map((h) => (
            <div key={h.toISOString()} className="flex-1 flex flex-col items-center">
              <div className="w-full h-px bg-border" />
              <span>{h.getHours()}:00</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Avg focused streak: {avgFocusedStreakMin} min</p>
      </section>

      <section className="space-y-2">
        <h4 className="text-md font-semibold">Focus Intensity Chart</h4>
        <p className="text-xs text-muted-foreground">Dot chart: each dot midpoint of a segment (focused vs unfocused).</p>
        <svg viewBox="0 0 100 100" className="w-full h-40 border border-border rounded bg-muted">
          {/* axes */}
          <line x1="0" y1="100" x2="100" y2="100" stroke="#ccc" strokeWidth="0.5" />
          <line x1="0" y1="0" x2="100" y2="0" stroke="#ccc" strokeWidth="0.5" />
          {/* horizontal guide (middle) */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#ddd" strokeDasharray="2 2" />
          {dotPoints.map((p, i) => {
            const x = (p.xMin / maxXMin) * 100;
            const y = 100 - p.value * 100; // 1 -> top, 0 -> bottom
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={2.8}
                fill={p.state === "focused" ? "#10b981" : "#e11d48"}
              >
                <title>
                  {p.state} • {p.durMin.toFixed(1)}m @ {p.ts.toLocaleTimeString()}
                </title>
              </circle>
            );
          })}
        </svg>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0m</span>
          <span>{Math.round(maxXMin)}m</span>
        </div>
      </section>
    </div>
  );
}

function mins(sec: number) {
  return Math.round(sec / 60);
}
function fmtTime(date: Date) {
  return date.toLocaleString();
}
