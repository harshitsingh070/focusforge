-- Fix badge constraint to allow all criteria types
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_criteria_type_check;

ALTER TABLE badges ADD CONSTRAINT badges_criteria_type_check 
CHECK (criteria_type IN ('POINTS', 'STREAK', 'CONSISTENCY', 'DAYS_ACTIVE', 'MILESTONE'));
