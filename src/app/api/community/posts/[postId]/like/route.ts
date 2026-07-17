import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { canAccessCommunityPost } from "@/features/community/communityService"

type RouteContext = {
  params: Promise<{ postId: string }>
}

function isMissingCommunityTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === "42P01" || /community_post_likes|community_posts/i.test(error.message ?? "")
}

export async function POST(_request: Request, context: RouteContext) {
  const { postId } = await context.params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 })

  const canAccess = await canAccessCommunityPost(user.id, postId)
  if (!canAccess) return Response.json({ error: "Publicación no encontrada" }, { status: 404 })

  const { data: existing, error: existingError } = await admin
    .from("community_post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingError && !isMissingCommunityTable(existingError)) {
    return Response.json({ error: existingError.message }, { status: 500 })
  }

  if (existing) {
    const { error } = await admin
      .from("community_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ liked: false })
  }

  const { error } = await admin
    .from("community_post_likes")
    .insert({ post_id: postId, user_id: user.id })

  if (error) {
    if (isMissingCommunityTable(error)) {
      return Response.json({ error: "EcoMuro aún no tiene tablas en Supabase" }, { status: 503 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ liked: true })
}
