import Groq from "groq-sdk"
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { WasteCategory } from "@/types/database"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" })

const CATEGORY_META: Record<WasteCategory, { points: number; co2_kg: number; waste_kg: number }> = {
  plastic:    { points: 15, co2_kg: 0.50, waste_kg: 0.10 },
  paper:      { points: 10, co2_kg: 0.90, waste_kg: 0.15 },
  glass:      { points: 20, co2_kg: 0.30, waste_kg: 0.30 },
  metal:      { points: 25, co2_kg: 2.00, waste_kg: 0.10 },
  organic:    { points: 5,  co2_kg: 0.20, waste_kg: 0.20 },
  electronic: { points: 30, co2_kg: 1.50, waste_kg: 0.20 },
  hazardous:  { points: 20, co2_kg: 0.50, waste_kg: 0.10 },
  other:      { points: 5,  co2_kg: 0.05, waste_kg: 0.10 },
}

const SYSTEM_PROMPT = `Eres un experto en clasificación de residuos y reciclaje en Perú.
Analiza la imagen. Si la imagen NO contiene un residuo o basura (por ejemplo: personas, animales, paisajes, comida sin envase, objetos en uso), clasifícala como "other" con recyclable: false y explica en instructions que no es un residuo reconocible.
Si SÍ contiene un residuo, clasifícalo y responde ÚNICAMENTE con un JSON válido con este formato exacto (sin texto adicional):
{
  "waste_category": "plastic|paper|glass|metal|organic|electronic|hazardous|other",
  "waste_name": "nombre corto del residuo (ej: Botella PET)",
  "material": "descripción del material (ej: Plástico PET #1)",
  "recyclable": true|false,
  "confidence": 0-100,
  "instructions": "instrucciones concretas de preparación y dónde llevarlo en Perú (2-3 oraciones)",
  "eco_tip": "dato curioso o motivador sobre reciclar este material (1 oración)"
}`

export async function POST(request: Request) {
  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("No autenticado", { status: 401 })

  const form = await request.formData()
  const file = form.get("image") as File | null
  if (!file) return Response.json({ error: "No se recibió imagen" }, { status: 400 })

  const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!ALLOWED_MIME.includes(file.type))
    return Response.json({ error: "Formato no permitido (jpeg/png/webp/gif)" }, { status: 400 })
  if (file.size > 10 * 1024 * 1024)
    return Response.json({ error: "Imagen demasiado grande (máx 10 MB)" }, { status: 400 })

  const bytes   = await file.arrayBuffer()
  const base64  = Buffer.from(bytes).toString("base64")
  const dataUrl = `data:${file.type};base64,${base64}`

  let parsed: {
    waste_category: WasteCategory
    waste_name:     string
    material:       string
    recyclable:     boolean
    confidence:     number
    instructions:   string
    eco_tip:        string
  }

  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text",      text: "Analiza este residuo y clasifícalo." },
        ],
      },
    ]

    const completion = await groq.chat.completions.create({
      model:      "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 600,
      messages,
    })

    const text  = completion.choices[0]?.message?.content ?? "{}"
    const first = text.indexOf("{")
    const last  = text.lastIndexOf("}")
    const jsonStr = first !== -1 && last > first ? text.slice(first, last + 1) : text
    parsed = JSON.parse(jsonStr)
  } catch {
    return Response.json({ error: "Error al analizar la imagen. Intenta con otra foto." }, { status: 500 })
  }

  // Validar campos NOT NULL antes de insertar — el modelo puede devolver JSON incompleto
  const required = ["waste_name", "material", "instructions"] as const
  for (const field of required) {
    if (!parsed[field]) {
      return Response.json({ error: "La IA no pudo clasificar el residuo. Intenta con otra foto." }, { status: 422 })
    }
  }
  // Boolean("false") === true, so we need explicit string comparison
  if (typeof parsed.recyclable !== "boolean") {
    parsed.recyclable = String(parsed.recyclable).toLowerCase() === "true"
  }

  const category = (CATEGORY_META[parsed.waste_category] ? parsed.waste_category : "other") as WasteCategory
  const meta     = CATEGORY_META[category]

  // Solo se otorgan puntos e impacto si el ítem es reciclable
  const pointsEarned = parsed.recyclable ? meta.points  : 0
  const co2Saved     = parsed.recyclable ? meta.co2_kg  : 0
  const wasteKg      = parsed.recyclable ? meta.waste_kg : 0

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, classroom_id")
    .eq("id", user.id)
    .single() as { data: { org_id: string | null; classroom_id: string | null } | null }

  const { data: scan, error: scanError } = await adminSupabase
    .from("scans")
    .insert({
      user_id:        user.id,
      org_id:         profile?.org_id      ?? null,
      classroom_id:   profile?.classroom_id ?? null,
      waste_category: category,
      waste_name:     parsed.waste_name,
      material:       parsed.material,
      recyclable:     parsed.recyclable,
      instructions:   parsed.instructions,
      confidence:     Number.isFinite(parsed.confidence)
                        ? Math.min(Math.max(parsed.confidence, 0), 100) / 100
                        : null,
      points_earned:  pointsEarned,
      image_url:      null,
    })
    .select("id")
    .single()

  if (scanError) return Response.json({ error: scanError.message }, { status: 500 })

  const { error: impactError } = await adminSupabase.from("impact_logs").insert({
    user_id:      user.id,
    org_id:       profile?.org_id ?? null,
    scan_id:      scan.id,
    co2_saved_kg: co2Saved,
    waste_kg:     wasteKg,
  })
  if (impactError) console.error("[scan] impact_log insert failed:", impactError.message)

  if (pointsEarned > 0) {
    const { error: pointsError } = await adminSupabase.rpc("increment_points", { uid: user.id, delta: pointsEarned })
    if (pointsError) console.error("[scan] increment_points failed:", pointsError.message)
  }

  return Response.json({
    waste_category: category,
    waste_name:     parsed.waste_name,
    material:       parsed.material,
    recyclable:     parsed.recyclable,
    confidence:     parsed.confidence,
    instructions:   parsed.instructions,
    eco_tip:        parsed.eco_tip,
    points_earned:  pointsEarned,
    co2_saved_kg:   co2Saved,
  })
}
