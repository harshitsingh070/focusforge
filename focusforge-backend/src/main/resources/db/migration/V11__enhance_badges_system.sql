-- V11: Enhance badges system with progress tracking and evaluation metadata
-- Add earned_reason and evaluation_scope fields

-- Add earned_reason to user_badges for explainability
ALTER TABLE user_badges 
ADD COLUMN earned_reason VARCHAR(500);

-- Add evaluation_scope to badges for rule clarity
ALTER TABLE badges
ADD COLUMN evaluation_scope VARCHAR(50) DEFAULT 'GLOBAL';

-- Add comments for clarity
COMMENT ON COLUMN badges.criteria_type IS 'Types: POINTS, STREAK, DAYS_ACTIVE, CONSISTENCY';
COMMENT ON COLUMN badges.evaluation_scope IS 'Scope: GLOBAL (overall), PER_GOAL (any single goal), PER_CATEGORY (category-specific)';
COMMENT ON COLUMN badges.threshold IS 'Required value to earn badge (e.g., 100 points, 7 days)';
COMMENT ON COLUMN user_badges.earned_reason IS 'Why badge was awarded (e.g., "Reached 100 total points", "Maintained 7-day streak on Coding goal")';

-- Update existing badges to have clear evaluation scopes
UPDATE badges SET evaluation_scope = 'GLOBAL' WHERE criteria_type = 'POINTS';
UPDATE badges SET evaluation_scope = 'PER_GOAL' WHERE criteria_type = 'STREAK';
UPDATE badges SET evaluation_scope = 'GLOBAL' WHERE criteria_type = 'DAYS_ACTIVE';
UPDATE badges SET evaluation_scope = 'GLOBAL' WHERE criteria_type = 'CONSISTENCY';
