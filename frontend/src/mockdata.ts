import { AppSession, IrisFocus } from "./types";

export const mockAppSessions: AppSession[] = [
  {
    id: 1,
    app_name: "code",
    window_title: "server.ts - eyedesk - Visual Studio Code",
    start_time: "2024-01-15T09:00:00",
    end_time: "2024-01-15T09:25:00",
    duration_seconds: 1500,
  },
  {
    id: 2,
    app_name: "chrome",
    window_title: "Documentation - TypeScript",
    start_time: "2024-01-15T09:25:00",
    end_time: "2024-01-15T09:35:00",
    duration_seconds: 600,
  },
  {
    id: 3,
    app_name: "code",
    window_title: "server.ts - eyedesk - Visual Studio Code",
    start_time: "2024-01-15T09:35:00",
    end_time: "2024-01-15T10:15:00",
    duration_seconds: 2400,
  },
  {
    id: 4,
    app_name: "slack",
    window_title: "team-engineering - Slack",
    start_time: "2024-01-15T10:15:00",
    end_time: "2024-01-15T10:22:00",
    duration_seconds: 420,
  },
];

export const mockIrisFocus: IrisFocus[] = [
  { id: 1, timestamp: "2024-01-15 09:00:00", duration: 0, state: "focused" },
  { id: 2, timestamp: "2024-01-15 09:03:30", duration: 210, state: "focused" },
  {
    id: 3,
    timestamp: "2024-01-15 09:08:45",
    duration: 315,
    state: "unfocused",
  },
  { id: 4, timestamp: "2024-01-15 09:09:30", duration: 45, state: "focused" },
  { id: 5, timestamp: "2024-01-15 09:14:20", duration: 290, state: "focused" },
  {
    id: 6,
    timestamp: "2024-01-15 09:19:15",
    duration: 295,
    state: "unfocused",
  },
  { id: 7, timestamp: "2024-01-15 09:20:00", duration: 45, state: "focused" },
  { id: 8, timestamp: "2024-01-15 09:25:30", duration: 330, state: "focused" },
  {
    id: 9,
    timestamp: "2024-01-15 09:28:00",
    duration: 150,
    state: "unfocused",
  },
  { id: 10, timestamp: "2024-01-15 09:29:15", duration: 75, state: "focused" },
  { id: 11, timestamp: "2024-01-15 09:35:00", duration: 345, state: "focused" },
  { id: 12, timestamp: "2024-01-15 09:40:30", duration: 330, state: "focused" },
  {
    id: 13,
    timestamp: "2024-01-15 09:45:15",
    duration: 285,
    state: "unfocused",
  },
  { id: 14, timestamp: "2024-01-15 09:46:00", duration: 45, state: "focused" },
  { id: 15, timestamp: "2024-01-15 09:52:30", duration: 390, state: "focused" },
  { id: 16, timestamp: "2024-01-15 09:58:00", duration: 330, state: "focused" },
  {
    id: 17,
    timestamp: "2024-01-15 10:03:45",
    duration: 345,
    state: "unfocused",
  },
  { id: 18, timestamp: "2024-01-15 10:05:00", duration: 75, state: "focused" },
  { id: 19, timestamp: "2024-01-15 10:10:30", duration: 330, state: "focused" },
  {
    id: 20,
    timestamp: "2024-01-15 10:15:30",
    duration: 300,
    state: "unfocused",
  },
];
