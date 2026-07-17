import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/features/citizen/citizenService"
import { ProfileSettingsClient } from "@/components/profile/ProfileSettingsClient"

type OrgSummary = {
  name: string
}

type ClassroomSummary = {
  name:  string
  grade: string | null
}

async function getOrgName(orgId: string | null) {
  if (!orgId) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .maybeSingle()

  return (data as OrgSummary | null)?.name ?? null
}

async function getClassroomLabel(classroomId: string | null) {
  if (!classroomId) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from("classrooms")
    .select("name, grade")
    .eq("id", classroomId)
    .maybeSingle()

  const classroom = data as ClassroomSummary | null
  if (!classroom) return null

  return [classroom.name, classroom.grade].filter(Boolean).join(" · ")
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const profile = await getProfile(user.id)
  if (!profile) redirect("/auth/login")

  const [orgName, classroom] = await Promise.all([
    getOrgName(profile.org_id),
    getClassroomLabel(profile.classroom_id),
  ])

  return (
    <ProfileSettingsClient
      email={user.email ?? ""}
      profile={{
        id:           profile.id,
        full_name:    profile.full_name,
        avatar_url:   profile.avatar_url,
        role:         profile.role,
        points:       profile.points,
        org_name:     orgName,
        classroom,
      }}
    />
  )
}
