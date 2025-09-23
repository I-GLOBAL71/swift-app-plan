CREATE TABLE social_links (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT UNIQUE NOT NULL,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read social links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Admins can manage social links" ON social_links FOR ALL USING (public.is_admin_user(auth.uid()));

-- Seed initial data
INSERT INTO social_links (name) VALUES ('facebook'), ('instagram'), ('x'), ('tiktok');