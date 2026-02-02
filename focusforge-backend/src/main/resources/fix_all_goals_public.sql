-- ================================================================
-- CRITICAL FIX: Make your goals PUBLIC and enable leaderboard
-- ================================================================

-- 1. First, check which goals you created
SELECT 
    g.id,
    g.title,
    c.name as category,
    g.is_private,
    g.is_active,
    u.username
FROM goals g
JOIN users u ON g.user_id = u.id
JOIN categories c ON g.category_id = c.id
ORDER BY g.created_at DESC
LIMIT 20;

-- 2. Make ALL your goals public (set is_private = false)
UPDATE goals 
SET is_private = false 
WHERE is_active = true;

-- 3. Enable leaderboard for ALL users  
UPDATE users 
SET privacy_settings = '{"showLeaderboard": true, "publicProfile": true}';

-- 4. Check if you have activity logs in the past 7 days
SELECT 
    u.username,
    g.title,
    al.log_date,
    al.minutes_spent
FROM activity_logs al
JOIN goals g ON al.goal_id = g.id
JOIN users u ON g.user_id = u.id
WHERE al.log_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY al.log_date DESC;

-- 5. VERIFY: See who SHOULD appear on Academics Weekly leaderboard
SELECT 
    u.username,
    g.title as goal,
    COUNT(DISTINCT al.log_date) as days_logged,
    SUM(al.minutes_spent) as total_minutes,
    g.is_private,
    u.privacy_settings
FROM users u
JOIN goals g ON g.user_id = u.id
JOIN categories c ON g.category_id = c.id
LEFT JOIN activity_logs al ON al.goal_id = g.id 
    AND al.log_date >= CURRENT_DATE - INTERVAL '7 days'
WHERE g.is_active = true
    AND c.name = 'Academics'
GROUP BY u.username, g.title, g.is_private, u.privacy_settings
ORDER BY total_minutes DESC NULLS LAST;
