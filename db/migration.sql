
-- Check current schema and fix if needed
-- Run this before inserting mock data

-- Drop the old table if it exists with wrong schema
DROP TABLE IF EXISTS iris_focus;

-- Recreate with correct schema
CREATE TABLE IF NOT EXISTS iris_focus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME NOT NULL,
  duration INTEGER NOT NULL,
  state TEXT NOT NULL -- "focused" | "unfocused"
);

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_iris_timestamp ON iris_focus(timestamp);

-- Verify app_sessions table exists with correct schema
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

CREATE INDEX IF NOT EXISTS idx_app_times ON app_sessions(start_time, end_time);
