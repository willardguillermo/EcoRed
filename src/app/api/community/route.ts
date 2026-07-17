import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getProfile } from "@/features/citizen/citizenService"
import { getCommunityFeed } from "@/features/community/communityService"

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function isMissingCommunityTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === "42P01" || /community_posts/i.test(error.message ?? "")
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 })

  const feed = await getCommunityFeed(user.id)
  return Response.json(feed)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 })

  const profile = await getProfile(user.id)
  if (!profile) return Response.json({ error: "Perfil no encontrado" }, { status: 404 })

  const body = await request.json() as {
    message?: string
    image_url?: string
  }

  const message = body.message?.trim() ?? ""
  const imageUrl = body.image_url?.trim() ?? ""

  if (message.length < 4 || message.length > 500) {
    return Response.json({ error: "El mensaje debe tener entre 4 y 500 caracteres" }, { status: 400 })
  }

  if (imageUrl && (!isValidImageUrl(imageUrl) || imageUrl.length > 1200)) {
    return Response.json({ error: "La URL de imagen no es válida" }, { status: 400 })
  }

  const { data, error } = await admin
    .from("community_posts")
    .insert({
      user_id:   user.id,
      org_id:    profile.org_id,
      message,
      image_url: imageUrl || null,
    })
    .select("id")
    .single()

  if (error) {
    if (isMissingCommunityTable(error)) {
      return Response.json({ error: "EcoMuro aún no tiene tablas en Supabase" }, { status: 503 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
