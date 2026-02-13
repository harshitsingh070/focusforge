-- Expand settings defaults to support full privacy, preferences, and profile bio persistence.
ALTER TABLE users
ALTER COLUMN privacy_settings
SET DEFAULT '{
  "showActivity":"PUBLIC",
  "showLeaderboard":true,
  "showBadges":true,
  "showProgress":true,
  "theme":"system",
  "emailReminders":true,
  "weeklySummary":true,
  "profileBio":""
}'::jsonb;

UPDATE users
SET privacy_settings = CASE
    WHEN privacy_settings IS NULL OR jsonb_typeof(privacy_settings) <> 'object' THEN '{
      "showActivity":"PUBLIC",
      "showLeaderboard":true,
      "showBadges":true,
      "showProgress":true,
      "theme":"system",
      "emailReminders":true,
      "weeklySummary":true,
      "profileBio":""
    }'::jsonb
    ELSE '{
      "showActivity":"PUBLIC",
      "showLeaderboard":true,
      "showBadges":true,
      "showProgress":true,
      "theme":"system",
      "emailReminders":true,
      "weeklySummary":true,
      "profileBio":""
    }'::jsonb || privacy_settings
END;
