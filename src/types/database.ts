export type OrgType = "school" | "municipality"
export type UserRole = "citizen" | "student" | "teacher" | "school_admin" | "municipal_admin" | "platform_admin"
export type WasteCategory = "plastic" | "paper" | "glass" | "metal" | "organic" | "electronic" | "hazardous" | "other"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          org_id: string | null
          classroom_id: string | null
          points: number
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "points"> & { points?: number }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
      }
      organizations: {
        Row: {
          id: string
          name: string
          type: OrgType
          district: string
          region: string
          contact_email: string
          contact_phone: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>
      }
      classrooms: {
        Row: {
          id: string
          org_id: string
          name: string
          grade: string | null
          teacher_id: string | null
          code: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["classrooms"]["Row"], "id" | "created_at" | "code">
        Update: Partial<Database["public"]["Tables"]["classrooms"]["Insert"]>
      }
      scans: {
        Row: {
          id: string
          user_id: string
          org_id: string | null
          image_url: string | null
          waste_category: WasteCategory
          waste_name: string
          material: string
          recyclable: boolean
          instructions: string
          points_earned: number
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["scans"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["scans"]["Insert"]>
      }
      impact_logs: {
        Row: {
          id: string
          user_id: string
          org_id: string | null
          co2_saved_kg: number
          waste_kg: number
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["impact_logs"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["impact_logs"]["Insert"]>
      }
      recycling_points: {
        Row: {
          id: string
          org_id: string
          name: string
          address: string
          lat: number
          lng: number
          materials: WasteCategory[]
          schedule: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["recycling_points"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["recycling_points"]["Insert"]>
      }
      challenges: {
        Row: {
          id: string
          org_id: string
          title: string
          description: string
          points: number
          deadline: string
          active: boolean
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["challenges"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["challenges"]["Insert"]>
      }
    }
  }
}
