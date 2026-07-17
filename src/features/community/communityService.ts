import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types/database"

export type CommunityMode = "database" | "demo"

export type CommunityAuthor = {
  id:         string
  name:       string
  avatar_url: string | null
  role:       UserRole
  label:      string
}

export type CommunityComment = {
  id:         string
  post_id:    string
  body:       string
  created_at: string
  author:     CommunityAuthor
}

export type CommunityPost = {
  id:             string
  message:        string
  image_url:      string | null
  created_at:     string
  author:         CommunityAuthor
  likes_count:    number
  comments_count: number
  has_liked:      boolean
  comments:       CommunityComment[]
}

type ProfileRow = {
  id:         string
  full_name:  string | null
  avatar_url: string | null
  role:       UserRole
  org_id:     string | null
}

type PostRow = {
  id:         string
  user_id:    string
  org_id:     string | null
  message:    string
  image_url:  string | null
  created_at: string
}

type LikeRow = {
  post_id: string
  user_id: string
}

type CommentRow = {
  id:         string
  post_id:    string
  user_id:    string
  body:       string
  created_at: string
}

const ROLE_LABELS: Record<UserRole, string> = {
  citizen:         "Ciudadano",
  student:         "Estudiante",
  teacher:         "Docente",
  school_admin:    "Institución educativa",
  municipal_admin: "Municipio",
  platform_admin:  "EcoRed",
}

function authorFromProfile(profile: ProfileRow | undefined, fallbackId: string): CommunityAuthor {
  const role = profile?.role ?? "citizen"
  return {
    id:         profile?.id ?? fallbackId,
    name:       profile?.full_name ?? "Usuario EcoRed",
    avatar_url: profile?.avatar_url ?? null,
    role,
    label:      ROLE_LABELS[role],
  }
}

function isMissingCommunityTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === "42P01" || /community_posts|community_post_likes|community_post_comments/i.test(error.message ?? "")
}

function demoAuthor(id: string, name: string, role: UserRole): CommunityAuthor {
  return { id, name, role, avatar_url: null, label: ROLE_LABELS[role] }
}

export function getDemoCommunityPosts(currentUser?: Partial<ProfileRow>): CommunityPost[] {
  const now = Date.now()
  const kiara = demoAuthor("demo-kiara", "Kiara", "student")
  const colegio = demoAuthor("demo-colegio", "Colegio San Martín", "school_admin")
  const muni = demoAuthor("demo-muni", "Municipalidad de Barranco", "municipal_admin")
  const current = currentUser?.id
    ? authorFromProfile(currentUser as ProfileRow, currentUser.id)
    : demoAuthor("demo-user", "Usuario EcoRed", "citizen")

  return [
    {
      id: "demo-1",
      message: "Hoy reciclé 20 botellas de plástico. Cada pequeño esfuerzo cuenta.",
      image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
      created_at: new Date(now - 1000 * 60 * 18).toISOString(),
      author: kiara,
      likes_count: 24,
      comments_count: 2,
      has_liked: false,
      comments: [
        {
          id: "demo-c1",
          post_id: "demo-1",
          body: "Buenísimo, esas botellas ya no terminan en la calle.",
          created_at: new Date(now - 1000 * 60 * 12).toISOString(),
          author: muni,
        },
        {
          id: "demo-c2",
          post_id: "demo-1",
          body: "Inspirador. Mañana llevo las mías al punto verde.",
          created_at: new Date(now - 1000 * 60 * 7).toISOString(),
          author: current,
        },
      ],
    },
    {
      id: "demo-2",
      message: "Nuestra promoción recolectó 150 kg de papel para reciclar.",
      image_url: "https://images.unsplash.com/photo-1536748376217-d9960a64c2c3?auto=format&fit=crop&w=1200&q=80",
      created_at: new Date(now - 1000 * 60 * 80).toISOString(),
      author: colegio,
      likes_count: 103,
      comments_count: 3,
      has_liked: true,
      comments: [
        {
          id: "demo-c3",
          post_id: "demo-2",
          body: "Gran trabajo de la promoción.",
          created_at: new Date(now - 1000 * 60 * 66).toISOString(),
          author: kiara,
        },
        {
          id: "demo-c4",
          post_id: "demo-2",
          body: "Esto merece un reto interaulas.",
          created_at: new Date(now - 1000 * 60 * 44).toISOString(),
          author: current,
        },
        {
          id: "demo-c5",
          post_id: "demo-2",
          body: "La comunidad ya está viendo el impacto.",
          created_at: new Date(now - 1000 * 60 * 21).toISOString(),
          author: muni,
        },
      ],
    },
    {
      id: "demo-3",
      message: "Activamos un nuevo punto de acopio para papel, cartón y plástico cerca del parque central.",
      image_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1200&q=80",
      created_at: new Date(now - 1000 * 60 * 160).toISOString(),
      author: muni,
      likes_count: 56,
      comments_count: 1,
      has_liked: false,
      comments: [
        {
          id: "demo-c6",
          post_id: "demo-3",
          body: "Perfecto para llevar lo que juntamos en casa.",
          created_at: new Date(now - 1000 * 60 * 123).toISOString(),
          author: kiara,
        },
      ],
    },
  ]
}

