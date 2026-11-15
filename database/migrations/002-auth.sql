-- Jalankan pada database Hari 1. Aman dijalankan ulang.
BEGIN;
CREATE TABLE IF NOT EXISTS sessions (
 token_hash char(64) PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
 user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS auth_limits (
 key char(64) PRIMARY KEY,
 attempts integer NOT NULL CHECK (attempts > 0),
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_limits_expires_idx ON auth_limits(expires_at);
COMMIT;
