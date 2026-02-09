-- Sample badges to demonstrate the badges system
-- These badges cover all criteria types and categories

-- Points Badges
INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
VALUES 
('First Steps', 'Earn your first 10 points', 'Points', 'POINTS', 10, 'GLOBAL', 5, '⭐'),
('Rising Star', 'Earn 50 total points', 'Points', 'POINTS', 50, 'GLOBAL', 10, '🌟'),
('Century Club', 'Earn 100 total points', 'Points', 'POINTS', 100, 'GLOBAL', 25, '💯'),
('Points Master', 'Earn 500 total points', 'Points', 'POINTS', 500, 'GLOBAL', 100, '👑'),
('Millennium Master', 'Earn 1000 total points', 'Points', 'POINTS', 1000, 'GLOBAL', 250, '🏆');

-- Streak Badges
INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
VALUES 
('Three Day Fire', 'Maintain a 3-day streak on any goal', 'Streak', 'STREAK', 3, 'PER_GOAL', 10, '🔥'),
('Week Warrior', 'Maintain a 7-day streak on any goal', 'Streak', 'STREAK', 7, 'PER_GOAL', 25, '🔥'),
('Two Week Titan', 'Maintain a 14-day streak on any goal', 'Streak', 'STREAK', 14, 'PER_GOAL', 50, '🔥'),
('Month Master', 'Maintain a 30-day streak on any goal', 'Streak', 'STREAK', 30, 'PER_GOAL', 100, '🔥');

-- Consistency Badges  
INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
VALUES 
('Dedication', 'Log activity for 7 consecutive days', 'Consistency', 'CONSISTENCY', 7, 'GLOBAL', 20, '💪'),
('Persistence', 'Log activity for 14 consecutive days', 'Consistency', 'CONSISTENCY', 14, 'GLOBAL', 40, '💪'),
('Consistency King', 'Log activity for 30 consecutive days', 'Consistency', 'CONSISTENCY', 30, 'GLOBAL', 100, '💪');

-- Days Active Badges (Milestones)
INSERT INTO badges (name, description, category, criteria_type, threshold, evaluation_scope, points_bonus, icon_url)
VALUES 
('Getting Started', 'Log activity on 5 different days', 'Milestones', 'DAYS_ACTIVE', 5, 'GLOBAL', 10, '📅'),
('Committed', 'Log activity on 15 different days', 'Milestones', 'DAYS_ACTIVE', 15, 'GLOBAL', 30, '📅'),
('30 Day Challenge', 'Log activity on 30 different days', 'Milestones', 'DAYS_ACTIVE', 30, 'GLOBAL', 75, '📅'),
('100 Day Club', 'Log activity on 100 different days', 'Milestones', 'DAYS_ACTIVE', 100, 'GLOBAL', 200, '📅');

-- Verify insertion
SELECT category, COUNT(*) as badge_count 
FROM badges 
GROUP BY category 
ORDER BY category;

-- Show all badges
SELECT 
    id,
    name,
    category,
    criteria_type,
    threshold,
    evaluation_scope,
    points_bonus
FROM badges
ORDER BY category, threshold;
