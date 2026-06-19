import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/features/citizen/citizenService"
import { Trophy, Users } from "lucide-react"
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

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const profile = await getProfile(user.id)
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
    <>
      <style>{`
        @keyframes barGrow {
          from { width: 0; }
        }
        .bar-anim { animation: barGrow 0.8s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes podiumRise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .podium-col { animation: podiumRise 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .pc-0 { animation-delay: 0.1s; }
        .pc-1 { animation-delay: 0.0s; }
        .pc-2 { animation-delay: 0.2s; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.15s; }
        .d3 { animation-delay: 0.25s; }
        .d4 { animation-delay: 0.35s; }

        .rank-row:hover { background: rgba(0,137,123,0.025) !important; }
        .rank-row { transition: background 0.15s ease; }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Header ── */}
        <div className="fu d1">
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.025em' }}>Ranking</h1>
          <p style={{ fontSize: 14, color: 'rgba(26,26,46,0.4)', marginTop: 3 }}>
            {profile.org_id ? "Tu posición en la comunidad" : "Únete a una institución para ver el ranking"}
          </p>
        </div>

        {!profile.org_id ? (
          <div style={{ borderRadius: 20, border: '1px dashed rgba(0,0,0,0.11)', background: '#FAFAFA', padding: '48px 24px', textAlign: 'center' }}>
            <Trophy className="h-12 w-12 mx-auto mb-3" style={{ color: 'rgba(0,0,0,0.1)' }} />
            <p style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: 6 }}>Sin comunidad aún</p>
            <p style={{ fontSize: 14, color: 'rgba(26,26,46,0.42)', lineHeight: 1.6 }}>
              Pídele a tu colegio o municipio el código QR para unirte y ver el ranking.
            </p>
          </div>
        ) : (
          <>
            {/* ── Mi posición ── */}
            {myRank && (
              <div className="fu d2" style={{
                borderRadius: 18,
                background: 'linear-gradient(135deg, #00897B 0%, #005F57 100%)',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 4px 16px rgba(0,137,123,0.22)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: '#fff',
                }}>
                  {(profile.full_name ?? "U")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{profile.full_name ?? "Tú"}</p>
                  {myRank.classroom_name && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{myRank.classroom_name}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    #{myRank.rank}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                    {Number(myRank.points).toLocaleString("es-PE")} pts
                  </p>
                </div>
              </div>
            )}

            {/* ── Podio ── */}
            {users.length >= 2 && (
              <div className="fu d3">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  {/* Orden visual: plata (col 0), oro (col 1), bronce (col 2) */}
                  {[
                    { rankIdx: 1, colIdx: 0, height: 148, emoji: '🥈', gradFrom: 'rgba(148,163,184,0.1)', gradTo: 'rgba(148,163,184,0.03)', border: 'rgba(148,163,184,0.22)', nameColor: '#64748B', ptColor: '#94A3B8' },
                    { rankIdx: 0, colIdx: 1, height: 188, emoji: '🥇', gradFrom: 'rgba(234,179,8,0.12)',   gradTo: 'rgba(234,179,8,0.04)',   border: 'rgba(234,179,8,0.3)',   nameColor: '#B45309', ptColor: '#D97706' },
                    { rankIdx: 2, colIdx: 2, height: 120, emoji: '🥉', gradFrom: 'rgba(180,83,9,0.09)',   gradTo: 'rgba(180,83,9,0.02)',   border: 'rgba(180,83,9,0.18)',   nameColor: '#92400E', ptColor: '#B45309' },
                  ].map(({ rankIdx, colIdx, height, emoji, gradFrom, gradTo, border, nameColor, ptColor }) => {
                    const u = users[rankIdx]
                    if (!u) return <div key={colIdx} style={{ flex: 1 }} />
                    return (
                      <div
                        key={colIdx}
                        className={`podium-col pc-${colIdx}`}
                        style={{
                          flex: 1, height,
                          borderRadius: '14px 14px 0 0',
                          background: `linear-gradient(180deg, ${gradFrom} 0%, ${gradTo} 100%)`,
                          border: `1px solid ${border}`,
                          borderBottom: 'none',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'flex-start',
                          padding: '14px 8px 0',
                          gap: 5,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{emoji}</span>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: '#fff', border: `2px solid ${border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: nameColor,
                        }}>
                          {(u.full_name ?? "?")[0].toUpperCase()}
                        </div>
                        <div style={{ textAlign: 'center', padding: '0 4px' }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: nameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 76 }}>
                            {u.full_name?.split(" ")[0] ?? "Usuario"}
                          </p>
                          <p style={{ fontSize: 11, fontWeight: 700, color: ptColor, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                            {Number(u.points).toLocaleString("es-PE")}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ height: 4, background: 'linear-gradient(90deg, rgba(148,163,184,0.2), rgba(234,179,8,0.35), rgba(180,83,9,0.18))', borderRadius: '0 0 6px 6px' }} />
              </div>
            )}

            {/* ── Lista ── */}
            <section className="fu d4">
              <h2 style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(26,26,46,0.35)', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users className="h-3.5 w-3.5" /> Recicladores
              </h2>

              {users.length === 0 ? (
                <div style={{ borderRadius: 20, border: '1px dashed rgba(0,0,0,0.11)', background: '#FAFAFA', padding: '32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: 'rgba(26,26,46,0.4)' }}>Aún no hay actividad en tu comunidad</p>
                </div>
              ) : (
                <div style={{ borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', background: '#fff', overflow: 'hidden' }}>
                  {users.map((u, i) => {
                    const isMe = u.user_id === user.id
                    const rankColors = ['#D97706', '#64748B', '#B45309']
                    const rankBadgeColors = ['rgba(234,179,8,0.12)', 'rgba(148,163,184,0.12)', 'rgba(180,83,9,0.1)']
                    const isTop3 = i < 3
                    return (
                      <div
                        key={u.user_id}
                        className="rank-row"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px',
                          borderBottom: i < users.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                          background: isMe ? 'rgba(0,137,123,0.04)' : 'transparent',
                          borderLeft: isMe ? '3px solid #00897B' : '3px solid transparent',
                        }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isTop3 ? rankBadgeColors[i] : 'rgba(0,0,0,0.05)',
                        }}>
                          <span style={{
                            fontSize: 11, fontWeight: 800,
                            color: isTop3 ? rankColors[i] : 'rgba(26,26,46,0.3)',
                            fontVariantNumeric: 'tabular-nums',
                          }}>
                            {u.rank}
                          </span>
                        </div>

                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: isMe ? '#00897B' : 'rgba(0,0,0,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700,
                          color: isMe ? '#fff' : 'rgba(26,26,46,0.4)',
                        }}>
                          {(u.full_name ?? "?")[0].toUpperCase()}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: isMe ? 700 : 500, color: isMe ? '#00897B' : '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.full_name ?? "Usuario"}{isMe && " (tú)"}
                          </p>
                          {u.classroom_name && (
                            <p style={{ fontSize: 11, color: 'rgba(26,26,46,0.35)', marginTop: 1 }}>{u.classroom_name}</p>
                          )}
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: isMe ? '#00897B' : '#1A1A2E', fontVariantNumeric: 'tabular-nums' }}>
                            {Number(u.points).toLocaleString("es-PE")}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(26,26,46,0.3)', marginLeft: 3 }}>pts</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* ── Ranking de aulas ── */}
            {classrooms.length > 0 && (
              <section className="fu d4" style={{ animationDelay: '0.42s' }}>
                <h2 style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(26,26,46,0.35)', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Trophy className="h-3.5 w-3.5" /> Ranking de aulas
                </h2>
                <div style={{ borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', background: '#fff', overflow: 'hidden' }}>
                  {classrooms.map((cls, i) => {
                    const maxPts  = Number(classrooms[0]?.total_points ?? 1)
                    const pct     = maxPts > 0 ? (Number(cls.total_points) / maxPts) * 100 : 0
                    const isMyCls = cls.classroom_id === profile.classroom_id
                    const rankColors = ['#D97706', '#64748B', '#B45309']
                    const isTop3 = i < 3
                    return (
                      <div
                        key={cls.classroom_id}
                        className={cn("rank-row", isMyCls && "border-l-[3px] border-l-[#00897B]")}
                        style={{
                          padding: '13px 16px',
                          borderBottom: i < classrooms.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                          background: isMyCls ? 'rgba(0,137,123,0.04)' : 'transparent',
                          borderLeft: isMyCls ? '3px solid #00897B' : '3px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isTop3 ? `rgba(${i===0?'234,179,8':i===1?'148,163,184':'180,83,9'},0.1)` : 'rgba(0,0,0,0.05)',
                          }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: isTop3 ? rankColors[i] : 'rgba(26,26,46,0.3)', fontVariantNumeric: 'tabular-nums' }}>
                              {cls.rank}
                            </span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: isMyCls ? 700 : 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isMyCls ? '#00897B' : '#1A1A2E' }}>
                            {cls.classroom_name}{isMyCls && " (tu aula)"}
                          </span>
                          <span style={{ fontSize: 12, color: 'rgba(26,26,46,0.32)', flexShrink: 0 }}>{cls.member_count} miembros</span>
                          <span style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: isMyCls ? '#00897B' : '#1A1A2E', flexShrink: 0 }}>
                            {Number(cls.total_points).toLocaleString("es-PE")}
                          </span>
                        </div>
                        <div style={{ marginLeft: 36, height: 4, borderRadius: 100, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                          <div
                            className="bar-anim"
                            style={{
                              height: '100%', borderRadius: 100,
                              background: isMyCls
                                ? 'linear-gradient(90deg, #00897B, #00BFAA)'
                                : 'linear-gradient(90deg, #1565C0, #4B9EFF)',
                              width: `${pct}%`,
                              animationDelay: `${0.4 + i * 0.05}s`,
                            }}
                          />
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
    </>
  )
}
