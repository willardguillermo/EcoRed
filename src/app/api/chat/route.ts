import Groq from "groq-sdk"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getProfile, getImpactTotals, getRecentScans } from "@/features/citizen/citizenService"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" })

// ── Sistema de intents por palabras clave ─────────────────────────────────────
// Más confiable que tool calling automático: detectamos la intención y
// ejecutamos la query directamente, luego inyectamos los datos en el prompt.

type Intent =
  | { type: "recycling_points"; categoria?: string }
  | { type: "challenges" }
  | { type: "leaderboard"; subtipo: "usuarios" | "aulas" }

const WASTE_KEYWORDS: Record<string, string> = {
  plástico: "plastic",  plastico: "plastic",  botella: "plastic",
  papel:    "paper",    cartón:   "paper",     carton:  "paper",
  vidrio:   "glass",    frasco:   "glass",
  metal:    "metal",    lata:     "metal",     aluminio: "metal",
  orgánico: "organic",  organico: "organic",   comida: "organic",
  electrónico: "electronic", electronico: "electronic", celular: "electronic",
  peligroso: "hazardous", pila: "hazardous", batería: "hazardous",
}

function detectIntent(msg: string): Intent | null {
  const lower = msg.toLowerCase()

  // Ranking / leaderboard
  if (/ranking|posici[oó]n|quién.*m[aá]s|quien.*mas|lidera|primero|puntaje|tabla/i.test(lower)) {
    const subtipo = /aula|clase|salon|salón|grupo/i.test(lower) ? "aulas" : "usuarios"
    return { type: "leaderboard", subtipo }
  }

  // Retos / desafíos
  if (/reto|desafío|desafio|ganar.*punto|punto.*extra|competencia|campaña/i.test(lower)) {
    return { type: "challenges" }
  }

  // Puntos de acopio (tiene que mencionar lugar + reciclar, o mencionarlo directamente)
  if (/acopio|recolección|recoleccion|dónde.*recicl|donde.*recicl|recicl.*donde|recicl.*dónde|llevar.*residuo|punto.*recicl/i.test(lower)) {
    for (const [kw, cat] of Object.entries(WASTE_KEYWORDS)) {
      if (lower.includes(kw)) return { type: "recycling_points", categoria: cat }
    }
    return { type: "recycling_points" }
  }

  return null
}

// ── Ejecución directa de queries según intent ─────────────────────────────────

async function fetchIntentData(
  intent: Intent,
  _supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string | null
): Promise<string> {
  // Usamos admin client para bypassear RLS en queries de leaderboard y puntos de acopio
  const admin = createAdminClient()
  try {
    if (intent.type === "recycling_points") {
      type RPoint = { name: string; address: string; materials: string[]; schedule: string | null }
      const base = admin.from("recycling_points").select("name, address, materials, schedule")
      const { data } = await (
        intent.categoria
          ? base.contains("materials", [intent.categoria]).limit(5)
          : base.limit(5)
      )
      const points = (data ?? []) as RPoint[]
      if (points.length === 0) {
        return "PUNTOS DE ACOPIO: No hay puntos de acopio registrados en EcoRed para esta categoría. Informa al usuario y sugiere contactar al municipio local."
      }
      const CAT_ES: Record<string, string> = {
        plastic: "Plástico", paper: "Papel", glass: "Vidrio", metal: "Metal",
        organic: "Orgánico", electronic: "Electrónico", hazardous: "Peligroso", other: "Otro"
      }
      const lista = points
        .map(p => `• ${p.name} — ${p.address} (Acepta: ${p.materials.map(m => CAT_ES[m] ?? m).join(", ")}${p.schedule ? ` | ${p.schedule}` : ""})`)
        .join("\n")
      return `PUNTOS DE ACOPIO EN TIEMPO REAL (datos oficiales de EcoRed):\n${lista}\n\nUSA ESTOS DATOS EXACTOS en tu respuesta. No inventes otros.`
    }

    if (intent.type === "challenges") {
      if (!orgId) return "RETOS: El usuario no pertenece a ninguna organización con retos activos."
      type Challenge = { title: string; description: string; points: number; deadline: string }
      const { data } = await admin
        .from("challenges")
        .select("title, description, points, deadline")
        .eq("org_id", orgId)
        .eq("active", true)
        .gt("deadline", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(3)
      const chs = (data ?? []) as Challenge[]
      if (chs.length === 0) return "RETOS: No hay retos activos en la organización del usuario en este momento."
      const lista = chs.map(c => {
        const dias = Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86_400_000)
        return `• ${c.title} (+${c.points} pts) — ${c.description} — Vence en ${dias} día${dias !== 1 ? "s" : ""}`
      }).join("\n")
      return `RETOS ACTIVOS EN TIEMPO REAL:\n${lista}\n\nUSA ESTOS DATOS en tu respuesta.`
    }

    if (intent.type === "leaderboard") {
      if (!orgId) return "RANKING: El usuario no pertenece a ninguna organización con ranking disponible."
      if (intent.subtipo === "aulas") {
        type ClsRow = { rank: number; classroom_name: string; total_points: number; member_count: number }
        const { data } = await admin
          .from("classroom_leaderboard")
          .select("rank, classroom_name, total_points, member_count")
          .eq("org_id", orgId)
          .order("rank", { ascending: true })
          .limit(5)
        const rows = (data ?? []) as ClsRow[]
        if (rows.length === 0) return "RANKING: Aún no hay ranking de aulas disponible."
        const lista = rows.map(c => `${c.rank}. ${c.classroom_name}: ${Number(c.total_points).toLocaleString("es-PE")} pts (${c.member_count} miembros)`).join("\n")
        return `RANKING DE AULAS EN TIEMPO REAL:\n${lista}\n\nUSA ESTOS DATOS en tu respuesta.`
      } else {
        type UserRow = { rank: number; full_name: string; points: number; classroom_name: string | null }
        const { data } = await admin
          .from("org_leaderboard")
          .select("rank, full_name, points, classroom_name")
          .eq("org_id", orgId)
          .order("rank", { ascending: true })
          .limit(5)
        const rows = (data ?? []) as UserRow[]
        if (rows.length === 0) return "RANKING: Aún no hay ranking disponible en la organización."
        const lista = rows.map(u => `${u.rank}. ${u.full_name}: ${Number(u.points).toLocaleString("es-PE")} pts${u.classroom_name ? ` (${u.classroom_name})` : ""}`).join("\n")
        return `RANKING DE USUARIOS EN TIEMPO REAL:\n${lista}\n\nUSA ESTOS DATOS en tu respuesta. No inventes posiciones.`
      }
    }
  } catch (err) {
    console.error("[fetchIntentData] error:", err)
  }
  return ""
}

