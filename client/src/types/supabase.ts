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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      kickstart_form_entries: {
        Row: {
          contact_number: string
          course: string
          created_at: string
          email: string | null
          first_name: string
          id: number
          is_checked_in: boolean
          has_attended_ga: boolean
          has_dost_sa: boolean
          is_minority: boolean | null
          last_name: string
          middle_name: string | null
          dietary_restrictions: string | null
          preferred_date: Database["public"]["Enums"]["preferred_date"] | null
          scholarship_type: Database["public"]["Enums"]["scholarship_type"]
          seat_assignment: string | null
          status: Database["public"]["Enums"]["status"]
          suffix: string | null
          university: Database["public"]["Enums"]["university"]
          university_custom: string | null
          year_awarded: string | null
          event_uid: string | null
          island: Database["public"]["Enums"]["island"] | null
          is_start_member: boolean
          why_join: string | null
        }
        Insert: {
          contact_number: string
          course: string
          created_at?: string
          first_name?: string
          id?: number
          is_checked_in?: boolean
          has_attended_ga?: boolean
          has_dost_sa?: boolean
          is_minority?: boolean | null
          last_name?: string
          middle_name?: string | null
          email?: string | null
          dietary_restrictions?: string | null
          preferred_date?: Database["public"]["Enums"]["preferred_date"] | null
          scholarship_type: Database["public"]["Enums"]["scholarship_type"]
          seat_assignment?: string | null
          status: Database["public"]["Enums"]["status"]
          suffix?: string | null
          university: Database["public"]["Enums"]["university"]
          university_custom?: string | null
          year_awarded?: string | null
          event_uid?: string | null
          island?: Database["public"]["Enums"]["island"] | null
          is_start_member?: boolean
          why_join?: string | null
        }
        Update: {
          contact_number?: string
          course?: string
          created_at?: string
          email?: string | null
          event_uid?: string | null
          first_name?: string
          has_attended_ga?: boolean
          has_dost_sa?: boolean
          id?: number
          is_checked_in?: boolean
          is_minority?: boolean | null
          is_start_member?: boolean
          last_name?: string
          middle_name?: string | null
          dietary_restrictions?: string | null
          preferred_date?: Database["public"]["Enums"]["preferred_date"] | null
          scholarship_type?: Database["public"]["Enums"]["scholarship_type"]
          seat_assignment?: string | null
          status?: Database["public"]["Enums"]["status"]
          suffix?: string | null
          university?: Database["public"]["Enums"]["university"]
          university_custom?: string | null
          year_awarded?: string | null
          island?: Database["public"]["Enums"]["island"] | null
          why_join?: string | null
        }
        Relationships: []
      }
      options: {
        Row: {
          created_at: string
          id: Database["public"]["Enums"]["option_keys"]
          value: boolean | null
        }
        Insert: {
          created_at?: string
          id: Database["public"]["Enums"]["option_keys"]
          value?: boolean | null
        }
        Update: {
          created_at?: string
          id?: Database["public"]["Enums"]["option_keys"]
          value?: boolean | null
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
      option_keys:
        | "is_event_closed"
        | "island_luzon_closed"
        | "island_visayas_closed"
        | "island_mindanao_closed"
      university:
        | "Adamson University"
        | "Ateneo de Manila University"
        | "Centro Escolar University"
        | "De La Salle University – Manila"
        | "Eulogio Rodriguez Institute of Science and Technology"
        | "Far Eastern University – Manila"
        | "Far Eastern University – Tech"
        | "Far Eastern University – NRMF"
        | "Mapúa University (Manila/Makati)"
        | "National University – Manila"
        | "New Era University"
        | "Our Lady of Fatima University – Quezon City"
        | "Our Lady of Fatima University – Valenzuela"
        | "Philippine Normal University"
        | "National Aviation Academy of the Philippines"
        | "Polytechnic University of the Philippines – Manila"
        | "Polytechnic University of the Philippines – Taguig"
        | "Polytechnic University of the Philippines – Quezon City"
        | "Pamantasan ng Lungsod ng Maynila"
        | "Rizal Technological University – Mandaluyong"
        | "Rizal Technological University – Pasig"
        | "Technological Institute of the Philippines – Manila"
        | "Technological Institute of the Philippines – Quezon City"
        | "Technological University of the Philippines – Manila"
        | "Technological University of the Philippines – Taguig"
        | "Trinity University of Asia"
        | "Marikina Polytechnic College"
        | "Assumption College San Lorenzo"
        | "PATTS College of Aeronautics"
        | "Manila Central University (MCU)"
        | "University of Santo Tomas"
        | "University of the East – Manila"
        | "University of the Philippines – Diliman"
        | "University of the Philippines – Manila"
        | "Other"
      scholarship_type:
        | "UG RA 7687"
        | "UG Merit"
        | "JLSS RA 7687"
        | "JLSS Merit"
        | "JLSS RA 10612"
      status: "pending" | "rejected" | "accepted" | "waitlisted"
      preferred_date: "December 13" | "December 14"
      island: "Luzon" | "Visayas" | "Mindanao"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      option_keys: ["is_event_closed"],
      philippine_region: [
        "Region I",
        "Region II",
        "Region III",
        "Region IV-A",
        "Region IV-B",
        "Region V",
        "Region VI",
        "Region VII",
        "Region VIII",
        "Region IX",
        "Region X",
        "Region XI",
        "Region XII",
        "Region XIII",
        "NCR",
        "CAR",
        "BARMM",
        "NIR",
      ],
      scholarship_type: ["Merit", "RA 7687", "RA 10612", "JLSS Merit", "JLSS 10612"],
      status: ["pending", "rejected", "accepted"],
    },
  },
} as const
