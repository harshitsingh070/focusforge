-- Add optional target_category for PER_CATEGORY badge rules
ALTER TABLE badges
ADD COLUMN IF NOT EXISTS target_category VARCHAR(100);

COMMENT ON COLUMN badges.target_category IS
'Goal category name targeted by PER_CATEGORY badges (e.g., Coding, Health)';
