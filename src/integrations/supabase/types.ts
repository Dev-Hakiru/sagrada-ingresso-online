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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      games: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          hora: string
          id: string
          imagem_url: string | null
          nome_jogo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          descricao?: string | null
          hora: string
          id?: string
          imagem_url?: string | null
          nome_jogo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          hora?: string
          id?: string
          imagem_url?: string | null
          nome_jogo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seat_images: {
        Row: {
          codigo_bilhete: string
          created_at: string
          id: string
          imagem_url: string
        }
        Insert: {
          codigo_bilhete: string
          created_at?: string
          id?: string
          imagem_url: string
        }
        Update: {
          codigo_bilhete?: string
          created_at?: string
          id?: string
          imagem_url?: string
        }
        Relationships: []
      }
      seats: {
        Row: {
          codigo_assento: string | null
          created_at: string
          game_id: string
          id: string
          imagem_url: string | null
          number: number
          reserved_by: string | null
          reserved_until: string | null
          row: string
          section: string
          setor_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          codigo_assento?: string | null
          created_at?: string
          game_id: string
          id?: string
          imagem_url?: string | null
          number: number
          reserved_by?: string | null
          reserved_until?: string | null
          row: string
          section: string
          setor_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          codigo_assento?: string | null
          created_at?: string
          game_id?: string
          id?: string
          imagem_url?: string | null
          number?: number
          reserved_by?: string | null
          reserved_until?: string | null
          row?: string
          section?: string
          setor_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          capacidade: number
          created_at: string
          id: string
          nome_setor: string
          preco: number
          status: string
          updated_at: string
        }
        Insert: {
          capacidade: number
          created_at?: string
          id?: string
          nome_setor: string
          preco: number
          status?: string
          updated_at?: string
        }
        Update: {
          capacidade?: number
          created_at?: string
          id?: string
          nome_setor?: string
          preco?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          codigo_qr: string | null
          created_at: string
          data_compra: string | null
          date: string
          game_id: string
          game_title: string
          id: string
          seat_id: string | null
          seats: Json
          stadium: string
          status_pagamento: string | null
          time: string
          user_id: string
        }
        Insert: {
          codigo_qr?: string | null
          created_at?: string
          data_compra?: string | null
          date: string
          game_id: string
          game_title: string
          id?: string
          seat_id?: string | null
          seats: Json
          stadium: string
          status_pagamento?: string | null
          time: string
          user_id: string
        }
        Update: {
          codigo_qr?: string | null
          created_at?: string
          data_compra?: string | null
          date?: string
          game_id?: string
          game_title?: string
          id?: string
          seat_id?: string | null
          seats?: Json
          stadium?: string
          status_pagamento?: string | null
          time?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      initialize_seats_for_game: {
        Args:
          | Record<PropertyKey, never>
          | {
              game_id_param: string
              sections: string[]
              rows_param: string[]
              seats_per_row: number
            }
          | {
              game_id_param: string
              vip_rows: string[]
              normal_left_rows: string[]
              normal_right_rows: string[]
              vip_seats_per_row: number
              normal_seats_per_row: number
            }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
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
