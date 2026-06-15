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

## Memoria de direccion actualizada

### Referencia funcional descartable
- La carpeta externa `ecored/` fue usada solo como referencia de logica y flujos.
- No se debe copiar su diseno visual.
- Se rescata la idea de producto: portal ciudadano, portal municipal, scanner IA, EcoPuntos, retos, historial, chat, onboarding institucional, ranking, metricas, reportes y QR.
- Se descarta el estilo editorial/literario: serif decorativa, cursivas, textos largos, bordes negros duros, tono poetico y cualquier caracter roto tipo `Ã³`, `Â¡`, `â€¢`.

### Direccion visual oficial
EcoRed debe sentirse como una PWA eco-tech moderna, limpia, comunitaria y practica. Debe parecer una app real de producto, no una landing decorativa ni un documento editorial.

- Base visual clara, ordenada y premium.
- Paleta oficial: verde `#00897B`, azul institucional `#1565C0`, fondos suaves verde/azul, texto `#1A1A2E`.
- Tipografia: Plus Jakarta Sans para headings, Inter para cuerpo, JetBrains Mono para datos.
- UI basada en tarjetas suaves, radios moderados, jerarquia clara, buen espaciado y componentes consistentes.
- Animaciones sutiles y funcionales, no efectos decorativos excesivos.
- Iconografia consistente con `lucide-react`.
- Prioridad de diseno: velocidad de lectura, confianza, usabilidad y demo fuerte para hackathon.

### Stack oficial
EcoRed se construye sobre el stack oficial del repo, no sobre el stack del preview.

- Framework: Next.js App Router.
- Lenguaje: TypeScript.
- UI: React, Tailwind CSS v4, shadcn/ui.
- DB/Auth/Realtime: Supabase.
- IA: Claude/Anthropic.
- PWA: `@ducanh2912/next-pwa`.
- Deploy: Vercel.
- Package manager: pnpm.
- QR: `qrcode.react`.
- Mapas: Leaflet / react-leaflet.
- Graficos: preferir Recharts si se necesita dashboard analitico.

No usar Vite ni Gemini como base del proyecto oficial. El preview puede inspirar flujos, pero la implementacion final debe vivir en Next.js, Supabase y Claude.

### Funcionalidades que se deben conservar
- Selector de portal: ciudadano / gestion municipal.
- Navegacion superior, sidebar desktop y navegacion inferior mobile.
- Indicador de IA activa y notificaciones con dropdown.
- Dashboard ciudadano con bienvenida, EcoPuntos, kg reciclados, CO2 evitado, reto semanal e historial filtrable.
- Modal de detalle de escaneo con instrucciones de disposicion y mensaje de impacto.
- Scanner IA con camara real o simulada, HUD, presets, resultado de analisis y checklist obligatorio antes de acreditar puntos.
- EcoAsistente conversacional con preguntas sugeridas, burbujas, estado escribiendo, autoscroll y envio personalizado.
- Dashboard municipal con metricas globales, grafico mensual, top comunidades, campanas/reto escolares y exportacion.
- Onboarding institucional tipo wizard: tipo de organizacion, datos, ubicaciones/aulas/puntos de acopio, QR final y acciones de copiar/descargar.

### Disciplina tipo Angular aplicada a Next.js/React
Aunque EcoRed use React/Next, se adoptan beneficios de Angular: estructura guiada, convenciones fuertes y separacion clara de responsabilidades.

Principios:
- Arquitectura modular por dominio: `features/citizen`, `features/scanner`, `features/assistant`, `features/institution`, `features/onboarding`.
- Separar UI, estado, servicios, tipos y logica de negocio.
- No meter llamadas a Supabase, Claude o `fetch` dispersas dentro de componentes visuales grandes.
- Centralizar servicios/helper modules: `authService`, `scanService`, `chatService`, `impactService`, `organizationService`, `challengeService`.
- Usar contratos TypeScript claros: `UserProfile`, `ScanResult`, `Organization`, `Challenge`, `ImpactLog`, `RecyclingPoint`, `ChatMessage`.
- Definir estados predecibles para flujos: `idle`, `loading`, `success`, `error`, `empty`, `simulated`.
- Formularios con validacion clara, datos normalizados y errores visibles.
- Componentes reutilizables para layout, cards, buttons, badges, dialogs, navigation, metric widgets y empty states.
- Convenciones antes que libertad extrema: React da flexibilidad, pero EcoRed debe mantenerse ordenado, entendible y escalable para el equipo.

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
