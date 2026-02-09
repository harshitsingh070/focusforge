-- Quick diagnostic: Check if badges exist
SELECT COUNT(*) as total_badges FROM badges;

-- If 0, badges haven't been added yet
-- Run setup_badges_auto.sql first!
