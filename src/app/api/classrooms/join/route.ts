import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const supabase = await createClient()
  const admin    = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 })

  const body = await request.json() as { code?: string }
  if (!body.code?.trim()) return Response.json({ error: "Código requerido" }, { status: 400 })

  const { data: classroom, error: clsErr } = await admin
    .from("classrooms")
    .select("id, org_id, name, organizations(name)")
    .eq("code", body.code.trim().toUpperCase())
    .single()

  if (clsErr || !classroom) return Response.json({ error: "Código inválido" }, { status: 404 })

  const { error: updErr } = await admin
    .from("profiles")
    .update({ classroom_id: classroom.id, org_id: classroom.org_id })
    .eq("id", user.id)

  if (updErr) return Response.json({ error: updErr.message }, { status: 500 })

  return Response.json({ classroom_name: classroom.name })
}
