"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"

function getTomorrowDateInputValue() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split("T")[0]
}

export function CreateChallengeButton() {
  const router           = useRouter()
  const [, start]        = useTransition()
  const [open,   setOpen]   = useState(false)
  const [saving, setSaving] = useState(false)

  const [title,       setTitle]       = useState("")
  const [description, setDescription] = useState("")
  const [points,      setPoints]      = useState("50")
  const [deadline,    setDeadline]    = useState("")
  const [minDate] = useState(getTomorrowDateInputValue)

  function reset() {
    setTitle(""); setDescription(""); setPoints("50"); setDeadline("")
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res  = await fetch("/api/challenges", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, description, points: Number(points), deadline }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al crear reto"); return }
      toast.success("Reto creado correctamente")
      reset()
      start(() => router.refresh())
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[#00897B] font-medium hover:underline"
      >
        + Crear reto
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={reset} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Nuevo reto</h2>
              <button onClick={reset} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Semana del plástico cero"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00897B]/30 focus:border-[#00897B]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe qué deben hacer los participantes..."
                  required
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00897B]/30 focus:border-[#00897B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Puntos
                  </label>
                  <input
                    type="number"
                    value={points}
                    onChange={e => setPoints(e.target.value)}
                    min={5} max={500} step={5}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00897B]/30 focus:border-[#00897B]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Vence <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    min={minDate}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00897B]/30 focus:border-[#00897B]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !description.trim() || !deadline}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Guardando..." : "Crear reto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
