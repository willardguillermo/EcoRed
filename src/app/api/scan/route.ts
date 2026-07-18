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

const SCAN_IMAGE_BUCKET = "scan-images"
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const
const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

const CATEGORY_LABELS: Record<WasteCategory, string> = {
  plastic: "Plastico",
  paper: "Papel",
  glass: "Vidrio",
  metal: "Metal",
  organic: "Organico",
  electronic: "Electronico",
  hazardous: "Residuo peligroso",
  other: "Residuo no identificado",
}

const DEFAULT_GROQ_VISION_MODELS = [
  "qwen/qwen3.6-27b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
]

const SYSTEM_PROMPT = `Eres EcoRed Vision, un clasificador experto de residuos para Peru.

Tu tarea:
- Identifica el residuo principal visible en la imagen.
- Si hay una mano, mesa, bolsa o personas pero el residuo se ve claro, clasifica el residuo, no la escena.
- Si hay varios residuos mezclados, clasifica el material dominante y menciona la mezcla en instructions.
- Si no hay ningun residuo reconocible, usa waste_category "other", recyclable false y explica que la foto debe mostrar mejor el residuo.

Reglas de categoria:
- Botellas PET, bolsas, envases plasticos, tapas: plastic.
- Papel, carton, cuadernos, cajas limpias: paper.
- Botellas/frascos de vidrio: glass.
- Latas, aluminio, chatarra pequena: metal.
- Restos de comida, cascaras, hojas: organic.
- Cables, celulares, cargadores, aparatos: electronic.
- Pilas, baterias, aerosoles, focos, quimicos, medicina: hazardous.
- Si no encaja o no es residuo: other.

Responde solo JSON valido. Sin markdown, sin texto antes ni despues.`

const RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "waste_scan_result",
    description: "Resultado normalizado de clasificacion de residuos para EcoRed",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: [
        "waste_category",
        "waste_name",
        "material",
        "recyclable",
        "confidence",
        "instructions",
        "eco_tip",
      ],
      properties: {
        waste_category: {
          type: "string",
          enum: ["plastic", "paper", "glass", "metal", "organic", "electronic", "hazardous", "other"],
        },
        waste_name: {
          type: "string",
          description: "Nombre corto y entendible, por ejemplo Botella PET o Lata de aluminio",
        },
        material: {
          type: "string",
          description: "Material especifico o composicion probable",
        },
        recyclable: {
          type: "boolean",
        },
        confidence: {
          type: "number",
          minimum: 0,
          maximum: 100,
        },
        instructions: {
          type: "string",
          description: "2 o 3 oraciones concretas sobre como prepararlo y donde llevarlo en Peru",
        },
        eco_tip: {
          type: "string",
          description: "Una frase breve y motivadora sobre el impacto de reciclar ese material",
        },
      },
    },
  },
} as const

const JSON_OBJECT_RESPONSE_FORMAT = { type: "json_object" } as const

type ScanClassification = {
  waste_category: WasteCategory
  waste_name: string
  material: string
  recyclable: boolean
  confidence: number
  instructions: string
  eco_tip: string
}

type RawClassification = Partial<Record<keyof ScanClassification, unknown>>
type AdminSupabase = ReturnType<typeof createAdminClient>

