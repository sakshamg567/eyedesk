import { useState } from "react";
import { DataProvider, useDataStore } from "../data/DataStore";
import { SummaryTab } from "./tabs/SummaryTab";
import { GraphTab } from "./tabs/GraphTab";
import { BrowserTab } from "./tabs/BrowserTab";

type TabId = "summary" | "focus" | "apps";

const tabs: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "focus", label: "Focus" },
  { id: "apps", label: "Applications" },
];

export function HomeTabs() {
  const [active, setActive] = useState<TabId>("summary");
  return (
    <DataProvider>
      <InnerTabs active={active} setActive={setActive} />
    </DataProvider>
  );
}

function InnerTabs({ active, setActive }: { active: TabId; setActive: (t: TabId) => void }) {
  const { sessions, focus, refresh } = useDataStore();
  const updatedAt = new Date(
    Math.max(
      ...(sessions.map(s => new Date(s.start_time).getTime())),
      ...(focus.map(f => new Date(f.timestamp).getTime())),
      Date.now()
    )
  );

  const render = () => {
    switch (active) {
      case "summary":
        return <SummaryTab />;
      case "focus":
        return <GraphTab />;
      case "apps":
        return <BrowserTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">EyeDesk</h1>
            <button
              onClick={refresh}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-muted hover:bg-muted/70"
            >
              Refresh
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Minimal overview of your focus and app usage
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-muted">
              Updated {updatedAt.toLocaleTimeString()}
            </span>
          </p>
        </header>

        <nav className="flex gap-2 border-b border-border">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={
                  "px-3 py-2 text-sm rounded-t-md border-x border-t " +
                  (active === t.id
                    ? "bg-primary text-primary-foreground border-border"
                    : "bg-muted text-muted-foreground hover:text-foreground")
                }
              >
                {t.label}
              </button>
            ))}
        </nav>

        <main className="bg-card border border-border rounded-md p-4">{render()}</main>
      </div>
    </div>
  );
}
