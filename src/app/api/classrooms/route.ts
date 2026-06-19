import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getProfile } from "@/features/citizen/citizenService"

const ALLOWED_ROLES = ["school_admin", "platform_admin"]

export async function POST(request: Request) {
  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("No autenticado", { status: 401 })

  const profile = await getProfile(user.id)
  if (!profile?.org_id)                     return Response.json({ error: "Sin organización" },   { status: 403 })
  if (!ALLOWED_ROLES.includes(profile.role)) return Response.json({ error: "Sin permisos" },       { status: 403 })

  const body = await request.json() as { name?: string; grade?: string }
  if (!body.name?.trim()) return Response.json({ error: "Nombre requerido" }, { status: 400 })

  const { data, error } = await adminSupabase
    .from("classrooms")
    .insert({
      org_id: profile.org_id,
      name:   body.name.trim(),
      grade:  body.grade?.trim() || null,
    })
    .select("id, name, grade, code, created_at")
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
