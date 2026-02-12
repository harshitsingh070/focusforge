-- Conservative performance indexes for existing query patterns.
-- Additive only (no schema/data changes), and guarded with IF NOT EXISTS.

-- Activity logs: optimize goal timeline reads ordered by date.
CREATE INDEX IF NOT EXISTS idx_activity_logs_goal_date
ON activity_logs(goal_id, log_date DESC);

-- Point ledger: optimize category/date leaderboard aggregations via goal join.
-- NOTE: point_ledger has no category_id column in current schema.
CREATE INDEX IF NOT EXISTS idx_point_ledger_goal_date_user
ON point_ledger(goal_id, reference_date DESC, user_id);

-- Goals: optimize active goals filtered by category.
CREATE INDEX IF NOT EXISTS idx_goals_category_active
ON goals(category_id)
WHERE is_active = true;

-- Goals: optimize user+category joins used by streak/category queries.
CREATE INDEX IF NOT EXISTS idx_goals_user_category
ON goals(user_id, category_id);

-- Leaderboard snapshots: optimize period/category/rank retrievals.
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_scope_rank
ON leaderboard_snapshots(
    period_type,
    period_start,
    period_end,
    COALESCE(category_name, '__OVERALL__'),
    rank_position
);

-- Leaderboard snapshot retention cleanup by date.
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_snapshot_date_rank
ON leaderboard_snapshots(snapshot_date, rank_position);
