import Groq from "groq-sdk"
import { createClient } from "@/lib/supabase/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `Eres EcoAsistente, el agente educativo de EcoRed — una plataforma de reciclaje comunitario en Perú.

Tu misión es educar y motivar a ciudadanos, estudiantes y comunidades a reciclar mejor.

Guías de comportamiento:
- Responde siempre en español, con un tono amigable, claro y motivador
- Adapta tu nivel de lenguaje al usuario (más simple para niños, más técnico para adultos)
- Cuando identifiques un residuo, explica: categoría, si es reciclable, cómo prepararlo y dónde llevarlo
- Usa datos reales de impacto ambiental cuando sea relevante (CO₂, agua, energía ahorrada)
- Sugiere retos y hábitos concretos que el usuario puede adoptar
- Mantén respuestas concisas (máximo 3-4 párrafos) a menos que se pida más detalle
- Usa emojis con moderación ♻️🌿

Temas que dominas:
- Clasificación de residuos (plástico, papel, vidrio, metal, orgánico, electrónico, peligroso)
- Proceso de reciclaje por material
- Impacto ambiental del reciclaje
- Puntos de acopio y la cadena de reciclaje en Perú
- Hábitos sostenibles en el hogar, colegio y comunidad
- Economía circular y reutilización
- Leyes y normativas de reciclaje en Perú`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("No autenticado", { status: 401 })

  const { messages } = await request.json() as {
    messages: { role: "user" | "assistant"; content: string }[]
  }

  const stream = await groq.chat.completions.create({
    model:      "llama-3.1-8b-instant",
    max_tokens: 800,
    stream:     true,
    messages:   [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ""
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
