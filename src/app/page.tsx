import Link from "next/link"
import { Leaf, Building2, Users, BarChart3, Camera, ArrowRight, Globe, ChevronRight, Recycle, MapPin, MessageCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .eco-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #070D0A;
          color: #E6F4F1;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .display-font { font-family: 'Syne', system-ui, sans-serif; }

        /* ── Container ── */
        .wrap { max-width: 1200px; margin: 0 auto; width: 100%; }

        /* ── Section padding ── */
        .sec      { padding: 120px 24px; }
        .sec-md   { padding: 100px 24px; }
        .sec-end  { padding: 0 24px 120px; }

        /* ── Hero content ── */
        .hero-content { padding: 100px 24px 80px; }

        /* ── Gradient mesh background ── */
        .hero-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(90px); opacity: 0.26;
          animation: blobDrift 10s ease-in-out infinite;
        }
        .blob-1 { width: 700px; height: 700px; background: radial-gradient(#00897B, transparent 70%); top: -220px; left: -180px; animation-delay: 0s; }
        .blob-2 { width: 550px; height: 550px; background: radial-gradient(#1565C0, transparent 70%); top: 80px; right: -160px; animation-delay: -4s; }
        .blob-3 { width: 380px; height: 380px; background: radial-gradient(#00BFAA, transparent 70%); bottom: -80px; left: 45%; opacity: 0.12; animation-delay: -7s; }

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
        .fu  { animation: fadeUp .8s cubic-bezier(0.16,1,0.3,1) both; }
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

        /* ── Buttons: pill + Button-in-Button ── */
        .btn-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 20px 13px 26px; border-radius: 100px;
          background: linear-gradient(135deg, #00897B 0%, #006B61 100%);
          color: #fff; font-weight: 700; font-size: 15px;
          border: 1px solid rgba(0,229,180,0.18);
          box-shadow: 0 8px 28px rgba(0,137,123,0.32), inset 0 1px 0 rgba(255,255,255,0.12);
          text-decoration: none; transition: all .28s cubic-bezier(0.16,1,0.3,1); cursor: pointer;
        }
        .btn-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(0,137,123,0.48), inset 0 1px 0 rgba(255,255,255,0.12);
          background: linear-gradient(135deg, #00A896 0%, #00897B 100%);
        }
        .btn-cta:hover .btn-icon { transform: translateX(2px) scale(1.08); }
        .btn-icon {
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(255,255,255,0.16);
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: transform .25s cubic-bezier(0.16,1,0.3,1);
        }
        .btn-outline {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 26px; border-radius: 100px;
          background: rgba(255,255,255,0.04);
          color: rgba(230,244,241,0.72); font-weight: 500; font-size: 15px;
          border: 1px solid rgba(255,255,255,0.1);
          text-decoration: none; transition: all .28s cubic-bezier(0.16,1,0.3,1);
        }
        .btn-outline:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #E6F4F1; }

        /* ── Hero buttons group ── */
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }

        /* ── Nav ── */
        .sticky-nav {
          position: sticky; top: 0; z-index: 50;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          backdrop-filter: blur(22px);
          background: rgba(7,13,10,0.82);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 20px; height: 60px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-links { display: flex; gap: 28px; }
        .nav-auth  { display: flex; gap: 10px; align-items: center; }
        .nav-login { color: rgba(255,255,255,0.42); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; white-space: nowrap; }
        .nav-login:hover { color: #00E5B4; }

        /* ── Nav links ── */
        .nav-link { color: rgba(255,255,255,0.42); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
        .nav-link:hover { color: #00E5B4; }

        /* ── Divider ── */
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,137,123,0.26), transparent); border: none; margin: 0; }
        .divider-wrap { padding: 0 24px; }

        /* ── Marquee ── */
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-wrap { overflow: hidden; }
        .marquee-track { display: flex; width: max-content; animation: marquee 22s linear infinite; }
        .marquee-item { display: flex; align-items: center; gap: 18px; padding: 0 22px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.18); white-space: nowrap; text-transform: uppercase; letter-spacing: .08em; }
        .marquee-dot { width: 3px; height: 3px; border-radius: 50%; background: #00897B; opacity: .7; display: inline-block; }

        /* ── Hero stats ── */
        .hero-stats { display: flex; gap: 40px; flex-wrap: wrap; margin-top: 56px; padding-top: 36px; border-top: 1px solid rgba(255,255,255,0.07); }
        .stat-val { font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 800; line-height: 1; color: #00E5B4; }
        .stat-sub { font-size: 12px; color: rgba(255,255,255,0.32); font-weight: 500; margin-top: 3px; }

        /* ── Step row (numbered vertical list) ── */
        .step-row {
          display: grid; grid-template-columns: 72px 1fr;
          gap: 28px; padding: 36px 0; align-items: start;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .step-row:first-child { border-top: none; }
        .step-num {
          font-family: 'Syne', sans-serif; font-size: 52px; font-weight: 800;
          line-height: 1; user-select: none;
          background: linear-gradient(135deg, rgba(0,229,180,0.28), rgba(0,229,180,0.06));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .step-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #E6F4F1; letter-spacing: -.01em; }
        .step-desc { color: rgba(230,244,241,.42); font-size: 15px; line-height: 1.75; }

        /* ── Role bento (asymmetric) ── */
        .role-bento {
          display: grid; grid-template-columns: 1.45fr 1fr;
          grid-template-rows: auto auto; gap: 14px;
        }
        .role-card {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 28px; display: flex; flex-direction: column;
          position: relative; overflow: hidden; transition: all .38s cubic-bezier(0.16,1,0.3,1);
        }
        .role-card-wide { grid-row: 1 / 3; padding: 36px; }
        .role-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,229,180,0.35), transparent);
          opacity: 0; transition: opacity .38s ease;
        }
        .role-card:hover::before { opacity: 1; }
        .role-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(0,229,180,0.14); transform: translateY(-3px); }

        /* ── Feature bento (2x2 asymmetric) ── */
        .feature-bento {
          display: grid; grid-template-columns: 1.5fr 1fr;
          grid-template-rows: auto auto; gap: 12px;
        }
        .feat-cell {
          border-radius: 20px; padding: 28px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .feat-cell-accent { background: linear-gradient(135deg, rgba(0,137,123,0.12), rgba(0,137,123,0.04)); border-color: rgba(0,137,123,0.16); }
        .feat-cell-blue   { background: linear-gradient(135deg, rgba(21,101,192,0.1), rgba(21,101,192,0.03)); border-color: rgba(21,101,192,0.14); }
        .feat-cell-plain  { background: rgba(255,255,255,0.018); }

        /* ── Double-Bezel (Doppelrand) on impact CTA ── */
        .dbezel-outer {
          padding: 6px; border-radius: 36px;
          background: rgba(0,137,123,0.06);
          border: 1px solid rgba(0,137,123,0.1);
        }
        .dbezel-inner {
          border-radius: 30px; padding: 72px 56px; text-align: center;
          background: linear-gradient(135deg, rgba(0,137,123,0.12) 0%, rgba(21,101,192,0.08) 60%, rgba(0,137,123,0.04) 100%);
          border: 1px solid rgba(0,229,180,0.09);
          position: relative; overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── Scale bar ── */
        .scale-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 40px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
        .scale-pill { padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }

        /* ── Icon box ── */
        .icon-box { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* ── Feature dot ── */
        .feat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* ── Section header ── */
        .sec-head { margin-bottom: 56px; }
        .sec-head-lg { margin-bottom: 64px; }

        /* ────────────────────────────────────────────
           RESPONSIVE — tablet (≤ 900px)
        ──────────────────────────────────────────── */
        @media (max-width: 900px) {
          .role-bento { grid-template-columns: 1fr 1fr; }
          .role-card-wide { grid-row: 1 / 3; }
          .feature-bento { grid-template-columns: 1fr 1fr; }
        }

        /* ────────────────────────────────────────────
           RESPONSIVE — mobile (≤ 680px)
        ──────────────────────────────────────────── */
        @media (max-width: 680px) {
          /* Section spacing */
          .sec     { padding: 64px 20px; }
          .sec-md  { padding: 56px 20px; }
          .sec-end { padding: 0 20px 64px; }
          .hero-content { padding: 72px 20px 56px; }
          .divider-wrap { padding: 0 20px; }

          /* Nav */
          .nav-inner  { padding: 0 16px; height: 56px; }
          .nav-links  { display: none; }
          .nav-login  { display: none; }

          /* Hero */
          .hero-btns { flex-direction: column; gap: 10px; }
          .hero-btns .btn-cta,
          .hero-btns .btn-outline { width: 100%; justify-content: center; }
          .hero-stats { gap: 28px; margin-top: 40px; padding-top: 28px; }
          .stat-val { font-size: 32px; }

          /* Steps */
          .step-row { grid-template-columns: 48px 1fr; gap: 16px; padding: 28px 0; }
          .step-num { font-size: 38px; }
          .step-title { font-size: 17px; }

          /* Section headers */
          .sec-head    { margin-bottom: 40px; }
          .sec-head-lg { margin-bottom: 48px; }

          /* Role bento */
          .role-bento { grid-template-columns: 1fr; }
          .role-card-wide { grid-row: auto; padding: 24px; }
          .role-card { padding: 22px; }

          /* Feature bento */
          .feature-bento { grid-template-columns: 1fr; }
          .feat-cell { padding: 22px; }
          .feat-cell.feat-cell-accent,
          .feat-cell.feat-cell-blue { padding: 22px; }

          /* Impact CTA */
          .dbezel-outer { border-radius: 24px; }
          .dbezel-inner { border-radius: 20px; padding: 48px 24px; }
          .cta-btns { flex-direction: column; gap: 10px; }
          .cta-btns .btn-cta,
          .cta-btns .btn-outline { width: 100%; justify-content: center; }
        }

        /* ────────────────────────────────────────────
           RESPONSIVE — small mobile (≤ 400px)
        ──────────────────────────────────────────── */
        @media (max-width: 400px) {
          .sec     { padding: 48px 16px; }
          .sec-md  { padding: 44px 16px; }
          .sec-end { padding: 0 16px 48px; }
          .hero-content { padding: 60px 16px 44px; }
          .divider-wrap { padding: 0 16px; }
          .eco-badge { font-size: 10px; padding: 4px 12px; }
          .step-row { grid-template-columns: 40px 1fr; gap: 12px; padding: 22px 0; }
          .step-num { font-size: 30px; }
          .scale-bar { gap: 6px; }
          .scale-pill { padding: 4px 10px; font-size: 11px; }
        }
      `}</style>

      <div className="eco-root">

        {/* ── NAV ── */}
        <header className="sticky-nav">
          <div className="nav-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#00897B,#005F57)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(0,137,123,.4)', flexShrink: 0 }}>
                <Leaf size={15} color="#fff" />
              </div>
              <span className="display-font" style={{ fontSize: 18, fontWeight: 800, color: '#E6F4F1', letterSpacing: '-.02em' }}>EcoRed</span>
            </div>

            <nav className="nav-links">
              <a href="#como-funciona" className="nav-link">Cómo funciona</a>
              <a href="#para-quien"    className="nav-link">Para quién</a>
              <a href="#impacto"       className="nav-link">Impacto</a>
            </nav>

            <div className="nav-auth">
              <Link href="/auth/login" className="nav-login">Iniciar sesión</Link>
              <Link href="/auth/register" className="btn-cta" style={{ padding: '8px 14px 8px 18px', fontSize: 13 }}>
                Empezar
                <span className="btn-icon" style={{ width: 20, height: 20 }}><ArrowRight size={11} /></span>
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <div className="hero-bg">
            <div className="grid-overlay" />
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>

          {[
            { l: '8%',  b: '18%', d: '0s',   x: '22px',  dur: '13s' },
            { l: '22%', b: '8%',  d: '2.5s', x: '-28px', dur: '16s' },
            { l: '55%', b: '22%', d: '5s',   x: '14px',  dur: '11s' },
            { l: '72%', b: '6%',  d: '1.2s', x: '-18px', dur: '14s' },
            { l: '42%', b: '35%', d: '7s',   x: '26px',  dur: '12s' },
            { l: '88%', b: '45%', d: '3.5s', x: '-12px', dur: '15s' },
          ].map((p, i) => (
            <div key={i} className="particle" style={{ left: p.l, bottom: p.b, animationDelay: p.d, animationDuration: p.dur, ['--x' as string]: p.x }} />
          ))}

          <div className="wrap hero-content" style={{ position: 'relative', zIndex: 1 }}>
            <div className="fu d1">
              <span className="eco-badge">
                <span className="eco-badge-dot" />
                IA al servicio del planeta · QuipuSoft 2026
              </span>
            </div>

            <h1 className="display-font fu d2" style={{ fontSize: 'clamp(44px,8vw,100px)', fontWeight: 800, lineHeight: 1.0, marginTop: 24, letterSpacing: '-.03em', color: '#E6F4F1' }}>
              Tu comunidad,{' '}
              <span style={{ background: 'linear-gradient(135deg,#00897B 0%,#00E5B4 55%,#4B9EFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block' }}>
                más verde.
              </span>
            </h1>

            <p className="fu d3" style={{ fontSize: 'clamp(15px,2vw,18px)', lineHeight: 1.75, color: 'rgba(230,244,241,.52)', maxWidth: 500, marginTop: 20 }}>
              EcoRed conecta ciudadanos, colegios y municipios para reciclar mejor con IA.
              Escanea residuos, mide tu impacto y compite con tu comunidad.
            </p>

            <div className="fu d4 hero-btns" style={{ marginTop: 36 }}>
              <Link href="/auth/register" className="btn-cta">
                Empezar gratis
                <span className="btn-icon"><ArrowRight size={14} /></span>
              </Link>
              <a href="#como-funciona" className="btn-outline">
                Ver cómo funciona
              </a>
            </div>

            <div className="fu d5 hero-stats">
              {[
                { val: '3',        sub: 'roles · aula a ciudad' },
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

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, background: 'linear-gradient(to top,#070D0A,transparent)', pointerEvents: 'none' }} />
        </section>

        {/* ── MARQUEE ── */}
        <div className="marquee-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '14px 0', background: 'rgba(255,255,255,0.01)' }}>
          <div className="marquee-track">
            {['Escaneo con IA', 'Reciclaje inteligente', 'Impacto medible', 'Rankings en vivo', 'Puntos de acopio', 'Retos comunitarios', 'CO2 evitado', 'Educación ambiental', 'Llama 4 Vision', 'Supabase Realtime',
              'Escaneo con IA', 'Reciclaje inteligente', 'Impacto medible', 'Rankings en vivo', 'Puntos de acopio', 'Retos comunitarios', 'CO2 evitado', 'Educación ambiental', 'Llama 4 Vision', 'Supabase Realtime']
              .map((t, i) => (
                <span key={i} className="marquee-item">
                  {t} <span className="marquee-dot" />
                </span>
              ))
            }
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section id="como-funciona" className="sec">
          <div className="wrap">
            <div className="sec-head-lg">
              <span className="eco-badge" style={{ marginBottom: 18, display: 'inline-flex' }}>Proceso</span>
              <h2 className="display-font" style={{ fontSize: 'clamp(30px,5vw,56px)', fontWeight: 800, color: '#E6F4F1', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 14 }}>
                Tres pasos para<br />reciclar mejor
              </h2>
              <p style={{ color: 'rgba(230,244,241,.42)', fontSize: 'clamp(14px,2vw,17px)', maxWidth: 420, lineHeight: 1.7 }}>
                Sin complicaciones. Del primer escaneo al impacto colectivo en tu comunidad.
              </p>
            </div>

            <div>
              {[
                { num: '01', Icon: Camera,    rgb: '0,137,123',   accent: '#00897B', title: 'Escanea el residuo',    desc: 'Toma una foto y la IA identifica el material, si es reciclable y cómo desecharlo correctamente en Perú.' },
                { num: '02', Icon: BarChart3, rgb: '0,191,170',   accent: '#00BFAA', title: 'Acumula impacto',       desc: 'Cada escaneo suma EcoPuntos y registra CO₂ evitado. Ve tu huella ambiental crecer en tiempo real.' },
                { num: '03', Icon: Users,     rgb: '107,163,255', accent: '#6BA3FF', title: 'Compite en comunidad', desc: 'Únete a tu aula, colegio o municipio. El leaderboard muestra quién lidera el cambio en tu zona.' },
              ].map(s => (
                <div key={s.num} className="step-row">
                  <div className="step-num">{s.num}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className="icon-box" style={{ background: `rgba(${s.rgb},.12)`, border: `1px solid rgba(${s.rgb},.2)` }}>
                        <s.Icon size={17} color={s.accent} />
                      </div>
                      <h3 className="step-title">{s.title}</h3>
                    </div>
                    <p className="step-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider-wrap"><hr className="divider" /></div>

        {/* ── FOR WHOM ── */}
        <section id="para-quien" className="sec">
          <div className="wrap">
            <div className="sec-head">
              <h2 className="display-font" style={{ fontSize: 'clamp(30px,5vw,56px)', fontWeight: 800, color: '#E6F4F1', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 14 }}>
                Diseñado para<br />todos los niveles
              </h2>
              <p style={{ color: 'rgba(230,244,241,.42)', fontSize: 'clamp(14px,2vw,17px)', maxWidth: 420, lineHeight: 1.7 }}>
                Escala desde un ciudadano hasta una ciudad entera, sin cambiar de plataforma.
              </p>
            </div>

            <div className="scale-bar">
              {['Ciudadano', 'Aula', 'Colegio', 'Municipio', 'Ciudad'].map((lv, i, arr) => (
                <div key={lv} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span className="scale-pill" style={{
                    background: `rgba(${i <= 2 ? '0,137,123' : '21,101,192'},${ .07 + i * .04})`,
                    border: `1px solid rgba(${i <= 2 ? '0,137,123' : '21,101,192'},${ .18 + i * .04})`,
                    color: i <= 2 ? '#00E5B4' : '#6BA3FF',
                  }}>{lv}</span>
                  {i < arr.length - 1 && <ChevronRight size={12} color="rgba(255,255,255,0.18)" />}
                </div>
              ))}
            </div>

            <div className="role-bento">
              {[
                { Icon: Users,    role: 'Ciudadano', badge: 'Para ti',    color: '#00E5B4', rgb: '0,229,180',   wide: true,  features: ['Escanea residuos con IA', 'Consulta al EcoAsistente', 'Ve tu impacto personal', 'Retos semanales', 'Ranking de tu comunidad'] },
                { Icon: Building2,role: 'Colegio',   badge: 'Institución',color: '#6BA3FF', rgb: '107,163,255', wide: false, features: ['Dashboard de aulas', 'QR de acceso', 'Ranking entre clases', 'Reportes descargables'] },
                { Icon: Globe,    role: 'Municipio', badge: 'Admin local', color: '#6BA3FF', rgb: '107,163,255', wide: false, features: ['Mapa de puntos de acopio', 'Impacto del distrito', 'Campañas de reciclaje'] },
              ].map(c => (
                <div key={c.role} className={`role-card${c.wide ? ' role-card-wide' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div className="icon-box" style={{ background: `rgba(${c.rgb},.1)`, border: `1px solid rgba(${c.rgb},.18)` }}>
                      <c.Icon size={19} color={c.color} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: `rgba(${c.rgb},.1)`, color: c.color, letterSpacing: '.05em', textTransform: 'uppercase', flexShrink: 0 }}>{c.badge}</span>
                  </div>

                  <h3 className="display-font" style={{ fontSize: c.wide ? 28 : 20, fontWeight: 700, color: '#E6F4F1', marginBottom: 16, letterSpacing: '-.015em' }}>{c.role}</h3>

                  {c.wide && (
                    <p style={{ fontSize: 14, color: 'rgba(230,244,241,0.42)', lineHeight: 1.72, marginBottom: 16, maxWidth: 360 }}>
                      El ciudadano es el núcleo de EcoRed. Cada escaneo suma impacto real a tu comunidad y al planeta.
                    </p>
                  )}

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {c.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(230,244,241,.48)', fontWeight: 400 }}>
                        <span className="feat-dot" style={{ background: c.color, boxShadow: `0 0 5px ${c.color}` }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/auth/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: c.wide ? 28 : 20, padding: '11px 16px', borderRadius: 100, background: `rgba(${c.rgb},.08)`, border: `1px solid rgba(${c.rgb},.16)`, color: c.color, fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all .28s ease' }}>
                    Empezar <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider-wrap"><hr className="divider" /></div>

        {/* ── FEATURES — 2x2 asymmetric bento ── */}
        <section className="sec-md">
          <div className="wrap">
            <div className="feature-bento">
              <div className="feat-cell feat-cell-accent" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                  <div className="icon-box" style={{ background: 'rgba(0,137,123,0.15)', border: '1px solid rgba(0,137,123,0.22)' }}>
                    <Camera size={17} color="#00E5B4" />
                  </div>
                  <div className="icon-box" style={{ background: 'rgba(107,163,255,0.1)', border: '1px solid rgba(107,163,255,0.18)' }}>
                    <MessageCircle size={17} color="#6BA3FF" />
                  </div>
                </div>
                <h3 className="display-font" style={{ fontSize: 20, fontWeight: 700, color: '#E6F4F1', marginBottom: 8, letterSpacing: '-.01em' }}>Visión IA + Asistente</h3>
                <p style={{ fontSize: 14, color: 'rgba(230,244,241,.42)', lineHeight: 1.7 }}>
                  Llama 4 Scout Vision identifica cualquier residuo con una foto. El EcoAsistente conoce tu historial y responde en tiempo real.
                </p>
              </div>

              <div className="feat-cell feat-cell-plain">
                <div className="icon-box" style={{ background: 'rgba(0,137,123,0.1)', border: '1px solid rgba(0,137,123,0.16)', marginBottom: 14 }}>
                  <MapPin size={17} color="#00E5B4" />
                </div>
                <h3 className="display-font" style={{ fontSize: 17, fontWeight: 700, color: '#E6F4F1', marginBottom: 6, letterSpacing: '-.01em' }}>Mapa de acopio</h3>
                <p style={{ fontSize: 13, color: 'rgba(230,244,241,.38)', lineHeight: 1.65 }}>Puntos de reciclaje cerca de ti, actualizados por el municipio.</p>
              </div>

              <div className="feat-cell feat-cell-plain">
                <div className="icon-box" style={{ background: 'rgba(21,101,192,0.1)', border: '1px solid rgba(21,101,192,0.18)', marginBottom: 14 }}>
                  <BarChart3 size={17} color="#6BA3FF" />
                </div>
                <h3 className="display-font" style={{ fontSize: 17, fontWeight: 700, color: '#E6F4F1', marginBottom: 6, letterSpacing: '-.01em' }}>Rankings en vivo</h3>
                <p style={{ fontSize: 13, color: 'rgba(230,244,241,.38)', lineHeight: 1.65 }}>Podio de aulas actualizado con cada escaneo. Competencia en tiempo real.</p>
              </div>

              <div className="feat-cell feat-cell-blue" style={{ padding: '32px' }}>
                <div className="icon-box" style={{ background: 'rgba(107,163,255,0.12)', border: '1px solid rgba(107,163,255,0.2)', marginBottom: 18 }}>
                  <Recycle size={17} color="#6BA3FF" />
                </div>
                <h3 className="display-font" style={{ fontSize: 20, fontWeight: 700, color: '#E6F4F1', marginBottom: 8, letterSpacing: '-.01em' }}>Impacto medible</h3>
                <p style={{ fontSize: 14, color: 'rgba(230,244,241,.42)', lineHeight: 1.7 }}>
                  CO₂ evitado, kg reciclados y EcoPuntos por cada acción. Datos reales, no estimaciones genéricas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── IMPACT CTA — Double-Bezel ── */}
        <section id="impacto" className="sec-end">
          <div className="wrap">
            <div className="dbezel-outer">
              <div className="dbezel-inner">
                <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(rgba(0,137,123,.32),transparent)', filter: 'blur(50px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(rgba(21,101,192,.28),transparent)', filter: 'blur(45px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(0,229,180,.1)', border: '1px solid rgba(0,229,180,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 22px rgba(0,229,180,.12)' }}>
                    <Leaf size={22} color="#00E5B4" />
                  </div>

                  <h2 className="display-font" style={{ fontSize: 'clamp(26px,5vw,52px)', fontWeight: 800, color: '#E6F4F1', letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 16 }}>
                    El cambio empieza<br />en tu comunidad
                  </h2>

                  <p style={{ color: 'rgba(230,244,241,.48)', fontSize: 'clamp(14px,2vw,17px)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.75 }}>
                    Únete a EcoRed y convierte cada residuo en datos reales de impacto ambiental.
                  </p>

                  <div className="cta-btns">
                    <Link href="/auth/register" className="btn-cta" style={{ fontSize: 15, padding: '13px 20px 13px 28px' }}>
                      Crear cuenta gratuita
                      <span className="btn-icon" style={{ width: 28, height: 28 }}><ArrowRight size={14} /></span>
                    </Link>
                    <Link href="/auth/login" className="btn-outline" style={{ fontSize: 15, padding: '13px 28px' }}>
                      Ya tengo cuenta
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.055)', padding: '24px 20px' }}>
          <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#00897B,#005F57)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Leaf size={12} color="#fff" />
              </div>
              <span className="display-font" style={{ fontWeight: 700, color: '#E6F4F1', fontSize: 15 }}>EcoRed</span>
              <span style={{ color: 'rgba(255,255,255,.18)', fontSize: 13 }}>Tu comunidad, más verde</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,.14)', fontSize: 12 }}>QuipuSoft 2026 · Tecsup · Perú</span>
          </div>
        </footer>

      </div>
    </>
  )
}
