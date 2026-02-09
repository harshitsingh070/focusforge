-- DIAGNOSTIC: Check category distribution in snapshots
-- This will show if categories are being stored correctly

SELECT 
    period_type,
    COALESCE(category_name, 'overall') as category,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_snapshots,
    MIN(snapshot_date) as oldest_snapshot,
    MAX(snapshot_date) as newest_snapshot
FROM leaderboard_snapshots
GROUP BY period_type, category_name
ORDER BY period_type, category_name;

-- Check for users appearing in wrong categories
SELECT 
    u.username,
    ls.category_name,
    ls.period_type,
    ls.score,
    COUNT(*) OVER (PARTITION BY ls.user_id, ls.period_type, ls.category_name) as duplicate_count
FROM leaderboard_snapshots ls
JOIN users u ON ls.user_id = u.id
WHERE ls.period_type = 'ALL_TIME'
ORDER BY u.username, ls.category_name;

-- Check if a user has goals in specific categories
SELECT 
    u.username,
    c.name as category,
    COUNT(g.id) as goals_count,
    COUNT(CASE WHEN g.is_private = false AND g.is_active = true THEN 1 END) as public_active_goals
FROM users u
JOIN goals g ON u.id = g.user_id
JOIN categories c ON g.category_id = c.id
GROUP BY u.username, c.name
ORDER BY u.username, c.name;
