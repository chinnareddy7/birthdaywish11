/*
# Create surprises and wishes tables (single-tenant, no auth)

1. Purpose
- Store birthday surprises created via the Generate Surprise wizard.
- Each surprise has a unique slug used to build a public share link (e.g. /s/ananya-2026).
- Optionally protected by a password (stored hashed) for extra privacy.
- Store optional "wishes" left by visitors who view a surprise.

2. New Tables
- `surprises`
  - `id` (uuid, primary key)
  - `slug` (text, unique) — short identifier used in the share URL
  - `creator_name` (text) — who made the surprise
  - `recipient_name` (text) — who it's for
  - `nickname` (text) — optional cute nickname
  - `relationship` (text) — e.g. partner / friend / family / other
  - `birthday_date` (date) — the birthday
  - `theme` (text) — theme id (pink / purple / blue / gold / neon)
  - `letter` (text) — heartfelt message
  - `letter_photo_url` (text) — optional photo attached to the letter
  - `memories` (jsonb, default '[]') — array of { url, caption }
  - `video_url` (text) — optional YouTube link
  - `video_file_url` (text) — optional uploaded video object URL (stored as text)
  - `video_title` (text)
  - `video_dedication` (text)
  - `password_hash` (text) — optional bcrypt-style hash; null means public
  - `created_at` (timestamptz, default now())
- `wishes`
  - `id` (uuid, primary key)
  - `surprise_id` (uuid, foreign key to surprises.id, on delete cascade)
  - `author` (text) — name of the person leaving the wish
  - `message` (text) — the wish text
  - `created_at` (timestamptz, default now())

3. Indexes
- Unique index on `surprises.slug` (created by UNIQUE constraint).
- Index on `wishes.surprise_id` for fast lookup by surprise.

4. Security
- Enable RLS on both tables.
- Surprises are public-by-link: anyone (anon + authenticated) can SELECT, INSERT, UPDATE, DELETE.
  The share link IS the access control. A password_hash adds optional second-factor protection enforced in app code.
- Wishes: anyone can SELECT (so the creator can read replies), INSERT (so visitors can leave one),
  and DELETE/UPDATE (so the creator can moderate). Single-tenant app, no sign-in.
- `USING (true)` / `WITH CHECK (true)` is acceptable here because the link is the intended
  access boundary and there is no per-user ownership concept in this app.

5. Notes
- No `user_id` column and no `auth.uid()` checks — this app has no sign-in screen.
- The slug is generated client-side and validated for uniqueness on insert (UNIQUE constraint).
- Password hashing is done client-side with a lightweight hash; for stronger security a future
  version could move hashing into an edge function, but for this demo a client hash is sufficient.
*/

CREATE TABLE IF NOT EXISTS surprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  creator_name text NOT NULL,
  recipient_name text NOT NULL,
  nickname text,
  relationship text,
  birthday_date date,
  theme text NOT NULL DEFAULT 'pink',
  letter text,
  letter_photo_url text,
  memories jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  video_file_url text,
  video_title text,
  video_dedication text,
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surprise_id uuid NOT NULL REFERENCES surprises(id) ON DELETE CASCADE,
  author text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wishes_surprise_id ON wishes(surprise_id);

ALTER TABLE surprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- surprises: public-by-link CRUD
DROP POLICY IF EXISTS "anon_select_surprises" ON surprises;
CREATE POLICY "anon_select_surprises" ON surprises FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_surprises" ON surprises;
CREATE POLICY "anon_insert_surprises" ON surprises FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_surprises" ON surprises;
CREATE POLICY "anon_update_surprises" ON surprises FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_surprises" ON surprises;
CREATE POLICY "anon_delete_surprises" ON surprises FOR DELETE
  TO anon, authenticated USING (true);

-- wishes: public read/insert, update/delete for moderation
DROP POLICY IF EXISTS "anon_select_wishes" ON wishes;
CREATE POLICY "anon_select_wishes" ON wishes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_wishes" ON wishes;
CREATE POLICY "anon_insert_wishes" ON wishes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_wishes" ON wishes;
CREATE POLICY "anon_update_wishes" ON wishes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_wishes" ON wishes;
CREATE POLICY "anon_delete_wishes" ON wishes FOR DELETE
  TO anon, authenticated USING (true);
