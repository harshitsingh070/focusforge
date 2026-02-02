-- ========================================
-- LEADERBOARD DIAGNOSTIC CHECK
-- Run this in PgAdmin or your database tool
-- ========================================

-- 1. Check if V9 migration ran
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
WHERE version = '9';

-- 2. Count all users
SELECT COUNT(*) as total_users FROM users;

-- 3. List all users (should include alice, bob, carol, dave, eve)
SELECT username, privacy_settings FROM users ORDER BY username;

-- 4. Count public goals
SELECT COUNT(*) as public_goals FROM goals WHERE is_private = false AND is_active = true;

-- 5. List public goals by category
SELECT 
    c.name as category,
    g.title,
    u.username,
    g.is_private,
    g.is_active
FROM goals g
JOIN users u ON g.user_id = u.id
JOIN categories c ON g.category_id = c.id
WHERE g.is_private = false AND g.is_active = true
ORDER BY c.name, u.username;

-- 6. Count recent activity logs (last 7 days)
SELECT COUNT(*) as recent_logs 
FROM activity_logs 
WHERE log_date >= CURRENT_DATE - INTERVAL '7 days';

-- 7. Activity logs by user for last 7 days
SELECT 
    u.username,
    g.title as goal,
    COUNT(*) as days_logged,
    SUM(al.minutes_spent) as total_minutes
FROM activity_logs al
JOIN goals g ON al.goal_id = g.id
JOIN users u ON g.user_id = u.id
WHERE al.log_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.username, g.title
ORDER BY total_minutes DESC;

-- 8. CRITICAL: Check what the leaderboard query SHOULD return (Academics category, Weekly)
SELECT 
    u.id as user_id,
    u.username,
    g.title as goal_title,
    c.name as category,
    COUNT(DISTINCT al.log_date) as days_active,
    SUM(al.minutes_spent) as total_minutes,
    u.privacy_settings
FROM users u
JOIN goals g ON g.user_id = u.id
JOIN categories c ON g.category_id = c.id
LEFT JOIN activity_logs al ON al.goal_id = g.id 
    AND al.log_date >= CURRENT_DATE - INTERVAL '7 days'
WHERE g.is_private = false 
    AND g.is_active = true
    AND c.name = 'Academics'
GROUP BY u.id, u.username, g.title, c.name, u.privacy_settings
ORDER BY total_minutes DESC NULLS LAST;
