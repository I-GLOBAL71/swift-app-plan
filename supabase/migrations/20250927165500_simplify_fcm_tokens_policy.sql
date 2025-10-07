DROP POLICY IF EXISTS "Allow public read access" ON fcm_tokens;
DROP POLICY IF EXISTS "Allow individual insert" ON fcm_tokens;
DROP POLICY IF EXISTS "Allow individual update" ON fcm_tokens;

CREATE POLICY "Allow all access" ON fcm_tokens FOR ALL
USING (true)
WITH CHECK (true);