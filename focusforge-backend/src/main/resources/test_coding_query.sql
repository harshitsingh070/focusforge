-- Test the exact query that's failing
-- This simulates: findPublicGoalsByCategory("Coding")
SELECT g.id, g.title, c.name as category, g.is_private, g.is_active, u.username
FROM goals g
JOIN categories c ON g.category_id = c.id
JOIN users u ON g.user_id = u.id
WHERE c.name = 'Coding' 
  AND g.is_private = false 
  AND g.is_active = true;

-- Double check - are there ANY goals that match?
SELECT 
    c.name as category,
    g.is_private,
    g.is_active,
    COUNT(*) as count
FROM goals g
JOIN categories c ON g.category_id = c.id
WHERE c.name = 'Coding'
GROUP BY c.name, g.is_private, g.is_active;
