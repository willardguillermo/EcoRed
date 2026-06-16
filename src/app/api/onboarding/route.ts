import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { OrgType, UserRole } from "@/types/database"

export async function POST(request: NextRequest) {
  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

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

  // Si ya existe la org, solo crear las aulas
  if (body.existing_org_id) {
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

  // Actualizar perfil
  const role: UserRole = body.type === "school" ? "school_admin" : "municipal_admin"
  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({ org_id: org.id, role })
    .eq("id", user.id)

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ org, classrooms: [] })
}
