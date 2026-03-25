-- Step 1: Remove default
ALTER TABLE users 
ALTER COLUMN privacy_settings DROP DEFAULT;

-- Step 2: Convert column
ALTER TABLE users 
ALTER COLUMN privacy_settings TYPE JSONB 
USING privacy_settings::jsonb;

-- Step 3: Add new JSONB default
ALTER TABLE users 
ALTER COLUMN privacy_settings SET DEFAULT '{}'::jsonb;