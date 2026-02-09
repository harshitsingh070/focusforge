-- COMPREHENSIVE LEADERBOARD FIX
-- Run these in order

-- ========================================
-- STEP 1: CLEAN UP DUPLICATE SNAPSHOTS
-- ========================================

-- Delete all duplicate snapshots, keeping only the oldest one
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, period_type, 
                        COALESCE(category_name, 'NULL'), 
                        period_start, period_end
            ORDER BY id ASC
        ) as row_num
    FROM leaderboard_snapshots
)
DELETE FROM leaderboard_snapshots
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);

-- ========================================
-- STEP 2: FIX ALL GOALS TO BE PUBLIC
-- ========================================

-- Set all goals to public (is_private = false)
UPDATE goals
SET is_private = false
WHERE is_private = true;

-- ========================================
-- STEP 3: FIX ALL USERS' PRIVACY SETTINGS
-- ========================================

-- Ensure all users have showLeaderboard = true in privacy_settings
UPDATE users
SET privacy_settings = jsonb_set(
    COALESCE(privacy_settings, '{}'::jsonb),
    '{showLeaderboard}',
    'true'::jsonb
)
WHERE privacy_settings->>'showLeaderboard' IS NULL 
   OR privacy_settings->>'showLeaderboard' = 'false';

-- ========================================
-- STEP 4: VERIFY FIXES
-- ========================================

-- Should return 0 rows (no duplicates)
SELECT 
    user_id,
    period_type,
    category_name,
    COUNT(*) as count
FROM leaderboard_snapshots
GROUP BY user_id, period_type, category_name, period_start, period_end
HAVING COUNT(*) > 1;

-- Check all users are eligible
SELECT 
    u.username,
    u.privacy_settings->>'showLeaderboard' as show_leaderboard,
    COUNT(g.id) as total_goals,
    SUM(CASE WHEN g.is_private = false AND g.is_active = true THEN 1 ELSE 0 END) as public_active_goals,
    COALESCE(SUM(pl.points), 0) as total_points
FROM users u
LEFT JOIN goals g ON u.id = g.user_id
LEFT JOIN point_ledger pl ON u.id = pl.user_id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.privacy_settings
ORDER BY total_points DESC;
