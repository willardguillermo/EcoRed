"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Camera, Upload, RotateCcw, CheckCircle2, XCircle, X, ArrowRight,
  Leaf, Zap, Cpu, Trash2, FlaskConical, FileText, Package, AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { WasteCategory } from "@/types/database"

type ScanResult = {
  waste_category: WasteCategory
  waste_name:     string
  material:       string
  recyclable:     boolean
  confidence:     number
  instructions:   string
  eco_tip:        string
  points_earned:  number
  co2_saved_kg:   number
}

type State = "idle" | "camera" | "preview" | "analyzing" | "result" | "error"

const CATEGORY_STYLE: Record<WasteCategory, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  plastic:    { color: "text-blue-600",   bg: "bg-blue-50   border-blue-200",   icon: Package,       label: "Plástico"    },
  paper:      { color: "text-amber-600",  bg: "bg-amber-50  border-amber-200",  icon: FileText,      label: "Papel"       },
  glass:      { color: "text-cyan-600",   bg: "bg-cyan-50   border-cyan-200",   icon: FlaskConical,  label: "Vidrio"      },
  metal:      { color: "text-slate-600",  bg: "bg-slate-50  border-slate-200",  icon: Zap,           label: "Metal"       },
  organic:    { color: "text-green-600",  bg: "bg-green-50  border-green-200",  icon: Leaf,          label: "Orgánico"    },
  electronic: { color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: Cpu,           label: "Electrónico" },
  hazardous:  { color: "text-red-600",    bg: "bg-red-50    border-red-200",    icon: AlertTriangle, label: "Peligroso"   },
  other:      { color: "text-gray-600",   bg: "bg-gray-50   border-gray-200",   icon: Trash2,        label: "Otro"        },
}

