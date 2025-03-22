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
      accommodation_rooms: {
        Row: {
          building: string | null
          capacity: number
          created_at: string | null
          description: string | null
          floor: string | null
          id: string
          name: string
          occupied: number | null
          type: string | null
        }
        Insert: {
          building?: string | null
          capacity: number
          created_at?: string | null
          description?: string | null
          floor?: string | null
          id?: string
          name: string
          occupied?: number | null
          type?: string | null
        }
        Update: {
          building?: string | null
          capacity?: number
          created_at?: string | null
          description?: string | null
          floor?: string | null
          id?: string
          name?: string
          occupied?: number | null
          type?: string | null
        }
        Relationships: []
      }
      brotherhood_events: {
        Row: {
          capacity: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          id: string
          location: string | null
          title: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: []
      }
      brotherhood_members: {
        Row: {
          bio: string | null
          expertise: string[] | null
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["brotherhood_role"] | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          expertise?: string[] | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["brotherhood_role"] | null
          user_id: string
        }
        Update: {
          bio?: string | null
          expertise?: string[] | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["brotherhood_role"] | null
          user_id?: string
        }
        Relationships: []
      }
      department_budgets: {
        Row: {
          allocated_amount: number
          created_at: string | null
          department_id: string | null
          fiscal_year: number
          id: string
          spent_amount: number | null
          updated_at: string | null
        }
        Insert: {
          allocated_amount: number
          created_at?: string | null
          department_id?: string | null
          fiscal_year: number
          id?: string
          spent_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          created_at?: string | null
          department_id?: string | null
          fiscal_year?: number
          id?: string
          spent_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_budgets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      department_resources: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          name: string
          quantity: number
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          name: string
          quantity: number
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          name?: string
          quantity?: number
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_resources_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["department_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["department_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["department_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string | null
          department_id: string | null
          hire_date: string
          id: string
          position: string
          salary: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          hire_date: string
          id?: string
          position: string
          salary?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          hire_date?: string
          id?: string
          position?: string
          salary?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          event_id: string | null
          id: string
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "brotherhood_events"
            referencedColumns: ["id"]
          },
        ]
      }
      file_imports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          filename: string
          id: string
          records_failed: number | null
          records_processed: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          filename: string
          id?: string
          records_failed?: number | null
          records_processed?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          filename?: string
          id?: string
          records_failed?: number | null
          records_processed?: number | null
          status?: string
        }
        Relationships: []
      }
      program_submissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          budget: number | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          thematic_area: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          thematic_area: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          thematic_area?: string
        }
        Relationships: []
      }
      project_submissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          budget: number | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          program_id: string | null
          start_date: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          program_id?: string | null
          start_date?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          program_id?: string | null
          start_date?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Relationships: []
      }
      room_allocations: {
        Row: {
          created_at: string | null
          date_assigned: string | null
          id: string
          notes: string | null
          person_id: string | null
          room_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_assigned?: string | null
          id?: string
          notes?: string | null
          person_id?: string | null
          room_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_assigned?: string | null
          id?: string
          notes?: string | null
          person_id?: string | null
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_allocations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "women_attendees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "accommodation_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      women_attendees: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          home_church: string | null
          id: string
          import_source: string | null
          imported_at: string | null
          name: string
          phone: string | null
          special_needs: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          home_church?: string | null
          id?: string
          import_source?: string | null
          imported_at?: string | null
          name: string
          phone?: string | null
          special_needs?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          home_church?: string | null
          id?: string
          import_source?: string | null
          imported_at?: string | null
          name?: string
          phone?: string | null
          special_needs?: string | null
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
      brotherhood_role:
        | "member"
        | "mentor"
        | "counselor"
        | "leader"
        | "facilitator"
      department_type:
        | "finance"
        | "human_resources"
        | "operations"
        | "procurement"
        | "programs"
        | "monitoring_evaluation"
        | "communications"
        | "it"
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
