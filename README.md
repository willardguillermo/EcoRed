# EcoRed

**Tu comunidad, mas verde**

EcoRed es una PWA de reciclaje comunitario con IA, pensada para escalar desde un aula hasta un municipio completo. El proyecto se desarrolla para **QuipuSoft 2026**, hackathon organizado por Tecsup, bajo el enfoque de IA al servicio del planeta y reciclaje domestico.

## Vision del Proyecto

EcoRed ayuda a ciudadanos, colegios y municipios a adoptar habitos de reciclaje medibles. La aplicacion permite escanear residuos, recibir instrucciones de disposicion, conversar con un agente educativo, registrar impacto ambiental y visualizar el progreso colectivo por comunidad.

El modelo de crecimiento esperado es:

```txt
Ciudadano -> Aula -> Colegio -> Municipio -> Ciudad
```

## Objetivo del Hackathon

El desafio principal es demostrar una solucion factible, usable y escalable para adopcion comunitaria.

Criterios clave del jurado:

- Innovacion
- Impacto
- Factibilidad
- Usabilidad
- Escalabilidad

## Roles Principales

| Rol | Usuario | Funciones |
| --- | --- | --- |
| Ciudadano | Alumno, vecino o usuario general | Escanea residuos, consulta al agente, ve su impacto |
| Institucion | Colegio o municipio | Gestiona comunidad, rankings, aulas y reportes |
| Admin local | Municipalidad o responsable institucional | Gestiona puntos de acopio e impacto territorial |

## Funcionalidades Planeadas

- Landing publica de EcoRed
- Autenticacion con Supabase
- Registro y login
- Onboarding institucional para colegios y municipios
- Dashboard ciudadano
- Escaneo de residuos con IA
- Historial de escaneos
- Impacto ambiental personal y colectivo
- Leaderboard por aula, colegio o municipio
- Agente educativo conversacional
- Mapa de puntos de acopio
- Retos semanales y gamificacion
- Reportes para instituciones
- PWA instalable

## Alcance del MVP

Para el hackathon, el objetivo es priorizar una demo funcional con flujo completo hasta el reconocimiento de productos reciclables con IA.

Orden recomendado:

1. Base documental y limpieza inicial del proyecto.
2. Landing publica con propuesta de valor clara.
3. Auth: registro, login y proteccion de rutas.
4. Onboarding institucional basico.
5. Dashboard ciudadano.
6. Escaneo de residuos con IA.
7. Guardado de escaneos e impacto en Supabase.
8. Leaderboard institucional.
9. Pulido visual, responsive y preparacion del pitch.

## Stack Tecnico

Frontend:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- PWA

Backend y datos:

- Supabase
- PostgreSQL
- Row Level Security
- Supabase Auth
- Supabase Storage
- Realtime

IA:

- Servidor de IA institucional para reconocimiento de residuos.
- La integracion debe mantenerse desacoplada para poder cambiar de proveedor si hace falta.
- Anthropic aparece en dependencias iniciales, pero no sera el proveedor principal por ahora.

Deploy:

- Vercel

Package manager:

- pnpm

## Branding

| Token | Valor |
| --- | --- |
| Primary | `#00897B` |
| Secondary | `#1565C0` |
| Surface verde | `#E0F2F1` |
| Surface azul | `#E3F2FD` |
| Background | `#F5F5F5` |
| Texto | `#1A1A2E` |

Tipografias:

- Headings: Plus Jakarta Sans
- Body: Inter
- Datos: JetBrains Mono

## Estado Actual del Proyecto

Ya existe:

- Proyecto Next.js 16 con App Router.
- TypeScript configurado.
- Tailwind CSS v4.
- shadcn/ui inicializado.
- Variables globales de marca en `src/app/globals.css`.
- Layout raiz con fuentes y toaster en `src/app/layout.tsx`.
- Manifest PWA en `public/manifest.json`.
- Clientes Supabase en `src/lib/supabase/client.ts` y `src/lib/supabase/server.ts`.
- Tipos de base de datos en `src/types/database.ts`.
- Middleware/proxy de autenticacion en `src/proxy.ts`.
- Schema SQL completo en `supabase/schema.sql`.

Pendiente:

- Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase.
- Confirmar credenciales reales en `.env.local`.
- Definir contrato HTTP del servidor de IA institucional.
- Construir pantallas y flujos principales.

## Estructura Planeada de Rutas

```txt
/                        -> Landing publica
/auth/login              -> Login
/auth/register           -> Registro
/onboarding              -> Flujo institucional
/(app)/dashboard         -> Dashboard ciudadano
/(app)/scan              -> Camara + reconocimiento IA
/(app)/chat              -> Agente educativo
/(app)/leaderboard       -> Ranking comunitario
/institution/dashboard   -> Dashboard institucion
/institution/classrooms  -> Gestion de aulas
/institution/map         -> Puntos de acopio
/institution/reports     -> Reportes
/api/scan                -> Endpoint de reconocimiento IA
/api/chat                -> Endpoint del agente educativo
```

## Base de Datos

Tablas principales:

- `organizations`
- `classrooms`
- `profiles`
- `scans`
- `impact_logs`
- `recycling_points`
- `challenges`

Vistas:

- `org_leaderboard`
- `org_impact`

Todas las tablas principales tienen RLS activado en el schema inicial.

## Variables de Entorno

Crear o completar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# IA institucional
AI_SERVER_URL=
AI_SERVER_API_KEY=
```

Nota: si temporalmente se usa otro proveedor de IA, se debe encapsular detras de los endpoints internos de EcoRed para no acoplar la app a un proveedor especifico.

## Comandos

```bash
pnpm dev
pnpm build
pnpm lint
```

## Siguiente Paso Tecnico

Antes de construir features dependientes de datos reales, conviene avanzar en este orden:

1. Dejar la landing publica y navegacion base.
2. Crear auth con Supabase.
3. Ejecutar el schema en Supabase.
4. Probar registro/login con perfiles.
5. Construir el flujo de escaneo usando un contrato mock del servidor IA.
6. Reemplazar el mock por la API institucional cuando el contrato este definido.

## Informacion Pendiente

Para conectar el reconocimiento de residuos con IA institucional, falta definir:

- URL base del servidor.
- Metodo de autenticacion.
- Formato de request para imagenes.
- Formato de respuesta.
- Limites de tamano de imagen.
- Latencia esperada.
- Si devuelve categoria, material, instrucciones y confianza.

Repo: <https://github.com/willardguillermo/EcoRed>
