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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          ai_evaluation: string | null
          created_at: string | null
          cv_file_path: string | null
          email: string
          faculty: string
          full_name: string
          id: string
          instagram: string | null
          interests_skills: string | null
          line_id: string | null
          major: string
          match_percentage: number | null
          motivation: string
          nickname: string
          phone: string
          portfolio_url: string | null
          position_id: string | null
          status: string | null
          tracking_token: string | null
          university: string | null
          university_year: number
          updated_at: string | null
        }
        Insert: {
          ai_evaluation?: string | null
          created_at?: string | null
          cv_file_path?: string | null
          email: string
          faculty: string
          full_name: string
          id?: string
          instagram?: string | null
          interests_skills?: string | null
          line_id?: string | null
          major: string
          match_percentage?: number | null
          motivation: string
          nickname: string
          phone: string
          portfolio_url?: string | null
          position_id?: string | null
          status?: string | null
          tracking_token?: string | null
          university?: string | null
          university_year: number
          updated_at?: string | null
        }
        Update: {
          ai_evaluation?: string | null
          created_at?: string | null
          cv_file_path?: string | null
          email?: string
          faculty?: string
          full_name?: string
          id?: string
          instagram?: string | null
          interests_skills?: string | null
          line_id?: string | null
          major?: string
          match_percentage?: number | null
          motivation?: string
          nickname?: string
          phone?: string
          portfolio_url?: string | null
          position_id?: string | null
          status?: string | null
          tracking_token?: string | null
          university?: string | null
          university_year?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          queue_id: string | null
          recipient_email: string
          retry_attempt: number
          sent_at: string
          status: string
          subject: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          queue_id?: string | null
          recipient_email: string
          retry_attempt?: number
          sent_at?: string
          status: string
          subject: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          queue_id?: string | null
          recipient_email?: string
          retry_attempt?: number
          sent_at?: string
          status?: string
          subject?: string
          template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "email_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_retries: number
          recipient_email: string
          retry_count: number
          scheduled_at: string
          status: string
          template_name: string
          updated_at: string
          variables: Json
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retries?: number
          recipient_email: string
          retry_count?: number
          scheduled_at?: string
          status?: string
          template_name: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retries?: number
          recipient_email?: string
          retry_count?: number
          scheduled_at?: string
          status?: string
          template_name?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          description: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          requirements: string
          responsibilities: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          requirements: string
          responsibilities: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          requirements?: string
          responsibilities?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string
          tags: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          tags?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          tags?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          application_id: string | null
          created_at: string
          department: string
          description: string | null
          division: string | null
          email: string | null
          end_date: string | null
          full_name: string
          id: string
          is_active: boolean | null
          nickname: string | null
          phone: string | null
          photo_url: string | null
          position: string
          start_date: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          department: string
          description?: string | null
          division?: string | null
          email?: string | null
          end_date?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          nickname?: string | null
          phone?: string | null
          photo_url?: string | null
          position: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          department?: string
          description?: string | null
          division?: string | null
          email?: string | null
          end_date?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          nickname?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          role_title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          role_title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          role_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      retry_failed_emails: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "vice_president" | "admin"
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
  public: {
    Enums: {
      app_role: ["super_admin", "vice_president", "admin"],
    },
  },
} as const
