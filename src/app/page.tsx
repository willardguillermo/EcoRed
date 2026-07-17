import Link from "next/link"
import { BarChart3, Camera, CheckCircle2, Leaf, MapPinned, Recycle, Sparkles, UsersRound } from "lucide-react"
import { LandingInteractions } from "@/components/landing/LandingInteractions"

// ── Pixel-art leaf — deterministic noise, SSR-safe ───────────────────────────
function pixelNoise(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function PixelLeaf({ scale = 1 }: { scale?: number }) {
  const COLS = 34, ROWS = 22, CELL = 10 * scale, GAP = 2 * scale

  function inLeaf(col: number, row: number): boolean {
    const cx = (COLS - 1) / 2
    const cy = (ROWS - 1) / 2 * 0.70
    const x = (col - cx) / (COLS * 0.44)
    const y = (row - cy) / (ROWS * 0.44)
    const xr = x * 0.978 - y * 0.208
    const yr = x * 0.208 + y * 0.978
    return (xr * xr) / (0.88 * 0.88) + (yr * yr) / (0.60 * 0.60) < 1
  }

  function inStem(col: number, row: number): boolean {
    const sc = Math.round((COLS - 1) / 2)
    return (col === sc - 1 || col === sc || col === sc + 1)
      && row >= ROWS - 6 && row < ROWS
  }

  type DotCell = { col: number; row: number; size: number; opacity: number; n: number }
  const cells: DotCell[] = []

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!inLeaf(col, row) && !inStem(col, row)) continue
      const n = pixelNoise(col, row)
      cells.push({ col, row, size: CELL * (0.28 + n * 0.72), opacity: 0.12 + n * 0.88, n })
    }
  }

  const W = COLS * (CELL + GAP)
  const H = ROWS * (CELL + GAP)

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: "100%", height: "auto", display: "block" }}>
      {cells.map(({ col, row, size, opacity, n }) => {
        const cx = col * (CELL + GAP) + CELL / 2
        const cy = row * (CELL + GAP) + CELL / 2
        return n > 0.55 ? (
          <circle key={`${col}-${row}`} cx={cx} cy={cy} r={size / 2}
            fill={`rgba(0,137,123,${opacity.toFixed(2)})`} />
        ) : (
          <rect key={`${col}-${row}`} x={cx - size / 2} y={cy - size / 2}
            width={size} height={size} rx={size * 0.18}
            fill={`rgba(0,137,123,${opacity.toFixed(2)})`} />
        )
      })}
    </svg>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────
const MARQUEE = [
  "IE Gran Unidad Escolar", "Municipalidad de Miraflores",
  "IE Colegio Monterrico",  "Municipalidad de San Isidro",
  "IE CBTIS",               "Municipalidad de Barranco",
  "ONG ReciclaPerú",        "IE Colegio Los Álamos",
]

const FEATURES = [
  { title: "Escáner IA",          icon: "📸", bg: "linear-gradient(145deg,#CFFAF4,#99F0E8)", shadow: "0,200,180",
    desc: "Fotografía cualquier residuo y la IA lo clasifica al instante: material, categoría e instrucciones de reciclaje adaptadas al contexto peruano." },
  { title: "Mapa de Acopio",      icon: "🗺️", bg: "linear-gradient(145deg,#FFE0EE,#FFADD1)", shadow: "255,100,180",
    desc: "Encuentra puntos de reciclaje activos cerca de ti en tiempo real. Filtra por tipo de material, institución o distrito." },
  { title: "EcoAsistente IA",     icon: "💬", bg: "linear-gradient(145deg,#D8FDED,#A7F3C8)", shadow: "60,220,140",
    desc: "Chatbot especializado en reciclaje en Perú. Resuelve dudas, sugiere hábitos ecológicos y te conecta con tu impacto acumulado." },
  { title: "Panel Institucional", icon: "📊", bg: "linear-gradient(145deg,#FEF8C0,#FDE58A)", shadow: "240,190,50",
    desc: "Gestiona aulas, crea desafíos de reciclaje y mide el impacto de tu colegio o municipalidad con reportes en tiempo real." },
]

const TIERS = [
  {
    label: "Tier 1", title: "Ciudadano",
    desc: "Para personas que quieren reciclar mejor, acumular puntos y medir su impacto ambiental personal.",
    cta: "Crear cuenta gratis", href: "/auth/register",
    feats: ["Escaneo ilimitado de residuos con IA", "Sistema de puntos por reciclaje", "Mapa de puntos de acopio", "EcoAsistente 24/7", "Historial de impacto personal"],
  },
  {
    label: "Tier 2", title: "Institución Educativa",
    desc: "Convierte tu colegio en un hub de reciclaje con aulas, competencias y reportes de impacto grupal.",
    cta: "Registrar institución", href: "/auth/register",
    feats: ["Todo del plan Ciudadano", "Panel de gestión de aulas y alumnos", "Desafíos y competencias entre clases", "Leaderboard institucional en tiempo real", "Reportes exportables por aula y grado"],
  },
  {
    label: "Tier 3", title: "Municipio",
    desc: "Dashboard completo para gestionar puntos de acopio y visualizar el impacto ambiental del distrito.",
    cta: "Contactar equipo", href: "/auth/register",
    feats: ["Todo del plan Institución", "Gestión de puntos de acopio distritales", "Dashboard de CO₂ y residuos por zona", "Reportes para políticas públicas", "Soporte prioritario y onboarding dedicado"],
  },
]

