
-- Mock data for 3 days of activity tracking
-- Simulates realistic work patterns with app switching and eye focus events

-- Clear existing data (optional - uncomment if you want to reset)
-- DELETE FROM app_sessions;
-- DELETE FROM iris_focus;

-- ============================================================================
-- DAY 1: 2024-01-15 (Full work day)
-- ============================================================================

-- Morning: Starting work with VS Code
INSERT INTO app_sessions (app_name, window_title, start_time, end_time) VALUES
('code', 'server.ts - eyedesk - Visual Studio Code', '2024-01-15 09:00:00', '2024-01-15 09:25:00'),
('chrome', 'Documentation - TypeScript', '2024-01-15 09:25:00', '2024-01-15 09:35:00'),
('code', 'server.ts - eyedesk - Visual Studio Code', '2024-01-15 09:35:00', '2024-01-15 10:15:00'),
('slack', 'team-engineering - Slack', '2024-01-15 10:15:00', '2024-01-15 10:22:00'),
('chrome', 'Stack Overflow - better-sqlite3 tutorial', '2024-01-15 10:22:00', '2024-01-15 10:30:00'),
('code', 'database.ts - eyedesk - Visual Studio Code', '2024-01-15 10:30:00', '2024-01-15 11:45:00');

-- Mid-day: Mixed work and communication
INSERT INTO app_sessions (app_name, window_title, start_time, end_time) VALUES
('zoom', 'Team Standup Meeting', '2024-01-15 11:45:00', '2024-01-15 12:00:00'),
('slack', 'general - Slack', '2024-01-15 12:00:00', '2024-01-15 12:05:00'),
('chrome', 'YouTube - Programming Music', '2024-01-15 12:05:00', '2024-01-15 12:45:00'),
('notion', 'Project Tasks - Eyedesk', '2024-01-15 12:45:00', '2024-01-15 13:00:00'),
('code', 'watcher.ts - eyedesk - Visual Studio Code', '2024-01-15 13:00:00', '2024-01-15 14:30:00');

-- Afternoon: Deep work and testing
INSERT INTO app_sessions (app_name, window_title, start_time, end_time) VALUES
('terminal', 'npm run dev', '2024-01-15 14:30:00', '2024-01-15 14:35:00'),
('chrome', 'localhost:3000 - Eyedesk Dashboard', '2024-01-15 14:35:00', '2024-01-15 14:50:00'),
('code', 'server.ts - eyedesk - Visual Studio Code', '2024-01-15 14:50:00', '2024-01-15 15:45:00'),
('slack', 'dm-@john - Slack', '2024-01-15 15:45:00', '2024-01-15 15:52:00'),
('chrome', 'GitHub - Pull Requests', '2024-01-15 15:52:00', '2024-01-15 16:10:00'),
('code', 'README.md - eyedesk - Visual Studio Code', '2024-01-15 16:10:00', '2024-01-15 17:30:00'),
('slack', 'team-engineering - Slack', '2024-01-15 17:30:00', '2024-01-15 17:40:00'),
('chrome', 'Gmail - Inbox', '2024-01-15 17:40:00', '2024-01-15 18:00:00');

-- ============================================================================
-- DAY 2: 2024-01-16 (Full work day with more breaks)
-- ============================================================================

INSERT INTO app_sessions (app_name, window_title, start_time, end_time) VALUES
('slack', 'team-engineering - Slack', '2024-01-16 09:15:00', '2024-01-16 09:25:00'),
('chrome', 'Gmail - Inbox', '2024-01-16 09:25:00', '2024-01-16 09:35:00'),
('code', 'schema.sql - eyedesk - Visual Studio Code', '2024-01-16 09:35:00', '2024-01-16 10:30:00'),
('chrome', 'SQLite Tutorial - Indexes', '2024-01-16 10:30:00', '2024-01-16 10:45:00'),
('code', 'schema.sql - eyedesk - Visual Studio Code', '2024-01-16 10:45:00', '2024-01-16 11:30:00');

-- Coffee break
INSERT INTO app_sessions (app_name, window_title, start_time, end_time) VALUES
('chrome', 'Twitter - Timeline', '2024-01-16 11:30:00', '2024-01-16 11:50:00'),
('notion', 'Daily Notes - Jan 16', '2024-01-16 11:50:00', '2024-01-16 12:00:00'),
('zoom', 'Client Meeting', '2024-01-16 12:00:00', '2024-01-16 13:00:00'),
('notion', 'Meeting Notes - Client Sync', '2024-01-16 13:00:00', '2024-01-16 13:15:00');

