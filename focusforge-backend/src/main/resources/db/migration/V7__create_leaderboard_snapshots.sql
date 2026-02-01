-- Create leaderboard_snapshots table for rank tracking
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_name VARCHAR(100),
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    rank_position INTEGER,
    score DOUBLE PRECISION,
    raw_points INTEGER,
    snapshot_date DATE NOT NULL,
    CONSTRAINT unique_snapshot UNIQUE (user_id, category_name, period_type, period_start, period_end)
);

CREATE INDEX idx_leaderboard_snapshots_user ON leaderboard_snapshots(user_id);
CREATE INDEX idx_leaderboard_snapshots_period ON leaderboard_snapshots(period_type, period_start, period_end);
CREATE INDEX idx_leaderboard_snapshots_category ON leaderboard_snapshots(category_name);
