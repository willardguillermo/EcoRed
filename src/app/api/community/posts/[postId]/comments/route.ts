import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { canAccessCommunityPost } from "@/features/community/communityService"

type RouteContext = {
  params: Promise<{ postId: string }>
}

function isMissingCommunityTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === "42P01" || /community_post_comments|community_posts/i.test(error.message ?? "")
}

export async function POST(request: Request, context: RouteContext) {
  const { postId } = await context.params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 })

  const body = await request.json() as { body?: string }
  const comment = body.body?.trim() ?? ""

  if (comment.length < 1 || comment.length > 240) {
    return Response.json({ error: "El comentario debe tener entre 1 y 240 caracteres" }, { status: 400 })
  }

  const canAccess = await canAccessCommunityPost(user.id, postId)
  if (!canAccess) return Response.json({ error: "Publicación no encontrada" }, { status: 404 })

  const { data, error } = await admin
    .from("community_post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      body: comment,
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
