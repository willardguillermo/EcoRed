import type { SupabaseClient } from "@supabase/supabase-js"

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, org_id, classroom_id, points")
    .eq("id", userId)
    .single()
  return data
}

export async function getImpactTotals(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("impact_logs")
    .select("co2_saved_kg, waste_kg")
    .eq("user_id", userId)

  if (!data || data.length === 0) return { co2_saved_kg: 0, waste_kg: 0 }

  return {
    co2_saved_kg: data.reduce((sum, l) => sum + Number(l.co2_saved_kg), 0),
    waste_kg:     data.reduce((sum, l) => sum + Number(l.waste_kg), 0),
  }
}

export async function getRecentScans(supabase: SupabaseClient, userId: string, limit = 5) {
  const { data } = await supabase
    .from("scans")
    .select("id, waste_name, waste_category, recyclable, points_earned, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getActiveChallenge(supabase: SupabaseClient, orgId: string) {
  const { data } = await supabase
    .from("challenges")
    .select("id, title, description, points, deadline")
    .eq("org_id", orgId)
    .eq("active", true)
    .gt("deadline", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}
