import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const supabase = await createClient()
  const admin    = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 })

  const body = await request.json() as { org_id?: string }
  if (!body.org_id) return Response.json({ error: "org_id requerido" }, { status: 400 })

  const { data: org } = await admin
    .from("organizations")
    .select("id")
    .eq("id", body.org_id)
    .single()

  if (!org) return Response.json({ error: "Organización no encontrada" }, { status: 404 })

  const { error } = await admin
    .from("profiles")
    .update({ org_id: body.org_id })
    .eq("id", user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}
