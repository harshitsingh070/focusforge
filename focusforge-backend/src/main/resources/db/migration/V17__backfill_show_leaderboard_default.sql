-- Ensure leaderboard visibility defaults to enabled unless explicitly disabled.
ALTER TABLE users
ALTER COLUMN privacy_settings
SET DEFAULT '{"publicProfile": false, "shareAnalytics": false, "showLeaderboard": true}'::jsonb;

-- Backfill users missing the showLeaderboard key.
UPDATE users
SET privacy_settings = CASE
    WHEN privacy_settings IS NULL OR jsonb_typeof(privacy_settings) <> 'object'
        THEN jsonb_build_object('showLeaderboard', true)
    ELSE privacy_settings || jsonb_build_object('showLeaderboard', true)
END
WHERE privacy_settings IS NULL
   OR jsonb_typeof(privacy_settings) <> 'object'
   OR NOT (privacy_settings ? 'showLeaderboard');
