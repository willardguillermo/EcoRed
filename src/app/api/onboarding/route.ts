import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { OrgType, UserRole } from "@/types/database"

export async function POST(request: NextRequest) {
  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: currentProfile } = (await supabase
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single()) as unknown as { data: { org_id: string | null; role: string } | null }

  const body = await request.json() as {
    name:             string
    type:             OrgType
    district:         string
    region:           string
    contact_email:    string
    contact_phone?:   string
    classrooms?:      { name: string; grade: string }[]
    existing_org_id?: string
  }

  // Segunda fase (agregar aulas): el usuario YA debe ser admin de esa org exacta
  if (body.existing_org_id) {
    if (
      currentProfile?.org_id !== body.existing_org_id ||
      !["school_admin", "platform_admin"].includes(currentProfile?.role ?? "")
    ) {
      return NextResponse.json({ error: "Sin permisos para esta organización" }, { status: 403 })
    }

    const rows = (body.classrooms ?? [])
      .filter((c) => c.name.trim())
      .map((c) => ({ org_id: body.existing_org_id!, name: c.name.trim(), grade: c.grade.trim() || null }))

    const { data: classrooms, error } = await adminSupabase
      .from("classrooms")
      .insert(rows)
      .select("id, name, code")

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ classrooms: classrooms ?? [] })
  }

  // Primera fase (crear org): el usuario NO debe tener org aún
  if (currentProfile?.org_id) {
    return NextResponse.json({ error: "Ya perteneces a una organización" }, { status: 403 })
  }

  // Crear organización
  const { data: org, error: orgError } = await adminSupabase
    .from("organizations")
    .insert({
      name:          body.name,
      type:          body.type,
      district:      body.district,
      region:        body.region,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone ?? null,
    })
    .select("id, name, type")
    .single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 500 })

  // Actualizar perfil con la nueva org y rol
  const role: UserRole = body.type === "school" ? "school_admin" : "municipal_admin"
  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({ org_id: org.id, role })
    .eq("id", user.id)

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ org, classrooms: [] })
}
