
-- app sessions table
CREATE TABLE IF NOT EXISTS app_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT NOT NULL,
  window_title TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN end_time IS NOT NULL THEN strftime('%s', end_time) - strftime('%s', start_time)
      ELSE NULL
    END
  ) STORED
);

-- iris focus data
CREATE TABLE IF NOT EXISTS iris_focus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME NOT NULL,
  state TEXT NOT NULL -- "focused" | "unfocused"
);

-- indexes for performance
CREATE INDEX IF NOT EXISTS idx_iris_timestamp ON iris_focus(timestamp);
CREATE INDEX IF NOT EXISTS idx_app_times ON app_sessions(start_time, end_time);
