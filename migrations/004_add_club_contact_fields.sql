-- Add phone and email columns to clubs table
-- This migration adds the missing phone and email fields to the clubs table
-- to match what the frontend and API expect

ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Comment the new columns
COMMENT ON COLUMN clubs.phone IS 'Club contact phone number';
COMMENT ON COLUMN clubs.email IS 'Club contact email address';