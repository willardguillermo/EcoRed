import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/features/citizen/citizenService"
import {
  getOrgDetails,
  getOrgImpact,
  getClassroomLeaderboard,
  getOrgTopUsers,
  getOrgChallenges,
  getScanCategoryBreakdown,
} from "@/features/institution/institutionService"
import { ReportsClient } from "@/components/institution/ReportsClient"

export const metadata = { title: "Reporte institucional · EcoRed" }

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const profile = await getProfile(supabase, user.id)
  if (!profile?.org_id) redirect("/onboarding")

  const ALLOWED = ["school_admin", "municipal_admin", "platform_admin"]
  if (!ALLOWED.includes(profile.role)) redirect("/dashboard")

  const [org, impact, classrooms, topUsers, challenges, categories] = await Promise.all([
    getOrgDetails(supabase, profile.org_id),
    getOrgImpact(supabase, profile.org_id),
    getClassroomLeaderboard(supabase, profile.org_id),
    getOrgTopUsers(supabase, profile.org_id, 10),
    getOrgChallenges(supabase, profile.org_id),
    getScanCategoryBreakdown(supabase, profile.org_id),
  ])

  if (!org) redirect("/onboarding")

  return (
    <ReportsClient
      org={org}
      impact={impact}
      classrooms={classrooms}
      topUsers={topUsers}
      challenges={challenges}
      categories={categories}
      generatedAt={new Date().toISOString()}
    />
  )
}
