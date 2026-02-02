-- Step 1: Find and DELETE duplicate leaderboard snapshots
-- Keep only the snapshot with the lowest ID for each unique combination

-- Method 1: Using a CTE to identify and delete duplicates
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

-- Step 2: Verify no duplicates remain
SELECT 
    user_id,
    period_type,
    category_name,
    period_start,
    period_end,
    COUNT(*) as count
FROM leaderboard_snapshots
GROUP BY user_id, period_type, category_name, period_start, period_end
HAVING COUNT(*) > 1;

-- This should return 0 rows after cleanup
