import React, { createContext, useContext, useMemo, useState } from "react";
import { mockAppSessions, mockIrisFocus } from "../mockdata";

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
  const [sessions, setSessions] = useState<Session[]>(mockAppSessions as Session[]);
  const [focus, setFocus] = useState<Focus[]>(mockIrisFocus as Focus[]);

  const derived = useMemo<Derived>(() => {
    const totalDurationSec = sessions.reduce(
      (acc, s) => acc + (s.duration_seconds || 0),
      0
    );
    const byAppMap = new Map<string, { app: string; totalSec: number; count: number }>();
    for (const s of sessions) {
      const prev =
        byAppMap.get(s.app_name) || { app: s.app_name, totalSec: 0, count: 0 };
      prev.totalSec += s.duration_seconds || 0;
      prev.count += 1;
      byAppMap.set(s.app_name, prev);
    }
    const byApp = Array.from(byAppMap.values()).sort(
      (a, b) => b.totalSec - a.totalSec
    );
    const topApp = byApp[0];

    let focusedSec = 0;
    let unfocusedSec = 0;
    const interruptions: { at: Date; durationSec: number }[] = [];
    for (const f of focus) {
      if (f.state === "focused") focusedSec += f.duration;
      else {
        unfocusedSec += f.duration;
        interruptions.push({ at: new Date(f.timestamp), durationSec: f.duration });
      }
    }
    const focusRatio =
      focusedSec + unfocusedSec > 0
        ? focusedSec / (focusedSec + unfocusedSec)
        : 0;

    return {
      totalDurationSec,
      byApp,
      topApp,
      focusSummary: { focusedSec, unfocusedSec, focusRatio },
      interruptions,
    };
  }, [sessions, focus]);

  const refresh = () => {
    // Future: replace with DB fetch.
    setSessions([...mockAppSessions]);
    setFocus([...mockIrisFocus]);
  };

  return (
    <Ctx.Provider value={{ sessions, focus, derived, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDataStore must be used inside DataProvider");
  return ctx;
}
