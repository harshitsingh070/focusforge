-- Aggregated analytics tables
CREATE TABLE IF NOT EXISTS daily_user_summary (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    active_goals INTEGER NOT NULL DEFAULT 0,
    activities_count INTEGER NOT NULL DEFAULT 0,
    active_flag BOOLEAN NOT NULL DEFAULT false,
    max_streak_snapshot INTEGER NOT NULL DEFAULT 0,
    trust_score_snapshot INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_daily_user_summary UNIQUE (user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_user_summary_user_date
ON daily_user_summary(user_id, summary_date);

CREATE TABLE IF NOT EXISTS weekly_category_summary (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    active_days INTEGER NOT NULL DEFAULT 0,
    activities_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_weekly_category_summary UNIQUE (user_id, week_start, category_name)
);

CREATE INDEX IF NOT EXISTS idx_weekly_category_summary_user_week
ON weekly_category_summary(user_id, week_start);

-- Notification center table
CREATE TABLE IF NOT EXISTS user_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    metadata VARCHAR(1000),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created
ON user_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read
ON user_notifications(user_id, is_read);
