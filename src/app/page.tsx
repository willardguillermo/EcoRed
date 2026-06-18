import Link from "next/link"
import { Leaf, Building2, Users, BarChart3, Camera, ArrowRight, Globe, ChevronRight, Recycle, MapPin, MessageCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,700;9..144,900&family=Figtree:wght@300;400;500;600;700&display=swap');

        .eco-root {
          font-family: 'Figtree', system-ui, sans-serif;
          background: #070D0A;
          color: #E6F4F1;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .display-font { font-family: 'Fraunces', Georgia, serif; }

        /* ── Gradient mesh background ── */
        .hero-bg {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
        }
        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(90px); opacity: 0.28;
          animation: blobDrift 10s ease-in-out infinite;
        }
        .blob-1 { width: 700px; height: 700px; background: radial-gradient(#00897B, transparent 70%); top: -220px; left: -180px; animation-delay: 0s; }
        .blob-2 { width: 550px; height: 550px; background: radial-gradient(#1565C0, transparent 70%); top: 80px; right: -160px; animation-delay: -4s; }
        .blob-3 { width: 380px; height: 380px; background: radial-gradient(#00BFAA, transparent 70%); bottom: -80px; left: 45%; opacity: 0.14; animation-delay: -7s; }

        @keyframes blobDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(24px, -28px) scale(1.06); }
          66%       { transform: translate(-18px, 18px) scale(0.94); }
        }

        /* ── Grid overlay ── */
        .grid-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,137,123,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,137,123,0.04) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        /* ── Particles ── */
        .particle {
          position: absolute; width: 3px; height: 3px;
          background: #00BFAA; border-radius: 50%;
          animation: rise linear infinite; opacity: 0;
        }
        @keyframes rise {
          0%   { transform: translateY(0) translateX(0);    opacity: 0; }
          8%   { opacity: 0.55; }
          92%  { opacity: 0.15; }
          100% { transform: translateY(-580px) translateX(var(--x,20px)); opacity: 0; }
        }

        /* ── Fade-in stagger ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu  { animation: fadeUp .8s ease both; }
        .d1  { animation-delay: .10s; }
        .d2  { animation-delay: .22s; }
        .d3  { animation-delay: .34s; }
        .d4  { animation-delay: .46s; }
        .d5  { animation-delay: .58s; }

        /* ── Badge ── */
        .eco-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 14px; border-radius: 100px;
          background: rgba(0,137,123,0.12);
          border: 1px solid rgba(0,229,180,0.22);
          font-size: 11.5px; font-weight: 600; letter-spacing: .06em;
          color: #00E5B4; text-transform: uppercase;
        }
        .eco-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #00E5B4; box-shadow: 0 0 7px #00E5B4;
        }

        /* ── Buttons ── */
        .btn-cta {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 14px 28px; border-radius: 13px;
          background: linear-gradient(135deg, #00897B 0%, #006B61 100%);
          color: #fff; font-weight: 700; font-size: 15px;
          border: 1px solid rgba(0,229,180,0.18);
          box-shadow: 0 8px 28px rgba(0,137,123,0.35), inset 0 1px 0 rgba(255,255,255,0.12);
          text-decoration: none; transition: all .28s ease; cursor: pointer;
        }
        .btn-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(0,137,123,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
          background: linear-gradient(135deg, #00A896 0%, #00897B 100%);
        }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 14px 28px; border-radius: 13px;
          background: rgba(255,255,255,0.04);
          color: rgba(230,244,241,0.75); font-weight: 500; font-size: 15px;
          border: 1px solid rgba(255,255,255,0.1);
          text-decoration: none; transition: all .28s ease;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #E6F4F1; }

        /* ── Nav links ── */
        .nav-link { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
        .nav-link:hover { color: #00E5B4; }

        /* ── Divider ── */
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,137,123,0.28), transparent); border: none; margin: 0; }

        /* ── Marquee ── */
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-wrap { overflow: hidden; }
        .marquee-track { display: flex; width: max-content; animation: marquee 22s linear infinite; }
        .marquee-item { display: flex; align-items: center; gap: 18px; padding: 0 22px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.2); white-space: nowrap; text-transform: uppercase; letter-spacing: .08em; }
        .marquee-dot { width: 3px; height: 3px; border-radius: 50%; background: #00897B; opacity: .7; display: inline-block; }

        /* ── Step card ── */
        .step-card {
          background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 36px; position: relative; overflow: hidden;
          transition: border-color .35s ease, background .35s ease;
        }
        .step-card:hover { border-color: rgba(0,137,123,0.25); background: rgba(0,137,123,0.04); }
        .step-num-bg {
          position: absolute; top: 10px; right: 18px;
          font-family: 'Fraunces', serif; font-size: 80px; font-weight: 900; line-height: 1;
          background: linear-gradient(135deg, rgba(0,137,123,0.18), rgba(0,229,180,0.04));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          pointer-events: none; user-select: none;
        }
        .icon-box {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 22px;
        }

        /* ── Role card ── */
        .role-card {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 32px; display: flex; flex-direction: column;
          position: relative; overflow: hidden; transition: all .38s ease;
        }
        .role-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,229,180,0.35), transparent);
          opacity: 0; transition: opacity .38s ease;
        }
        .role-card:hover::before { opacity: 1; }
        .role-card:hover { background: rgba(255,255,255,0.045); border-color: rgba(0,229,180,0.14); transform: translateY(-4px); }

        /* ── Impact section ── */
        .impact-card {
          border-radius: 28px; padding: 80px 64px; text-align: center;
          background: linear-gradient(135deg, rgba(0,137,123,0.13) 0%, rgba(21,101,192,0.09) 60%, rgba(0,137,123,0.05) 100%);
          border: 1px solid rgba(0,229,180,0.1); position: relative; overflow: hidden;
        }

        /* ── Scale bar ── */
        .scale-item {
          display: flex; align-items: center; gap: 8px;
        }
        .scale-pill {
          padding: 6px 18px; border-radius: 100px; font-size: 13px; font-weight: 600;
          white-space: nowrap; transition: all .25s ease;
        }

        /* ── Stat numbers ── */
        .stat-val { font-family: 'Fraunces', serif; font-size: 44px; font-weight: 900; line-height: 1; color: #00E5B4; }
        .stat-sub { font-size: 12px; color: rgba(255,255,255,0.35); font-weight: 500; margin-top: 3px; }

        /* ── Feature list dot ── */
        .feat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* ── Nav ── */
        .sticky-nav {
          position: sticky; top: 0; z-index: 50;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          backdrop-filter: blur(22px);
          background: rgba(7,13,10,0.82);
        }

        /* ── Grid helpers ── */
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media (max-width: 900px) {
          .grid-3 { grid-template-columns: 1fr; }
          .hero-stats { flex-direction: column; gap: 20px; }
          .impact-card { padding: 48px 28px; }
          .scale-bar { flex-wrap: wrap; }
        }
      `}</style>

      <div className="eco-root">

        {/* ── NAV ── */}
        <header className="sticky-nav">
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 33, height: 33, borderRadius: 10, background: 'linear-gradient(135deg,#00897B,#005F57)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(0,137,123,.45)' }}>
                <Leaf size={16} color="#fff" />
              </div>
              <span className="display-font" style={{ fontSize: 19, fontWeight: 700, color: '#E6F4F1', letterSpacing: '-.01em' }}>EcoRed</span>
            </div>

            {/* Nav links */}
            <nav style={{ display: 'flex', gap: 32 }}>
              <a href="#como-funciona" className="nav-link">Cómo funciona</a>
              <a href="#para-quien"    className="nav-link">Para quién</a>
              <a href="#impacto"       className="nav-link">Impacto</a>
            </nav>

            {/* Auth */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link href="/auth/login"    className="nav-link" style={{ fontSize: 14 }}>Iniciar sesión</Link>
              <Link href="/auth/register" className="btn-cta"  style={{ padding: '10px 20px', fontSize: 14, borderRadius: 10 }}>Empezar gratis</Link>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <div className="hero-bg">
            <div className="grid-overlay" />
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>

          {/* Floating particles */}
          {[
            { l: '8%',  b: '18%', d: '0s',   x: '22px',  dur: '13s' },
            { l: '22%', b: '8%',  d: '2.5s', x: '-28px', dur: '16s' },
            { l: '55%', b: '22%', d: '5s',   x: '14px',  dur: '11s' },
            { l: '72%', b: '6%',  d: '1.2s', x: '-18px', dur: '14s' },
            { l: '42%', b: '35%', d: '7s',   x: '26px',  dur: '12s' },
            { l: '88%', b: '45%', d: '3.5s', x: '-12px', dur: '15s' },
          ].map((p, i) => (
            <div key={i} className="particle" style={{
              left: p.l, bottom: p.b,
              animationDelay: p.d, animationDuration: p.dur,
              ['--x' as string]: p.x,
            }} />
          ))}

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 80px', position: 'relative', zIndex: 1, width: '100%' }}>

            {/* Badge */}
            <div className="fu d1">
              <span className="eco-badge">
                <span className="eco-badge-dot" />
                IA al servicio del planeta · QuipuSoft 2026
              </span>
            </div>

            {/* Headline */}
            <h1 className="display-font fu d2" style={{ fontSize: 'clamp(54px,8.5vw,100px)', fontWeight: 900, lineHeight: 1.0, marginTop: 28, letterSpacing: '-.035em', color: '#E6F4F1' }}>
              Tu comunidad,{' '}
              <span style={{ background: 'linear-gradient(135deg,#00897B 0%,#00E5B4 55%,#4B9EFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block' }}>
                más verde.
              </span>
            </h1>

            {/* Sub */}
            <p className="fu d3" style={{ fontSize: 18, lineHeight: 1.75, color: 'rgba(230,244,241,.55)', maxWidth: 510, marginTop: 24 }}>
              EcoRed conecta ciudadanos, colegios y municipios para reciclar mejor con IA.
              Escanea residuos, mide tu impacto y compite con tu comunidad en tiempo real.
            </p>

            {/* CTAs */}
            <div className="fu d4" style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn-cta">
                Empezar gratis <ArrowRight size={16} />
              </Link>
              <a href="#como-funciona" className="btn-outline">
                Ver cómo funciona
              </a>
            </div>

            {/* Stats row */}
            <div className="fu d5 hero-stats" style={{ display: 'flex', gap: 48, marginTop: 64, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { val: '3',        sub: 'roles · aula → ciudad' },
                { val: 'IA',       sub: 'Llama 4 Scout Vision' },
                { val: 'Realtime', sub: 'Rankings en vivo' },
              ].map(s => (
                <div key={s.val}>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(to top,#070D0A,transparent)', pointerEvents: 'none' }} />
        </section>

        {/* ── MARQUEE ── */}
        <div className="marquee-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '15px 0', background: 'rgba(255,255,255,0.01)' }}>
          <div className="marquee-track">
            {['Escaneo con IA', '♻ Reciclaje inteligente', 'Impacto medible', 'Rankings en vivo', 'Puntos de acopio', 'Retos comunitarios', 'CO₂ evitado', 'Educación ambiental', 'Llama 4 Vision', 'Supabase Realtime',
              'Escaneo con IA', '♻ Reciclaje inteligente', 'Impacto medible', 'Rankings en vivo', 'Puntos de acopio', 'Retos comunitarios', 'CO₂ evitado', 'Educación ambiental', 'Llama 4 Vision', 'Supabase Realtime']
              .map((t, i) => (
                <span key={i} className="marquee-item">
                  {t} <span className="marquee-dot" />
                </span>
              ))
            }
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section id="como-funciona" style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 72 }}>
            <span className="eco-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>Proceso</span>
            <h2 className="display-font" style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 800, color: '#E6F4F1', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 16 }}>
              Tres pasos para<br />reciclar mejor
            </h2>
            <p style={{ color: 'rgba(230,244,241,.45)', fontSize: 17, maxWidth: 440, lineHeight: 1.7 }}>
              Sin complicaciones. Del primer escaneo al impacto colectivo en tu comunidad.
            </p>
          </div>

          <div className="grid-3">
            {[
              { num: '01', Icon: Camera,   accent: '#00897B', rgb: '0,137,123',  title: 'Escanea el residuo',    desc: 'Toma una foto y la IA identifica el material, si es reciclable y cómo desecharlo correctamente en Perú.' },
              { num: '02', Icon: BarChart3, accent: '#1565C0', rgb: '21,101,192', title: 'Acumula impacto',       desc: 'Cada escaneo suma EcoPuntos y registra CO₂ evitado. Ve tu huella ambiental crecer en tiempo real.' },
              { num: '03', Icon: Users,    accent: '#00897B', rgb: '0,137,123',  title: 'Compite en comunidad', desc: 'Únete a tu aula, colegio o municipio. El leaderboard muestra quién lidera el cambio.' },
            ].map(s => (
              <div key={s.num} className="step-card">
                <div className="step-num-bg">{s.num}</div>
                <div className="icon-box" style={{ background: `rgba(${s.rgb},.14)`, border: `1px solid rgba(${s.rgb},.22)` }}>
                  <s.Icon size={22} color={s.accent} />
                </div>
                <h3 className="display-font" style={{ fontSize: 22, fontWeight: 700, color: '#E6F4F1', marginBottom: 12, letterSpacing: '-.01em' }}>{s.title}</h3>
                <p style={{ color: 'rgba(230,244,241,.45)', fontSize: 15, lineHeight: 1.72 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" style={{ maxWidth: 1200, margin: '0 auto' }} />

        {/* ── FOR WHOM ── */}
        <section id="para-quien" style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <span className="eco-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>Escalabilidad</span>
            <h2 className="display-font" style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 800, color: '#E6F4F1', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 16 }}>
              Diseñado para<br />todos los niveles
            </h2>
            <p style={{ color: 'rgba(230,244,241,.45)', fontSize: 17, maxWidth: 440, lineHeight: 1.7 }}>
              Escala desde un ciudadano hasta una ciudad entera, sin cambiar de plataforma.
            </p>
          </div>

          {/* Scale bar */}
          <div className="scale-bar" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 44, overflowX: 'auto', paddingBottom: 4 }}>
            {['Ciudadano', 'Aula', 'Colegio', 'Municipio', 'Ciudad'].map((lv, i, arr) => (
              <div key={lv} className="scale-item">
                <span className="scale-pill" style={{
                  background: `rgba(${i <= 2 ? '0,137,123' : '21,101,192'},${ .07 + i * .04})`,
                  border: `1px solid rgba(${i <= 2 ? '0,137,123' : '21,101,192'},${ .18 + i * .04})`,
                  color: i <= 2 ? '#00E5B4' : '#6BA3FF',
                }}>{lv}</span>
                {i < arr.length - 1 && <ChevronRight size={13} color="rgba(255,255,255,0.2)" />}
              </div>
            ))}
          </div>

          <div className="grid-3">
            {[
              { Icon: Users,    role: 'Ciudadano', badge: 'Para ti',    color: '#00E5B4', rgb: '0,229,180',   features: ['Escanea residuos con IA', 'Consulta al EcoAsistente', 'Ve tu impacto personal', 'Retos semanales', 'Ranking de tu comunidad'] },
              { Icon: Building2,role: 'Colegio',   badge: 'Institución',color: '#6BA3FF', rgb: '107,163,255', features: ['Dashboard de aulas', 'QR de acceso por salón', 'Ranking entre clases', 'Retos escolares', 'Reportes descargables'] },
              { Icon: Globe,    role: 'Municipio', badge: 'Admin local', color: '#6BA3FF', rgb: '107,163,255', features: ['Mapa de puntos de acopio', 'Impacto del distrito', 'Métricas por comunidad', 'Campañas de reciclaje', 'Exportación de datos'] },
            ].map(c => (
              <div key={c.role} className="role-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div className="icon-box" style={{ background: `rgba(${c.rgb},.1)`, border: `1px solid rgba(${c.rgb},.18)`, marginBottom: 0 }}>
                    <c.Icon size={20} color={c.color} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 100, background: `rgba(${c.rgb},.1)`, color: c.color, letterSpacing: '.055em', textTransform: 'uppercase' }}>{c.badge}</span>
                </div>

                <h3 className="display-font" style={{ fontSize: 26, fontWeight: 700, color: '#E6F4F1', marginBottom: 20, letterSpacing: '-.015em' }}>{c.role}</h3>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {c.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(230,244,241,.5)', fontWeight: 400 }}>
                      <span className="feat-dot" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/auth/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28, padding: '12px 16px', borderRadius: 12, background: `rgba(${c.rgb},.08)`, border: `1px solid rgba(${c.rgb},.15)`, color: c.color, fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all .3s ease' }}>
                  Empezar <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" style={{ maxWidth: 1200, margin: '0 auto' }} />

        {/* ── FEATURES STRIP ── */}
        <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {[
              { Icon: Camera,      color: '#00E5B4', title: 'Visión IA',        desc: 'Llama 4 Scout identifica cualquier residuo con una foto' },
              { Icon: MessageCircle,color:'#6BA3FF', title: 'EcoAsistente',     desc: 'Chatbot educativo que conoce tu historial de reciclaje' },
              { Icon: MapPin,      color: '#00E5B4', title: 'Mapa de acopio',   desc: 'Puntos de reciclaje cerca de ti, en tiempo real' },
              { Icon: Recycle,     color: '#6BA3FF', title: 'Impacto medible',  desc: 'CO₂ evitado, kg reciclados y EcoPuntos por cada acción' },
            ].map((f, i) => (
              <div key={f.title} style={{ padding: '32px 28px', borderLeft: i === 0 ? '1px solid rgba(255,255,255,0.07)' : undefined, borderRight: '1px solid rgba(255,255,255,0.07)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <f.Icon size={26} color={f.color} style={{ marginBottom: 16 }} />
                <div className="display-font" style={{ fontSize: 17, fontWeight: 700, color: '#E6F4F1', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: 'rgba(230,244,241,.42)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── IMPACT CTA ── */}
        <section id="impacto" style={{ padding: '0 24px 120px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="impact-card">
              {/* Decorative blobs inside */}
              <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(rgba(0,137,123,.35),transparent)', filter: 'blur(50px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(rgba(21,101,192,.3),transparent)', filter: 'blur(45px)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,229,180,.1)', border: '1px solid rgba(0,229,180,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 24px rgba(0,229,180,.15)' }}>
                  <Leaf size={26} color="#00E5B4" />
                </div>

                <h2 className="display-font" style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 900, color: '#E6F4F1', letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 18 }}>
                  El cambio empieza<br />en tu comunidad
                </h2>

                <p style={{ color: 'rgba(230,244,241,.5)', fontSize: 17, maxWidth: 430, margin: '0 auto 40px', lineHeight: 1.75 }}>
                  Únete a EcoRed y convierte cada residuo en datos reales de impacto ambiental.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/auth/register" className="btn-cta" style={{ fontSize: 16, padding: '16px 32px' }}>
                    Crear cuenta gratuita <ArrowRight size={17} />
                  </Link>
                  <Link href="/auth/login" className="btn-outline" style={{ fontSize: 16, padding: '16px 32px' }}>
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.055)', padding: '28px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#00897B,#005F57)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={13} color="#fff" />
              </div>
              <span className="display-font" style={{ fontWeight: 700, color: '#E6F4F1', fontSize: 16 }}>EcoRed</span>
              <span style={{ color: 'rgba(255,255,255,.22)', fontSize: 14 }}>— Tu comunidad, más verde</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,.18)', fontSize: 13 }}>QuipuSoft 2026 · Tecsup · Perú</span>
          </div>
        </footer>

      </div>
    </>
  )
}
