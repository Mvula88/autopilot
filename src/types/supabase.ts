export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string
          email: string
          full_name: string
          school_name: string | null
          subject_area: string | null
          grade_level: string | null
          digest_day: string
          digest_time: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          school_name?: string | null
          subject_area?: string | null
          grade_level?: string | null
          digest_day?: string
          digest_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          school_name?: string | null
          subject_area?: string | null
          grade_level?: string | null
          digest_day?: string
          digest_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          teacher_id: string
          name: string
          grade_level: string | null
          subject: string | null
          school_year: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          grade_level?: string | null
          subject?: string | null
          school_year?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          grade_level?: string | null
          subject?: string | null
          school_year?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          class_id: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          student_id: string | null
          attendance_rate: number | null
          current_grades: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          student_id?: string | null
          attendance_rate?: number | null
          current_grades?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          student_id?: string | null
          attendance_rate?: number | null
          current_grades?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      parents: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          preferred_language: string
          communication_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          preferred_language?: string
          communication_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          preferred_language?: string
          communication_preference?: string
          created_at?: string
          updated_at?: string
        }
      }
      student_parents: {
        Row: {
          id: string
          student_id: string
          parent_id: string
          relationship: string | null
          is_primary: boolean
          receive_updates: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          parent_id: string
          relationship?: string | null
          is_primary?: boolean
          receive_updates?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          parent_id?: string
          relationship?: string | null
          is_primary?: boolean
          receive_updates?: boolean
          created_at?: string
        }
      }
      quick_notes: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          type: 'positive' | 'concern' | 'info'
          category: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          type: 'positive' | 'concern' | 'info'
          category: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          type?: 'positive' | 'concern' | 'info'
          category?: string
          content?: string
          created_at?: string
        }
      }
      communications: {
        Row: {
          id: string
          teacher_id: string
          parent_id: string
          student_id: string
          type: string
          subject: string | null
          content: string
          status: string
          sent_at: string | null
          opened_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          parent_id: string
          student_id: string
          type: string
          subject?: string | null
          content: string
          status?: string
          sent_at?: string | null
          opened_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          parent_id?: string
          student_id?: string
          type?: string
          subject?: string | null
          content?: string
          status?: string
          sent_at?: string | null
          opened_at?: string | null
          created_at?: string
        }
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
  }
}