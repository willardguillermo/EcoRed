import type { SupabaseClient } from "@supabase/supabase-js"
import type { OrgType, UserRole, WasteCategory } from "@/types/database"

export async function createOrganization(
  supabase: SupabaseClient,
  data: {
    name:          string
    type:          OrgType
    district:      string
    region:        string
    contact_email: string
    contact_phone?: string
  }
) {
  const { data: org, error } = await supabase
    .from("organizations")
    .insert(data)
    .select("id, name, type")
    .single()
  if (error) throw error
  return org
}

export async function linkProfileToOrg(
  supabase: SupabaseClient,
  userId: string,
  orgId:  string,
  role:   UserRole
) {
  const { error } = await supabase
    .from("profiles")
    .update({ org_id: orgId, role })
    .eq("id", userId)
  if (error) throw error
}

export async function createClassrooms(
  supabase:   SupabaseClient,
  orgId:      string,
  classrooms: { name: string; grade: string }[]
) {
  const rows = classrooms
    .filter((c) => c.name.trim())
    .map((c) => ({ org_id: orgId, name: c.name.trim(), grade: c.grade.trim() || null }))

  const { data, error } = await supabase
    .from("classrooms")
    .insert(rows)
    .select("id, name, code")
  if (error) throw error
  return data ?? []
}

export async function createRecyclingPoint(
  supabase: SupabaseClient,
  orgId:    string,
  data: {
    name:      string
    address:   string
    materials: WasteCategory[]
    schedule?: string
  }
) {
  const { error } = await supabase
    .from("recycling_points")
    .insert({ org_id: orgId, lat: 0, lng: 0, ...data })
  if (error) throw error
}
