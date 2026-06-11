# EcoRed — Contexto del proyecto para Claude

## Quién soy
Desarrollador full-stack participando en **QuipuSoft 2026**, hackathon organizado por Tecsup (Perú).
- Email: guillermo.willard@tecsup.edu.pe
- GitHub: willardguillermo

## Stack técnico
Frontend: Next.js 15, React, TypeScript, Tailwind CSS v4, shadcn/ui, PWA
Backend/DB: Supabase (PostgreSQL, RLS, Realtime, Storage)
IA: Claude API (Anthropic) — agentes, herramientas, visión
Deploy: Vercel
Package manager: pnpm

## El hackathon
- **Evento:** QuipuSoft 2026 — Tecsup
- **Tema:** IA al servicio del planeta / reciclaje doméstico
- **Premio:** S/5,000
- **Equipo:** 2 personas (yo + 1 compañero que aprende rápido)
- **Duración:** ~2 semanas, virtual
- **Pitch:** 5 min presentación + 3 min preguntas

### Criterios del jurado
1. Innovación, 2. Impacto, 3. Factibilidad, 4. Usabilidad, 5. Escalabilidad

## El proyecto: EcoRed

**Concepto:** PWA de reciclaje comunitario con IA, escalable desde un aula hasta un municipio completo.

**Tagline:** "Tu comunidad, más verde"

**Desafío principal:** #09 — Escalabilidad y adopción comunitaria (adoptable por escuelas y municipios)
**Desafíos integrados:** #01/#08 (visión computadora), #02 (agente educativo), #05 (personalización), #06 (medición impacto)

### Modelo de escalabilidad
```
Ciudadano → Aula → Colegio → Municipio → Ciudad
```

### 3 roles principales
| Rol | Quién | Qué hace |
|-----|-------|----------|
| Ciudadano | Cualquier persona | Escanea residuos, chatea con agente, ve su impacto |
| Institución | Colegio o municipio | Dashboard colectivo, ranking de aulas, reportes |
| Admin local | Municipio | Mapa de puntos de acopio, impacto del distrito |

### Onboarding institucional (3 pasos)
- **Colegio:** 1) Datos del colegio → 2) Crear aulas + código QR → 3) Compartir QR con alumnos
- **Municipio:** 1) Datos del municipio → 2) Mapear puntos de acopio → 3) Link/QR del distrito

## Arquitectura de agentes Claude
| Feature | Modelo | Uso |
|---------|--------|-----|
| Identificar residuo (foto) | claude-sonnet-4-6 (vision) | Foto → tipo, material, instrucciones |
| Agente educativo conversacional | claude-sonnet-4-6 | Chat adaptado por edad/rol |
| Generar retos semanales | claude-haiku-4-5-20251001 | Texto de retos por org |
| Calcular impacto ambiental | claude-haiku-4-5-20251001 | CO₂ evitado, equivalencias |
| Planificación (solo desarrollo) | claude-opus-4-7 | No se usa en producción |

## Branding
- **Primary:** #00897B (verde esmeralda)
- **Secondary:** #1565C0 (azul institución)
- **Surface verde:** #E0F2F1
- **Surface azul:** #E3F2FD
- **Background:** #F5F5F5
- **Texto:** #1A1A2E
- **Tipografía:** Plus Jakarta Sans (headings) + Inter (body) + JetBrains Mono (datos)

## Lo que ya está construido
- [x] Proyecto Next.js 16 + TypeScript + Tailwind v4 + App Router
- [x] shadcn/ui inicializado con paleta EcoRed
- [x] Dependencias instaladas: @supabase/supabase-js, @supabase/ssr, @anthropic-ai/sdk, qrcode.react, leaflet, react-leaflet, sonner, @ducanh2912/next-pwa
- [x] `src/lib/supabase/client.ts` — cliente browser
- [x] `src/lib/supabase/server.ts` — cliente servidor
- [x] `src/lib/anthropic.ts` — cliente Claude con los 3 modelos
- [x] `src/types/database.ts` — tipos TypeScript completos de la DB
- [x] `src/proxy.ts` — auth middleware (protege rutas, redirige por rol)
- [x] `src/app/layout.tsx` — layout raíz con fuentes EcoRed + Toaster
- [x] `src/app/globals.css` — variables CSS con paleta EcoRed
- [x] `public/manifest.json` — PWA configurada
- [x] `supabase/schema.sql` — schema completo con RLS

## Schema de base de datos (Supabase)
Tablas: `organizations`, `classrooms`, `profiles`, `scans`, `impact_logs`, `recycling_points`, `challenges`
Vistas: `org_leaderboard`, `org_impact`
RLS activo en todas las tablas.

## Estructura de rutas (App Router)
```
/                        → Landing pública
/auth/login              → Login
/auth/register           → Registro
/onboarding              → Flujo 3 pasos (colegio o municipio)
/(app)/dashboard         → Dashboard ciudadano
/(app)/scan              → Cámara + Claude Vision
/(app)/chat              → Agente conversacional
/(app)/leaderboard       → Ranking en tiempo real
/institution/dashboard   → Dashboard institución
/institution/classrooms  → Gestión de aulas
/institution/map         → Mapa de puntos de acopio
/institution/reports     → Exportación de reportes
/api/scan                → Endpoint Claude Vision
/api/chat                → Endpoint Claude Agent
```

## Variables de entorno necesarias (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Próximos pasos (en orden)
1. Crear proyecto en Supabase y llenar `.env.local`
2. Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase
3. Poner API key de Anthropic en `.env.local`
4. Construir flujo auth (login/register)
5. Construir onboarding institucional (3 pasos)
6. Construir feature de scan con Claude Vision
7. Dashboard ciudadano
8. Dashboard institución + leaderboard Realtime
9. Agente conversacional
10. Mapa de puntos de acopio (Leaflet)
11. Sistema de retos y gamificación
12. Exportación PDF para municipios
13. Polish + testing + pitch prep

## Comandos útiles
```bash
pnpm dev        # desarrollo
pnpm build      # build de producción
pnpm lint       # linting
```

## Repo
https://github.com/willardguillermo/EcoRed
