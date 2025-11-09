export interface AppSession {
  id: number;
  app_name: string;
  window_title: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
}

export interface IrisFocus {
  id: number;
  timestamp: string;
  duration: number;
  state: "focused" | "unfocused";
}
