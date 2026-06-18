import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Leaf, Building2 } from "lucide-react"
import { JoinOrgButton } from "@/components/join/JoinOrgButton"

interface Props {
  params: Promise<{ id: string }>
}

export default async function JoinOrgPage({ params }: Props) {
  const { id } = await params
  const admin  = createAdminClient()

  const { data: org } = await admin
    .from("organizations")
    .select("id, name, type, district, region")
    .eq("id", id)
    .single()

  if (!org) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .maybeSingle()
    const profile = profileData as { org_id: string | null } | null
    if (profile?.org_id === org.id) redirect("/dashboard")
  }

  const isSchool = org.type === "school"

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00897B]">
            <Leaf className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#1A1A2E]">EcoRed</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-[#E3F2FD] flex items-center justify-center">
              <Building2 className="h-8 w-8 text-[#1565C0]" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Invitación a {isSchool ? "colegio" : "municipio"}
            </p>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{org.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[org.district, org.region].filter(Boolean).join(", ")}
            </p>
          </div>

          {user ? (
            <JoinOrgButton orgId={org.id} />
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Necesitas una cuenta para unirte
              </p>
              <Link
                href={`/auth/login?next=/join/org/${id}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-[#1565C0] hover:bg-[#1255A3] text-white font-semibold text-base transition-colors"
              >
                Iniciar sesión para unirse
              </Link>
              <Link
                href={`/auth/register?next=/join/org/${id}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Crear cuenta nueva
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Al unirte, tu reciclaje contribuirá al impacto colectivo de la organización
        </p>
      </div>
    </div>
  )
}
