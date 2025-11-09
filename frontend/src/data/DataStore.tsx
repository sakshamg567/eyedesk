import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

type Session = {
  id: number;
  app_name: string;
  window_title?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number | null;
};

type Focus = {
  id: number;
  timestamp: string;
  duration: number;
  state: "focused" | "unfocused";
};

type Derived = {
  totalDurationSec: number;
  byApp: { app: string; totalSec: number; count: number }[];
  topApp?: { app: string; totalSec: number; count: number };
  focusSummary: { focusedSec: number; unfocusedSec: number; focusRatio: number };
  interruptions: { at: Date; durationSec: number }[];
};

type Store = {
  sessions: Session[];
  focus: Focus[];
  derived: Derived;
  refresh: () => void;
};

const Ctx = createContext<Store | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [focus, setFocus] = useState<Focus[]>([]);

  // Fetch helpers
  async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
    return res.json();
  }

  function normalizeSessions(rows: any[]): Session[] {
    // Expect columns: id, app_name, window_title, start_time, end_time, duration_seconds
    return (rows || [])
      .map((r) => {
        const start = r.start_time ? new Date(r.start_time) : null;
        const end = r.end_time ? new Date(r.end_time) : null;
        let duration = r.duration_seconds as number | null | undefined;
        if ((duration == null || Number.isNaN(duration)) && start && end) {
          duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
        }
        return {
          id: Number(r.id),
          app_name: String(r.app_name),
          window_title: r.window_title ?? null,
          start_time: start ? start.toISOString() : String(r.start_time),
          end_time: end ? end.toISOString() : null,
          duration_seconds: duration ?? null,
        } as Session;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  function normalizeFocus(rows: any[]): Focus[] {
    // Expect columns: id, timestamp, state, optional duration (per migration it exists)
    const sorted = (rows || [])
      .map((r) => ({
        id: Number(r.id),
        timestamp: new Date(r.timestamp).toISOString(),
        state: r.state as "focused" | "unfocused",
        duration: Number(r.duration ?? 0), // may be 0/missing in some DBs -> compute below
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Backfill duration if missing or 0 by looking at next timestamp
    for (let i = 0; i < sorted.length; i++) {
      if (!sorted[i].duration || sorted[i].duration <= 0) {
        const currTs = new Date(sorted[i].timestamp).getTime();
        const nextTs = i < sorted.length - 1 ? new Date(sorted[i + 1].timestamp).getTime() : NaN;
        const diffSec = Number.isFinite(nextTs) ? Math.max(0, Math.floor((nextTs - currTs) / 1000)) : 60; // default 60s for last
        sorted[i].duration = diffSec;
      }
    }
    return sorted as Focus[];
  }

  const derived = useMemo<Derived>(() => {
    const totalDurationSec = (sessions || []).reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

    const byAppMap = new Map<string, { app: string; totalSec: number; count: number }>();
    for (const s of sessions || []) {
      const prev = byAppMap.get(s.app_name) || { app: s.app_name, totalSec: 0, count: 0 };
      prev.totalSec += s.duration_seconds || 0;
      prev.count += 1;
      byAppMap.set(s.app_name, prev);
    }
    const byApp = Array.from(byAppMap.values()).sort((a, b) => b.totalSec - a.totalSec);
    const topApp = byApp[0];

    let focusedSec = 0;
    let unfocusedSec = 0;
    const interruptions: { at: Date; durationSec: number }[] = [];
    for (const f of focus || []) {
      if (f.state === "focused") focusedSec += f.duration;
      else {
        unfocusedSec += f.duration;
        interruptions.push({ at: new Date(f.timestamp), durationSec: f.duration });
      }
    }
    const focusRatio = focusedSec + unfocusedSec > 0 ? focusedSec / (focusedSec + unfocusedSec) : 0;

    return { totalDurationSec, byApp, topApp, focusSummary: { focusedSec, unfocusedSec, focusRatio }, interruptions };
  }, [sessions, focus]);

  const refresh = async () => {
    try {
      const [sessRows, focusRows] = await Promise.all([
        fetchJSON<any[]>("/api/app_sessions"),
        fetchJSON<any[]>("/api/iris_focus"),
      ]);
      setSessions(normalizeSessions(sessRows));
      setFocus(normalizeFocus(focusRows));
    } catch (err) {
      console.error("Data refresh failed:", err);
      // Optional: keep prior data; you can show a toast in UI.
    }
  };

  // Initial load
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Ctx.Provider value={{ sessions, focus, derived, refresh }}>{children}</Ctx.Provider>;
}

export function useDataStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDataStore must be used inside DataProvider");
  return ctx;
}
