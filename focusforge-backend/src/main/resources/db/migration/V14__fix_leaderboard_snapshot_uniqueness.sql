-- Remove duplicate leaderboard snapshots (including overall rows with NULL category_name)
WITH duplicate_rows AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, period_type, COALESCE(category_name, '__OVERALL__'), period_start, period_end
               ORDER BY id
           ) AS row_num
    FROM leaderboard_snapshots
)
DELETE FROM leaderboard_snapshots
WHERE id IN (
    SELECT id
    FROM duplicate_rows
    WHERE row_num > 1
);

-- Enforce uniqueness even when category_name is NULL (overall leaderboard)
CREATE UNIQUE INDEX IF NOT EXISTS uq_leaderboard_snapshot_scope
ON leaderboard_snapshots (
    user_id,
    period_type,
    COALESCE(category_name, '__OVERALL__'),
    period_start,
    period_end
);
