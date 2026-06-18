import type { SupabaseClient } from "@supabase/supabase-js"

export async function getOrgDetails(supabase: SupabaseClient, orgId: string) {
  const { data } = await supabase
    .from("organizations")
    .select("id, name, type, district, region, contact_email")
    .eq("id", orgId)
    .single()
  return data
}

export async function getOrgImpact(supabase: SupabaseClient, orgId: string) {
  const { data } = await supabase
    .from("org_impact")
    .select("total_scans, total_co2_kg, total_waste_kg, active_users")
    .eq("org_id", orgId)
    .maybeSingle()
  return data ?? { total_scans: 0, total_co2_kg: 0, total_waste_kg: 0, active_users: 0 }
}

export async function getClassroomLeaderboard(supabase: SupabaseClient, orgId: string) {
  const { data } = await supabase
    .from("classroom_leaderboard")
    .select("classroom_id, classroom_name, total_points, member_count, rank")
    .eq("org_id", orgId)
    .order("rank", { ascending: true })
    .limit(10)
  return data ?? []
}

export async function getOrgTopUsers(supabase: SupabaseClient, orgId: string, limit = 5) {
  const { data } = await supabase
    .from("org_leaderboard")
    .select("user_id, full_name, points, classroom_name, rank")
    .eq("org_id", orgId)
    .order("rank", { ascending: true })
    .limit(limit)
  return data ?? []
}

export async function getOrgClassrooms(supabase: SupabaseClient, orgId: string) {
  const { data } = await supabase
    .from("classrooms")
    .select("id, name, grade, code, created_at")
    .eq("org_id", orgId)
    .order("name", { ascending: true })
  return data ?? []
}

export async function getOrgChallenges(supabase: SupabaseClient, orgId: string) {
  const { data } = await supabase
    .from("challenges")
    .select("id, title, description, points, deadline, active")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(5)
  return data ?? []
}

export async function getRecentScans(supabase: SupabaseClient, orgId: string, limit = 8) {
  const { data } = await supabase
    .from("scans")
    .select("id, waste_name, waste_category, points_earned, created_at, profiles(full_name)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getScanCategoryBreakdown(supabase: SupabaseClient, orgId: string) {
  const { data } = await supabase
    .from("scans")
    .select("waste_category")
    .eq("org_id", orgId)

  if (!data || data.length === 0) return []

  const counts = data.reduce<Record<string, number>>((acc, s) => {
    acc[s.waste_category] = (acc[s.waste_category] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count, pct: Math.round((count / data.length) * 100) }))
    .sort((a, b) => b.count - a.count)
}
