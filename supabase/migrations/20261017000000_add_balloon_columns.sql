-- Add balloon message columns if not already present in surprises table
ALTER TABLE surprises
ADD COLUMN IF NOT EXISTS balloon_recipient_name text,
ADD COLUMN IF NOT EXISTS balloon_main_message text,
ADD COLUMN IF NOT EXISTS balloon_personal_message text,
ADD COLUMN IF NOT EXISTS balloon_closing_message text,
ADD COLUMN IF NOT EXISTS balloon_emoji text,
ADD COLUMN IF NOT EXISTS balloon_style text;
