"use client"

import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import { toast } from "sonner"
import {
  Heart,
  Image as ImageIcon,
  Leaf,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CommunityMode, CommunityPost, CommunityAuthor } from "@/features/community/communityService"

type Props = {
  initialPosts: CommunityPost[]
  initialMode:  CommunityMode
  currentUser:  CommunityAuthor
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.floor(diff / 60_000))
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} d`
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function isDemoPost(id: string) {
  return id.startsWith("demo-") || id.startsWith("local-")
}

export function CommunityFeedClient({ initialPosts, initialMode, currentUser }: Props) {
  const [posts, setPosts] = useState(initialPosts)
  const [mode, setMode] = useState<CommunityMode>(initialMode)
  const [message, setMessage] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [publishing, setPublishing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const previewUrl = useMemo(() => imageUrl.trim(), [imageUrl])

  async function refreshFeed() {
    setRefreshing(true)
    try {
      const response = await fetch("/api/community", { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? "No se pudo cargar el muro")
      setPosts(data.posts)
      setMode(data.mode)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setRefreshing(false)
    }
  }

  function addLocalPost() {
    const now = new Date().toISOString()
    const localPost: CommunityPost = {
      id:             `local-${Date.now()}`,
      message:        message.trim(),
      image_url:      previewUrl || null,
      created_at:     now,
      author:         currentUser,
      likes_count:    0,
      comments_count: 0,
      has_liked:      false,
      comments:       [],
    }

    setPosts((current) => [localPost, ...current])
    setMessage("")
    setImageUrl("")
  }

  async function handlePublish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const body = message.trim()

    if (body.length < 4) {
      toast.error("Escribe un mensaje un poco más completo.")
      return
    }

    setPublishing(true)
    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body, image_url: previewUrl || undefined }),
      })

      if (!response.ok) {
        if (response.status === 503) {
          addLocalPost()
          setMode("demo")
          toast.info("Publicación agregada para esta sesión de demo.")
          return
        }

        const data = await response.json()
        throw new Error(data.error ?? "No se pudo publicar")
      }

      setMessage("")
      setImageUrl("")
      toast.success("Publicado en EcoMuro.")
      await refreshFeed()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setPublishing(false)
    }
  }

  async function handleLike(postId: string) {
    const currentPost = posts.find((post) => post.id === postId)
    if (!currentPost) return

    setPosts((current) => current.map((post) => {
      if (post.id !== postId) return post
      const nextLiked = !post.has_liked
      return {
        ...post,
        has_liked: nextLiked,
        likes_count: Math.max(0, post.likes_count + (nextLiked ? 1 : -1)),
      }
    }))

    if (mode === "demo" || isDemoPost(postId)) return

    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, { method: "POST" })
      if (!response.ok) throw new Error("No se pudo actualizar el me gusta")
    } catch (error) {
      setPosts((current) => current.map((post) => post.id === postId ? currentPost : post))
      toast.error((error as Error).message)
    }
  }

  async function handleComment(postId: string) {
    const body = (commentDrafts[postId] ?? "").trim()
    if (!body) return

    const localComment = {
      id:         `local-comment-${Date.now()}`,
      post_id:    postId,
      body,
      created_at: new Date().toISOString(),
      author:     currentUser,
    }

    setPosts((current) => current.map((post) => post.id === postId
      ? { ...post, comments: [...post.comments, localComment], comments_count: post.comments_count + 1 }
      : post
    ))
    setCommentDrafts((current) => ({ ...current, [postId]: "" }))

    if (mode === "demo" || isDemoPost(postId)) return

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      })
      if (!response.ok) throw new Error("No se pudo comentar")
      await refreshFeed()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-5 md:grid-cols-[minmax(0,1fr)_19rem] md:py-7">
      <main className="space-y-5 md:order-1">
        <header className="rounded-2xl border border-white/60 bg-white/36 p-5 shadow-[0_22px_62px_rgba(0,65,58,0.09)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#00897B]">EcoMuro</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A1A2E] md:text-3xl">
                Comunidad que recicla junta
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Comparte avances, campañas y pequeñas victorias ambientales de tu barrio, aula o institución.
              </p>
            </div>
            <button
              onClick={refreshFeed}
              disabled={refreshing}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/60 bg-white/45 text-[#00897B] transition hover:-translate-y-0.5 hover:bg-white/70 disabled:opacity-60"
              aria-label="Actualizar muro"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </button>
          </div>
        </header>

        <form onSubmit={handlePublish} className="rounded-2xl border border-white/60 bg-white/40 p-4 shadow-[0_18px_52px_rgba(0,65,58,0.09)] backdrop-blur-2xl">
          <div className="flex gap-3">
            <Avatar author={currentUser} />
            <div className="min-w-0 flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Comparte tu logro de reciclaje..."
                className="min-h-24 w-full resize-none rounded-2xl border border-white/60 bg-white/45 px-4 py-3 text-sm leading-6 text-[#1A1A2E] outline-none backdrop-blur-xl transition focus:border-[#00897B]/40 focus:ring-4 focus:ring-[#00897B]/10"
              />
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de imagen opcional"
                    className="h-11 w-full rounded-xl border border-white/60 bg-white/45 pl-9 pr-3 text-sm outline-none backdrop-blur-xl transition focus:border-[#00897B]/40 focus:ring-4 focus:ring-[#00897B]/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={publishing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00897B] px-4 text-sm font-bold text-white shadow-[0_14px_32px_rgba(0,137,123,0.22)] transition hover:-translate-y-0.5 hover:bg-[#00796B] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {publishing ? "Publicando..." : "Publicar"}
                </button>
              </div>
              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/60 bg-white/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Vista previa" className="max-h-56 w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </form>

        <section className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-white/60 bg-white/42 shadow-[0_22px_62px_rgba(0,65,58,0.10)] backdrop-blur-2xl">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar author={post.author} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-bold text-[#1A1A2E]">{post.author.name}</p>
                      <span className="rounded-full border border-white/60 bg-white/45 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#00897B]">
                        {post.author.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{relativeTime(post.created_at)}</p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-[#1A1A2E]">
                  {post.message}
                </p>
              </div>

              {post.image_url && (
                <div className="border-y border-white/50 bg-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image_url} alt="Publicación de reciclaje" className="max-h-[28rem] w-full object-cover" />
                </div>
              )}

              <div className="px-4 py-3">
                <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.likes_count} Me gusta</span>
                  <span>{post.comments_count} comentarios</span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-white/50 py-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
                      post.has_liked
                        ? "bg-[#E0F2F1] text-[#00897B]"
                        : "bg-white/28 text-muted-foreground hover:bg-white/55 hover:text-[#00897B]"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", post.has_liked && "fill-current")} />
                    Me gusta
                  </button>
                  <a
                    href={`#comments-${post.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/28 px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-white/55 hover:text-[#00897B]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Comentar
                  </a>
                </div>

                <div id={`comments-${post.id}`} className="mt-3 space-y-3">
                  {post.comments.slice(-3).map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar author={comment.author} size="sm" />
                      <div className="min-w-0 rounded-2xl border border-white/60 bg-white/38 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#1A1A2E]">{comment.author.name}</p>
                          <span className="text-[10px] text-muted-foreground">{relativeTime(comment.created_at)}</span>
                        </div>
                        <p className="mt-1 text-sm leading-5 text-[#1A1A2E]">{comment.body}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-2">
                    <Avatar author={currentUser} size="sm" />
                    <input
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(e) => setCommentDrafts((current) => ({ ...current, [post.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleComment(post.id)
                        }
                      }}
                      placeholder="Escribe un comentario..."
                      className="h-10 min-w-0 flex-1 rounded-xl border border-white/60 bg-white/42 px-3 text-sm outline-none backdrop-blur-xl transition focus:border-[#00897B]/40 focus:ring-4 focus:ring-[#00897B]/10"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#00897B] text-white transition hover:bg-[#00796B]"
                      aria-label="Enviar comentario"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <aside className="space-y-4 md:order-2">
        <section className="rounded-2xl border border-white/60 bg-white/40 p-5 shadow-[0_22px_62px_rgba(0,65,58,0.09)] backdrop-blur-2xl">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/70 bg-white/45 text-[#00897B]">
            <UsersRound className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-[#1A1A2E]">Impacto visible</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            EcoMuro convierte cada botella, papel o campaña en una historia que otros pueden apoyar.
          </p>
          <div className="mt-4 grid gap-2">
            <Metric icon={<Leaf className="h-4 w-4" />} label="Historias" value={String(posts.length)} />
            <Metric icon={<Heart className="h-4 w-4" />} label="Apoyos" value={String(posts.reduce((sum, post) => sum + post.likes_count, 0))} />
            <Metric icon={<MessageCircle className="h-4 w-4" />} label="Comentarios" value={String(posts.reduce((sum, post) => sum + post.comments_count, 0))} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/60 bg-white/32 p-4 shadow-[0_18px_52px_rgba(0,65,58,0.08)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-[#00897B]">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-bold">Idea para presentar</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Después de escanear un residuo, EcoRed puede sugerir compartirlo aquí para inspirar a la comunidad.
          </p>
        </section>
      </aside>
    </div>
  )
}

function Avatar({ author, size = "md" }: { author: CommunityAuthor; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-8 w-8 rounded-xl text-[11px]" : "h-11 w-11 rounded-2xl text-sm"

  return (
    <div className={cn("grid shrink-0 place-items-center overflow-hidden border border-white/70 bg-[#E0F2F1] font-extrabold text-[#00897B]", sizeClass)}>
      {author.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.avatar_url} alt={`Avatar de ${author.name}`} className="h-full w-full object-cover" />
      ) : (
        initials(author.name)
      )}
    </div>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/38 px-3 py-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <span className="text-[#00897B]">{icon}</span>
        {label}
      </div>
      <span className="font-mono text-sm font-extrabold text-[#1A1A2E]">{value}</span>
    </div>
  )
}
