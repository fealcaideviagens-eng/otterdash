export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      client: {
        Row: {
          criado_em: string
          email: string | null
          id: string
          nome: string | null
          senha: string | null
        }
        Insert: {
          criado_em?: string
          email?: string | null
          id?: string
          nome?: string | null
          senha?: string | null
        }
        Update: {
          criado_em?: string
          email?: string | null
          id?: string
          nome?: string | null
          senha?: string | null
        }
        Relationships: []
      }
      goal: {
        Row: {
          created_at: string
          goal_ano: number | null
          goal_id: string
          goal_tipo: string | null
          goal_valor: number | null
          id: string | null
        }
        Insert: {
          created_at?: string
          goal_ano?: number | null
          goal_id?: string
          goal_tipo?: string | null
          goal_valor?: number | null
          id?: string | null
        }
        Update: {
          created_at?: string
          goal_ano?: number | null
          goal_id?: string
          goal_tipo?: string | null
          goal_valor?: number | null
          id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_completed: {
        Row: {
          completed_criado_em: string
          completed_data: string | null
          completed_id: string
          completed_premio: number | null
          completed_quanti: number | null
          ops_id: string | null
        }
        Insert: {
          completed_criado_em?: string
          completed_data?: string | null
          completed_id?: string
          completed_premio?: number | null
          completed_quanti?: number | null
          ops_id?: string | null
        }
        Update: {
          completed_criado_em?: string
          completed_data?: string | null
          completed_id?: string
          completed_premio?: number | null
          completed_quanti?: number | null
          ops_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ops_completed_ops_id_fkey"
            columns: ["ops_id"]
            isOneToOne: false
            referencedRelation: "ops_registry"
            referencedColumns: ["ops_id"]
          },
        ]
      }
      ops_registry: {
        Row: {
          acao_cotacao: number | null
          id: string
          ops_acao: string | null
          ops_criado_em: string | null
          ops_id: string
          ops_operacao: string | null
          ops_premio: number | null
          ops_quanti: number | null
          ops_strike: number | null
          ops_ticker: string | null
          ops_tipo: string | null
          ops_vencimento: string | null
        }
        Insert: {
          acao_cotacao?: number | null
          id?: string
          ops_acao?: string | null
          ops_criado_em?: string | null
          ops_id?: string
          ops_operacao?: string | null
          ops_premio?: number | null
          ops_quanti?: number | null
          ops_strike?: number | null
          ops_ticker?: string | null
          ops_tipo?: string | null
          ops_vencimento?: string | null
        }
        Update: {
          acao_cotacao?: number | null
          id?: string
          ops_acao?: string | null
          ops_criado_em?: string | null
          ops_id?: string
          ops_operacao?: string | null
          ops_premio?: number | null
          ops_quanti?: number | null
          ops_strike?: number | null
          ops_ticker?: string | null
          ops_tipo?: string | null
          ops_vencimento?: string | null
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
    Enums: {},
  },
} as const