// ── System prompt ─────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `Eres EcoAsistente, el agente educativo de EcoRed — plataforma de reciclaje comunitario en Perú.

COMPORTAMIENTO:
- Responde siempre en español, tono amigable, claro y motivador
- Adapta el lenguaje al usuario (simple para niños, técnico para adultos)
- Al identificar un residuo: categoría, si es reciclable, cómo prepararlo y dónde llevarlo
- Usa datos reales de impacto ambiental (CO₂, agua, energía ahorrada)
- Respuestas concisas (máx 3-4 párrafos)
- Emojis con moderación ♻️🌿
- Si preguntan por historial, impacto o puntos → usa el CONTEXTO DEL USUARIO
- NUNCA digas que no tienes acceso al historial

GUARDRAILS:
- SOLO responde sobre reciclaje, medio ambiente, sostenibilidad o EcoRed
- Si el tema NO es ambiental: "Mi especialidad es el reciclaje y el cuidado del planeta. ¿Hay algo ambiental en lo que pueda ayudarte? ♻️"
- Si el prompt contiene sección "DATOS EN TIEMPO REAL", ÚSALOS y no inventes datos adicionales
- NUNCA inventes posiciones en rankings ni direcciones de puntos de acopio

Temas que dominas: clasificación de residuos, proceso de reciclaje, impacto ambiental, puntos de acopio en Perú, hábitos sostenibles, economía circular, normativas de reciclaje en Perú.`

// ── Contexto del usuario ──────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  plastic: "Plástico", paper: "Papel", glass: "Vidrio", metal: "Metal",
  organic: "Orgánico", electronic: "Electrónico", hazardous: "Peligroso", other: "Otro",
}

function buildUserContext(
  name:    string,
  points:  number,
  co2:     number,
  wasteKg: number,
  scans:   { waste_name: string; waste_category: string; recyclable: boolean; points_earned: number; created_at: string }[]
): string {
  const scanLines = scans.length === 0
    ? "  (ninguno aún)"
    : scans.map((s, i) =>
        `  ${i + 1}. ${s.waste_name} (${CATEGORY_LABELS[s.waste_category] ?? s.waste_category}) — ${s.recyclable ? "Reciclable" : "No reciclable"} — +${s.points_earned} pts — ${new Date(s.created_at).toLocaleDateString("es-PE")}`
      ).join("\n")

  return `
--- CONTEXTO DEL USUARIO ---
Nombre: ${name}
EcoPuntos acumulados: ${points.toLocaleString("es-PE")} pts
CO₂ evitado total: ${co2.toFixed(2)} kg
Residuos reciclados total: ${wasteKg.toFixed(2)} kg
Últimos ${scans.length} residuos escaneados:
${scanLines}
--- FIN CONTEXTO ---`
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("No autenticado", { status: 401 })

  try {
    const { messages } = await request.json() as {
      messages: { role: "user" | "assistant"; content: string }[]
    }

    const [profile, impact, scans] = await Promise.all([
      getProfile(user.id),
      getImpactTotals(user.id),
      getRecentScans(user.id, 10),
    ])

    const userName = profile?.full_name?.split(" ")[0] ?? "Usuario"
    const orgId    = profile?.org_id ?? null

    const userCtx = buildUserContext(
      userName,
      profile?.points ?? 0,
      impact.co2_saved_kg,
      impact.waste_kg,
      scans,
    )

    // Detectar intent y cargar datos en tiempo real
    const lastMsg = messages[messages.length - 1]?.content ?? ""
    const intent  = detectIntent(lastMsg)
    const realtimeData = intent
      ? await fetchIntentData(intent, supabase, orgId)
      : ""

    const systemPrompt = [
      BASE_SYSTEM_PROMPT,
      userCtx,
      realtimeData ? `\n--- DATOS EN TIEMPO REAL ---\n${realtimeData}\n--- FIN DATOS ---` : "",
    ].join("\n")

    // Llamada única streaming con todos los datos ya inyectados
    const stream = await groq.chat.completions.create({
      model:      "llama-3.1-8b-instant",
      max_tokens: 800,
      stream:     true,
      messages:   [{ role: "system", content: systemPrompt }, ...messages],
    })

    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ""
            if (text) controller.enqueue(encoder.encode(text))
          }
          controller.close()
        },
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    )

  } catch (err) {
    console.error("[chat/route] error:", err)
    return new Response(
      new ReadableStream({
        start(c) {
          c.enqueue(new TextEncoder().encode("Tuve un problema técnico momentáneo. Por favor intenta de nuevo. ♻️"))
          c.close()
        },
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    )
  }
}