const FAQS = [
  { q: "¿Mis fotos de escaneo se almacenan?",
    a: "No. Las imágenes se envían a la IA para clasificación y se descartan de inmediato. Solo guardamos el resultado: categoría, material y puntos asignados." },
  { q: "¿Cómo funciona el sistema de puntos?",
    a: "Cada residuo correctamente clasificado otorga puntos según el material — plástico: 15 pts, metal: 25 pts, electrónico: 30 pts. Los puntos se acumulan y aparecen en el leaderboard de tu comunidad." },
  { q: "¿Puede mi colegio unirse gratuitamente?",
    a: "Sí. Al registrarse como institución, el responsable completa el perfil de la organización y puede crear aulas, gestionar estudiantes y lanzar desafíos de reciclaje sin costo adicional." },
  { q: "¿Qué residuos puede identificar la IA?",
    a: "Plástico, papel, vidrio, metal, orgánico, electrónico y residuos peligrosos. La IA indica si el ítem es reciclable, cómo prepararlo y dónde llevarlo en tu distrito." },
  { q: "¿EcoRed funciona sin conexión?",
    a: "El escáner y el asistente requieren conexión. El mapa guarda tus puntos favoritos offline y el historial personal está disponible en caché sin internet." },
]

const STATS = [
  { num: "12,400+", lbl: "Kg de residuos\nclasificados" },
  { num: "8,200+",  lbl: "CO₂ equivalente\nevitado (kg)" },
  { num: "47",      lbl: "Instituciones\nactivas" },
  { num: "3,100+",  lbl: "Ciudadanos\nregistrados" },
]

const CTA_ITEMS = [
  "Sin costos de entrada para ciudadanos e instituciones",
  "Onboarding completo en menos de 5 minutos",
  "IA entrenada para el contexto de reciclaje peruano",
  "Reportes de impacto ambiental en tiempo real",
]

const FLOW_STEPS = [
  {
    label: "01",
    title: "Escaneo IA",
    desc: "El ciudadano toma una foto y EcoRed identifica material, preparación y reciclabilidad.",
    icon: Camera,
  },
  {
    label: "02",
    title: "Comunidad",
    desc: "Cada acción suma EcoPuntos al perfil, aula, colegio o municipio.",
    icon: UsersRound,
  },
  {
    label: "03",
    title: "Gestión",
    desc: "La institución ve rankings, retos y reportes listos para tomar decisiones.",
    icon: BarChart3,
  },
]

