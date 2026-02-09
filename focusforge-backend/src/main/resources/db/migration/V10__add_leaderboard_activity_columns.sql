-- Add missing columns to leaderboard_snapshots table
ALTER TABLE leaderboard_snapshots 
ADD COLUMN IF NOT EXISTS days_active INTEGER,
ADD COLUMN IF NOT EXISTS current_streak INTEGER;

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'leaderboard_snapshots'
ORDER BY ordinal_position;
