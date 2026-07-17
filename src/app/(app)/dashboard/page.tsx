import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Leaf, Zap, Weight, Trophy, Camera, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import {
  getProfile,
  getImpactTotals,
  getRecentScans,
  getActiveChallenge,
} from "@/features/citizen/citizenService"
import type { WasteCategory } from "@/types/database"

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
  plastic:    "#1565C0",
  paper:      "#F59E0B",
  glass:      "#06B6D4",
  metal:      "#64748B",
  organic:    "#00897B",
  electronic: "#7C3AED",
  hazardous:  "#DC2626",
  other:      "#EA580C",
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso))
}

function getDaysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / 86_400_000)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // async-parallel: start independent fetches immediately, await profile early
  // to unblock challenge fetch, then resolve all together (vercel-react-best-practices §1.2)
  const profileP = getProfile(user.id)
  const impactP  = getImpactTotals(user.id)
  const scansP   = getRecentScans(user.id, 5)

  const profile = await profileP
  if (!profile) redirect("/auth/login")

  const challengeP = profile.org_id
    ? getActiveChallenge(profile.org_id)
    : Promise.resolve(null)

  const [impact, scans, challenge] = await Promise.all([impactP, scansP, challengeP])

  const firstName = profile.full_name?.split(" ")[0] ?? "Usuario"
  const daysLeft  = challenge ? getDaysLeft(challenge.deadline) : 0

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu  { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .d1  { animation-delay: 0.04s; }
        .d2  { animation-delay: 0.11s; }
        .d3  { animation-delay: 0.18s; }
        .d4  { animation-delay: 0.25s; }
        .d5  { animation-delay: 0.32s; }

        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0   rgba(0,137,123,0.4); }
          60%       { box-shadow: 0 0 0 10px rgba(0,137,123,0);   }
        }
        .scan-ring { animation: ringPulse 2.6s ease-in-out infinite; border-radius: 16px; }

        .scan-btn:hover { filter: brightness(1.07); transform: translateY(-1px); }
        .scan-btn { transition: all 0.22s ease; }

        .history-row:hover { background: rgba(0,137,123,0.03) !important; }
        .history-row { transition: background 0.15s ease; }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Saludo ── */}
        <div className="fu d1">
          <p style={{ fontSize: 13, color: 'rgba(26,26,46,0.38)', fontWeight: 500 }}>{greeting()},</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.025em', lineHeight: 1.15, marginTop: 1 }}>
            {firstName}
          </h1>
        </div>

        {/* ── Métricas ── */}
        <div className="fu d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <MetricCard
            icon={<Zap className="h-4 w-4 text-[#00897B]" />}
            value={profile.points.toLocaleString("es-PE")}
            label="EcoPuntos"
            rgb="0,137,123"
            accent="#00897B"
          />
          <MetricCard
            icon={<Leaf className="h-4 w-4 text-[#1565C0]" />}
            value={impact.co2_saved_kg.toFixed(1)}
            label="kg CO₂"
            sublabel="evitado"
            rgb="21,101,192"
            accent="#1565C0"
          />
          <MetricCard
            icon={<Weight className="h-4 w-4 text-[#00897B]" />}
            value={impact.waste_kg.toFixed(1)}
            label="kg"
            sublabel="reciclados"
            rgb="0,137,123"
            accent="#00897B"
          />
        </div>

        {/* ── Reto activo ── */}
        <section className="fu d3">
          {challenge ? (
            <div style={{
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(0,137,123,0.92) 0%, rgba(0,95,87,0.9) 100%)',
              padding: '20px',
              position: 'relative', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.24)',
              boxShadow: '0 18px 48px rgba(0,137,123,0.22), inset 0 1px 0 rgba(255,255,255,0.22)',
              backdropFilter: 'blur(18px) saturate(145%)',
              WebkitBackdropFilter: 'blur(18px) saturate(145%)',
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -24, left: -24, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Reto activo</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{challenge.title}</p>
                  </div>
                  <div style={{
                    padding: '8px 12px', borderRadius: 100, textAlign: 'center', flexShrink: 0,
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>+{challenge.points}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>pts</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 14 }}>{challenge.description}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    {daysLeft <= 0 ? "Vence hoy" : `${daysLeft} día${daysLeft !== 1 ? "s" : ""} restantes`}
                  </span>
                  {daysLeft > 0 && daysLeft <= 2 && (
                    <span style={{
                      marginLeft: 4, padding: '2px 8px', borderRadius: 100, fontSize: 9,
                      fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase',
                      background: 'rgba(239,83,80,0.22)', border: '1px solid rgba(239,83,80,0.35)',
                      color: '#FF8A80',
                    }}>
                      ¡Urgente!
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              borderRadius: 20, border: '1px dashed rgba(0,0,0,0.11)',
              background: 'rgba(255,255,255,0.30)', padding: '28px', textAlign: 'center',
              backdropFilter: 'blur(28px) saturate(165%)',
              WebkitBackdropFilter: 'blur(28px) saturate(165%)',
              boxShadow: '0 20px 54px rgba(58,68,151,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
            }}>
              <Trophy className="h-8 w-8 mx-auto mb-2" style={{ color: 'rgba(0,0,0,0.13)' }} />
              <p style={{ fontSize: 14, color: 'rgba(26,26,46,0.4)' }}>
                {profile.org_id
                  ? "No hay retos activos en este momento"
                  : "Únete a una institución para ver retos"}
              </p>
            </div>
          )}
        </section>

        {/* ── Escanear ── */}
        <div className="fu d4">
          <Link
            href="/scan"
            className="scan-btn scan-ring"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '15px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #00897B 0%, #005F57 100%)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              textDecoration: 'none',
              border: '1px solid rgba(0,229,180,0.16)',
              boxShadow: '0 4px 16px rgba(0,137,123,0.28)',
            }}
          >
            <Camera className="h-5 w-5" />
            Escanear residuo
          </Link>
        </div>

        {/* ── Historial ── */}
        <section className="fu d5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(26,26,46,0.35)', letterSpacing: '.09em', textTransform: 'uppercase' }}>
              Historial reciente
            </h2>
            {scans.length > 0 && (
              <Link href="/scan" style={{ fontSize: 12, color: '#00897B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
                Ver todo <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {scans.length === 0 ? (
            <div style={{
              borderRadius: 20, border: '1px dashed rgba(0,0,0,0.11)',
              background: 'rgba(255,255,255,0.30)', padding: '36px', textAlign: 'center',
              backdropFilter: 'blur(28px) saturate(165%)',
              WebkitBackdropFilter: 'blur(28px) saturate(165%)',
              boxShadow: '0 20px 54px rgba(58,68,151,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
            }}>
              <Camera className="h-10 w-10 mx-auto mb-3" style={{ color: 'rgba(0,0,0,0.11)' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>Aún no has reciclado</p>
              <p style={{ fontSize: 13, color: 'rgba(26,26,46,0.4)', lineHeight: 1.55 }}>
                Escanea tu primer residuo para empezar a acumular puntos
              </p>
            </div>
          ) : (
            <div style={{
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.66)',
              background: 'rgba(255,255,255,0.40)',
              overflow: 'hidden',
              boxShadow: '0 22px 62px rgba(58,68,151,0.14), inset 0 1px 0 rgba(255,255,255,0.74)',
              backdropFilter: 'blur(30px) saturate(170%)',
              WebkitBackdropFilter: 'blur(30px) saturate(170%)',
            }}>
              {scans.map((scan, i) => {
                const catColor = CATEGORY_COLORS[scan.waste_category as WasteCategory] ?? '#00897B'
                return (
                  <div
                    key={scan.id}
                    className="history-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 16px',
                      borderBottom: i < scans.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                      borderLeft: `3px solid ${catColor}`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scan.waste_name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
                          background: `${catColor}16`, color: catColor,
                          border: `1px solid ${catColor}2A`,
                        }}>
                          {CATEGORY_LABELS[scan.waste_category as WasteCategory]}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(26,26,46,0.32)' }}>{formatDate(scan.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#00897B', fontVariantNumeric: 'tabular-nums', display: 'block' }}>
                        +{scan.points_earned}
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(26,26,46,0.3)' }}>pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </>
  )
}

function MetricCard({ icon, value, label, sublabel, rgb, accent }: {
  icon:      React.ReactNode
  value:     string
  label:     string
  sublabel?: string
  rgb:       string
  accent:    string
}) {
  return (
    <div style={{
      borderRadius: 18,
      background: `linear-gradient(145deg, rgba(255,255,255,0.36) 0%, rgba(${rgb},0.12) 100%)`,
      border: `1px solid rgba(255,255,255,0.58)`,
      padding: '14px 12px',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 20px 48px rgba(${rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.74)`,
      backdropFilter: 'blur(30px) saturate(170%)',
      WebkitBackdropFilter: 'blur(30px) saturate(170%)',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: `rgba(${rgb},0.12)`,
        border: `1px solid rgba(${rgb},0.18)`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
          {value}
        </p>
        <p style={{ fontSize: 10.5, color: 'rgba(26,26,46,0.38)', marginTop: 3, lineHeight: 1.4 }}>
          {label}{sublabel && <><br />{sublabel}</>}
        </p>
      </div>
    </div>
  )
}
