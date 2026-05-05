CREATE TABLE IF NOT EXISTS rate_limits (
  id              TEXT        PRIMARY KEY,
  count           INTEGER     NOT NULL DEFAULT 1,
  window_start    TIMESTAMPTZ NOT NULL DEFAULT now()
);
