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
      events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          end_time: string
          id: string
          location: string | null
          name: string
          recurring: string
          start_date: string
          start_time: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          end_time: string
          id?: string
          location?: string | null
          name: string
          recurring?: string
          start_date: string
          start_time: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          end_time?: string
          id?: string
          location?: string | null
          name?: string
          recurring?: string
          start_date?: string
          start_time?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          due_date: string
          id: string
          name: string
          priority: string
          start_date: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          name: string
          priority?: string
          start_date: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          name?: string
          priority?: string
          start_date?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_blocks: {
        Row: {
          created_at: string
          date: string
          duration: number
          end_time: string
          id: string
          start_minute: number
          start_time: string
          task_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration: number
          end_time: string
          id?: string
          start_minute: number
          start_time: string
          task_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: number
          end_time?: string
          id?: string
          start_minute?: number
          start_time?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_blocks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          chunk_size: number | null
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          due_time: string | null
          duration: number | null
          hard_deadline: boolean
          id: string
          name: string
          priority: string
          project_id: string | null
          scheduled_blocks: Json | null
          start_date: string | null
          start_time: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chunk_size?: number | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          due_time?: string | null
          duration?: number | null
          hard_deadline?: boolean
          id?: string
          name: string
          priority?: string
          project_id?: string | null
          scheduled_blocks?: Json | null
          start_date?: string | null
          start_time?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chunk_size?: number | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          duration?: number | null
          hard_deadline?: boolean
          id?: string
          name?: string
          priority?: string
          project_id?: string | null
          scheduled_blocks?: Json | null
          start_date?: string | null
          start_time?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          default_calendar_view: string
          default_chunk_duration: number
          default_task_duration: number
          default_view: string
          id: string
          notification_time: number
          notifications_enabled: boolean
          primary_color: string
          task_scheduling_strategy: string
          theme: string
          updated_at: string
          working_hours_end: string
          working_hours_start: string
        }
        Insert: {
          created_at?: string
          default_calendar_view?: string
          default_chunk_duration?: number
          default_task_duration?: number
          default_view?: string
          id: string
          notification_time?: number
          notifications_enabled?: boolean
          primary_color?: string
          task_scheduling_strategy?: string
          theme?: string
          updated_at?: string
          working_hours_end?: string
          working_hours_start?: string
        }
        Update: {
          created_at?: string
          default_calendar_view?: string
          default_chunk_duration?: number
          default_task_duration?: number
          default_view?: string
          id?: string
          notification_time?: number
          notifications_enabled?: boolean
          primary_color?: string
          task_scheduling_strategy?: string
          theme?: string
          updated_at?: string
          working_hours_end?: string
          working_hours_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_next_available_slot: {
        Args: {
          time_slots: Json
          working_start_minute: number
          working_end_minute: number
          duration_needed: number
        }
        Returns: number
      }
      schedule_task_from_date: {
        Args: {
          task_id_param: string
          duration_param: number
          chunk_size_param: number
          start_date_param: string
          start_time_param: string
          schedule_param: Json
          working_start_minute: number
          working_end_minute: number
        }
        Returns: Json
      }
      schedule_user_tasks: {
        Args: {
          user_id_param: string
        }
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
