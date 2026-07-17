"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Plus, Copy, Check, Users, Zap, GraduationCap, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Classroom = {
  id:         string
  name:       string
  grade:      string | null
  code:       string
  created_at: string
}

type ClassroomStat = {
  classroom_id: string
  total_points: number
  member_count: number
}

type Props = {
  classrooms: Classroom[]
  stats:      ClassroomStat[]
  appUrl:     string
}

export function ClassroomsClient({ classrooms, stats, appUrl }: Props) {
  const router             = useRouter()
  const [, start]          = useTransition()
  const [open,    setOpen] = useState(false)
  const [copied,  setCopied] = useState<string | null>(null)

  const [name,  setName]  = useState("")
  const [grade, setGrade] = useState("")
  const [saving, setSaving] = useState(false)

  const statMap = Object.fromEntries(stats.map(s => [s.classroom_id, s]))

  function joinUrl(code: string) {
    return `${appUrl}/join/${code}`
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(joinUrl(code))
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const res  = await fetch("/api/classrooms", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), grade: grade.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al crear aula"); return }
      toast.success(`Aula "${data.name}" creada`)
      setOpen(false)
      setName("")
      setGrade("")
      start(() => router.refresh())
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Gestión de aulas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {classrooms.length} aula{classrooms.length !== 1 ? "s" : ""} registrada{classrooms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva aula
        </button>
      </div>

      {/* Empty state */}
      {classrooms.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">No hay aulas creadas</p>
          <p className="text-sm text-muted-foreground mb-4">
            Crea tu primera aula y comparte el QR con tus alumnos
          </p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00897B] text-white text-sm font-semibold hover:bg-[#00796B] transition-colors"
          >
            <Plus className="h-4 w-4" /> Crear primera aula
          </button>
        </div>
      )}

      {/* Grid */}
      {classrooms.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((cls) => {
            const stat = statMap[cls.id]
            return (
              <div key={cls.id} className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-4">
                {/* Name + grade */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[#1A1A2E] text-base leading-tight">{cls.name}</h3>
                    {cls.grade && (
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#00897B]">
                        {cls.grade}
                      </span>
                    )}
                  </div>
                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {stat?.member_count ?? 0} alumnos
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="h-3.5 w-3.5" />
                      {Number(stat?.total_points ?? 0).toLocaleString("es-PE")} pts
                    </span>
                  </div>
                </div>

                {/* QR */}
                <div className="flex flex-col items-center gap-2 py-4 bg-[#F8FFFE] rounded-xl border border-[#E0F2F1]">
                  <QRCodeSVG
                    value={joinUrl(cls.code)}
                    size={120}
                    fgColor="#1A1A2E"
                    bgColor="transparent"
                    level="M"
                  />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Código de acceso</p>
                    <p className="font-mono font-bold text-[#00897B] text-lg tracking-widest">{cls.code}</p>
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => copyCode(cls.code)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                    copied === cls.code
                      ? "bg-[#E0F2F1] border-[#00897B]/30 text-[#00897B]"
                      : "bg-white border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {copied === cls.code
                    ? <><Check className="h-4 w-4" /> ¡Enlace copiado!</>
                    : <><Copy className="h-4 w-4" /> Copiar enlace</>
                  }
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal crear aula */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Nueva aula</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Nombre del aula <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: 3° A"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00897B]/30 focus:border-[#00897B]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Grado / Nivel <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <input
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  placeholder="Ej: Secundaria, 5to grado..."
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00897B]/30 focus:border-[#00897B]"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Creando..." : "Crear aula"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
