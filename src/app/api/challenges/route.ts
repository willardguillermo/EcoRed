import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getProfile } from "@/features/citizen/citizenService"

const ALLOWED_ROLES = ["school_admin", "municipal_admin", "platform_admin"]

export async function POST(request: Request) {
  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("No autenticado", { status: 401 })

  const profile = await getProfile(supabase, user.id)
  if (!profile?.org_id)                     return Response.json({ error: "Sin organización" }, { status: 403 })
  if (!ALLOWED_ROLES.includes(profile.role)) return Response.json({ error: "Sin permisos" },    { status: 403 })

  const body = await request.json() as {
    title?: string; description?: string; points?: number; deadline?: string
  }

  if (!body.title?.trim() || !body.description?.trim() || !body.deadline) {
    return Response.json({ error: "Título, descripción y fecha son requeridos" }, { status: 400 })
  }

  const deadlineDate = new Date(body.deadline)
  if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
    return Response.json({ error: "La fecha debe ser futura" }, { status: 400 })
  }

  const { data, error } = await adminSupabase
    .from("challenges")
    .insert({
      org_id:      profile.org_id,
      title:       body.title.trim(),
      description: body.description.trim(),
      points:      Math.max(5, Math.min(500, body.points ?? 50)),
      deadline:    deadlineDate.toISOString(),
      active:      true,
    })
    .select("id")
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
