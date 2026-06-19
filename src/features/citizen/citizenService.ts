import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { UserRole, WasteCategory } from "@/types/database"

export type ProfileData = {
  id:           string
  full_name:    string | null
  avatar_url:   string | null
  role:         UserRole
  org_id:       string | null
  classroom_id: string | null
  points:       number
}

type ImpactRow = { co2_saved_kg: number; waste_kg: number }

type ScanRow = {
  id:             string
  waste_name:     string
  waste_category: WasteCategory
  recyclable:     boolean
  points_earned:  number
  created_at:     string
}

type ChallengeRow = {
  id:          string
  title:       string
  description: string
  points:      number
  deadline:    string
}

// React.cache() deduplicates per-request: called in AppLayout AND each page,
// only hits the DB once per request.
export const getProfile = cache(async (userId: string): Promise<ProfileData | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, org_id, classroom_id, points")
    .eq("id", userId)
    .single()
  return data as unknown as ProfileData | null
})

export async function getImpactTotals(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("impact_logs")
    .select("co2_saved_kg, waste_kg")
    .eq("user_id", userId)

  if (!data?.length) return { co2_saved_kg: 0, waste_kg: 0 }

  const rows = data as unknown as ImpactRow[]
  return {
    co2_saved_kg: rows.reduce((s, l) => s + Number(l.co2_saved_kg), 0),
    waste_kg:     rows.reduce((s, l) => s + Number(l.waste_kg),     0),
  }
}

export async function getRecentScans(userId: string, limit = 5) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("scans")
    .select("id, waste_name, waste_category, recyclable, points_earned, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as unknown as ScanRow[]
}

export async function getActiveChallenge(orgId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("challenges")
    .select("id, title, description, points, deadline")
    .eq("org_id", orgId)
    .eq("active", true)
    .gt("deadline", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as unknown as ChallengeRow | null
}
