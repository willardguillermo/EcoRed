import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/features/citizen/citizenService"
import { getOrgClassrooms } from "@/features/institution/institutionService"
import { ClassroomsClient } from "@/components/institution/ClassroomsClient"

export default async function ClassroomsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const profile = await getProfile(supabase, user.id)
  if (!profile?.org_id) redirect("/onboarding")

  const ALLOWED = ["school_admin", "platform_admin"]
  if (!ALLOWED.includes(profile.role)) redirect("/dashboard")

  const [classrooms, statsRes] = await Promise.all([
    getOrgClassrooms(supabase, profile.org_id),
    supabase
      .from("classroom_leaderboard")
      .select("classroom_id, total_points, member_count")
      .eq("org_id", profile.org_id),
  ])

  const stats = (statsRes.data ?? []) as {
    classroom_id: string
    total_points: number
    member_count: number
  }[]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <ClassroomsClient
        classrooms={classrooms}
        stats={stats}
        appUrl={appUrl}
      />
    </div>
  )
}
