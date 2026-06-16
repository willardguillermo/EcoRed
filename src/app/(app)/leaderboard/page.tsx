import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/features/citizen/citizenService"
import { Trophy, Users, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

type LeaderboardUser = {
  user_id:        string
  full_name:      string | null
  points:         number
  classroom_name: string | null
  rank:           number
}

type LeaderboardClass = {
  classroom_id:   string
  classroom_name: string
  total_points:   number
  member_count:   number
  rank:           number
}

const MEDAL_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"]
const MEDAL_BG     = ["bg-yellow-50 border-yellow-200", "bg-gray-50 border-gray-200", "bg-amber-50 border-amber-200"]

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const profile = await getProfile(supabase, user.id)
  if (!profile) redirect("/auth/login")

  let users:      LeaderboardUser[]  = []
  let classrooms: LeaderboardClass[] = []

  if (profile.org_id) {
    const [usersRes, classRes] = await Promise.all([
      supabase
        .from("org_leaderboard")
        .select("user_id, full_name, points, classroom_name, rank")
        .eq("org_id", profile.org_id)
        .order("rank", { ascending: true })
        .limit(50),
      supabase
        .from("classroom_leaderboard")
        .select("classroom_id, classroom_name, total_points, member_count, rank")
        .eq("org_id", profile.org_id)
        .order("rank", { ascending: true })
        .limit(20),
    ])
    users      = (usersRes.data  ?? []) as LeaderboardUser[]
    classrooms = (classRes.data  ?? []) as LeaderboardClass[]
  }

  const myRank = users.find((u) => u.user_id === user.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Ranking</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {profile.org_id ? "Tu posición en la comunidad" : "Únete a una institución para ver el ranking"}
        </p>
      </div>

      {!profile.org_id ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Sin comunidad aún</p>
          <p className="text-sm text-muted-foreground">
            Pídele a tu colegio o municipio el código QR para unirte y ver el ranking.
          </p>
        </div>
      ) : (
        <>
          {/* Mi posición */}
          {myRank && (
            <div className="rounded-2xl bg-[#00897B] p-4 flex items-center gap-4 text-white">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold shrink-0">
                {(profile.full_name ?? "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{profile.full_name ?? "Tú"}</p>
                {myRank.classroom_name && (
                  <p className="text-white/70 text-xs">{myRank.classroom_name}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold font-mono">#{myRank.rank}</p>
                <p className="text-white/70 text-xs font-mono">{Number(myRank.points).toLocaleString("es-PE")} pts</p>
              </div>
            </div>
          )}

          {/* Podio top 3 */}
          {users.length >= 3 && (
            <div className="grid grid-cols-3 gap-2">
              {[users[1], users[0], users[2]].map((u, i) => {
                const rankIdx = [1, 0, 2][i]
                if (!u) return <div key={i} />
                return (
                  <div key={u.user_id} className={cn(
                    "rounded-2xl border p-4 text-center flex flex-col items-center gap-2",
                    MEDAL_BG[rankIdx],
                    rankIdx === 0 && "md:-mt-2 shadow-sm"
                  )}>
                    <Medal className={cn("h-5 w-5", MEDAL_COLORS[rankIdx])} />
                    <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-sm font-bold text-[#1A1A2E]">
                      {(u.full_name ?? "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1A1A2E] truncate max-w-[80px]">
                        {u.full_name?.split(" ")[0] ?? "Usuario"}
                      </p>
                      <p className={cn("text-xs font-bold font-mono", MEDAL_COLORS[rankIdx])}>
                        {Number(u.points).toLocaleString("es-PE")} pts
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Lista completa */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" /> Recicladores
            </h2>
            {users.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
                <p className="text-sm text-muted-foreground">Aún no hay actividad en tu comunidad</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
                {users.map((u, i) => {
                  const isMe = u.user_id === user.id
                  return (
                    <div key={u.user_id} className={cn("flex items-center gap-3 px-4 py-3", isMe && "bg-[#E0F2F1]")}>
                      <span className={cn(
                        "text-xs font-bold font-mono w-6 text-center shrink-0",
                        i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                      )}>#{u.rank}</span>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                        isMe ? "bg-[#00897B] text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {(u.full_name ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", isMe ? "text-[#00897B]" : "text-[#1A1A2E]")}>
                          {u.full_name ?? "Usuario"}{isMe && " (tú)"}
                        </p>
                        {u.classroom_name && (
                          <p className="text-xs text-muted-foreground">{u.classroom_name}</p>
                        )}
                      </div>
                      <span className={cn("text-sm font-bold font-mono shrink-0", isMe ? "text-[#00897B]" : "text-[#1A1A2E]")}>
                        {Number(u.points).toLocaleString("es-PE")}
                        <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Ranking de aulas */}
          {classrooms.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5" /> Ranking de aulas
              </h2>
              <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
                {classrooms.map((cls, i) => {
                  const maxPts  = Number(classrooms[0]?.total_points ?? 1)
                  const pct     = maxPts > 0 ? (Number(cls.total_points) / maxPts) * 100 : 0
                  const isMyCls = cls.classroom_id === profile.classroom_id
                  return (
                    <div key={cls.classroom_id} className={cn("px-4 py-3", isMyCls && "bg-[#E0F2F1]")}>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={cn(
                          "text-xs font-bold font-mono w-6 text-center shrink-0",
                          i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                        )}>#{cls.rank}</span>
                        <span className={cn("text-sm font-medium flex-1 truncate", isMyCls ? "text-[#00897B]" : "text-[#1A1A2E]")}>
                          {cls.classroom_name}{isMyCls && " (tu aula)"}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">{cls.member_count} miembros</span>
                        <span className={cn("text-sm font-bold font-mono shrink-0", isMyCls ? "text-[#00897B]" : "text-[#1A1A2E]")}>
                          {Number(cls.total_points).toLocaleString("es-PE")}
                        </span>
                      </div>
                      <div className="ml-9 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", isMyCls ? "bg-[#00897B]" : "bg-[#1565C0]/40")}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
