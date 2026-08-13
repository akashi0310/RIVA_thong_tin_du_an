-- Drop existing policies if any, then recreate
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
    WHERE tablename IN ('incidents','tasks','nckh_projects','duhoc_students','onluyen_students')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nckh_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE duhoc_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE onluyen_students ENABLE ROW LEVEL SECURITY;

-- Public can read all
CREATE POLICY "public read incidents" ON incidents FOR SELECT USING (true);
CREATE POLICY "public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "public read nckh" ON nckh_projects FOR SELECT USING (true);
CREATE POLICY "public read duhoc" ON duhoc_students FOR SELECT USING (true);
CREATE POLICY "public read onluyen" ON onluyen_students FOR SELECT USING (true);

-- Logged-in managers can do everything
CREATE POLICY "manager all incidents" ON incidents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "manager all tasks" ON tasks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "manager all nckh" ON nckh_projects FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "manager all duhoc" ON duhoc_students FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "manager all onluyen" ON onluyen_students FOR ALL USING (auth.uid() IS NOT NULL);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
