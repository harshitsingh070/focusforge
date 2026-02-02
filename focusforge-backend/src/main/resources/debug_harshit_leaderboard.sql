-- Check if harshit's activity was actually saved
SELECT 
    al.id,
    u.username,
    g.title as goal_title,
    c.name as category,
    al.log_date,
    al.minutes_spent,
    g.is_private,
    g.is_active
FROM activity_logs al
JOIN users u ON al.user_id = u.id
JOIN goals g ON al.goal_id = g.id
LEFT JOIN categories c ON g.category_id = c.id
WHERE u.username = 'harshit'
ORDER BY al.log_date DESC
LIMIT 5;

-- Check harshit's goals
SELECT 
    g.id,
    g.title,
    c.name as category,
    g.is_private,
    g.is_active
FROM goals g
JOIN users u ON g.user_id = u.id
LEFT JOIN categories c ON g.category_id = c.id
WHERE u.username = 'harshit';

-- Check harshit's privacy settings
SELECT 
    id,
    username,
    privacy_settings
FROM users
WHERE username = 'harshit';

-- Check what snapshots exist for Coding category
SELECT 
    u.username,
    ls.rank_position,
    ls.score,
    ls.period_type,
    ls.period_start,
    ls.period_end
FROM leaderboard_snapshots ls
JOIN users u ON ls.user_id = u.id
WHERE ls.category_name = 'Coding'
  AND ls.period_type = 'WEEKLY'
ORDER BY ls.rank_position
LIMIT 10;
