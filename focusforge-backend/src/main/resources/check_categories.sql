-- Test query: check what categories exist in the database and how they're named
SELECT DISTINCT c.name
FROM categories c
ORDER BY c.name;

-- Check if there are any coding goals at all
SELECT 
    c.name as category,
    COUNT(g.id) as total_goals,
    SUM(CASE WHEN g.is_private = false AND g.is_active = true THEN 1 ELSE 0 END) as public_active_goals
FROM categories c
LEFT JOIN goals g ON c.id = g.category_id
GROUP BY c.name
ORDER BY c.name;
