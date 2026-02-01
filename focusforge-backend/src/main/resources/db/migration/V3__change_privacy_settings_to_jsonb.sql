-- Change privacy_settings column from VARCHAR to JSONB
ALTER TABLE users ALTER COLUMN privacy_settings TYPE JSONB USING privacy_settings::jsonb;