async function prepareImageForScan(original: File): Promise<File> {
  if (!original.type.startsWith("image/") || original.type === "image/gif") return original

  const maxSide = 1600
  const maxKeepSize = 3 * 1024 * 1024
  const objectUrl = URL.createObjectURL(original)

  try {
    const image = new Image()
    image.src = objectUrl
    await image.decode()

    const longestSide = Math.max(image.naturalWidth, image.naturalHeight)
    const scale = longestSide > maxSide ? maxSide / longestSide : 1

    if (scale === 1 && original.type === "image/jpeg" && original.size <= maxKeepSize) {
      return original
    }

    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

    const ctx = canvas.getContext("2d")
    if (!ctx) return original

    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.86)
    })

    if (!blob) return original
    const name = original.name.replace(/\.[^.]+$/, "") || "scan"
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" })
  } catch {
    return original
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function ScanCamera() {
  const [state,    setState]    = useState<State>("idle")
  const [preview,  setPreview]  = useState<string | null>(null)
  const [file,     setFile]     = useState<File | null>(null)
  const [result,   setResult]   = useState<ScanResult | null>(null)
  const [error,    setError]    = useState<string>("")
  const [dragging, setDragging] = useState(false)

  const fileRef   = useRef<HTMLInputElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router    = useRouter()

  // Wires the stream to the video element once the camera state is active
  useEffect(() => {
    if (state === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [state])

  // Stop stream on unmount
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setState("camera")
    } catch {
      // Fallback: file picker
      fileRef.current?.click()
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement("canvas")
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const captured = new File([blob], "capture.jpg", { type: "image/jpeg" })
      stopStream()
      void loadFile(captured)
    }, "image/jpeg", 0.92)
  }

  async function loadFile(f: File) {
    setError("")
    const prepared = await prepareImageForScan(f)
    setFile(prepared)
    setPreview(URL.createObjectURL(prepared))
    setState("preview")
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) void loadFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith("image/")) void loadFile(f)
  }

  const analyze = useCallback(async () => {
    if (!file) return
    setState("analyzing")
    const form = new FormData()
    form.append("image", file)
    try {
      const res  = await fetch("/api/scan", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error ?? "Error desconocido"); setState("error"); return }
      setResult(data as ScanResult)
      setState("result")
    } catch {
      setError("No se pudo conectar al servidor")
      setState("error")
    }
  }, [file])

  function reset() {
    stopStream()
    setFile(null)
    setPreview(null)
    setResult(null)
    setError("")
    setState("idle")
    if (fileRef.current) fileRef.current.value = ""
  }

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (state === "idle") return (
    <div className="flex flex-col items-center justify-center px-4 py-10 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Escanear residuo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toma una foto o sube una imagen para identificar el material
        </p>
      </div>

      {/* Double-Bezel camera button */}
      <div style={{ padding: 5, borderRadius: 34, background: 'rgba(0,137,123,0.07)', border: '1px solid rgba(0,137,123,0.18)' }}>
        <button
          onClick={openCamera}
          className="active:scale-95"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10, width: 156, height: 156, borderRadius: 29,
            background: 'linear-gradient(145deg, #00897B 0%, #005F57 100%)',
            color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,137,123,0.36), inset 0 1px 0 rgba(255,255,255,0.14)',
            transition: 'all .28s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <Camera size={50} color="rgba(255,255,255,0.95)" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Abrir cámara</span>
        </button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          width: '100%', maxWidth: 320, cursor: 'pointer',
          padding: 4, borderRadius: 22,
          background: dragging ? 'rgba(0,137,123,0.05)' : 'rgba(0,0,0,0.015)',
          border: `1.5px dashed ${dragging ? '#00897B' : 'rgba(0,0,0,0.12)'}`,
          transition: 'all .25s ease',
        }}
      >
        <div style={{ borderRadius: 18, padding: '20px 16px', textAlign: 'center', background: dragging ? 'rgba(0,137,123,0.04)' : 'rgba(255,255,255,0.6)' }}>
          <Upload size={26} color="rgba(26,26,46,0.35)" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>Subir desde galería</p>
          <p style={{ fontSize: 12, color: 'rgba(26,26,46,0.42)', marginTop: 2 }}>PNG, JPG, WEBP · máx. 10 MB</p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*"
        className="hidden" onChange={handleFileChange} />
    </div>
  )

  // ── CAMERA ────────────────────────────────────────────────────────────────
  if (state === "camera") return (
    <div className="flex flex-col h-full">
      {/* Viewfinder */}
      <div className="relative flex-1 bg-black overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {/* Corner guides */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-56 h-56">
            <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-md" />
            <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-md" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-md" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-md" />
          </div>
        </div>
        {/* Close */}
        <button
          onClick={reset}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="absolute bottom-28 left-0 right-0 text-center text-white/70 text-xs">
          Centra el residuo en el encuadre
        </p>
      </div>

      {/* Capture bar */}
      <div className="shrink-0 bg-black flex items-center justify-center py-6 gap-8">
        {/* Gallery fallback */}
        <button
          onClick={() => { stopStream(); setState("idle"); setTimeout(() => fileRef.current?.click(), 100) }}
          className="h-11 w-11 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <Upload className="h-5 w-5" />
        </button>

        {/* Shutter */}
        <button
          onClick={capturePhoto}
          className="h-16 w-16 rounded-full border-4 border-white bg-white hover:bg-white/90 transition-colors active:scale-95 shadow-lg"
        />

        <div className="h-11 w-11" /> {/* spacer */}
      </div>

      <input ref={fileRef} type="file" accept="image/*"
        className="hidden" onChange={handleFileChange} />
    </div>
  )

  // ── PREVIEW ───────────────────────────────────────────────────────────────
  if (state === "preview") return (
    <div className="flex flex-col items-center px-4 py-8 gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-[#1A1A2E]">¿Listo para analizar?</h1>
        <p className="text-sm text-muted-foreground mt-1">Asegúrate de que el residuo sea visible</p>
      </div>
      {preview && (
        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" className="w-full object-cover max-h-72" />
        </div>
      )}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={reset}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-white hover:bg-muted transition-colors text-sm font-medium"
        >
          <RotateCcw className="h-4 w-4" /> Cambiar foto
        </button>
        {/* Button-in-Button analyze */}
        <button
          onClick={analyze}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 16px 12px 20px', borderRadius: 100,
            background: 'linear-gradient(135deg, #00897B, #005F57)',
            color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            transition: 'all .28s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: '0 4px 14px rgba(0,137,123,0.32)',
          }}
        >
          Analizar
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Camera size={12} />
          </span>
        </button>
      </div>
    </div>
  )

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (state === "analyzing") return (
    <div className="flex flex-col items-center justify-center px-4 py-16 gap-6">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-[#E0F2F1] animate-ping opacity-30" />
        <div className="relative h-24 w-24 rounded-full bg-[#00897B] flex items-center justify-center shadow-lg">
          <Leaf className="h-10 w-10 text-white animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-[#1A1A2E]">Analizando residuo...</p>
        <p className="text-sm text-muted-foreground mt-1">La IA está identificando el material</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 150, 300].map((delay) => (
          <div key={delay} className="h-2 w-2 rounded-full bg-[#00897B] animate-bounce"
            style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  )

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (state === "error") return (
    <div className="flex flex-col items-center justify-center px-4 py-16 gap-6">
      <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-[#1A1A2E]">No pudimos analizar la imagen</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{error}</p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00897B] text-white text-sm font-semibold hover:bg-[#00796B] transition-colors"
      >
        <RotateCcw className="h-4 w-4" /> Intentar de nuevo
      </button>
    </div>
  )

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (state === "result" && result) {
    const style = CATEGORY_STYLE[result.waste_category] ?? CATEGORY_STYLE.other
    const Icon  = style.icon

    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {preview && (
          <div className="w-full rounded-2xl overflow-hidden border border-border shadow-sm max-h-48 flex items-center justify-center bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="scanned" className="w-full object-cover max-h-48" />
          </div>
        )}

        <div className={cn("rounded-2xl border p-5 space-y-1", style.bg)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-white border", style.bg)}>
                <Icon className={cn("h-5 w-5", style.color)} />
              </div>
              <div>
                <p className={cn("font-bold text-lg leading-tight", style.color)}>{result.waste_name}</p>
                <p className="text-sm text-muted-foreground">{result.material}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{result.confidence}% confianza</span>
          </div>
          <div className="pt-2">
            {result.recyclable ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm font-semibold text-green-700">Reciclable</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-sm font-semibold text-red-600">No reciclable</span>
              </div>
            )}
          </div>
        </div>

        {/* Double-Bezel impact card */}
        <div style={{ padding: 4, borderRadius: 22, background: 'rgba(0,137,123,0.06)', border: '1px solid rgba(0,137,123,0.14)' }}>
          <div style={{
            borderRadius: 18, padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(0,137,123,0.1), rgba(0,191,170,0.06))',
            border: '1px solid rgba(0,137,123,0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(26,26,46,0.5)', marginBottom: 2 }}>Puntos ganados</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#00897B', fontVariantNumeric: 'tabular-nums', letterSpacing: '-.015em' }}>+{result.points_earned} pts</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: 'rgba(26,26,46,0.5)', marginBottom: 2 }}>CO₂ evitado</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#00897B', fontVariantNumeric: 'tabular-nums' }}>{result.co2_saved_kg} kg</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            ¿Cómo lo preparo?
          </p>
          <p className="text-sm text-[#1A1A2E] leading-relaxed">{result.instructions}</p>
        </div>

        <div className="rounded-2xl border border-[#1565C0]/20 bg-[#E3F2FD] px-5 py-4">
          <div className="flex gap-2.5 items-start">
            <Leaf className="h-4 w-4 text-[#1565C0] shrink-0 mt-0.5" />
            <p className="text-sm text-[#1565C0]">{result.eco_tip}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button
            onClick={reset}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 16px', borderRadius: 100, border: '1px solid rgba(0,0,0,0.1)',
              background: '#fff', color: '#1A1A2E', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', transition: 'all .2s ease',
            }}
          >
            <Camera size={14} /> Escanear otro
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 16px 12px 20px', borderRadius: 100,
              background: 'linear-gradient(135deg, #00897B, #005F57)',
              color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', transition: 'all .28s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 4px 14px rgba(0,137,123,0.28)',
            }}
          >
            Ver mi impacto
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowRight size={12} />
            </span>
          </button>
        </div>
      </div>
    )
  }

  return null
}