function getVisionModels() {
  const configured = process.env.GROQ_VISION_MODEL
    ?.split(",")
    .map(model => model.trim())
    .filter(Boolean) ?? []

  return [...new Set([...configured, ...DEFAULT_GROQ_VISION_MODELS])]
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function toStringValue(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function normalizeCategory(value: unknown): WasteCategory {
  const raw = stripAccents(String(value ?? "")).toLowerCase()
  const token = raw.replace(/[^a-z0-9]/g, "")

  if (token.includes("plastic") || token.includes("plastico") || token.includes("pet")) return "plastic"
  if (token.includes("paper") || token.includes("papel") || token.includes("carton")) return "paper"
  if (token.includes("glass") || token.includes("vidrio")) return "glass"
  if (token.includes("metal") || token.includes("aluminio") || token.includes("lata")) return "metal"
  if (token.includes("organic") || token.includes("organico") || token.includes("comida")) return "organic"
  if (token.includes("electronic") || token.includes("electronico") || token.includes("ewaste")) return "electronic"
  if (token.includes("hazard") || token.includes("peligroso") || token.includes("bateria") || token.includes("pila")) return "hazardous"

  return "other"
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const normalized = stripAccents(value).toLowerCase().trim()
    if (["true", "si", "yes", "1", "reciclable"].includes(normalized)) return true
    if (["false", "no", "0", "no reciclable"].includes(normalized)) return false
  }
  return fallback
}

function normalizeConfidence(value: unknown) {
  const raw = typeof value === "number"
    ? value
    : Number.parseFloat(String(value ?? "").replace("%", ""))

  if (!Number.isFinite(raw)) return 70
  const percent = raw <= 1 ? raw * 100 : raw
  return Math.round(Math.min(Math.max(percent, 0), 100))
}

function extractJson(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
  const first = cleaned.indexOf("{")
  const last = cleaned.lastIndexOf("}")
  if (first === -1 || last <= first) throw new Error("Groq no devolvio JSON")
  return cleaned.slice(first, last + 1)
}

function normalizeClassification(raw: RawClassification): ScanClassification {
  const category = normalizeCategory(raw.waste_category)
  const fallbackName = CATEGORY_LABELS[category]
  const recyclable = normalizeBoolean(
    raw.recyclable,
    category !== "other" && category !== "hazardous",
  )

  return {
    waste_category: category,
    waste_name: toStringValue(raw.waste_name, fallbackName).slice(0, 90),
    material: toStringValue(raw.material, fallbackName).slice(0, 120),
    recyclable,
    confidence: normalizeConfidence(raw.confidence),
    instructions: toStringValue(
      raw.instructions,
      recyclable
        ? "Limpia el residuo, separalo por material y llevalo a un punto de acopio cercano. Si esta mezclado con comida o liquidos, enjuagalo antes de reciclarlo."
        : "Toma una foto mas clara del residuo o separalo de otros objetos. Si es peligroso, no lo mezcles con reciclaje comun y llevalo a un punto autorizado.",
    ).slice(0, 500),
    eco_tip: toStringValue(
      raw.eco_tip,
      "Separar bien los residuos mejora la calidad del reciclaje y aumenta su impacto.",
    ).slice(0, 220),
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message)
  }
  return String(error)
}

function getPublicAnalysisError(error: unknown) {
  const message = stripAccents(getErrorMessage(error)).toLowerCase()

  if (message.includes("invalid api key") || message.includes("api_key") || message.includes("groq_api_key")) {
    return "La IA no esta configurada correctamente. Actualiza la GROQ_API_KEY y vuelve a intentar."
  }

  if (
    message.includes("model") &&
    (message.includes("decommission") || message.includes("not found") || message.includes("does not exist") || message.includes("permission"))
  ) {
    return "El modelo de vision de Groq no esta disponible para esta key. Configura GROQ_VISION_MODEL con un modelo de vision habilitado."
  }

  return "Groq no pudo reconocer el residuo. Prueba con una foto mas clara, con buena luz y el residuo centrado."
}

async function ensureScanImageBucket(adminSupabase: AdminSupabase) {
  const { error } = await adminSupabase.storage.getBucket(SCAN_IMAGE_BUCKET)
  if (!error) return

  const { error: createError } = await adminSupabase.storage.createBucket(SCAN_IMAGE_BUCKET, {
    public: false,
    allowedMimeTypes: [...ALLOWED_MIME],
    fileSizeLimit: 10 * 1024 * 1024,
  })

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw createError
  }
}