-- Lunch break (no activity)
INSERT INTO app_sessions (app_name, window_title, start_time, end_time) VALUES
('chrome', 'Reddit - Programming', '2024-01-16 14:00:00', '2024-01-16 14:15:00'),
('code', 'api-routes.ts - eyedesk - Visual Studio Code', '2024-01-16 14:15:00', '2024-01-16 15:45:00'),
('terminal', 'pnpm test', '2024-01-16 15:45:00', '2024-01-16 15:50:00'),
('code', 'server.test.ts - eyedesk - Visual Studio Code', '2024-01-16 15:50:00', '2024-01-16 16:30:00'),
('chrome', 'GitHub - Issues', '2024-01-16 16:30:00', '2024-01-16 16:45:00'),
('slack', 'team-engineering - Slack', '2024-01-16 16:45:00', '2024-01-16 17:00:00'),
('code', 'CHANGELOG.md - eyedesk - Visual Studio Code', '2024-01-16 17:00:00', '2024-01-16 17:45:00'),
('chrome', 'Gmail - Inbox', '2024-01-16 17:45:00', '2024-01-16 18:00:00');

-- ============================================================================
-- DAY 3: 2024-01-17 (Shorter day)
-- ============================================================================

INSERT INTO app_sessions (app_name, window_title, start_time, end_time) VALUES
('slack', 'notifications - Slack', '2024-01-17 09:00:00', '2024-01-17 09:10:00'),
('chrome', 'Calendar - Google', '2024-01-17 09:10:00', '2024-01-17 09:20:00'),
('notion', 'Sprint Planning - Week 3', '2024-01-17 09:20:00', '2024-01-17 09:45:00'),
('code', 'frontend/dashboard.tsx - eyedesk - Visual Studio Code', '2024-01-17 09:45:00', '2024-01-17 11:00:00'),
('chrome', 'React Documentation - Hooks', '2024-01-17 11:00:00', '2024-01-17 11:15:00'),
('code', 'frontend/dashboard.tsx - eyedesk - Visual Studio Code', '2024-01-17 11:15:00', '2024-01-17 12:30:00'),
('zoom', 'Team Retrospective', '2024-01-17 12:30:00', '2024-01-17 13:30:00'),
('notion', 'Retro Notes - Sprint 2', '2024-01-17 13:30:00', '2024-01-17 13:45:00'),
('code', 'README.md - eyedesk - Visual Studio Code', '2024-01-17 13:45:00', '2024-01-17 14:30:00'),
('slack', 'team-engineering - Slack', '2024-01-17 14:30:00', '2024-01-17 14:45:00'),
('chrome', 'GitHub - Releases', '2024-01-17 14:45:00', '2024-01-17 15:00:00');

-- ============================================================================
-- IRIS FOCUS DATA - DAY 1: 2024-01-15
-- ============================================================================

-- Morning focus session (good focus during coding)
INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-15 09:00:00', 0, 'focused'),
('2024-01-15 09:03:30', 210, 'focused'),
('2024-01-15 09:08:45', 315, 'unfocused'),
('2024-01-15 09:09:30', 45, 'focused'),
('2024-01-15 09:14:20', 290, 'focused'),
('2024-01-15 09:19:15', 295, 'unfocused'),
('2024-01-15 09:20:00', 45, 'focused'),
('2024-01-15 09:25:30', 330, 'focused'),
('2024-01-15 09:28:00', 150, 'unfocused'),
('2024-01-15 09:29:15', 75, 'focused'),
('2024-01-15 09:35:00', 345, 'focused'),
('2024-01-15 09:40:30', 330, 'focused'),
('2024-01-15 09:45:15', 285, 'unfocused'),
('2024-01-15 09:46:00', 45, 'focused'),
('2024-01-15 09:52:30', 390, 'focused'),
('2024-01-15 09:58:00', 330, 'focused'),
('2024-01-15 10:03:45', 345, 'unfocused'),
('2024-01-15 10:05:00', 75, 'focused'),
('2024-01-15 10:10:30', 330, 'focused');

