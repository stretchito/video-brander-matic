export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      processing_jobs: {
        Row: {
          attempt_count: number | null
          captions_enabled: boolean | null
          completed_at: string | null
          completed_steps: number | null
          created_at: string
          error_message: string | null
          greyscale: boolean
          id: string
          last_error: string | null
          logo_path: string
          output_format: string
          output_path: string | null
          position: string
          processing_steps: Json | null
          started_at: string | null
          status: string
          total_steps: number | null
          transcription_enabled: boolean | null
          transcription_summary: string | null
          transcription_url: string | null
          updated_at: string
          user_id: string
          video_path: string
        }
        Insert: {
          attempt_count?: number | null
          captions_enabled?: boolean | null
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string
          error_message?: string | null
          greyscale?: boolean
          id?: string
          last_error?: string | null
          logo_path: string
          output_format: string
          output_path?: string | null
          position: string
          processing_steps?: Json | null
          started_at?: string | null
          status?: string
          total_steps?: number | null
          transcription_enabled?: boolean | null
          transcription_summary?: string | null
          transcription_url?: string | null
          updated_at?: string
          user_id: string
          video_path: string
        }
        Update: {
          attempt_count?: number | null
          captions_enabled?: boolean | null
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string
          error_message?: string | null
          greyscale?: boolean
          id?: string
          last_error?: string | null
          logo_path?: string
          output_format?: string
          output_path?: string | null
          position?: string
          processing_steps?: Json | null
          started_at?: string | null
          status?: string
          total_steps?: number | null
          transcription_enabled?: boolean | null
          transcription_summary?: string | null
          transcription_url?: string | null
          updated_at?: string
          user_id?: string
          video_path?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          discord_handle: string | null
          email: string | null
          facebook_handle: string | null
          first_name: string | null
          id: string
          instagram_handle: string | null
          last_name: string | null
          twitch_handle: string | null
          twitter_handle: string | null
          updated_at: string
          username: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          discord_handle?: string | null
          email?: string | null
          facebook_handle?: string | null
          first_name?: string | null
          id: string
          instagram_handle?: string | null
          last_name?: string | null
          twitch_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          username: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          discord_handle?: string | null
          email?: string | null
          facebook_handle?: string | null
          first_name?: string | null
          id?: string
          instagram_handle?: string | null
          last_name?: string | null
          twitch_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          username?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_stalled_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
