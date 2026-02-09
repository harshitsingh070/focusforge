-- ============================================================================
-- AUTOMATIC BADGE SETUP WITH AUTO-ASSIGNMENT
-- This script adds badges and automatically awards them to qualifying users
-- ============================================================================

-- Step 1: Add badges (safe - won't create duplicates)
-- ============================================================================

-- Points Badges
INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'First Steps', 'Earn your first 10 points', 'Points', 'POINTS', 10, 'GLOBAL', 5, '⭐'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'First Steps');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Rising Star', 'Earn 50 total points', 'Points', 'POINTS', 50, 'GLOBAL', 10, '🌟'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Rising Star');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Century Club', 'Earn 100 total points', 'Points', 'POINTS', 100, 'GLOBAL', 25, '💯'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Century Club');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Points Master', 'Earn 500 total points', 'Points', 'POINTS', 500, 'GLOBAL', 100, '👑'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Points Master');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Millennium Master', 'Earn 1000 total points', 'Points', 'POINTS', 1000, 'GLOBAL', 250, '🏆'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Millennium Master');

-- Streak Badges
INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Three Day Fire', 'Maintain a 3-day streak on any goal', 'Streak', 'STREAK', 3, 'PER_GOAL', 10, '🔥'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Three Day Fire');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Week Warrior', 'Maintain a 7-day streak on any goal', 'Streak', 'STREAK', 7, 'PER_GOAL', 25, '🔥'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Week Warrior');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Two Week Titan', 'Maintain a 14-day streak on any goal', 'Streak', 'STREAK', 14, 'PER_GOAL', 50, '🔥'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Two Week Titan');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Month Master', 'Maintain a 30-day streak on any goal', 'Streak', 'STREAK', 30, 'PER_GOAL', 100, '🔥'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Month Master');

-- Consistency Badges
INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Dedication', 'Log activity for 7 consecutive days', 'Consistency', 'CONSISTENCY', 7, 'GLOBAL', 20, '💪'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Dedication');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Persistence', 'Log activity for 14 consecutive days', 'Consistency', 'CONSISTENCY', 14, 'GLOBAL', 40, '💪'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Persistence');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Consistency King', 'Log activity for 30 consecutive days', 'Consistency', 'CONSISTENCY', 30, 'GLOBAL', 100, '💪'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Consistency King');

-- Milestone Badges (Days Active)
INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Getting Started', 'Log activity on 5 different days', 'Milestones', 'DAYS_ACTIVE', 5, 'GLOBAL', 10, '📅'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Getting Started');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT 'Committed', 'Log activity on 15 different days', 'Milestones', 'DAYS_ACTIVE', 15, 'GLOBAL', 30, '📅'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Committed');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT '30 Day Challenge', 'Log activity on 30 different days', 'Milestones', 'DAYS_ACTIVE', 30, 'GLOBAL', 75, '📅'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = '30 Day Challenge');

INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
SELECT '100 Day Club', 'Log activity on 100 different days', 'Milestones', 'DAYS_ACTIVE', 100, 'GLOBAL', 200, '📅'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = '100 Day Club');

-- Update existing badges to have proper category and evaluation_scope
UPDATE badges SET category = 'Points', evaluation_scope = 'GLOBAL' 
WHERE criteria_type = 'POINTS' AND (category IS NULL OR category = '');

UPDATE badges SET category = 'Streak', evaluation_scope = 'PER_GOAL' 
WHERE criteria_type = 'STREAK' AND (category IS NULL OR category = '');

UPDATE badges SET category = 'Consistency', evaluation_scope = 'GLOBAL' 
WHERE criteria_type = 'CONSISTENCY' AND (category IS NULL OR category = '');

UPDATE badges SET category = 'Milestones', evaluation_scope = 'GLOBAL' 
WHERE criteria_type = 'DAYS_ACTIVE' AND (category IS NULL OR category = '');

-- Step 2: Verify badges were added
-- ============================================================================
SELECT 
    category,
    COUNT(*) as badge_count
FROM badges 
GROUP BY category 
ORDER BY category;

-- ============================================================================
-- Step 3: AUTOMATIC BADGE ASSIGNMENT
-- ============================================================================
-- After running this script, execute the following command in your terminal:
--
-- curl.exe -X POST http://localhost:8080/api/badges/backfill
--
-- This will:
-- 1. Evaluate all existing users
-- 2. Award badges they qualify for based on current activity/points/streaks
-- 3. Return a summary of badges awarded
--
-- Example response:
-- {
--   "usersEvaluated": 5,
--   "totalBadgesAwarded": 12,
--   "message": "Badge backfill completed successfully"
-- }
-- ============================================================================

-- Optional: View all badges
SELECT 
    id,
    name,
    category,
    criteria_type,
    threshold,
    evaluation_scope,
    points_bonus,
    icon_url
FROM badges
ORDER BY category, threshold;