-- Communication period (more unfocused states)
INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-15 10:15:30', 300, 'unfocused'),
('2024-01-15 10:17:00', 90, 'focused'),
('2024-01-15 10:20:00', 180, 'unfocused'),
('2024-01-15 10:22:30', 150, 'focused'),
('2024-01-15 10:26:00', 210, 'focused'),
('2024-01-15 10:30:30', 270, 'focused'),
('2024-01-15 10:36:00', 330, 'focused'),
('2024-01-15 10:42:30', 390, 'focused'),
('2024-01-15 10:48:00', 330, 'unfocused'),
('2024-01-15 10:49:15', 75, 'focused'),
('2024-01-15 10:55:45', 390, 'focused'),
('2024-01-15 11:02:00', 375, 'focused'),
('2024-01-15 11:08:30', 390, 'unfocused'),
('2024-01-15 11:10:00', 90, 'focused'),
('2024-01-15 11:16:15', 375, 'focused'),
('2024-01-15 11:22:45', 390, 'focused'),
('2024-01-15 11:29:00', 375, 'unfocused');

-- Meeting and lunch (lots of unfocused)
INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-15 11:45:30', 990, 'unfocused'),
('2024-01-15 11:50:00', 270, 'focused'),
('2024-01-15 11:55:30', 330, 'unfocused'),
('2024-01-15 12:00:30', 300, 'unfocused'),
('2024-01-15 12:06:00', 330, 'unfocused'),
('2024-01-15 12:12:30', 390, 'unfocused'),
('2024-01-15 12:18:00', 330, 'focused'),
('2024-01-15 12:24:30', 390, 'unfocused'),
('2024-01-15 12:30:00', 330, 'unfocused');

-- Afternoon deep work (best focus)
INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-15 13:00:30', 330, 'focused'),
('2024-01-15 13:07:00', 390, 'focused'),
('2024-01-15 13:14:30', 450, 'focused'),
('2024-01-15 13:22:00', 450, 'focused'),
('2024-01-15 13:30:00', 480, 'unfocused'),
('2024-01-15 13:32:30', 150, 'focused'),
('2024-01-15 13:39:45', 435, 'focused'),
('2024-01-15 13:47:30', 465, 'focused'),
('2024-01-15 13:55:00', 450, 'focused'),
('2024-01-15 14:03:00', 480, 'unfocused'),
('2024-01-15 14:05:00', 120, 'focused'),
('2024-01-15 14:35:30', 1830, 'focused'),
('2024-01-15 14:42:00', 390, 'focused'),
('2024-01-15 14:48:30', 390, 'unfocused'),
('2024-01-15 14:50:45', 135, 'focused'),
('2024-01-15 14:57:30', 405, 'focused'),
('2024-01-15 15:04:45', 435, 'focused'),
('2024-01-15 15:12:00', 435, 'focused'),
('2024-01-15 15:19:30', 450, 'unfocused'),
('2024-01-15 15:21:00', 90, 'focused'),
('2024-01-15 15:28:30', 450, 'focused'),
('2024-01-15 15:36:15', 465, 'focused');

-- End of day (declining focus)
INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-15 15:45:30', 555, 'unfocused'),
('2024-01-15 15:48:00', 150, 'focused'),
('2024-01-15 15:54:30', 390, 'unfocused'),
('2024-01-15 15:56:00', 90, 'focused'),
('2024-01-15 16:10:30', 870, 'focused'),
('2024-01-15 16:17:45', 435, 'focused'),
('2024-01-15 16:25:00', 435, 'unfocused'),
('2024-01-15 16:27:30', 150, 'focused'),
('2024-01-15 16:34:45', 435, 'focused'),
('2024-01-15 16:42:15', 450, 'unfocused'),
('2024-01-15 16:44:00', 105, 'focused'),
('2024-01-15 16:51:30', 450, 'focused'),
('2024-01-15 16:59:00', 450, 'unfocused'),
('2024-01-15 17:01:00', 120, 'focused'),
('2024-01-15 17:30:30', 1770, 'unfocused'),
('2024-01-15 17:35:00', 270, 'unfocused'),
('2024-01-15 17:40:30', 330, 'unfocused'),
('2024-01-15 17:46:00', 330, 'focused'),
('2024-01-15 17:52:30', 390, 'unfocused');

-- ============================================================================
-- IRIS FOCUS DATA - DAY 2: 2024-01-16
-- ============================================================================

INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-16 09:15:30', 330, 'unfocused'),
('2024-01-16 09:18:00', 150, 'focused'),
('2024-01-16 09:24:00', 360, 'unfocused'),
('2024-01-16 09:26:30', 150, 'focused'),
('2024-01-16 09:32:00', 330, 'unfocused'),
('2024-01-16 09:35:30', 210, 'focused'),
('2024-01-16 09:42:00', 390, 'focused'),
('2024-01-16 09:49:30', 450, 'focused'),
('2024-01-16 09:57:00', 450, 'focused'),
('2024-01-16 10:04:45', 465, 'unfocused'),
('2024-01-16 10:06:30', 105, 'focused'),
('2024-01-16 10:14:00', 450, 'focused'),
('2024-01-16 10:21:45', 465, 'focused'),
('2024-01-16 10:30:30', 525, 'focused'),
('2024-01-16 10:36:00', 330, 'focused'),
('2024-01-16 10:42:30', 390, 'unfocused'),
('2024-01-16 10:44:15', 105, 'focused'),
('2024-01-16 10:51:30', 435, 'focused'),
('2024-01-16 10:59:00', 450, 'focused'),
('2024-01-16 11:06:45', 465, 'focused'),
('2024-01-16 11:14:30', 465, 'focused'),
('2024-01-16 11:22:00', 450, 'unfocused'),
('2024-01-16 11:24:00', 120, 'focused');

-- Break and meeting
INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-16 11:30:30', 390, 'unfocused'),
('2024-01-16 11:36:00', 330, 'unfocused'),
('2024-01-16 11:42:30', 390, 'unfocused'),
('2024-01-16 11:48:00', 330, 'focused'),
('2024-01-16 11:54:30', 390, 'focused'),
('2024-01-16 12:00:30', 360, 'focused'),
('2024-01-16 12:08:00', 450, 'unfocused'),
('2024-01-16 12:15:30', 450, 'focused'),
('2024-01-16 12:23:00', 450, 'unfocused'),
('2024-01-16 12:30:30', 450, 'focused'),
('2024-01-16 12:38:15', 465, 'unfocused'),
('2024-01-16 12:45:00', 405, 'focused'),
('2024-01-16 12:52:30', 450, 'unfocused'),
('2024-01-16 13:00:30', 480, 'focused'),
('2024-01-16 13:08:00', 450, 'focused');

-- Afternoon work
INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-16 14:00:30', 3030, 'unfocused'),
('2024-01-16 14:06:00', 330, 'unfocused'),
('2024-01-16 14:12:30', 390, 'focused'),
('2024-01-16 14:18:00', 330, 'focused'),
('2024-01-16 14:25:30', 450, 'focused'),
('2024-01-16 14:33:45', 495, 'focused'),
('2024-01-16 14:42:00', 495, 'focused'),
('2024-01-16 14:50:30', 510, 'focused'),
('2024-01-16 14:59:00', 510, 'unfocused'),
('2024-01-16 15:01:00', 120, 'focused'),
('2024-01-16 15:09:30', 510, 'focused'),
('2024-01-16 15:18:15', 525, 'focused'),
('2024-01-16 15:27:00', 525, 'focused'),
('2024-01-16 15:35:45', 525, 'unfocused'),
('2024-01-16 15:37:30', 105, 'focused'),
('2024-01-16 15:45:45', 495, 'focused'),
('2024-01-16 15:52:00', 375, 'focused'),
('2024-01-16 15:58:30', 390, 'focused'),
('2024-01-16 16:05:45', 435, 'focused'),
('2024-01-16 16:13:00', 435, 'unfocused'),
('2024-01-16 16:15:00', 120, 'focused'),
('2024-01-16 16:22:30', 450, 'focused'),
('2024-01-16 16:30:30', 480, 'focused'),
('2024-01-16 16:37:00', 390, 'unfocused'),
('2024-01-16 16:39:00', 120, 'focused'),
('2024-01-16 16:45:30', 390, 'unfocused'),
('2024-01-16 16:48:00', 150, 'focused'),
('2024-01-16 16:54:30', 390, 'unfocused'),
('2024-01-16 16:57:00', 150, 'focused'),
('2024-01-16 17:03:30', 390, 'focused'),
('2024-01-16 17:10:45', 435, 'focused'),
('2024-01-16 17:18:00', 435, 'focused'),
('2024-01-16 17:25:30', 450, 'unfocused'),
('2024-01-16 17:28:00', 150, 'focused'),
('2024-01-16 17:35:30', 450, 'focused'),
('2024-01-16 17:43:00', 450, 'unfocused'),
('2024-01-16 17:46:30', 210, 'unfocused'),
('2024-01-16 17:52:00', 330, 'unfocused');

-- ============================================================================
-- IRIS FOCUS DATA - DAY 3: 2024-01-17
-- ============================================================================

INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-17 09:00:30', 30, 'unfocused'),
('2024-01-17 09:03:00', 150, 'unfocused'),
('2024-01-17 09:08:30', 330, 'unfocused'),
('2024-01-17 09:11:00', 150, 'focused'),
('2024-01-17 09:17:30', 390, 'unfocused'),
('2024-01-17 09:20:30', 180, 'focused'),
('2024-01-17 09:27:00', 390, 'focused'),
('2024-01-17 09:34:30', 450, 'focused'),
('2024-01-17 09:42:00', 450, 'focused'),
('2024-01-17 09:50:30', 510, 'focused'),
('2024-01-17 09:59:00', 510, 'focused'),
('2024-01-17 10:07:45', 525, 'unfocused'),
('2024-01-17 10:09:30', 105, 'focused'),
('2024-01-17 10:17:45', 495, 'focused'),
('2024-01-17 10:26:15', 510, 'focused'),
('2024-01-17 10:34:45', 510, 'focused'),
('2024-01-17 10:43:30', 525, 'unfocused'),
('2024-01-17 10:45:30', 120, 'focused'),
('2024-01-17 10:53:45', 495, 'focused'),
('2024-01-17 11:00:30', 405, 'focused'),
('2024-01-17 11:06:00', 330, 'focused'),
('2024-01-17 11:12:30', 390, 'unfocused'),
('2024-01-17 11:14:15', 105, 'focused'),
('2024-01-17 11:21:45', 450, 'focused'),
('2024-01-17 11:29:30', 465, 'focused'),
('2024-01-17 11:37:15', 465, 'focused'),
('2024-01-17 11:45:00', 465, 'focused'),
('2024-01-17 11:52:45', 465, 'focused'),
('2024-01-17 12:00:30', 465, 'unfocused'),
('2024-01-17 12:03:00', 150, 'focused'),
('2024-01-17 12:10:45', 465, 'focused'),
('2024-01-17 12:18:30', 465, 'focused');

-- Meeting and wrap-up
INSERT INTO iris_focus (timestamp, duration, state) VALUES
('2024-01-17 12:30:30', 720, 'focused'),
('2024-01-17 12:40:00', 570, 'unfocused'),
('2024-01-17 12:48:30', 510, 'focused'),
('2024-01-17 12:57:00', 510, 'unfocused'),
('2024-01-17 13:05:30', 510, 'focused'),
('2024-01-17 13:14:00', 510, 'unfocused'),
('2024-01-17 13:22:30', 510, 'focused'),
('2024-01-17 13:30:30', 480, 'focused'),
('2024-01-17 13:38:00', 450, 'focused'),
('2024-01-17 13:45:45', 465, 'focused'),
('2024-01-17 13:53:30', 465, 'focused'),
('2024-01-17 14:01:30', 480, 'focused'),
('2024-01-17 14:09:45', 495, 'unfocused'),
('2024-01-17 14:12:00', 135, 'focused'),
('2024-01-17 14:19:30', 450, 'focused'),
('2024-01-17 14:27:00', 450, 'unfocused'),
('2024-01-17 14:30:30', 210, 'unfocused'),
('2024-01-17 14:36:00', 330, 'unfocused'),
('2024-01-17 14:42:30', 390, 'focused'),
('2024-01-17 14:48:00', 330, 'focused'),
('2024-01-17 14:54:30', 390, 'unfocused'),
('2024-01-17 14:57:00', 150, 'focused');

-- ============================================================================
-- Data Summary Queries (for verification)
-- ============================================================================

-- Total app sessions by day
-- SELECT DATE(start_time) as date, COUNT(*) as sessions
-- FROM app_sessions
-- GROUP BY DATE(start_time);

-- Total focus time vs unfocused time by day
-- SELECT DATE(timestamp) as date,
--        SUM(CASE WHEN state = 'focused' THEN duration ELSE 0 END) as focused_seconds,
--        SUM(CASE WHEN state = 'unfocused' THEN duration ELSE 0 END) as unfocused_seconds
-- FROM iris_focus
-- GROUP BY DATE(timestamp);

-- Most used apps
-- SELECT app_name, COUNT(*) as session_count,
--        SUM(strftime('%s', end_time) - strftime('%s', start_time)) as total_seconds
-- FROM app_sessions
-- WHERE end_time IS NOT NULL
-- GROUP BY app_name
-- ORDER BY total_seconds DESC;
