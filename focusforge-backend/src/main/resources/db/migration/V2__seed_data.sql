-- Insert Categories
INSERT INTO categories (name, description, normalization_factor, color_code) VALUES 
('Coding', 'Software development, programming, and technical skills', 1.0, '#3b82f6'),
('Health', 'Physical exercise, mental wellness, and healthy habits', 1.2, '#10b981'),
('Reading', 'Books, articles, research papers, and documentation', 0.9, '#f59e0b'),
('Academics', 'Formal education, courses, and studying', 1.1, '#8b5cf6'),
('Career Skills', 'Professional development, soft skills, and networking', 1.0, '#ec4899');

-- Insert Badges
INSERT INTO badges (name, description, criteria_type, threshold, points_bonus) VALUES
('Week Warrior', 'Maintain a 7-day streak on any goal', 'STREAK', 7, 50),
('Monthly Master', 'Maintain a 30-day streak on any goal', 'STREAK', 30, 200),
('Century Club', 'Earn 100 total points', 'POINTS', 100, 25),
('Point Master', 'Earn 1000 total points', 'POINTS', 1000, 100),
('Consistency King', 'Complete goals for 30 days without break', 'CONSISTENCY', 30, 150);