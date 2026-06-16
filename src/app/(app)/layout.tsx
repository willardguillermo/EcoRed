import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/features/citizen/citizenService"
import { AppShell } from "@/components/app/AppShell"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const profile = await getProfile(supabase, user.id)
  if (!profile) redirect("/auth/login")

  return (
    <AppShell profile={profile}>
      {children}
    </AppShell>
  )
}
