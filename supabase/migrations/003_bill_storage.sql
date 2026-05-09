-- ============================================================
-- Storage da conta de luz (PDF) para o admin
-- ============================================================
--
-- Cria um bucket privado para hospedar os PDFs de conta de luz
-- enviados pelo cliente durante o onboarding. Acesso é via
-- service-role (admin) ou via signed URL temporária — clientes
-- podem ler e gravar somente sua própria pasta `${auth.uid()}/...`.

-- ── BUCKET ───────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-files', 'onboarding-files', false)
ON CONFLICT (id) DO NOTHING;


-- ── POLICIES ─────────────────────────────────────────────────
-- Clientes só conseguem mexer na própria subpasta. Admin opera
-- via service-role e bypassa as RLS de storage.objects.

DROP POLICY IF EXISTS "Onboarding own folder upload" ON storage.objects;
CREATE POLICY "Onboarding own folder upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'onboarding-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Onboarding own folder read" ON storage.objects;
CREATE POLICY "Onboarding own folder read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'onboarding-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Onboarding own folder delete" ON storage.objects;
CREATE POLICY "Onboarding own folder delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'onboarding-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
