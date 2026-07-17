import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/features/citizen/citizenService"
import { getCommunityFeed, type CommunityAuthor } from "@/features/community/communityService"

import { CommunityFeedClient } from "@/components/community/CommunityFeedClient"

const ROLE_LABELS: Record<CommunityAuthor["role"], string> = {
  citizen:         "Ciudadano",
  student:         "Estudiante",
  teacher:         "Docente",
  school_admin:    "Institución educativa",
  municipal_admin: "Municipio",
  platform_admin:  "EcoRed",
}

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [profile, feed] = await Promise.all([
    getProfile(user.id),
    getCommunityFeed(user.id),
  ])

  if (!profile) redirect("/auth/login")

  return (
    <CommunityFeedClient
      initialPosts={feed.posts}
      initialMode={feed.mode}
      currentUser={{
        id:         profile.id,
        name:       profile.full_name ?? "Usuario EcoRed",
        avatar_url: profile.avatar_url,
        role:       profile.role,
        label:      ROLE_LABELS[profile.role],
      }}
    />
  )
}
