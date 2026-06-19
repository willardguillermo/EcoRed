import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/features/citizen/citizenService"
import {
  getOrgDetails,
  getOrgImpact,
  getClassroomLeaderboard,
  getOrgTopUsers,
  getOrgChallenges,
  getRecentScans,
} from "@/features/institution/institutionService"
import {
  Leaf, Users, Recycle, Trophy, Zap,
  Building2, GraduationCap, Plus, ChevronRight,
  Clock, FileBarChart2,
} from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WasteCategory } from "@/types/database"
import { CreateChallengeButton } from "@/components/institution/CreateChallengeButton"

const CATEGORY_COLORS: Record<WasteCategory, string> = {
  plastic:    "bg-blue-100 text-blue-700",
  paper:      "bg-yellow-100 text-yellow-700",
  glass:      "bg-cyan-100 text-cyan-700",
  metal:      "bg-gray-100 text-gray-700",
  organic:    "bg-green-100 text-green-700",
  electronic: "bg-purple-100 text-purple-700",
  hazardous:  "bg-red-100 text-red-700",
  other:      "bg-orange-100 text-orange-700",
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(new Date(iso))
}

function deadlineDays(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0)  return "Vencido"
  if (days === 0) return "Vence hoy"
  return `${days}d restantes`
}

export default async function InstitutionDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const profile = await getProfile(user.id)
  if (!profile?.org_id) redirect("/onboarding")

  const INSTITUTION_ROLES = ["school_admin", "municipal_admin", "platform_admin"]
  if (!INSTITUTION_ROLES.includes(profile.role)) redirect("/dashboard")

  const [org, impact, classroomBoard, topUsers, challenges, recentScans] = await Promise.all([
    getOrgDetails(supabase, profile.org_id),
    getOrgImpact(supabase, profile.org_id),
    getClassroomLeaderboard(supabase, profile.org_id),
    getOrgTopUsers(supabase, profile.org_id, 5),
    getOrgChallenges(supabase, profile.org_id),
    getRecentScans(supabase, profile.org_id, 6),
  ])

  if (!org) redirect("/onboarding")

  const isSchool = org.type === "school"
  const maxPoints = classroomBoard[0]?.total_points ?? 1

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
              isSchool ? "bg-[#E0F2F1] text-[#00897B]" : "bg-[#E3F2FD] text-[#1565C0]"
            )}>
              {isSchool ? <GraduationCap className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
              {isSchool ? "Colegio" : "Municipio"}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{org.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{org.district}, {org.region}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/institution/reports"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}
          >
            <FileBarChart2 className="h-3.5 w-3.5" /> Reporte
          </Link>
          {isSchool && (
            <Link
              href="/institution/classrooms"
              className={cn(buttonVariants({ size: "sm" }), "bg-[#00897B] hover:bg-[#00796B] text-white gap-1.5")}
            >
              <Plus className="h-3.5 w-3.5" /> Nueva aula
            </Link>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Recycle,  color: "#00897B", surface: "bg-[#E0F2F1]", value: Number(impact.total_scans).toLocaleString("es-PE"),       label: "Escaneos totales"  },
          { icon: Leaf,     color: "#1565C0", surface: "bg-[#E3F2FD]", value: Number(impact.total_co2_kg).toFixed(1) + " kg",            label: "CO₂ evitado"       },
          { icon: Zap,      color: "#00897B", surface: "bg-[#E0F2F1]", value: Number(impact.total_waste_kg).toFixed(1) + " kg",          label: "Residuos reciclados" },
          { icon: Users,    color: "#1565C0", surface: "bg-[#E3F2FD]", value: Number(impact.active_users).toLocaleString("es-PE"),        label: "Usuarios activos"  },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl bg-white border border-border p-4">
            <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-3", m.surface)}>
              <m.icon className="h-4.5 w-4.5" style={{ color: m.color }} />
            </div>
            <p className="text-xl font-bold font-mono text-[#1A1A2E] leading-none">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Ranking de aulas / comunidades */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {isSchool ? "Ranking de aulas" : "Top comunidades"}
            </h2>
            {isSchool && (
              <Link href="/institution/classrooms" className="text-xs text-[#00897B] font-medium hover:underline flex items-center gap-0.5">
                Ver todas <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {classroomBoard.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isSchool ? "Aún no hay aulas con actividad" : "Aún no hay datos de comunidades"}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
              {classroomBoard.map((cls, i) => {
                const pct = maxPoints > 0 ? (Number(cls.total_points) / maxPoints) * 100 : 0
                return (
                  <div key={cls.classroom_id} className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={cn(
                        "text-xs font-bold font-mono w-5 text-center",
                        i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                      )}>
                        #{cls.rank}
                      </span>
                      <span className="text-sm font-medium text-[#1A1A2E] flex-1 truncate">{cls.classroom_name}</span>
                      <span className="text-xs text-muted-foreground">{cls.member_count} miembros</span>
                      <span className="text-sm font-bold font-mono text-[#00897B]">{Number(cls.total_points).toLocaleString("es-PE")}</span>
                    </div>
                    <div className="ml-8 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00897B] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Top usuarios */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Top recicladores
          </h2>

          {topUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aún no hay usuarios con actividad</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
              {topUsers.map((u, i) => (
                <div key={u.user_id} className="flex items-center gap-3 px-4 py-3">
                  <span className={cn(
                    "text-xs font-bold font-mono w-5 text-center shrink-0",
                    i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    #{u.rank}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#00897B] text-sm font-bold shrink-0">
                    {(u.full_name ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A2E] truncate">{u.full_name ?? "Usuario"}</p>
                    {u.classroom_name && (
                      <p className="text-xs text-muted-foreground">{u.classroom_name}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold font-mono text-[#00897B] shrink-0">
                    {Number(u.points).toLocaleString("es-PE")} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Retos y actividad reciente */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Retos */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Retos</h2>
            <CreateChallengeButton />
          </div>

          {challenges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay retos creados aún</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
              {challenges.map((ch) => {
                const active = ch.active && new Date(ch.deadline) > new Date()
                return (
                  <div key={ch.id} className="px-4 py-3 flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 h-2 w-2 rounded-full shrink-0",
                      active ? "bg-[#00897B]" : "bg-muted-foreground/30"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A2E] truncate">{ch.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          active ? "bg-[#E0F2F1] text-[#00897B]" : "bg-muted text-muted-foreground"
                        )}>
                          {active ? "Activo" : deadlineDays(ch.deadline)}
                        </span>
                        {active && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {deadlineDays(ch.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-[#00897B] shrink-0">+{ch.points}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Actividad reciente */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Actividad reciente
          </h2>

          {recentScans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center">
              <Recycle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aún no hay escaneos en tu organización</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                    CATEGORY_COLORS[scan.waste_category as WasteCategory] ?? "bg-muted text-muted-foreground"
                  )}>
                    {scan.waste_category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A2E] truncate">{scan.waste_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(scan.profiles) ? scan.profiles[0]?.full_name : (scan.profiles as { full_name: string | null } | null)?.full_name ?? "Usuario"} · {formatDate(scan.created_at)}
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#00897B] shrink-0">+{scan.points_earned}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
