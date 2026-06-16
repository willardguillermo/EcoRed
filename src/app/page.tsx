import Link from "next/link"
import { Leaf, Building2, Users, BarChart3, Recycle, ArrowRight, Zap, Globe } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00897B]">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[#1A1A2E] tracking-tight">EcoRed</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Cómo funciona</a>
            <a href="#para-quien" className="hover:text-foreground transition-colors">Para quién</a>
            <a href="#impacto" className="hover:text-foreground transition-colors">Impacto</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-[#00897B] hover:bg-[#00796B] text-white"
              )}
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 md:py-28 text-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-[#E0F2F1] text-[#00897B] border-0 px-4 py-1.5 text-sm font-medium"
          >
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            IA al servicio del planeta
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1A1A2E] leading-[1.1] mb-6">
            Tu comunidad,{" "}
            <span className="text-[#00897B]">más verde</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
            EcoRed conecta ciudadanos, colegios y municipios para reciclar mejor. Escanea residuos con IA,
            mide tu impacto real y compite con tu comunidad.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#00897B] hover:bg-[#00796B] text-white px-8 h-12 text-base font-semibold"
              )}
            >
              Empezar gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "px-8 h-12 text-base border-border"
              )}
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "3 roles", label: "Ciudadano · Colegio · Municipio" },
              { value: "IA", label: "Reconocimiento de residuos" },
              { value: "Realtime", label: "Rankings en vivo" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-[#E0F2F1] p-4">
                <div className="text-xl font-bold text-[#00897B]">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="bg-[#F5F5F5] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-4">
                Tres pasos para reciclar mejor
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Sin complicaciones. Desde el primer escaneo hasta el impacto colectivo.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Recycle,
                  step: "01",
                  title: "Escanea el residuo",
                  desc: "Toma una foto y la IA identifica el material, si es reciclable y cómo desecharlo correctamente.",
                  color: "#00897B",
                  surface: "#E0F2F1",
                },
                {
                  icon: BarChart3,
                  step: "02",
                  title: "Acumula impacto",
                  desc: "Cada escaneo suma EcoPuntos y registra CO₂ evitado. Ve tu huella ambiental crecer en tiempo real.",
                  color: "#1565C0",
                  surface: "#E3F2FD",
                },
                {
                  icon: Users,
                  step: "03",
                  title: "Compite en comunidad",
                  desc: "Únete a tu aula, colegio o municipio. El leaderboard muestra quién lidera el cambio.",
                  color: "#00897B",
                  surface: "#E0F2F1",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl bg-white border border-border p-8">
                  <div
                    className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: item.surface }}
                  >
                    <item.icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mb-2">{item.step}</div>
                  <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Para quién */}
        <section id="para-quien" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-4">
                Diseñado para todos
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Escala desde un ciudadano hasta toda una ciudad.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  role: "Ciudadano",
                  badge: "Para ti",
                  badgeColor: "#00897B",
                  badgeBg: "#E0F2F1",
                  features: [
                    "Escanea residuos con IA",
                    "Consulta al EcoAsistente",
                    "Ve tu impacto personal",
                    "Retos semanales",
                    "Ranking de tu comunidad",
                  ],
                },
                {
                  icon: Building2,
                  role: "Colegio",
                  badge: "Institución",
                  badgeColor: "#1565C0",
                  badgeBg: "#E3F2FD",
                  features: [
                    "Dashboard de aulas",
                    "QR de acceso por salón",
                    "Ranking entre clases",
                    "Retos escolares",
                    "Reportes descargables",
                  ],
                },
                {
                  icon: Globe,
                  role: "Municipio",
                  badge: "Admin local",
                  badgeColor: "#1565C0",
                  badgeBg: "#E3F2FD",
                  features: [
                    "Mapa de puntos de acopio",
                    "Impacto del distrito",
                    "Métricas por comunidad",
                    "Campañas de reciclaje",
                    "Exportación de datos",
                  ],
                },
              ].map((card) => (
                <div
                  key={card.role}
                  className="rounded-2xl border border-border bg-white p-8 flex flex-col"
                >
                  <div
                    className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: card.badgeBg }}
                  >
                    <card.icon className="h-5 w-5" style={{ color: card.badgeColor }} />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-[#1A1A2E]">{card.role}</h3>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ color: card.badgeColor, backgroundColor: card.badgeBg }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div
                          className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: card.badgeColor }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className={cn(
                      buttonVariants(),
                      "mt-6 w-full justify-center text-white"
                    )}
                    style={{ backgroundColor: card.badgeColor }}
                  >
                    Empezar →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impacto / CTA final */}
        <section id="impacto" className="bg-[#00897B] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              El cambio empieza en tu comunidad
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
              Únete a EcoRed y convierte cada residuo en datos reales de impacto ambiental.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-[#00897B] hover:bg-white/90 px-8 h-12 text-base font-semibold"
                )}
              >
                Crear cuenta gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/40 text-white hover:bg-white/10 px-8 h-12 text-base bg-transparent"
                )}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#00897B]">
              <Leaf className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">EcoRed</span>
            <span>— Tu comunidad, más verde</span>
          </div>
          <span>QuipuSoft 2026 · Tecsup</span>
        </div>
      </footer>
    </div>
  )
}
