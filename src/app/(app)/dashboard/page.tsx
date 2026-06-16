import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Leaf, Zap, Weight, Trophy, Camera, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  getProfile,
  getImpactTotals,
  getRecentScans,
  getActiveChallenge,
} from "@/features/citizen/citizenService"
import type { WasteCategory } from "@/types/database"
import { buttonVariants } from "@/components/ui/button"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

const CATEGORY_LABELS: Record<WasteCategory, string> = {
  plastic:    "Plástico",
  paper:      "Papel",
  glass:      "Vidrio",
  metal:      "Metal",
  organic:    "Orgánico",
  electronic: "Electrónico",
  hazardous:  "Peligroso",
  other:      "Otro",
}

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
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [profile, impact, scans] = await Promise.all([
    getProfile(supabase, user.id),
    getImpactTotals(supabase, user.id),
    getRecentScans(supabase, user.id, 5),
  ])

  if (!profile) redirect("/auth/login")

  const challenge = profile.org_id
    ? await getActiveChallenge(supabase, profile.org_id)
    : null

  const firstName = profile.full_name?.split(" ")[0] ?? "Usuario"

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Saludo */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">{firstName} 👋</h1>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          icon={<Zap className="h-5 w-5 text-[#00897B]" />}
          surface="bg-[#E0F2F1]"
          value={profile.points.toLocaleString("es-PE")}
          label="EcoPuntos"
        />
        <MetricCard
          icon={<Leaf className="h-5 w-5 text-[#1565C0]" />}
          surface="bg-[#E3F2FD]"
          value={impact.co2_saved_kg.toFixed(1)}
          label="kg CO₂"
          sublabel="evitado"
        />
        <MetricCard
          icon={<Weight className="h-5 w-5 text-[#00897B]" />}
          surface="bg-[#E0F2F1]"
          value={impact.waste_kg.toFixed(1)}
          label="kg"
          sublabel="reciclados"
        />
      </div>

      {/* Reto semanal */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Reto activo
        </h2>
        {challenge ? (
          <div className="rounded-2xl bg-[#00897B] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-bold text-lg leading-tight mb-1">{challenge.title}</p>
                <p className="text-white/80 text-sm leading-relaxed">{challenge.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-2xl font-bold font-mono">+{challenge.points}</div>
                <div className="text-white/70 text-xs">puntos</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-white/70 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Vence {formatDate(challenge.deadline)}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white p-5 text-center">
            <Trophy className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {profile.org_id
                ? "No hay retos activos en este momento"
                : "Únete a una institución para ver retos"}
            </p>
          </div>
        )}
      </section>

      {/* Acción rápida de escanear */}
      <Link
        href="/scan"
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full justify-center bg-[#00897B] hover:bg-[#00796B] text-white h-13 text-base font-semibold gap-2"
        )}
      >
        <Camera className="h-5 w-5" />
        Escanear residuo
      </Link>

      {/* Historial reciente */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Historial reciente
          </h2>
          {scans.length > 0 && (
            <Link href="/scan" className="text-xs text-[#00897B] font-medium hover:underline flex items-center gap-0.5">
              Ver todo <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {scans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
            <Camera className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Aún no has reciclado</p>
            <p className="text-xs text-muted-foreground">
              Escanea tu primer residuo para empezar a acumular puntos
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
            {scans.map((scan) => (
              <div key={scan.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{scan.waste_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                      CATEGORY_COLORS[scan.waste_category as WasteCategory]
                    )}>
                      {CATEGORY_LABELS[scan.waste_category as WasteCategory]}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(scan.created_at)}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold font-mono text-[#00897B]">
                    +{scan.points_earned}
                  </span>
                  <p className="text-[10px] text-muted-foreground">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function MetricCard({
  icon, surface, value, label, sublabel,
}: {
  icon:      React.ReactNode
  surface:   string
  value:     string
  label:     string
  sublabel?: string
}) {
  return (
    <div className="rounded-2xl bg-white border border-border p-4 flex flex-col gap-2">
      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", surface)}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold font-mono text-[#1A1A2E] leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}{sublabel && <span className="block">{sublabel}</span>}</p>
      </div>
    </div>
  )
}
