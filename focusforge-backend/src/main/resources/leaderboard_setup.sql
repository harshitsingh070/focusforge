-- ==================================================
-- LEADERBOARD DATA SETUP & VERIFICATION
-- ==================================================

-- Step 1: Check if you have any users
SELECT id, username, email, privacy_settings FROM users;

-- Step 2: Check if you have any goals
SELECT g.id, g.title, c.name as category, g.is_private, g.is_active, u.username 
FROM goals g
JOIN users u ON g.user_id = u.id
JOIN categories c ON g.category_id = c.id;

-- Step 3: Check if you have any activity logs
SELECT al.id, al.log_date, al.minutes_spent, g.title, u.username
FROM activity_logs al
JOIN goals g ON al.goal_id = g.id
JOIN users u ON g.user_id = u.id
WHERE al.log_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY al.log_date DESC;

-- ==================================================
-- MAKE YOUR EXISTING GOALS PUBLIC (if you have any)
-- ==================================================

-- Option A: Make ALL your goals public
-- (Replace 'your_username' with your actual username)
UPDATE goals 
SET is_private = false
WHERE user_id = (SELECT id FROM users WHERE username = 'harshit') -- Change to your username
AND is_active = true;

-- Option B: Make only Academics goals public
UPDATE goals 
SET is_private = false
WHERE user_id = (SELECT id FROM users WHERE username = 'harshit') -- Change to your username
AND category_id = (SELECT id FROM categories WHERE name = 'Academics')
AND is_active = true;

-- ==================================================
-- SET PRIVACY SETTINGS TO SHOW ON LEADERBOARD
-- ==================================================

-- Make sure your user opts into leaderboards
UPDATE users 
SET privacy_settings = '{"showLeaderboard": true, "publicProfile": true}'
WHERE username = 'harshit'; -- Change to your username

-- ==================================================
-- VERIFICATION: Check what will appear on leaderboard
-- ==================================================

-- This shows what the leaderboard query will find:
SELECT 
    u.id,
    u.username,
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
GROUP BY u.id, u.username, c.name, u.privacy_settings;

-- ==================================================
-- CREATE TEST DATA (if you don't have any)
-- ==================================================

-- Insert a test user (if needed)
INSERT INTO users (email, password_hash, username, is_active, privacy_settings)
VALUES 
    ('test@example.com', '$2a$10$dummyhashedpassword', 'testuser', true, '{"showLeaderboard": true}')
ON CONFLICT (email) DO NOTHING;

-- Create a public Academics goal for the test user
INSERT INTO goals (user_id, category_id, title, description, difficulty, daily_minimum_minutes, start_date, is_active, is_private)
SELECT 
    (SELECT id FROM users WHERE username = 'testuser'),
    (SELECT id FROM categories WHERE name = 'Academics'),
    'Study Math',
    'Daily math practice',
    3,
    60,
    CURRENT_DATE,
    true,
    false -- PUBLIC
ON CONFLICT DO NOTHING;

-- Add some activity logs for this week
INSERT INTO activity_logs (goal_id, user_id, log_date, minutes_spent, notes)
SELECT 
    g.id,
    u.id,
    CURRENT_DATE - INTERVAL '1 day',
    90,
    'Algebra practice'
FROM goals g
JOIN users u ON g.user_id = u.id
WHERE u.username = 'testuser' AND g.title = 'Study Math'
ON CONFLICT (goal_id, log_date) DO NOTHING;

-- Add more days
INSERT INTO activity_logs (goal_id, user_id, log_date, minutes_spent, notes)
SELECT 
    g.id,
    u.id,
    CURRENT_DATE - INTERVAL '2 days',
    75,
    'Calculus'
FROM goals g
JOIN users u ON g.user_id = u.id
WHERE u.username = 'testuser' AND g.title = 'Study Math'
ON CONFLICT (goal_id, log_date) DO NOTHING;

-- ==================================================
-- FINAL VERIFICATION
-- ==================================================

-- Count public goals per category
SELECT c.name, COUNT(*) as public_goals_count
FROM goals g
JOIN categories c ON g.category_id = c.id
WHERE g.is_private = false AND g.is_active = true
GROUP BY c.name;

-- Check leaderboard eligibility
SELECT 
    u.username,
    'Eligible' as status
FROM users u
WHERE EXISTS (
    SELECT 1 FROM goals g 
    WHERE g.user_id = u.id 
    AND g.is_private = false 
    AND g.is_active = true
)
AND EXISTS (
    SELECT 1 FROM activity_logs al
    JOIN goals g ON al.goal_id = g.id
    WHERE g.user_id = u.id
    AND al.log_date >= CURRENT_DATE - INTERVAL '7 days'
);
