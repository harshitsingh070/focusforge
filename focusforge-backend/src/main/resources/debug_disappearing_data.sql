-- Check if harshit's activities are still saved
SELECT 
    COUNT(*) as activity_count,
    MIN(log_date) as first_activity,
    MAX(log_date) as last_activity
FROM activity_logs al
JOIN users u ON al.user_id = u.id
WHERE u.username = 'harshit';

-- Check current snapshots for harshit
SELECT 
    ls.period_type,
    ls.category_name,
    ls.rank_position,
    ls.score,
    ls.period_start,
    ls.period_end,
    ls.snapshot_date
FROM leaderboard_snapshots ls
JOIN users u ON ls.user_id = u.id
WHERE u.username = 'harshit'
ORDER BY ls.snapshot_date DESC, ls.period_type, ls.category_name;

-- Check what the latest snapshot date is (to see if snapshots were regenerated)
SELECT 
    MAX(snapshot_date) as latest_snapshot,
    COUNT(*) as total_snapshots
FROM leaderboard_snapshots;

-- Check WEEKLY snapshots that currently exist
SELECT 
    u.username,
    ls.category_name,
    ls.rank_position,
    ls.period_start,
    ls.period_end
FROM leaderboard_snapshots ls
JOIN users u ON ls.user_id = u.id
WHERE ls.period_type = 'WEEKLY'
  AND (ls.category_name = 'Coding' OR ls.category_name IS NULL)
ORDER BY ls.category_name, ls.rank_position
LIMIT 20;