async function createSignedScanImageUrl(
  adminSupabase: AdminSupabase,
  userId: string,
  file: File,
  bytes: ArrayBuffer,
) {
  await ensureScanImageBucket(adminSupabase)

  const extension = MIME_EXTENSION[file.type] ?? "jpg"
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await adminSupabase.storage
    .from(SCAN_IMAGE_BUCKET)
    .upload(path, Buffer.from(bytes), {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data, error: signedUrlError } = await adminSupabase.storage
    .from(SCAN_IMAGE_BUCKET)
    .createSignedUrl(path, 10 * 60)

  if (signedUrlError || !data?.signedUrl) {
    throw signedUrlError ?? new Error("No se pudo crear URL firmada para Groq")
  }

  return { path, signedUrl: data.signedUrl }
}

async function removeSignedScanImage(adminSupabase: AdminSupabase, path: string | null) {
  if (!path) return
  const { error } = await adminSupabase.storage.from(SCAN_IMAGE_BUCKET).remove([path])
  if (error) console.error("[scan] temporary image cleanup failed:", error.message)
}

async function analyzeWasteImage(dataUrl: string): Promise<ScanClassification> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Falta configurar GROQ_API_KEY")
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "image_url", image_url: { url: dataUrl } },
        {
          type: "text",
          text: "Clasifica el residuo de esta foto para una app de reciclaje. Devuelve solo el JSON solicitado.",
        },
      ],
    },
  ]

  const errors: string[] = []
  for (const model of getVisionModels()) {
    try {
      const isQwen = model.startsWith("qwen/")
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.1,
        max_completion_tokens: 700,
        response_format: isQwen ? JSON_OBJECT_RESPONSE_FORMAT : RESPONSE_FORMAT,
        ...(isQwen ? { reasoning_effort: "none" as const } : {}),
      })

      const text = completion.choices[0]?.message?.content ?? ""
      const raw = JSON.parse(extractJson(text)) as RawClassification
      return normalizeClassification(raw)
    } catch (error) {
      errors.push(`${model}: ${getErrorMessage(error)}`)
    }
  }

  throw new Error(`Groq no pudo analizar la imagen. ${errors.join(" | ")}`)
}

export async function POST(request: Request) {
  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("No autenticado", { status: 401 })

  const form = await request.formData()
  const file = form.get("image") as File | null
  if (!file) return Response.json({ error: "No se recibio imagen" }, { status: 400 })

  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
    return Response.json({ error: "Formato no permitido. Usa JPG, PNG o WEBP." }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "Imagen demasiado grande. Sube una foto menor a 10 MB." }, { status: 400 })
  }

  const bytes   = await file.arrayBuffer()
  const base64  = Buffer.from(bytes).toString("base64")
  let imageUrl  = `data:${file.type};base64,${base64}`
  let temporaryImagePath: string | null = null

  try {
    const signedImage = await createSignedScanImageUrl(adminSupabase, user.id, file, bytes)
    imageUrl = signedImage.signedUrl
    temporaryImagePath = signedImage.path
  } catch (error) {
    console.error("[scan] temporary image upload failed:", getErrorMessage(error))
  }

  let parsed: ScanClassification
  try {
    parsed = await analyzeWasteImage(imageUrl)
  } catch (error) {
    console.error("[scan] Groq analysis failed:", getErrorMessage(error))
    await removeSignedScanImage(adminSupabase, temporaryImagePath)
    return Response.json({ error: getPublicAnalysisError(error) }, { status: 502 })
  }
  await removeSignedScanImage(adminSupabase, temporaryImagePath)

  const category = parsed.waste_category
  const meta     = CATEGORY_META[category]

  const pointsEarned = parsed.recyclable ? meta.points    : 0
  const co2Saved     = parsed.recyclable ? meta.co2_kg    : 0
  const wasteKg      = parsed.recyclable ? meta.waste_kg  : 0

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, classroom_id")
    .eq("id", user.id)
    .single() as { data: { org_id: string | null; classroom_id: string | null } | null }

  const { data: scan, error: scanError } = await adminSupabase
    .from("scans")
    .insert({
      user_id:        user.id,
      org_id:         profile?.org_id       ?? null,
      classroom_id:   profile?.classroom_id ?? null,
      waste_category: category,
      waste_name:     parsed.waste_name,
      material:       parsed.material,
      recyclable:     parsed.recyclable,
      instructions:   parsed.instructions,
      confidence:     parsed.confidence / 100,
      points_earned:  pointsEarned,
      image_url:      null,
    })
    .select("id")
    .single()

  if (scanError) {
    console.error("[scan] scan insert failed:", scanError.message)
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
      saved:          false,
    })
  }

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
    saved:          true,
  })
}
