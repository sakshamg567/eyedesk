import { mockAppSessions, mockIrisFocus } from "../mockdata";
import { StatsOverview } from "./StatsOverview";
import { AppSessionsTable } from "./AppSessionsTable";
import { useMemo } from "react";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            EyeDesk Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your application usage and focus patterns
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview sessions={mockAppSessions} focusData={mockIrisFocus} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Focus Chart -> replaced with dotting chart */}
          <DotFocusChart focusData={mockIrisFocus} />

          {/* Additional Stats or Charts can go here */}
          <div className="space-y-6">
            {/* You can add more components here like productivity metrics, etc. */}
          </div>
        </div>

        {/* App Sessions Table */}
        <AppSessionsTable sessions={mockAppSessions} />
      </div>
    </div>
  );
}

// Time-based dotting chart: midpoint of each segment on X (time), Y bands for focus/unfocus
function DotFocusChart({
  focusData,
}: {
  focusData: { timestamp: string; duration: number; state: "focused" | "unfocused" }[];
}) {
  const points = useMemo(() => {
    if (!focusData?.length) return [];
    const sorted = [...focusData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const minTs = new Date(sorted[0].timestamp).getTime();
    const last = sorted[sorted.length - 1];
    const maxTs =
      new Date(last.timestamp).getTime() + (last.duration || 0) * 1000;
    const span = Math.max(maxTs - minTs, 1);

    let acc = 0;
    return sorted.map((f) => {
      const start = new Date(f.timestamp).getTime();
      const mid = start + (f.duration * 1000) / 2;
      acc += f.duration;
      return {
        xPct: ((mid - minTs) / span) * 100,
        y: f.state === "focused" ? 30 : 70, // two clear bands
        state: f.state,
        midTime: new Date(mid),
        durMin: Math.max(f.duration / 60, 0),
      };
    });
  }, [focusData]);

  const startLabel = points[0]?.midTime ?? (focusData[0] ? new Date(focusData[0].timestamp) : new Date());
  const endLabel =
    points[points.length - 1]?.midTime ??
    (focusData[focusData.length - 1]
      ? new Date(
          new Date(focusData[focusData.length - 1].timestamp).getTime() +
            (focusData[focusData.length - 1].duration || 0) * 1000
        )
      : new Date());

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Focus Dot Chart (Time-based)</h2>
      <p className="text-sm text-muted-foreground">
        Each dot represents the midpoint of a focus segment over time. Green =
        focused, Red = unfocused.
      </p>
      <svg viewBox="0 0 100 100" className="w-full h-64 border border-border rounded bg-muted">
        {/* vertical grid */}
        <g>
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1={(i / 8) * 100}
              x2={(i / 8) * 100}
              y1="0"
              y2="100"
              stroke="#e5e7eb"
              strokeWidth="0.4"
            />
          ))}
        </g>
        {/* horizontal bands labels lines */}
        <line x1="0" y1="30" x2="100" y2="30" stroke="#d1fae5" strokeDasharray="2 2" />
        <line x1="0" y1="70" x2="100" y2="70" stroke="#fee2e2" strokeDasharray="2 2" />
        {/* dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.xPct}
            cy={p.y}
            r="2.8"
            fill={p.state === "focused" ? "#10b981" : "#e11d48"}
          >
            <title>
              {p.state} • {p.durMin.toFixed(1)}m @ {p.midTime.toLocaleTimeString()}
            </title>
          </circle>
        ))}
        {/* axis line */}
        <line x1="0" y1="95" x2="100" y2="95" stroke="#9ca3af" strokeWidth="0.6" />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{startLabel.toLocaleTimeString()}</span>
        <span>{endLabel.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
