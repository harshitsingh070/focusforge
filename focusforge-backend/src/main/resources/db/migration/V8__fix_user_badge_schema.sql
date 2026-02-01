-- Ensure user_badges columns exist safely
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS related_goal_id BIGINT REFERENCES goals(id);
