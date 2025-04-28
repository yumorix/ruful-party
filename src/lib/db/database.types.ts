export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      matches: {
        Row: {
          created_at: string
          id: string
          match_type: string
          participant1_id: string
          participant2_id: string
          party_id: string
          seat_positions: Json | null
          table_number: number | null
        }
        Insert: {
          created_at?: string
          id: string
          match_type: string
          participant1_id: string
          participant2_id: string
          party_id: string
          seat_positions?: Json | null
          table_number?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          match_type?: string
          participant1_id?: string
          participant2_id?: string
          party_id?: string
          seat_positions?: Json | null
          table_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_participant1_id_fkey"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_participant2_id_fkey"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          access_token: string
          created_at: string
          gender: string
          id: string
          name: string
          participant_number: number
          party_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          gender: string
          id: string
          name: string
          participant_number: number
          party_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          gender?: string
          id?: string
          name?: string
          participant_number?: number
          party_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          capacity: number
          created_at: string
          current_mode: string
          date: string
          id: string
          location: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          current_mode: string
          date: string
          id: string
          location: string
          name: string
          status: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          current_mode?: string
          date?: string
          id?: string
          location?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      party_settings: {
        Row: {
          gender_rules: Json
          id: string
          matching_rule: Json
          party_id: string
          seating_layout: Json
          updated_at: string
        }
        Insert: {
          gender_rules: Json
          id: string
          matching_rule: Json
          party_id: string
          seating_layout: Json
          updated_at?: string
        }
        Update: {
          gender_rules?: Json
          id?: string
          matching_rule?: Json
          party_id?: string
          seating_layout?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_settings_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      seating_plans: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          layout_data: Json
          party_id: string
          plan_type: string
        }
        Insert: {
          created_at?: string
          id: string
          image_url?: string | null
          layout_data: Json
          party_id: string
          plan_type: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          layout_data?: Json
          party_id?: string
          plan_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "seating_plans_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          party_id: string
          rank: number
          vote_type: string
          voted_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id: string
          party_id: string
          rank: number
          vote_type: string
          voted_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          party_id?: string
          rank?: number
          vote_type?: string
          voted_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voted_id_fkey"
            columns: ["voted_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

