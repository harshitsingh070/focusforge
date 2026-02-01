-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    privacy_settings VARCHAR(500) DEFAULT '{"publicProfile": false, "shareAnalytics": false}'
);

-- Categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    normalization_factor DECIMAL(4,2) DEFAULT 1.0,
    color_code VARCHAR(7) DEFAULT '#6366f1'
);

-- Goals
CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    daily_minimum_minutes INTEGER NOT NULL CHECK (daily_minimum_minutes > 0),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Activity Logs
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    minutes_spent INTEGER NOT NULL CHECK (minutes_spent > 0 AND minutes_spent <= 1440),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, goal_id, log_date)
);

-- Streaks
CREATE TABLE streaks (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL UNIQUE REFERENCES goals(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Point Ledger
CREATE TABLE point_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id BIGINT REFERENCES goals(id) ON DELETE SET NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    reason VARCHAR(100) NOT NULL,
    reference_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges
CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    criteria_type VARCHAR(50) NOT NULL CHECK (criteria_type IN ('STREAK', 'POINTS', 'CONSISTENCY')),
    threshold INTEGER NOT NULL,
    icon_url VARCHAR(255),
    points_bonus INTEGER DEFAULT 0
);

-- User Badges
CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_goal_id BIGINT REFERENCES goals(id),
    UNIQUE(user_id, badge_id)
);

-- Suspicious Activities
CREATE TABLE suspicious_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    details JSONB,
    flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed BOOLEAN DEFAULT false,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    resolution_notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, log_date DESC);
CREATE INDEX idx_activity_logs_goal ON activity_logs(goal_id);
CREATE INDEX idx_point_ledger_user_date ON point_ledger(user_id, reference_date DESC);
CREATE INDEX idx_goals_user_active ON goals(user_id, is_active);
CREATE INDEX idx_suspicious_user_reviewed ON suspicious_activities(user_id, reviewed);