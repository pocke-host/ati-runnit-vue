-- V30: Add caption and song fields to moments table
-- Run in PlanetScale console: https://app.planetscale.com
-- Branch: main (or create a deploy request from a dev branch)

ALTER TABLE moments
  ADD COLUMN caption             VARCHAR(500)  NULL,
  ADD COLUMN song_title          VARCHAR(255)  NULL,
  ADD COLUMN song_artist         VARCHAR(255)  NULL,
  ADD COLUMN song_link           VARCHAR(512)  NULL,
  ADD COLUMN route_snapshot_url  VARCHAR(1024) NULL;

-- Verify
-- SELECT column_name, data_type, character_maximum_length, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'moments'
-- ORDER BY ordinal_position;
