-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  age INT,
  asthma_severity TEXT CHECK (asthma_severity IN ('mild','moderate','severe')),
  known_triggers TEXT[] DEFAULT '{}',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Symptom logs
CREATE TABLE public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity INT NOT NULL CHECK (severity BETWEEN 0 AND 10),
  cough BOOLEAN NOT NULL DEFAULT false,
  wheeze BOOLEAN NOT NULL DEFAULT false,
  breathlessness BOOLEAN NOT NULL DEFAULT false,
  chest_tightness BOOLEAN NOT NULL DEFAULT false,
  suspected_trigger TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX symptom_logs_user_time ON public.symptom_logs (user_id, logged_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.symptom_logs TO authenticated;
GRANT ALL ON public.symptom_logs TO service_role;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "symptom_own" ON public.symptom_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Medication logs
CREATE TABLE public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  medication_type TEXT CHECK (medication_type IN ('rescue_inhaler','controller_inhaler','oral','nebulizer','other')),
  dose TEXT,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX medication_logs_user_time ON public.medication_logs (user_id, taken_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medication_logs TO authenticated;
GRANT ALL ON public.medication_logs TO service_role;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "med_own" ON public.medication_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Peak flow logs
CREATE TABLE public.peakflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value_lpm INT NOT NULL CHECK (value_lpm > 0 AND value_lpm < 1200),
  personal_best INT,
  time_of_day TEXT CHECK (time_of_day IN ('morning','afternoon','evening','night')),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX peakflow_user_time ON public.peakflow_logs (user_id, logged_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.peakflow_logs TO authenticated;
GRANT ALL ON public.peakflow_logs TO service_role;
ALTER TABLE public.peakflow_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_own" ON public.peakflow_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Environment snapshots
CREATE TABLE public.environment_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  aqi INT,
  pm25 DOUBLE PRECISION,
  pm10 DOUBLE PRECISION,
  ozone DOUBLE PRECISION,
  temperature_c DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  pollen DOUBLE PRECISION,
  weather_summary TEXT,
  source TEXT DEFAULT 'open-meteo',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX env_user_time ON public.environment_snapshots (user_id, captured_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.environment_snapshots TO authenticated;
GRANT ALL ON public.environment_snapshots TO service_role;
ALTER TABLE public.environment_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "env_own" ON public.environment_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Risk predictions
CREATE TABLE public.risk_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  category TEXT NOT NULL CHECK (category IN ('low','moderate','high','critical')),
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX risk_user_time ON public.risk_predictions (user_id, computed_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_predictions TO authenticated;
GRANT ALL ON public.risk_predictions TO service_role;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risk_own" ON public.risk_predictions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- VayuPrint
CREATE TABLE public.vayuprint_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vayuprint_profiles TO authenticated;
GRANT ALL ON public.vayuprint_profiles TO service_role;
ALTER TABLE public.vayuprint_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vp_own" ON public.vayuprint_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Air Story
CREATE TABLE public.air_story_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_date DATE NOT NULL DEFAULT CURRENT_DATE,
  narrative TEXT NOT NULL,
  model TEXT DEFAULT 'rule-based',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX air_story_user_date ON public.air_story_logs (user_id, story_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.air_story_logs TO authenticated;
GRANT ALL ON public.air_story_logs TO service_role;
ALTER TABLE public.air_story_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story_own" ON public.air_story_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User settings
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  home_latitude DOUBLE PRECISION,
  home_longitude DOUBLE PRECISION,
  home_label TEXT,
  units TEXT NOT NULL DEFAULT 'metric' CHECK (units IN ('metric','imperial')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_time TIME,
  theme TEXT DEFAULT 'system',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_own" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile + settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();