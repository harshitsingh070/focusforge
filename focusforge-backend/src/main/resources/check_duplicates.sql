-- Check for duplicate snapshots (same user, period, category)
SELECT 
    user_id,
    period_type,
    category_name,
    period_start,
    period_end,
    COUNT(*) as duplicate_count,
    STRING_AGG(CAST(id AS TEXT), ', ') as snapshot_ids
FROM leaderboard_snapshots
GROUP BY user_id, period_type, category_name, period_start, period_end
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Check a specific case: Monthly + Coding
SELECT 
    ls.id,
    u.username,
    ls.rank_position,
    ls.score,
    ls.raw_points,
    ls.period_type,
    ls.category_name,
    ls.period_start,
    ls.period_end
FROM leaderboard_snapshots ls
JOIN users u ON ls.user_id = u.id
WHERE ls.period_type = 'MONTHLY' 
  AND ls.category_name = 'Coding'
ORDER BY ls.rank_position, u.username;
