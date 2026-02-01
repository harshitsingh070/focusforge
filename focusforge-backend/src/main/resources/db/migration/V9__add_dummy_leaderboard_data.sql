-- Insert Dummy Users
INSERT INTO users (email, password_hash, username, is_active, privacy_settings)
VALUES 
    ('alice@example.com', '$2a$10$dummyhashedpassword', 'alice', true, '{"showLeaderboard": true, "publicProfile": true}'),
    ('bob@example.com', '$2a$10$dummyhashedpassword', 'bob', true, '{"showLeaderboard": true, "publicProfile": true}'),
    ('carol@example.com', '$2a$10$dummyhashedpassword', 'carol', true, '{"showLeaderboard": true, "publicProfile": true}'),
    ('dave@example.com', '$2a$10$dummyhashedpassword', 'dave', true, '{"showLeaderboard": true, "publicProfile": true}'),
    ('eve@example.com', '$2a$10$dummyhashedpassword', 'eve', true, '{"showLeaderboard": true, "publicProfile": true}')
ON CONFLICT (email) DO NOTHING;

-- Create Public Goals (Academics)
INSERT INTO goals (user_id, category_id, title, description, difficulty, daily_minimum_minutes, start_date, is_active, is_private)
SELECT id, (SELECT id FROM categories WHERE name = 'Academics'), 'Advanced Calculs', 'Mastering integration', 4, 60, CURRENT_DATE - INTERVAL '10 days', true, false 
FROM users WHERE username = 'alice'
ON CONFLICT DO NOTHING;

INSERT INTO goals (user_id, category_id, title, description, difficulty, daily_minimum_minutes, start_date, is_active, is_private)
SELECT id, (SELECT id FROM categories WHERE name = 'Academics'), 'Physics 101', 'Mechanics basics', 3, 45, CURRENT_DATE - INTERVAL '15 days', true, false 
FROM users WHERE username = 'bob'
ON CONFLICT DO NOTHING;

INSERT INTO goals (user_id, category_id, title, description, difficulty, daily_minimum_minutes, start_date, is_active, is_private)
SELECT id, (SELECT id FROM categories WHERE name = 'Academics'), 'Literature Review', 'Reading classics', 2, 30, CURRENT_DATE - INTERVAL '5 days', true, false 
FROM users WHERE username = 'carol'
ON CONFLICT DO NOTHING;

INSERT INTO goals (user_id, category_id, title, description, difficulty, daily_minimum_minutes, start_date, is_active, is_private)
SELECT id, (SELECT id FROM categories WHERE name = 'Academics'), 'Chemistry Lab', 'Experiments', 5, 90, CURRENT_DATE - INTERVAL '20 days', true, false 
FROM users WHERE username = 'dave'
ON CONFLICT DO NOTHING;

-- Create Public Goals (Coding) for variety
INSERT INTO goals (user_id, category_id, title, description, difficulty, daily_minimum_minutes, start_date, is_active, is_private)
SELECT id, (SELECT id FROM categories WHERE name = 'Coding'), 'Learn Rust', 'Systems programming', 5, 60, CURRENT_DATE - INTERVAL '30 days', true, false 
FROM users WHERE username = 'eve'
ON CONFLICT DO NOTHING;

INSERT INTO goals (user_id, category_id, title, description, difficulty, daily_minimum_minutes, start_date, is_active, is_private)
SELECT id, (SELECT id FROM categories WHERE name = 'Coding'), 'LeetCode Daily', 'Algorithms', 4, 45, CURRENT_DATE - INTERVAL '12 days', true, false 
FROM users WHERE username = 'alice'
ON CONFLICT DO NOTHING;


-- Insert Activity Logs (Recent - Last 7 days) to ensure they show up in Weekly
-- Alice: Very consistent (Academics)
INSERT INTO activity_logs (goal_id, user_id, log_date, minutes_spent, notes)
SELECT g.id, u.id, d, 75, 'Study session'
FROM users u
JOIN goals g ON g.user_id = u.id AND g.title = 'Advanced Calculs'
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') as d
WHERE u.username = 'alice'
ON CONFLICT DO NOTHING;

-- Bob: Consistent but lower minutes (Academics)
INSERT INTO activity_logs (goal_id, user_id, log_date, minutes_spent, notes)
SELECT g.id, u.id, d, 45, 'Homework'
FROM users u
JOIN goals g ON g.user_id = u.id AND g.title = 'Physics 101'
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE, '1 day') as d
WHERE u.username = 'bob'
ON CONFLICT DO NOTHING;

-- Carol: High minutes but skipped days (Academics)
INSERT INTO activity_logs (goal_id, user_id, log_date, minutes_spent, notes)
SELECT g.id, u.id, d, 120, 'Deep work'
FROM users u
JOIN goals g ON g.user_id = u.id AND g.title = 'Literature Review'
CROSS JOIN (VALUES 
    (CURRENT_DATE), 
    (CURRENT_DATE - INTERVAL '2 days'), 
    (CURRENT_DATE - INTERVAL '4 days')
) as t(d)
WHERE u.username = 'carol'
ON CONFLICT DO NOTHING;

-- Dave: Just started (Academics)
INSERT INTO activity_logs (goal_id, user_id, log_date, minutes_spent, notes)
SELECT g.id, u.id, CURRENT_DATE, 90, 'First day'
FROM users u
JOIN goals g ON g.user_id = u.id AND g.title = 'Chemistry Lab'
WHERE u.username = 'dave'
ON CONFLICT DO NOTHING;

-- Eve: Coding activity
INSERT INTO activity_logs (goal_id, user_id, log_date, minutes_spent, notes)
SELECT g.id, u.id, d, 60, 'Coding practice'
FROM users u
JOIN goals g ON g.user_id = u.id AND g.title = 'Learn Rust'
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE, '1 day') as d
WHERE u.username = 'eve'
ON CONFLICT DO NOTHING;

-- Create Streaks appropriately
INSERT INTO streaks (goal_id, current_streak, longest_streak, last_activity_date)
SELECT id, 7, 10, CURRENT_DATE FROM goals WHERE title = 'Advanced Calculs'
ON CONFLICT (goal_id) DO UPDATE SET current_streak = 7, last_activity_date = CURRENT_DATE;

INSERT INTO streaks (goal_id, current_streak, longest_streak, last_activity_date)
SELECT id, 6, 6, CURRENT_DATE FROM goals WHERE title = 'Physics 101'
ON CONFLICT (goal_id) DO UPDATE SET current_streak = 6, last_activity_date = CURRENT_DATE;

INSERT INTO streaks (goal_id, current_streak, longest_streak, last_activity_date)
SELECT id, 1, 5, CURRENT_DATE FROM goals WHERE title = 'Literature Review'
ON CONFLICT (goal_id) DO UPDATE SET current_streak = 1, last_activity_date = CURRENT_DATE;

INSERT INTO streaks (goal_id, current_streak, longest_streak, last_activity_date)
SELECT id, 5, 20, CURRENT_DATE FROM goals WHERE title = 'Learn Rust'
ON CONFLICT (goal_id) DO UPDATE SET current_streak = 5, last_activity_date = CURRENT_DATE;

-- Add Points to Ledger (Approximated) check constraint points >= 0
INSERT INTO point_ledger (user_id, goal_id, points, reason, reference_date)
SELECT u.id, g.id, 100, 'Daily Goal Met', CURRENT_DATE
FROM users u JOIN goals g ON g.user_id = u.id
WHERE u.username IN ('alice', 'bob', 'carol', 'dave', 'eve');
