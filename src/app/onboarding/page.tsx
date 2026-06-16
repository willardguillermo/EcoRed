import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Leaf } from "lucide-react"
import Link from "next/link"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .single() as { data: { role: string; org_id: string | null } | null }

  // Si ya tiene org, no necesita onboarding
  if (profile?.org_id) redirect("/institution/dashboard")

  // Solo admins pueden hacer onboarding institucional
  if (profile?.role === "citizen" || profile?.role === "student") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <header className="flex items-center h-14 px-6 border-b border-border bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00897B]">
            <Leaf className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-[#1A1A2E]">EcoRed</span>
        </Link>
        <span className="ml-3 text-sm text-muted-foreground">· Configuración institucional</span>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <OnboardingWizard userId={user.id} />
      </main>
    </div>
  )
}
