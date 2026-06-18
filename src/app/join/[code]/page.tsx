import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { JoinButton } from "@/components/join/JoinButton"
import { Leaf, GraduationCap } from "lucide-react"

interface Props {
  params: Promise<{ code: string }>
}

export default async function JoinClassroomPage({ params }: Props) {
  const { code } = await params
  const admin    = createAdminClient()

  const { data: classroom } = await admin
    .from("classrooms")
    .select("id, name, grade, org_id, organizations(name, type, district)")
    .eq("code", code.toUpperCase())
    .single()

  if (!classroom) notFound()

  const org = Array.isArray(classroom.organizations)
    ? classroom.organizations[0]
    : classroom.organizations

  // Check if already logged in + already in this classroom
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("classroom_id")
      .eq("id", user.id)
      .maybeSingle()

    const profile = profileData as { classroom_id: string | null } | null
    if (profile?.classroom_id === classroom.id) {
      redirect("/dashboard")
    }
  }

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
          {/* Classroom icon */}
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-[#E0F2F1] flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-[#00897B]" />
            </div>
          </div>

          {/* Info */}
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Invitación a aula
            </p>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{classroom.name}</h1>
            {classroom.grade && (
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E0F2F1] text-[#00897B]">
                {classroom.grade}
              </span>
            )}
            {org && (
              <p className="text-sm text-muted-foreground pt-1">
                {(org as { name: string }).name}
                {(org as { district?: string | null }).district && ` · ${(org as { district: string }).district}`}
              </p>
            )}
          </div>

          {/* Code */}
          <div className="bg-[#F8FFFE] rounded-2xl border border-[#E0F2F1] py-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Código de acceso</p>
            <p className="font-mono font-bold text-[#00897B] text-2xl tracking-widest">{code.toUpperCase()}</p>
          </div>

          {/* Action */}
          {user ? (
            <JoinButton code={code.toUpperCase()} />
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Necesitas una cuenta para unirte
              </p>
              <Link
                href={`/auth/login?next=/join/${code}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-[#00897B] hover:bg-[#00796B] text-white font-semibold text-base transition-colors"
              >
                Iniciar sesión para unirse
              </Link>
              <Link
                href={`/auth/register?next=/join/${code}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Crear cuenta nueva
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Al unirte, tu actividad de reciclaje contribuirá al ranking de tu aula
        </p>
      </div>
    </div>
  )
}