export async function getCommunityFeed(userId: string): Promise<{ posts: CommunityPost[]; mode: CommunityMode }> {
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, role, org_id")
    .eq("id", userId)
    .maybeSingle()

  const currentProfile = profile as ProfileRow | null

  let postsQuery = admin
    .from("community_posts")
    .select("id, user_id, org_id, message, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(30)

  postsQuery = currentProfile?.org_id
    ? postsQuery.or(`org_id.eq.${currentProfile.org_id},org_id.is.null`)
    : postsQuery.is("org_id", null)

  const { data: postRows, error: postsError } = await postsQuery

  if (postsError) {
    if (isMissingCommunityTable(postsError)) {
      return { posts: getDemoCommunityPosts(currentProfile ?? undefined), mode: "demo" }
    }
    return { posts: getDemoCommunityPosts(currentProfile ?? undefined), mode: "demo" }
  }

  const posts = (postRows ?? []) as PostRow[]
  if (posts.length === 0) {
    return { posts: getDemoCommunityPosts(currentProfile ?? undefined), mode: "database" }
  }

  const postIds = posts.map((post) => post.id)

  const [likesRes, commentsRes] = await Promise.all([
    admin
      .from("community_post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds),
    admin
      .from("community_post_comments")
      .select("id, post_id, user_id, body, created_at")
      .in("post_id", postIds)
      .order("created_at", { ascending: true }),
  ])

  if (likesRes.error || commentsRes.error) {
    return { posts: getDemoCommunityPosts(currentProfile ?? undefined), mode: "demo" }
  }

  const likes = (likesRes.data ?? []) as LikeRow[]
  const comments = (commentsRes.data ?? []) as CommentRow[]
  const userIds = new Set<string>()

  posts.forEach((post) => userIds.add(post.user_id))
  comments.forEach((comment) => userIds.add(comment.user_id))

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, role, org_id")
    .in("id", Array.from(userIds))

  const profileById = new Map((profiles ?? []).map((item) => {
    const row = item as ProfileRow
    return [row.id, row]
  }))

  const likesByPost = new Map<string, LikeRow[]>()
  likes.forEach((like) => {
    const bucket = likesByPost.get(like.post_id) ?? []
    bucket.push(like)
    likesByPost.set(like.post_id, bucket)
  })

  const commentsByPost = new Map<string, CommunityComment[]>()
  comments.forEach((comment) => {
    const bucket = commentsByPost.get(comment.post_id) ?? []
    bucket.push({
      id:         comment.id,
      post_id:    comment.post_id,
      body:       comment.body,
      created_at: comment.created_at,
      author:     authorFromProfile(profileById.get(comment.user_id), comment.user_id),
    })
    commentsByPost.set(comment.post_id, bucket)
  })

  return {
    mode: "database",
    posts: posts.map((post) => {
      const postLikes = likesByPost.get(post.id) ?? []
      const postComments = commentsByPost.get(post.id) ?? []

      return {
        id:             post.id,
        message:        post.message,
        image_url:      post.image_url,
        created_at:     post.created_at,
        author:         authorFromProfile(profileById.get(post.user_id), post.user_id),
        likes_count:    postLikes.length,
        comments_count: postComments.length,
        has_liked:      postLikes.some((like) => like.user_id === userId),
        comments:       postComments,
      }
    }),
  }
}

export async function canAccessCommunityPost(userId: string, postId: string) {
  const admin = createAdminClient()

  const [{ data: profile }, { data: post, error: postError }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, org_id")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("community_posts")
      .select("id, org_id")
      .eq("id", postId)
      .maybeSingle(),
  ])

  if (postError || !post) return false

  const currentProfile = profile as { org_id: string | null } | null
  const currentPost = post as { org_id: string | null }

  return !currentPost.org_id || currentProfile?.org_id === currentPost.org_id
}
