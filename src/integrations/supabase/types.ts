export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      air_story_logs: {
        Row: {
          created_at: string
          id: string
          model: string | null
          narrative: string
          story_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model?: string | null
          narrative: string
          story_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string | null
          narrative?: string
          story_date?: string
          user_id?: string
        }
        Relationships: []
      }
      environment_snapshots: {
        Row: {
          aqi: number | null
          captured_at: string
          created_at: string
          humidity: number | null
          id: string
          latitude: number | null
          longitude: number | null
          ozone: number | null
          pm10: number | null
          pm25: number | null
          pollen: number | null
          source: string | null
          temperature_c: number | null
          user_id: string
          weather_summary: string | null
        }
        Insert: {
          aqi?: number | null
          captured_at?: string
          created_at?: string
          humidity?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          ozone?: number | null
          pm10?: number | null
          pm25?: number | null
          pollen?: number | null
          source?: string | null
          temperature_c?: number | null
          user_id: string
          weather_summary?: string | null
        }
        Update: {
          aqi?: number | null
          captured_at?: string
          created_at?: string
          humidity?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          ozone?: number | null
          pm10?: number | null
          pm25?: number | null
          pollen?: number | null
          source?: string | null
          temperature_c?: number | null
          user_id?: string
          weather_summary?: string | null
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          created_at: string
          dose: string | null
          id: string
          medication_name: string
          medication_type: string | null
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dose?: string | null
          id?: string
          medication_name: string
          medication_type?: string | null
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dose?: string | null
          id?: string
          medication_name?: string
          medication_type?: string | null
          taken_at?: string
          user_id?: string
        }
        Relationships: []
      }
      peakflow_logs: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          personal_best: number | null
          time_of_day: string | null
          user_id: string
          value_lpm: number
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          personal_best?: number | null
          time_of_day?: string | null
          user_id: string
          value_lpm: number
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          personal_best?: number | null
          time_of_day?: string | null
          user_id?: string
          value_lpm?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          asthma_severity: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          known_triggers: string[] | null
          onboarded: boolean
          updated_at: string
        }
        Insert: {
          age?: number | null
          asthma_severity?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          known_triggers?: string[] | null
          onboarded?: boolean
          updated_at?: string
        }
        Update: {
          age?: number | null
          asthma_severity?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          known_triggers?: string[] | null
          onboarded?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      risk_predictions: {
        Row: {
          category: string
          computed_at: string
          factors: Json
          id: string
          inputs: Json
          score: number
          user_id: string
        }
        Insert: {
          category: string
          computed_at?: string
          factors?: Json
          id?: string
          inputs?: Json
          score: number
          user_id: string
        }
        Update: {
          category?: string
          computed_at?: string
          factors?: Json
          id?: string
          inputs?: Json
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          breathlessness: boolean
          chest_tightness: boolean
          cough: boolean
          created_at: string
          id: string
          logged_at: string
          notes: string | null
          severity: number
          suspected_trigger: string | null
          user_id: string
          wheeze: boolean
        }
        Insert: {
          breathlessness?: boolean
          chest_tightness?: boolean
          cough?: boolean
          created_at?: string
          id?: string
          logged_at?: string
          notes?: string | null
          severity: number
          suspected_trigger?: string | null
          user_id: string
          wheeze?: boolean
        }
        Update: {
          breathlessness?: boolean
          chest_tightness?: boolean
          cough?: boolean
          created_at?: string
          id?: string
          logged_at?: string
          notes?: string | null
          severity?: number
          suspected_trigger?: string | null
          user_id?: string
          wheeze?: boolean
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          home_label: string | null
          home_latitude: number | null
          home_longitude: number | null
          notifications_enabled: boolean
          reminder_time: string | null
          theme: string | null
          units: string
          updated_at: string
          user_id: string
        }
        Insert: {
          home_label?: string | null
          home_latitude?: number | null
          home_longitude?: number | null
          notifications_enabled?: boolean
          reminder_time?: string | null
          theme?: string | null
          units?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          home_label?: string | null
          home_latitude?: number | null
          home_longitude?: number | null
          notifications_enabled?: boolean
          reminder_time?: string | null
          theme?: string | null
          units?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vayuprint_profiles: {
        Row: {
          computed_at: string
          id: string
          user_id: string
          weights: Json
        }
        Insert: {
          computed_at?: string
          id?: string
          user_id: string
          weights?: Json
        }
        Update: {
          computed_at?: string
          id?: string
          user_id?: string
          weights?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
