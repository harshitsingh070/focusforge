-- Step 1: Check user 'met' eligibility for leaderboard
SELECT 
    u.username,
    u.is_active,
    u.privacy_settings,
    COUNT(g.id) as total_goals,
    SUM(CASE WHEN g.is_private = false AND g.is_active = true THEN 1 ELSE 0 END) as public_active_goals
FROM users u
LEFT JOIN goals g ON u.id = g.user_id
WHERE u.username = 'met'
GROUP BY u.id, u.username, u.is_active, u.privacy_settings;

-- Step 2: Check met's activities
SELECT 
    al.log_date,
    g.title as goal_title,
    c.name as category,
    al.minutes_spent,
    g.is_private,
    g.is_active
FROM activity_logs al
JOIN goals g ON al.goal_id = g.id
JOIN categories c ON g.category_id = c.id
JOIN users u ON al.user_id = u.id
WHERE u.username = 'met'
ORDER BY al.log_date DESC
LIMIT 10;

-- Step 3: Check met's points
SELECT 
    u.username,
    COALESCE(SUM(pl.points), 0) as total_points
FROM users u
LEFT JOIN point_ledger pl ON u.id = pl.user_id
WHERE u.username = 'met'
GROUP BY u.id, u.username;

-- Step 4: Check if met appears in ANY snapshots
SELECT 
    period_type,
    category_name,
    rank_position,
    score,
    raw_points
FROM leaderboard_snapshots ls
JOIN users u ON ls.user_id = u.id
WHERE u.username = 'met'
ORDER BY period_type, category_name;
