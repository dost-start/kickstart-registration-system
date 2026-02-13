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
          spas_id: string | null
          contact_number: string
          course: string
          created_at: string
          dietary_restrictions: string | null
          email: string | null
          event_uid: string | null
          first_name: string
          has_attended_ga: boolean
          has_dost_sa: boolean
          id: number
          is_checked_in: boolean
          is_minority: boolean | null
          last_name: string
          middle_name: string | null
          preferred_date: Database["public"]["Enums"]["preferred_date"] | null
          scholarship_type: Database["public"]["Enums"]["scholarship_type"]
          seat_assignment: string | null
          status: Database["public"]["Enums"]["status"]
          suffix: string | null
          university: Database["public"]["Enums"]["university"]
          university_custom: string | null
          year_awarded: string | null
          island: Database["public"]["Enums"]["island"] | null
          is_start_member: boolean
          why_join: string | null
        }
        Insert: {
          spas_id?: string | null
          contact_number: string
          course: string
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          event_uid?: string | null
          first_name?: string
          has_attended_ga?: boolean
          has_dost_sa?: boolean
          id?: number
          is_checked_in?: boolean
          is_minority?: boolean | null
          last_name?: string
          middle_name?: string | null
          preferred_date?: Database["public"]["Enums"]["preferred_date"] | null
          scholarship_type: Database["public"]["Enums"]["scholarship_type"]
          seat_assignment?: string | null
          status: Database["public"]["Enums"]["status"]
          suffix?: string | null
          university: Database["public"]["Enums"]["university"]
          university_custom?: string | null
          year_awarded?: string | null
          island?: Database["public"]["Enums"]["island"] | null
          is_start_member?: boolean
          why_join?: string | null
        }
        Update: {
          spas_id?: string | null
          contact_number?: string
          course?: string
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          event_uid?: string | null
          first_name?: string
          has_attended_ga?: boolean
          has_dost_sa?: boolean
          id?: number
          is_checked_in?: boolean
          is_minority?: boolean | null
          last_name?: string
          middle_name?: string | null
          preferred_date?: Database["public"]["Enums"]["preferred_date"] | null
          scholarship_type?: Database["public"]["Enums"]["scholarship_type"]
          seat_assignment?: string | null
          status?: Database["public"]["Enums"]["status"]
          suffix?: string | null
          university?: Database["public"]["Enums"]["university"]
          university_custom?: string | null
          year_awarded?: string | null
          island?: Database["public"]["Enums"]["island"] | null
          is_start_member?: boolean
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
      ,
      allocation_runs: {
        Row: {
          id: number
          day: string
          total_slots: number
          ruleset_version: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: number
          day: string
          total_slots?: number
          ruleset_version?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          day?: string
          total_slots?: number
          ruleset_version?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      ,
      allocation_results: {
        Row: {
          id: number
          run_id: number
          university: string
          is_minority: boolean
          registrant_count: number
          allocated_slots: number
          accepted_count: number
          waitlisted_count: number
        }
        Insert: {
          id?: number
          run_id: number
          university: string
          is_minority: boolean
          registrant_count: number
          allocated_slots: number
          accepted_count: number
          waitlisted_count: number
        }
        Update: {
          id?: number
          run_id?: number
          university?: string
          is_minority?: boolean
          registrant_count?: number
          allocated_slots?: number
          accepted_count?: number
          waitlisted_count?: number
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
      option_keys: "is_event_closed" | "island_luzon_closed" | "island_visayas_closed" | "island_mindanao_closed"
      preferred_date: string
      scholarship_type: "UG RA 7687" | "UG Merit" | "JLSS RA 7687" | "JLSS Merit" | "JLSS RA 10612"
      status: "pending" | "rejected" | "accepted" | "waitlisted"
      university: string
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
      option_keys: ["is_event_closed", "island_luzon_closed", "island_visayas_closed", "island_mindanao_closed"],
      preferred_date: [],
      scholarship_type: ["UG RA 7687", "UG Merit", "JLSS RA 7687", "JLSS Merit", "JLSS RA 10612"],
      status: ["pending", "rejected", "accepted", "waitlisted"],
      university: [],
      island: ["Luzon", "Visayas", "Mindanao"],
    },
  },
} as const
