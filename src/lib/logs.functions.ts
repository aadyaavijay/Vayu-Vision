import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Server functions for user-generated logs (symptoms, meds, peak flow). */

const symptomSchema = z.object({
  severity: z.number().int().min(0).max(10),
  cough: z.boolean().default(false),
  wheeze: z.boolean().default(false),
  breathlessness: z.boolean().default(false),
  chest_tightness: z.boolean().default(false),
  suspected_trigger: z.string().max(80).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const logSymptom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => symptomSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("symptom_logs")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const medSchema = z.object({
  medication_name: z.string().trim().min(1).max(80),
  medication_type: z.enum(["rescue_inhaler", "controller_inhaler", "oral", "nebulizer", "other"]).optional(),
  dose: z.string().max(40).optional().nullable(),
});

export const logMedication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => medSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("medication_logs")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const pfSchema = z.object({
  value_lpm: z.number().int().min(1).max(1199),
  personal_best: z.number().int().min(1).max(1199).optional().nullable(),
  time_of_day: z.enum(["morning", "afternoon", "evening", "night"]).optional(),
});

export const logPeakFlow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pfSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("peakflow_logs")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listSymptoms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("symptom_logs")
      .select("*")
      .eq("user_id", context.userId)
      .order("logged_at", { ascending: false })
      .limit(100);
    // A read failure must not be reported as "no records".
    if (error) throw new Error(`DB_READ_FAILED: symptom_logs — ${error.message}`);
    return data ?? [];
  });

export const listMedications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("medication_logs")
      .select("*")
      .eq("user_id", context.userId)
      .order("taken_at", { ascending: false })
      .limit(100);
    // A read failure must not be reported as "no records".
    if (error) throw new Error(`DB_READ_FAILED: medication_logs — ${error.message}`);
    return data ?? [];
  });

export const listPeakFlow = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("peakflow_logs")
      .select("*")
      .eq("user_id", context.userId)
      .order("logged_at", { ascending: false })
      .limit(100);
    // A read failure must not be reported as "no records".
    if (error) throw new Error(`DB_READ_FAILED: peakflow_logs — ${error.message}`);
    return data ?? [];
  });

const settingsSchema = z.object({
  home_latitude: z.number().min(-90).max(90).nullable().optional(),
  home_longitude: z.number().min(-180).max(180).nullable().optional(),
  home_label: z.string().max(120).nullable().optional(),
  units: z.enum(["metric", "imperial"]).optional(),
  notifications_enabled: z.boolean().optional(),
});

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => settingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_settings")
      .upsert({ user_id: context.userId, ...data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(80).optional(),
  age: z.number().int().min(0).max(120).nullable().optional(),
  asthma_severity: z.enum(["mild", "moderate", "severe"]).nullable().optional(),
  known_triggers: z.array(z.string().max(40)).max(20).optional(),
  onboarded: z.boolean().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => profileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
