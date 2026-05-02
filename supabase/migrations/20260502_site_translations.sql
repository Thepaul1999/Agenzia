-- Tabella per sovrascrivere le traduzioni direttamente dal DB (inline edit admin)
CREATE TABLE IF NOT EXISTS site_translations (
  id         BIGSERIAL PRIMARY KEY,
  lang       TEXT NOT NULL CHECK (lang IN ('it', 'en')),
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lang, key)
);

ALTER TABLE site_translations ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica per caricare override nel client
CREATE POLICY "public_read" ON site_translations
  FOR SELECT USING (true);
