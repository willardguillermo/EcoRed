"use client"

import { FileDown, Printer, Leaf, Recycle, Users, TrendingUp } from "lucide-react"

type OrgDetails = {
  name: string
  type: string
  district: string | null
  region: string | null
}

type Impact = {
  total_scans:   number
  total_co2_kg:  number
  total_waste_kg: number
  active_users:  number
}

type ClassroomRow = {
  rank:           number | null
  classroom_name: string | null
  total_points:   number | null
  member_count:   number | null
}

type UserRow = {
  rank:           number | null
  full_name:      string | null
  points:         number | null
  classroom_name: string | null
}

type Challenge = {
  id:          string
  title:       string
  points:      number
  deadline:    string
  active:      boolean
}

type Category = {
  category: string
  count:    number
  pct:      number
}

type Props = {
  org:          OrgDetails
  impact:       Impact
  classrooms:   ClassroomRow[]
  topUsers:     UserRow[]
  challenges:   Challenge[]
  categories:   Category[]
  generatedAt:  string
}

const CATEGORY_ES: Record<string, string> = {
  plastic:    "Plástico",
  paper:      "Papel / Cartón",
  glass:      "Vidrio",
  metal:      "Metal",
  organic:    "Orgánico",
  electronic: "Electrónico",
  hazardous:  "Peligroso",
  other:      "Otro",
}

const CATEGORY_COLOR: Record<string, string> = {
  plastic:    "#2196F3",
  paper:      "#FFC107",
  glass:      "#00BCD4",
  metal:      "#9E9E9E",
  organic:    "#4CAF50",
  electronic: "#9C27B0",
  hazardous:  "#F44336",
  other:      "#FF9800",
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso))
}

function deadlineDays(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / 86_400_000)
  if (days < 0)   return "Vencido"
  if (days === 0) return "Vence hoy"
  return `${days} días`
}

export function ReportsClient({ org, impact, classrooms, topUsers, challenges, categories, generatedAt }: Props) {
  const isSchool = org.type === "school"

  function handlePrint() {
    window.print()
  }

  return (
    <>
      {/* Print styles injected globally */}
      <style>{`
        @media print {
          aside, header, nav, .print-hide { display: none !important; }
          main { overflow: visible !important; }
          html, body { height: auto !important; overflow: visible !important; background: white !important; }
          .print-page-break { page-break-before: always; break-before: page; }
          .report-root { background: white !important; max-width: 100% !important; padding: 0 !important; }
          @page { margin: 18mm 15mm; }
        }
      `}</style>

      <div className="report-root max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── Action bar ── */}
        <div className="print-hide flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">Reporte institucional</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Generado el {fmtDate(generatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-sm font-semibold transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* ── Cover header (visible on print too) ── */}
        <div className="rounded-2xl bg-[#00897B] text-white px-6 py-5 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-0.5">
              Reporte Ambiental · EcoRed
            </p>
            <h2 className="text-xl font-bold leading-tight">{org.name}</h2>
            <p className="text-sm text-white/80 mt-0.5">
              {[org.district, org.region].filter(Boolean).join(", ")} ·{" "}
              {isSchool ? "Institución educativa" : "Municipio"} ·{" "}
              {fmtDate(generatedAt)}
            </p>
          </div>
        </div>

        {/* ── Impact metrics ── */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Impacto ambiental acumulado
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Recycle,    color: "#00897B", bg: "#E0F2F1", value: Number(impact.total_scans).toLocaleString("es-PE"),       label: "Escaneos totales",    unit: "" },
              { icon: Leaf,       color: "#1565C0", bg: "#E3F2FD", value: Number(impact.total_co2_kg).toFixed(2),                   label: "CO₂ evitado",         unit: "kg" },
              { icon: TrendingUp, color: "#00897B", bg: "#E0F2F1", value: Number(impact.total_waste_kg).toFixed(2),                 label: "Residuos reciclados",  unit: "kg" },
              { icon: Users,      color: "#1565C0", bg: "#E3F2FD", value: Number(impact.active_users).toLocaleString("es-PE"),      label: "Usuarios activos",    unit: "" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl bg-white border border-border p-4">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: m.bg }}
                >
                  <m.icon className="h-[18px] w-[18px]" style={{ color: m.color }} />
                </div>
                <p className="text-xl font-bold font-mono text-[#1A1A2E] leading-none">
                  {m.value}
                  {m.unit && <span className="text-sm font-semibold ml-1 text-muted-foreground">{m.unit}</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">

          {/* ── Classroom ranking ── */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {isSchool ? "Ranking de aulas" : "Top comunidades"}
            </h3>
            {classrooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center">
                <p className="text-sm text-muted-foreground">Sin datos aún</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-10">#</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Aula</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Miembros</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {classrooms.map((cls, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-bold">
                          {cls.rank ?? i + 1}
                        </td>
                        <td className="px-3 py-3 font-medium text-[#1A1A2E]">
                          {cls.classroom_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {cls.member_count ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-[#00897B]">
                          {Number(cls.total_points ?? 0).toLocaleString("es-PE")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Top recyclers ── */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Top recicladores
            </h3>
            {topUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center">
                <p className="text-sm text-muted-foreground">Sin datos aún</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-10">#</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Nombre</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Aula</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-bold">
                          {u.rank ?? i + 1}
                        </td>
                        <td className="px-3 py-3 font-medium text-[#1A1A2E]">
                          {u.full_name ?? "Usuario"}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground hidden md:table-cell text-xs">
                          {u.classroom_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-[#00897B]">
                          {Number(u.points ?? 0).toLocaleString("es-PE")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* ── Category breakdown ── */}
        {categories.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Distribución por categoría de residuos
            </h3>
            <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
              {categories.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#1A1A2E]">
                      {CATEGORY_ES[cat.category] ?? cat.category}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {cat.count} escaneo{cat.count !== 1 ? "s" : ""} · {cat.pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cat.pct}%`,
                        background: CATEGORY_COLOR[cat.category] ?? "#00897B",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Challenges ── */}
        {challenges.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Retos del período
            </h3>
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Reto</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Puntos</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Vence en</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {challenges.map((ch) => {
                    const active = ch.active && new Date(ch.deadline) > new Date()
                    return (
                      <tr key={ch.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A1A2E]">{ch.title}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#00897B]">+{ch.points}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                            active ? "bg-[#E0F2F1] text-[#00897B]" : "bg-muted text-muted-foreground"
                          }`}>
                            {active ? "Activo" : "Cerrado"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                          {deadlineDays(ch.deadline)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Generado por <strong className="text-[#00897B]">EcoRed</strong> · {fmtDate(generatedAt)}</span>
          <span>Plataforma de reciclaje comunitario con IA · Perú</span>
        </footer>
      </div>
    </>
  )
}
