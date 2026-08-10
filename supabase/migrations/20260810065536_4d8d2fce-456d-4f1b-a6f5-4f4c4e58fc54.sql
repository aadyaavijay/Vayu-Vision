DROP POLICY IF EXISTS story_own ON public.air_story_logs;
CREATE POLICY story_own ON public.air_story_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS env_own ON public.environment_snapshots;
CREATE POLICY env_own ON public.environment_snapshots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS med_own ON public.medication_logs;
CREATE POLICY med_own ON public.medication_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS pf_own ON public.peakflow_logs;
CREATE POLICY pf_own ON public.peakflow_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_own ON public.profiles;
CREATE POLICY profiles_own ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS risk_own ON public.risk_predictions;
CREATE POLICY risk_own ON public.risk_predictions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS symptom_own ON public.symptom_logs;
CREATE POLICY symptom_own ON public.symptom_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS settings_own ON public.user_settings;
CREATE POLICY settings_own ON public.user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS vp_own ON public.vayuprint_profiles;
CREATE POLICY vp_own ON public.vayuprint_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.air_story_logs, public.environment_snapshots, public.medication_logs, public.peakflow_logs, public.profiles, public.risk_predictions, public.symptom_logs, public.user_settings, public.vayuprint_profiles FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.air_story_logs, public.environment_snapshots, public.medication_logs, public.peakflow_logs, public.profiles, public.risk_predictions, public.symptom_logs, public.user_settings, public.vayuprint_profiles TO authenticated;
GRANT ALL ON public.air_story_logs, public.environment_snapshots, public.medication_logs, public.peakflow_logs, public.profiles, public.risk_predictions, public.symptom_logs, public.user_settings, public.vayuprint_profiles TO service_role;