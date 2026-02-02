-- Check snapshot distribution by period and category
SELECT 
    period_type,
    category_name,
    COUNT(*) as snapshot_count,
    MIN(snapshot_date) as oldest_snapshot,
    MAX(snapshot_date) as newest_snapshot
FROM leaderboard_snapshots
GROUP BY period_type, category_name
ORDER BY period_type, category_name;

-- Check if there are ANY Coding snapshots at all
SELECT 
    period_type,
    COUNT(*) as count,
    period_start,
    period_end
FROM leaderboard_snapshots
WHERE category_name = 'Coding'
GROUP BY period_type, period_start, period_end
ORDER BY period_type;