const FLOW_METRICS = [
  { value: "4.8s", label: "clasificación promedio" },
  { value: "7", label: "categorías de residuo" },
  { value: "100%", label: "impacto trazable" },
]

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', system-ui, sans-serif; background: #FAFAF8; color: #0A0A0A; -webkit-font-smoothing: antialiased; }

        /* NAV */
        .sg-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 48px;
          display: flex; align-items: center; justify-content: space-between;
          background: transparent; backdrop-filter: blur(0px);
          border-bottom: 1px solid transparent;
          transition: background .45s cubic-bezier(.4,0,.2,1),
                      backdrop-filter .45s cubic-bezier(.4,0,.2,1),
                      border-color .45s cubic-bezier(.4,0,.2,1);
        }
        .sg-nav.scrolled {
          background: rgba(250,250,248,.96); backdrop-filter: blur(20px);
          border-bottom-color: rgba(0,0,0,.07);
        }
        .sg-nav-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: 'DM Serif Display', serif; font-size: 19px;
          color: #0A0A0A; text-decoration: none; letter-spacing: -0.02em;
        }
        .sg-nav-links { display: flex; gap: 2px; list-style: none; align-items: center; }
        .sg-nav-links a {
          font-size: 13px; font-weight: 400; color: #555;
          text-decoration: none; padding: 6px 11px; border-radius: 6px;
          transition: color .18s, background .18s;
        }
        .sg-nav-links a:hover { color: #0A0A0A; background: rgba(0,0,0,.04); }
        .sg-nav-cta { background: #0A0A0A !important; color: #fff !important; border-radius: 100px !important; }
        .sg-nav-cta:hover { background: #00897B !important; }

        /* HERO */
        .sg-hero {
          min-height: 100dvh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 120px 48px 80px; text-align: center;
        }
        .sg-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: #00897B; margin-bottom: 22px;
        }
        .sg-h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(44px, 6.5vw, 90px);
          font-weight: 400; line-height: 1.0; letter-spacing: -.038em;
          color: #0A0A0A; max-width: 820px; margin-bottom: 24px;
        }
        .sg-h1 em { font-style: italic; color: #00897B; }
        .sg-hero-sub {
          font-size: 16px; color: #6B6B6B; max-width: 400px;
          line-height: 1.65; margin-bottom: 36px; font-weight: 400;
        }
        .sg-btns { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: center; }
        .sg-btn-out {
          font-size: 13px; font-weight: 500; color: #3D3D3D; text-decoration: none;
          padding: 10px 22px; border: 1px solid rgba(0,0,0,.16); border-radius: 100px;
          transition: border-color .2s, color .2s;
        }
        .sg-btn-out:hover { border-color: #0A0A0A; color: #0A0A0A; }
        .sg-btn-blk {
          font-size: 13px; font-weight: 500; color: #fff; text-decoration: none;
          padding: 10px 22px; background: #0A0A0A; border-radius: 100px;
          transition: background .2s;
        }
        .sg-btn-blk:hover { background: #00897B; }
        .sg-btn-grn {
          font-size: 14px; font-weight: 500; color: #fff; text-decoration: none;
          padding: 13px 32px; background: #00897B; border-radius: 100px;
          display: inline-block; transition: background .2s;
        }
        .sg-btn-grn:hover { background: #006B61; }

        /* Hero art */
        .sg-art-wrap { margin-top: 56px; position: relative; width: min(540px, 90vw); }
        .sg-art-frame {
          border: 1px solid rgba(0,0,0,.08); border-radius: 8px;
          background: #EEF9F5; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          padding: 28px 20px 28px;
        }
        .sg-corner {
          position: absolute; width: 18px; height: 18px;
          border-color: rgba(0,137,123,.5); border-style: solid; z-index: 2;
        }
        .sg-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .sg-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
        .sg-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
        .sg-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
        .sg-art-caption {
          margin-top: 14px; text-align: center;
          font-size: 11px; color: #B0B0B0; letter-spacing: .04em;
        }

        /* MARQUEE */
        .sg-marquee-wrap {
          border-top: 1px solid rgba(0,0,0,.07);
          border-bottom: 1px solid rgba(0,0,0,.07);
          overflow: hidden;
          background: #F4F8F6;
        }
        .sg-marquee-head {
          max-width: 1120px; margin: 0 auto;
          padding: 16px 48px 13px;
          display: flex; align-items: center; justify-content: space-between; gap: 24px;
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .sg-marquee-label {
          font-size: 10px; font-weight: 800;
          letter-spacing: .11em; color: #00897B; text-transform: uppercase;
          white-space: nowrap;
        }
        .sg-marquee-note {
          font-size: 13px; color: #62726E; text-align: right;
          max-width: 420px; line-height: 1.45;
        }
        .sg-marquee-row { padding: 12px 0; }
        .sg-marquee-track {
          display: flex; width: max-content;
          animation: sgMarq 34s linear infinite;
        }
        @keyframes sgMarq {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .sg-marquee-item {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; color: #7A8783;
          white-space: nowrap; padding: 0 26px;
        }
        .sg-marquee-item::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: #00897B; opacity: .55; flex-shrink: 0;
        }

        /* DARK SECTION */
        .sg-dark {
          background:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(180deg, #0C1412 0%, #08100E 100%);
          background-size: 44px 44px, 44px 44px, auto;
          color: #FAFAF8;
          padding: 68px 48px 74px;
          position: relative; overflow: hidden;
        }
        .sg-dark::before {
          content: ""; position: absolute; inset: 0;
          background-image: linear-gradient(120deg, rgba(0,137,123,.13), transparent 42%, rgba(21,101,192,.10));
          opacity: .7; pointer-events: none;
        }
        .sg-dark-shell {
          position: relative; z-index: 1;
          max-width: 1080px; margin: 0 auto;
          display: grid; grid-template-columns: .9fr 1.1fr; gap: 38px;
          align-items: center;
        }
        .sg-dark-copy { text-align: left; }
        .sg-dark-kicker {
          display: inline-flex; align-items: center; gap: 8px;
          margin-bottom: 14px;
          font-size: 11px; font-weight: 800; letter-spacing: .1em;
          text-transform: uppercase; color: #81D8CA;
        }
        .sg-dark-kicker svg { width: 15px; height: 15px; }
        .sg-dark h2 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(34px, 4.2vw, 56px);
          font-weight: 400; letter-spacing: -.03em; line-height: 1.05;
          max-width: 520px; margin-bottom: 16px;
          text-wrap: balance;
        }
        .sg-dark-copy > p {
          font-size: 15px; color: rgba(255,255,255,.66);
          max-width: 500px; line-height: 1.75;
          text-wrap: pretty;
        }
        .sg-dark-proof {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px; margin-top: 22px; max-width: 500px;
        }
        .sg-dark-proof-item {
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.045);
          padding: 12px 13px; border-radius: 12px;
        }
        .sg-dark-proof-value {
          display: block; color: #C8FFF6; font-size: 20px;
          font-weight: 800; letter-spacing: -.02em; font-variant-numeric: tabular-nums;
        }
        .sg-dark-proof-label {
          display: block; margin-top: 4px; color: rgba(255,255,255,.45);
          font-size: 11px; line-height: 1.35;
        }
        .sg-flow-panel {
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(8,19,17,.78);
          box-shadow: 0 28px 80px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.08);
          border-radius: 22px;
          padding: 18px;
          backdrop-filter: blur(18px);
        }
        .sg-flow-top {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,.10);
        }
        .sg-flow-status {
          display: inline-flex; align-items: center; gap: 8px;
          color: #C8FFF6; font-size: 12px; font-weight: 800;
          letter-spacing: .08em; text-transform: uppercase;
        }
        .sg-flow-status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #65D6C8; box-shadow: 0 0 0 5px rgba(101,214,200,.12);
        }
        .sg-flow-place {
          display: flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,.48); font-size: 12px;
        }
        .sg-flow-place svg { width: 15px; height: 15px; color: #65D6C8; }
        .sg-flow-steps {
          display: grid; gap: 10px; padding: 14px 0;
        }
        .sg-flow-step {
          display: grid; grid-template-columns: auto 1fr auto; gap: 14px;
          align-items: center;
          padding: 13px;
          border-radius: 16px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.075);
        }
        .sg-flow-icon {
          width: 36px; height: 36px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(101,214,200,.12); color: #A7FFF2;
        }
        .sg-flow-icon svg { width: 18px; height: 18px; }
        .sg-flow-step h3 {
          margin: 0 0 3px; color: #FFFFFF;
          font-size: 15px; font-weight: 800; letter-spacing: -.01em;
        }
        .sg-flow-step p {
          margin: 0; color: rgba(255,255,255,.52);
          font-size: 13px; line-height: 1.45;
        }
        .sg-flow-label {
          color: rgba(255,255,255,.28);
          font-family: var(--font-geist-mono), monospace;
          font-size: 12px; font-weight: 700;
        }
        .sg-flow-bottom {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          padding-top: 16px; border-top: 1px solid rgba(255,255,255,.10);
        }
        .sg-flow-result {
          min-height: 116px;
          border-radius: 18px;
          padding: 16px;
          background: linear-gradient(145deg, rgba(0,137,123,.22), rgba(21,101,192,.10));
          border: 1px solid rgba(129,216,202,.18);
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .sg-flow-result svg { width: 24px; height: 24px; color: #C8FFF6; }
        .sg-flow-result strong {
          display: block; color: #FFFFFF; font-size: 18px; line-height: 1.08;
          letter-spacing: -.02em;
        }
        .sg-flow-result span {
          display: block; margin-top: 6px; color: rgba(255,255,255,.52);
          font-size: 12px; line-height: 1.45;
        }
        .sg-flow-checks {
          border-radius: 18px;
          padding: 16px;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.075);
          display: flex; flex-direction: column; gap: 12px;
        }
        .sg-flow-check {
          display: flex; align-items: center; gap: 9px;
          color: rgba(255,255,255,.66); font-size: 12px;
        }
        .sg-flow-check svg { width: 15px; height: 15px; color: #81D8CA; flex-shrink: 0; }

        /* FEATURES */
        .sg-section { max-width: 1120px; margin: 0 auto; padding: 64px 48px 72px; }
        .sg-section-head {
          display: grid; grid-template-columns: minmax(0, .92fr) minmax(280px, .78fr);
          gap: 44px; align-items: end; margin-bottom: 30px;
        }
        .sg-section-title { min-width: 0; }
        .sg-label {
          display: inline-block; font-size: 11px; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          color: #fff; background: #0A0A0A;
          padding: 4px 10px; border-radius: 3px; margin-bottom: 16px;
        }
        .sg-h2 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400; letter-spacing: -.03em; line-height: 1.08;
          color: #0A0A0A; max-width: 540px; margin-bottom: 0;
          text-wrap: balance;
        }
        .sg-h2 em { font-style: italic; }
        .sg-sub {
          font-size: 15px; color: #6B6B6B;
          max-width: 480px; line-height: 1.65; margin: 0;
          text-wrap: pretty;
        }
        .sg-grid-2 {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: rgba(0,0,0,.08);
          border: 1px solid rgba(0,0,0,.08); border-radius: 16px; overflow: hidden;
        }
        .sg-feat-card { background: #fff; padding: 30px; }
        .sg-feat-illo {
          height: 124px; border-radius: 10px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px; font-size: 56px;
        }
        .sg-feat-emoji { font-size: 52px; }
        .sg-feat-title {
          font-size: 16px; font-weight: 600; color: #0A0A0A;
          letter-spacing: -.01em; margin-bottom: 8px;
        }
        .sg-feat-desc { font-size: 14px; color: #6B6B6B; line-height: 1.62; }

        /* TIERS */
        .sg-tiers { max-width: 920px; margin: 0 auto; padding: 80px 48px; }
        .sg-tiers-head { text-align: center; margin-bottom: 64px; }
        .sg-tiers-head .sg-h2 { max-width: 100%; margin: 0 auto 12px; }
        .sg-tiers-head p { font-size: 15px; color: #6B6B6B; max-width: 460px; margin: 0 auto; line-height: 1.65; }
        .sg-tier {
          display: grid; grid-template-columns: 220px 1fr;
          gap: 48px; padding: 52px 0;
          border-top: 1px solid rgba(0,0,0,.08);
          align-items: start;
        }
        .sg-tier:last-child { border-bottom: 1px solid rgba(0,0,0,.08); }
        .sg-tier-label {
          display: inline-block; font-size: 10px; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          color: #fff; background: #0A0A0A;
          padding: 3px 9px; border-radius: 3px; margin-bottom: 14px;
        }
        .sg-tier-title {
          font-family: 'DM Serif Display', serif;
          font-size: 27px; font-weight: 400; letter-spacing: -.025em;
          color: #0A0A0A; line-height: 1.15; margin-bottom: 10px;
        }
        .sg-tier-desc { font-size: 14px; color: #6B6B6B; line-height: 1.65; margin-bottom: 24px; }
        .sg-tier-cta {
          font-size: 13px; font-weight: 500; color: #fff;
          background: #00897B; text-decoration: none;
          padding: 10px 22px; border-radius: 100px;
          display: inline-block; transition: background .2s;
        }
        .sg-tier-cta:hover { background: #006B61; }
        .sg-tier-feats { list-style: none; display: flex; flex-direction: column; gap: 2px; }
        .sg-tier-feat {
          padding: 13px 18px; background: #F5F5F4;
          border-radius: 8px; font-size: 14px; color: #3D3D3D;
        }

        /* FAQ */
        .sg-faq {
          max-width: 1120px; margin: 0 auto; padding: 80px 48px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
          align-items: start;
          border-top: 1px solid rgba(0,0,0,.07);
        }
        .sg-faq-l p { font-size: 15px; color: #6B6B6B; line-height: 1.7; margin-top: 14px; max-width: 340px; }
        .sg-faq-r details { border-top: 1px solid rgba(0,0,0,.08); }
        .sg-faq-r details:last-child { border-bottom: 1px solid rgba(0,0,0,.08); }
        .sg-faq-r summary {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 0; font-size: 14px; font-weight: 500; color: #0A0A0A;
          cursor: pointer; list-style: none; user-select: none; gap: 20px;
        }
        .sg-faq-r summary::-webkit-details-marker { display: none; }
        .sg-faq-plus {
          flex-shrink: 0; width: 24px; height: 24px;
          border: 1px solid rgba(0,0,0,.15); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 300; color: #6B6B6B;
          transition: transform .25s, background .2s, border-color .2s, color .2s;
        }
        details[open] .sg-faq-plus {
          transform: rotate(45deg);
          background: #0A0A0A; border-color: #0A0A0A; color: #fff;
        }
        .sg-faq-r details > div {
          padding: 0 0 20px; font-size: 14px; color: #6B6B6B; line-height: 1.7;
        }

        /* CTA */
        .sg-cta {
          max-width: 1120px; margin: 0 auto; padding: 80px 48px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
          align-items: start;
          border-top: 1px solid rgba(0,0,0,.07);
        }
        .sg-cta-l h2 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 4.5vw, 58px);
          font-weight: 400; letter-spacing: -.038em; line-height: 1.0;
          color: #0A0A0A; margin-bottom: 28px;
        }
        .sg-cta-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .sg-cta-list li {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 14px; color: #3D3D3D; line-height: 1.5;
        }
        .sg-check {
          flex-shrink: 0; width: 18px; height: 18px; margin-top: 1px;
          background: #E3F4F0; border: 1.5px solid #00897B;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
        }
        .sg-cta-r {
          background: #0A0A0A; border-radius: 20px; padding: 36px;
          display: flex; flex-direction: column; gap: 24px;
        }
        .sg-cta-r-title {
          font-family: 'DM Serif Display', serif; font-size: 22px;
          font-weight: 400; letter-spacing: -.02em; color: #FAFAF8;
        }
        .sg-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .sg-stat {
          background: rgba(255,255,255,.06); border-radius: 12px; padding: 18px 20px;
        }
        .sg-stat-num {
          font-family: 'DM Serif Display', serif; font-size: 30px;
          font-weight: 400; color: #00C4A1; letter-spacing: -.03em; line-height: 1;
        }
        .sg-stat-lbl { font-size: 11px; color: rgba(255,255,255,.38); margin-top: 4px; line-height: 1.4; }

        /* FOOTER */
        .sg-foot-outer {
          border-top: 1px solid rgba(0,0,0,.07); position: relative; overflow: hidden;
        }
        .sg-foot-leaf {
          position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
          opacity: .045; pointer-events: none; width: 600px;
        }
        .sg-footer { max-width: 1120px; margin: 0 auto; padding: 52px 48px 30px; position: relative; }
        .sg-foot-top {
          display: grid; grid-template-columns: 1.5fr 1fr 1fr;
          gap: 64px; margin-bottom: 48px;
        }
        .sg-foot-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: 'DM Serif Display', serif; font-size: 18px;
          color: #0A0A0A; text-decoration: none;
          letter-spacing: -.02em; margin-bottom: 12px; width: fit-content;
        }
        .sg-foot-brand p { font-size: 13px; color: #9B9B9B; line-height: 1.65; max-width: 240px; }
        .sg-foot-socials { display: flex; gap: 8px; margin-top: 20px; }
        .sg-foot-socials a {
          width: 30px; height: 30px;
          border: 1px solid rgba(0,0,0,.12); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: #6B6B6B; text-decoration: none;
          transition: border-color .2s, color .2s;
        }
        .sg-foot-socials a:hover { border-color: #0A0A0A; color: #0A0A0A; }
        .sg-foot-col h4 {
          font-size: 11px; font-weight: 600; letter-spacing: .07em;
          text-transform: uppercase; color: #9B9B9B; margin-bottom: 16px;
        }
        .sg-foot-col ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
        .sg-foot-col ul a { font-size: 13px; color: #3D3D3D; text-decoration: none; transition: color .2s; }
        .sg-foot-col ul a:hover { color: #0A0A0A; }
        .sg-foot-bottom {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 24px; border-top: 1px solid rgba(0,0,0,.06);
        }
        .sg-foot-bottom span { font-size: 12px; color: #9B9B9B; }

        /* HERO — animación CSS pura, no depende de JS ni de navegación */
        @keyframes heroUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-anim {
          opacity: 1; transform: translateY(0);
        }
        .landing-enhanced .hero-anim {
          animation: heroUp .7s cubic-bezier(.16,1,.3,1) both;
        }
        .hero-anim.visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
          animation: none !important;
        }
        .ha-1 { animation-delay: .08s; }
        .ha-2 { animation-delay: .18s; }
        .ha-3 { animation-delay: .26s; }
        .ha-4 { animation-delay: .34s; }
        .ha-5 { animation-delay: .44s; }

        /* SCROLL REVEAL — sólo para secciones bajo el fold */
        .sr {
          opacity: 1; transform: translateY(0);
          transition: opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1);
        }
        .landing-enhanced .sr {
          opacity: 0; transform: translateY(20px);
        }
        .sr.visible { opacity: 1; transform: translateY(0); }
        .sr-d1 { transition-delay: .06s; } .sr-d2 { transition-delay: .12s; }
        .sr-d3 { transition-delay: .18s; } .sr-d4 { transition-delay: .24s; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .sg-nav { padding: 16px 20px; }
          .sg-nav-links li:not(:last-child) { display: none; }
          .sg-hero { padding: 100px 24px 60px; }
          .sg-section, .sg-tiers { padding: 52px 24px; }
          .sg-marquee-head { padding: 14px 24px 12px; align-items: flex-start; flex-direction: column; gap: 6px; }
          .sg-marquee-note { text-align: left; }
          .sg-dark { padding: 48px 20px 54px; }
          .sg-dark-shell { grid-template-columns: 1fr; gap: 26px; }
          .sg-dark-kicker { margin-bottom: 12px; }
          .sg-dark h2 { font-size: clamp(32px, 10vw, 44px); }
          .sg-dark-copy > p { font-size: 14px; line-height: 1.65; }
          .sg-dark-proof { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 18px; }
          .sg-dark-proof-item { padding: 10px 8px; }
          .sg-dark-proof-value { font-size: 17px; }
          .sg-dark-proof-label { font-size: 9.5px; }
          .sg-flow-panel { padding: 12px; border-radius: 18px; }
          .sg-flow-top { padding-bottom: 11px; }
          .sg-flow-place { display: none; }
          .sg-flow-step { grid-template-columns: auto 1fr; gap: 10px; padding: 11px; }
          .sg-flow-label { display: none; }
          .sg-flow-step h3 { font-size: 14px; }
          .sg-flow-step p { font-size: 12px; line-height: 1.38; }
          .sg-flow-bottom { grid-template-columns: 1fr; }
          .sg-flow-result { min-height: 0; gap: 18px; }
          .sg-flow-checks { gap: 9px; }
          .sg-section-head { grid-template-columns: 1fr; gap: 14px; margin-bottom: 24px; }
          .sg-label { margin-bottom: 12px; }
          .sg-h2 { font-size: clamp(34px, 11vw, 46px); }
          .sg-sub { font-size: 14px; line-height: 1.58; }
          .sg-grid-2 { grid-template-columns: 1fr; }
          .sg-feat-card {
            display: grid; grid-template-columns: 76px 1fr; gap: 16px;
            align-items: center; padding: 18px;
          }
          .sg-feat-illo {
            height: 76px; margin-bottom: 0; border-radius: 14px;
          }
          .sg-feat-emoji { font-size: 32px; }
          .sg-feat-title { font-size: 15px; margin-bottom: 4px; }
          .sg-feat-desc { font-size: 12.5px; line-height: 1.48; }
          .sg-tier { grid-template-columns: 1fr; gap: 24px; }
          .sg-faq { grid-template-columns: 1fr; gap: 40px; padding: 60px 24px; }
          .sg-cta { grid-template-columns: 1fr; gap: 36px; padding: 60px 24px; }
          .sg-foot-top { grid-template-columns: 1fr; gap: 36px; }
          .sg-footer { padding: 48px 24px 28px; }
          .sg-foot-bottom { flex-direction: column; gap: 10px; text-align: center; }
        }

        @media (max-width: 430px) {
          .sg-section { padding: 44px 16px 52px; }
          .sg-dark { padding: 42px 16px 48px; }
          .sg-dark-proof { grid-template-columns: 1fr; }
          .sg-dark-proof-label { font-size: 11px; }
          .sg-flow-step { align-items: start; }
          .sg-flow-icon { width: 34px; height: 34px; }
          .sg-feat-card {
            grid-template-columns: 58px 1fr; gap: 13px; padding: 14px;
          }
          .sg-feat-illo { height: 58px; border-radius: 12px; }
          .sg-feat-emoji { font-size: 25px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav id="main-nav" className="sg-nav">
        <Link href="/" className="sg-nav-logo">
          <Leaf size={17} color="#00897B" />
          EcoRed
        </Link>
        <ul className="sg-nav-links">
          <li><a href="#como-funciona">[Cómo funciona]</a></li>
          <li><a href="#funcionalidades">[Funcionalidades]</a></li>
          <li><a href="#impacto">[Impacto]</a></li>
          <li><a href="#faq">[FAQ]</a></li>
          <li><Link href="/auth/login" className="sg-nav-cta">[Ingresar]</Link></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="sg-hero" id="inicio">
        <p className="sg-eyebrow hero-anim ha-1">EcoRed — Reciclaje inteligente para el Perú</p>
        <h1 className="sg-h1 hero-anim ha-2">
          La nueva era del<br />
          <em>reciclaje comunitario.</em>
        </h1>
        <p className="sg-hero-sub hero-anim ha-3">
          Escanea residuos con IA, conecta con tu comunidad y convierte el reciclaje en impacto ambiental medible.
        </p>
        <div className="sg-btns hero-anim ha-4">
          <a href="#funcionalidades" className="sg-btn-out">[¿Por qué EcoRed?]</a>
          <Link href="/auth/register" className="sg-btn-blk">Empieza gratis</Link>
        </div>

        <div className="sg-art-wrap hero-anim ha-5">
          <span className="sg-corner sg-tl" />
          <span className="sg-corner sg-tr" />
          <span className="sg-corner sg-bl" />
          <span className="sg-corner sg-br" />
          <div className="sg-art-frame">
            <PixelLeaf />
          </div>
          <p className="sg-art-caption">EcoRed · Clasificación de residuos con IA · Perú 2026</p>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="sg-marquee-wrap">
        <div className="sg-marquee-head">
          <p className="sg-marquee-label">Pilotos y comunidades</p>
          <p className="sg-marquee-note">EcoRed está pensado para activarse rápido en aulas, colegios y municipios.</p>
        </div>
        <div className="sg-marquee-row">
          <div className="sg-marquee-track">
            {[...MARQUEE, ...MARQUEE].map((name, i) => (
              <span key={i} className="sg-marquee-item">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── DARK / INTERSECTION ── */}
      <section className="sg-dark" id="como-funciona">
        <div className="sg-dark-shell">
          <div className="sg-dark-copy sr">
            <span className="sg-dark-kicker">
              <Sparkles />
              Cómo funciona
            </span>
            <h2>De una foto a un impacto medible.</h2>
            <p>
              EcoRed convierte una acción cotidiana en datos útiles para estudiantes,
              docentes y municipios: clasifica residuos, acredita puntos y muestra
              qué comunidad está moviendo más reciclaje.
            </p>

            <div className="sg-dark-proof">
              {FLOW_METRICS.map((metric) => (
                <div key={metric.label} className="sg-dark-proof-item">
                  <span className="sg-dark-proof-value">{metric.value}</span>
                  <span className="sg-dark-proof-label">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sg-flow-panel sr">
            <div className="sg-flow-top">
              <span className="sg-flow-status">
                <span className="sg-flow-status-dot" />
                Sistema activo
              </span>
              <span className="sg-flow-place">
                <MapPinned />
                Lima, Perú
              </span>
            </div>

            <div className="sg-flow-steps">
              {FLOW_STEPS.map((step) => (
                <div key={step.label} className="sg-flow-step">
                  <span className="sg-flow-icon">
                    <step.icon />
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                  <span className="sg-flow-label">{step.label}</span>
                </div>
              ))}
            </div>

            <div className="sg-flow-bottom">
              <div className="sg-flow-result">
                <Recycle />
                <div>
                  <strong>Botella PET lista para reciclar</strong>
                  <span>Instrucciones claras, puntos acreditados y registro para el ranking.</span>
                </div>
              </div>
              <div className="sg-flow-checks">
                {["Material identificado", "Impacto ambiental calculado", "Reporte institucional actualizado"].map((item) => (
                  <span key={item} className="sg-flow-check">
                    <CheckCircle2 />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="sg-section" id="funcionalidades">
        <div className="sg-section-head sr">
          <div className="sg-section-title">
            <span className="sg-label">Funcionalidades</span>
            <h2 className="sg-h2">Herramientas claras para reciclar y medir.</h2>
          </div>
          <p className="sg-sub">
            Desde el escáner de IA hasta el panel municipal, cada módulo está pensado para una demo rápida y un uso real en comunidad.
          </p>
        </div>
        <div className="sg-grid-2 sr">
          {FEATURES.map((f, i) => (
            <div key={i} className="sg-feat-card">
              <div className="sg-feat-illo" style={{ background: f.bg }}>
                <span className="sg-feat-emoji" style={{ filter: `drop-shadow(0 8px 24px rgba(${f.shadow},.35))` }}>
                  {f.icon}
                </span>
              </div>
              <div>
                <div className="sg-feat-title">{f.title}</div>
                <p className="sg-feat-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIERS ── */}
      <section className="sg-tiers" id="impacto">
        <div className="sg-tiers-head sr">
          <h2 className="sg-h2">Para cada actor<br /><em>del cambio.</em></h2>
          <p>EcoRed se adapta al ciudadano individual, a la institución educativa y al municipio que quiere liderar la transición verde.</p>
        </div>
        <div>
          {TIERS.map((tier, i) => (
            <div key={i} className="sg-tier sr">
              <div>
                <span className="sg-tier-label">{tier.label}</span>
                <div className="sg-tier-title">{tier.title}</div>
                <p className="sg-tier-desc">{tier.desc}</p>
                <Link href={tier.href} className="sg-tier-cta">{tier.cta}</Link>
              </div>
              <ul className="sg-tier-feats">
                {tier.feats.map((feat, j) => (
                  <li key={j} className="sg-tier-feat">{feat}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="sg-faq" id="faq">
        <div className="sg-faq-l sr">
          <h2 className="sg-h2">Preguntas<br /><em>frecuentes.</em></h2>
          <p>Respuestas directas sobre privacidad, tecnología y cómo EcoRed transforma el reciclaje en Perú.</p>
        </div>
        <div className="sg-faq-r sr">
          {FAQS.map((faq, i) => (
            <details key={i}>
              <summary>
                {faq.q}
                <span className="sg-faq-plus">+</span>
              </summary>
              <div>{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="sg-cta">
        <div className="sg-cta-l sr">
          <h2>Únete a<br />EcoRed.</h2>
          <ul className="sg-cta-list">
            {CTA_ITEMS.map((item, i) => (
              <li key={i}>
                <span className="sg-check">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    stroke="#00897B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 5.5l2.5 2.5 4.5-5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link href="/auth/register" className="sg-btn-grn">Crear cuenta gratis</Link>
        </div>
        <div className="sg-cta-r sr">
          <div className="sg-cta-r-title">Impacto en tiempo real</div>
          <div className="sg-stats">
            {STATS.map((s, i) => (
              <div key={i} className="sg-stat">
                <div className="sg-stat-num">{s.num}</div>
                <div className="sg-stat-lbl" style={{ whiteSpace: "pre-line" }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="sg-foot-outer">
        <div className="sg-foot-leaf" aria-hidden="true">
          <PixelLeaf scale={2} />
        </div>
        <footer className="sg-footer">
          <div className="sg-foot-top">
            <div className="sg-foot-brand">
              <Link href="/" className="sg-foot-logo">
                <Leaf size={16} color="#00897B" />
                EcoRed
              </Link>
              <p>Plataforma de reciclaje comunitario con inteligencia artificial para el Perú.</p>
              <div className="sg-foot-socials">
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="X">𝕏</a>
                <a href="#" aria-label="YouTube">▶</a>
              </div>
            </div>
            <div className="sg-foot-col">
              <h4>[Páginas]</h4>
              <ul>
                <li><Link href="/">[Inicio]</Link></li>
                <li><a href="#funcionalidades">[Funcionalidades]</a></li>
                <li><a href="#impacto">[Impacto]</a></li>
                <li><Link href="/auth/login">[Ingresar]</Link></li>
              </ul>
            </div>
            <div className="sg-foot-col">
              <h4>[Soporte]</h4>
              <ul>
                <li><Link href="/auth/register">[Registro]</Link></li>
                <li><a href="#faq">[FAQ]</a></li>
                <li><a href="#">[Privacidad]</a></li>
                <li><a href="#">[Términos]</a></li>
              </ul>
            </div>
          </div>
          <div className="sg-foot-bottom">
            <span>© EcoRed 2026. Todos los derechos reservados.</span>
            <span>Hecho en Perú 🇵🇪 · Hackathon QuipuSoft 2026</span>
          </div>
        </footer>
      </div>

      <LandingInteractions />
    </>
  )
}
