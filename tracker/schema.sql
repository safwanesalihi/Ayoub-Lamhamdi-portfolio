-- Productive Day — D1 schema
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  time_zone TEXT NOT NULL DEFAULT 'Africa/Casablanca',
  -- the phone's UTC offset in minutes, refreshed whenever the app opens (independent of server tz data)
  utc_offset_min INTEGER NOT NULL DEFAULT 0,
  telegram_chat_id TEXT,
  telegram_link_token TEXT,
  notify_prayers INTEGER NOT NULL DEFAULT 1,
  notify_daily INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS users_link_token ON users(telegram_link_token);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS meta (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS days (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- Notifications already sent (dedupe), e.g. "2026-11-02:fajr"
CREATE TABLE IF NOT EXISTS sent (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

-- Fixed-window rate limits for SMS codes
CREATE TABLE IF NOT EXISTS rate (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);

-- Codes for OTP_MODE=dev only (local testing without Twilio)
CREATE TABLE IF NOT EXISTS dev_codes (
  phone TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
