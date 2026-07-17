"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeCanvas } from "qrcode.react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import {
  Building2, GraduationCap, Plus, Trash2, Loader2,
  CheckCircle2, Copy, Download, ArrowRight, ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type OrgType = "school" | "municipality"
type Step = 1 | 2 | 3

interface ClassroomRow { name: string; grade: string }
interface CreatedClass { id: string; name: string; code: string }
interface CreatedOrg   { id: string; name: string; type: OrgType }

const STEPS = ["Tipo y datos", "Configuración", "QR y compartir"]

export function OnboardingWizard() {
  const router = useRouter()

  const [step,    setStep]    = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [orgType, setOrgType] = useState<OrgType | null>(null)
  const [orgForm, setOrgForm] = useState({
    name: "", district: "", region: "Lima", contact_email: "", contact_phone: "",
  })

  // Step 2
  const [classrooms, setClassrooms] = useState<ClassroomRow[]>([{ name: "", grade: "" }])

  // Created
  const [createdOrg,        setCreatedOrg]        = useState<CreatedOrg | null>(null)
  const [createdClassrooms, setCreatedClassrooms] = useState<CreatedClass[]>([])

  // ── Step 1 submit — usa API route con service role ─────────────
  async function handleStep1() {
    if (!orgType)                        { toast.error("Selecciona el tipo de organización"); return }
    if (!orgForm.name.trim())            { toast.error("El nombre es obligatorio"); return }
    if (!orgForm.district.trim())        { toast.error("El distrito es obligatorio"); return }
    if (!orgForm.contact_email.trim())   { toast.error("El email de contacto es obligatorio"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          orgForm.name.trim(),
          type:          orgType,
          district:      orgForm.district.trim(),
          region:        orgForm.region.trim() || "Lima",
          contact_email: orgForm.contact_email.trim(),
          contact_phone: orgForm.contact_phone.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al crear la organización")
      setCreatedOrg(json.org as CreatedOrg)
      setStep(2)
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Error al crear la organización")
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2 submit ──────────────────────────────────────────────
  async function handleStep2() {
    if (!createdOrg) return

    if (orgType === "school") {
      const valid = classrooms.filter((c) => c.name.trim())
      if (valid.length === 0) { toast.error("Agrega al menos un aula"); return }

      setLoading(true)
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:          createdOrg.name,
            type:          "school",
            district:      orgForm.district,
            region:        orgForm.region,
            contact_email: orgForm.contact_email,
            classrooms:    classrooms.filter((c) => c.name.trim()),
            existing_org_id: createdOrg.id,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Error al crear las aulas")
        setCreatedClassrooms(json.classrooms ?? [])
        setStep(3)
      } catch (e: unknown) {
        toast.error((e as Error).message ?? "Error al crear las aulas")
      } finally {
        setLoading(false)
      }
    } else {
      setStep(3)
    }
  }

  // ── Classroom rows ─────────────────────────────────────────────
  function addRow()          { setClassrooms((p) => [...p, { name: "", grade: "" }]) }
  function removeRow(i: number) {
    setClassrooms((p) => p.length === 1 ? p : p.filter((_, idx) => idx !== i))
  }
  function updateRow(i: number, field: keyof ClassroomRow, val: string) {
    setClassrooms((p) => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  function joinUrl(code: string) { return `${appUrl}/join/${code}` }
  function orgUrl()              { return `${appUrl}/join/org/${createdOrg?.id}` }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    toast.success("¡Enlace copiado!")
  }

  function downloadQR(code: string, filename: string) {
    const canvas = document.getElementById(`qr-${code}`) as HTMLCanvasElement
    if (!canvas) return
    const url = canvas.toDataURL("image/png")
    const a   = document.createElement("a")
    a.href     = url
    a.download = `${filename}.png`
    a.click()
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => {
          const n       = (i + 1) as Step
          const active  = step === n
          const done    = step > n
          return (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  done   ? "bg-[#00897B] text-white" :
                  active ? "bg-[#00897B] text-white ring-4 ring-[#00897B]/20" :
                           "bg-muted text-muted-foreground"
                )}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : n}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:block",
                  active ? "text-[#00897B]" : "text-muted-foreground"
                )}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-px transition-colors",
                  done ? "bg-[#00897B]" : "bg-border"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Step 1: Tipo y datos ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">¿Qué tipo de organización eres?</h2>
            <p className="text-sm text-muted-foreground">Esto define el flujo y las funcionalidades que tendrás.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { type: "school" as OrgType,       icon: GraduationCap, label: "Colegio",   desc: "Gestiona aulas, alumnos y rankings escolares" },
              { type: "municipality" as OrgType, icon: Building2,     label: "Municipio", desc: "Administra distritos, puntos de acopio y campañas" },
            ] as const).map((opt) => (
              <button
                key={opt.type}
                onClick={() => setOrgType(opt.type)}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all",
                  orgType === opt.type
                    ? "border-[#00897B] bg-[#E0F2F1]"
                    : "border-border bg-white hover:border-[#00897B]/40"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  orgType === opt.type ? "bg-[#00897B]" : "bg-muted"
                )}>
                  <opt.icon className={cn("h-5 w-5", orgType === opt.type ? "text-white" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A2E]">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {orgType && (
            <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
              <h3 className="font-semibold text-[#1A1A2E]">
                Datos del {orgType === "school" ? "colegio" : "municipio"}
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nombre</Label>
                  <Input
                    placeholder={orgType === "school" ? "I.E. San Martín" : "Municipalidad de Miraflores"}
                    value={orgForm.name}
                    onChange={(e) => setOrgForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Distrito</Label>
                    <Input
                      placeholder="Miraflores"
                      value={orgForm.district}
                      onChange={(e) => setOrgForm((p) => ({ ...p, district: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Región</Label>
                    <Input
                      placeholder="Lima"
                      value={orgForm.region}
                      onChange={(e) => setOrgForm((p) => ({ ...p, region: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email de contacto</Label>
                  <Input
                    type="email"
                    placeholder="contacto@institucion.edu.pe"
                    value={orgForm.contact_email}
                    onChange={(e) => setOrgForm((p) => ({ ...p, contact_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input
                    placeholder="01 234 5678"
                    value={orgForm.contact_phone}
                    onChange={(e) => setOrgForm((p) => ({ ...p, contact_phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleStep1}
            disabled={loading || !orgType}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full bg-[#00897B] hover:bg-[#00796B] text-white"
            )}
          >
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando organización...</>
              : <>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>
            }
          </button>
        </div>
      )}

      {/* ── Step 2: Configuración ── */}
      {step === 2 && createdOrg && (
        <div className="space-y-6">
          {orgType === "school" ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">Crea tus aulas</h2>
                <p className="text-sm text-muted-foreground">
                  Cada aula tendrá un código QR único para que los alumnos se unan.
                </p>
              </div>

              <div className="space-y-2">
                {classrooms.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder="Nombre del aula (ej: 3°A)"
                      value={row.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Grado (ej: 3°)"
                      value={row.grade}
                      onChange={(e) => updateRow(i, "grade", e.target.value)}
                      className="w-28"
                    />
                    <button
                      onClick={() => removeRow(i)}
                      disabled={classrooms.length === 1}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addRow}
                className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
              >
                <Plus className="h-4 w-4" /> Agregar aula
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">¡Municipio registrado!</h2>
                <p className="text-sm text-muted-foreground">
                  Puedes agregar los puntos de acopio desde tu panel institucional una vez completado el registro.
                </p>
              </div>
              <div className="rounded-2xl bg-[#E3F2FD] border border-[#1565C0]/20 p-5">
                <p className="text-sm text-[#1565C0] font-medium mb-2">¿Qué puedes hacer desde el panel?</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {["Agregar y gestionar puntos de acopio en el mapa", "Ver métricas de reciclaje del distrito", "Crear campañas y retos para la comunidad", "Exportar reportes de impacto"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#1565C0] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ArrowLeft className="h-4 w-4" /> Atrás
            </button>
            <button
              onClick={handleStep2}
              disabled={loading}
              className={cn(buttonVariants({ size: "lg" }), "flex-1 bg-[#00897B] hover:bg-[#00796B] text-white")}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando aulas...</>
                : <>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: QR y compartir ── */}
      {step === 3 && createdOrg && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#E0F2F1] mb-4">
              <CheckCircle2 className="h-7 w-7 text-[#00897B]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">¡Todo listo!</h2>
            <p className="text-sm text-muted-foreground">
              {orgType === "school"
                ? "Comparte los QR con tus alumnos para que se unan a sus aulas."
                : "Comparte el enlace de tu municipio para que los ciudadanos se unan."}
            </p>
          </div>

          {orgType === "school" && createdClassrooms.length > 0 ? (
            <div className="space-y-3">
              {createdClassrooms.map((cls) => (
                <div key={cls.id} className="rounded-2xl border border-border bg-white p-4 flex items-center gap-4">
                  <div className="shrink-0 rounded-xl overflow-hidden border border-border p-1.5 bg-white">
                    <QRCodeCanvas
                      id={`qr-${cls.code}`}
                      value={joinUrl(cls.code)}
                      size={80}
                      bgColor="#ffffff"
                      fgColor="#1A1A2E"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A1A2E]">{cls.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{cls.code}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => copyToClipboard(joinUrl(cls.code))}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs gap-1")}
                      >
                        <Copy className="h-3 w-3" /> Copiar link
                      </button>
                      <button
                        onClick={() => downloadQR(cls.code, `ecored-${cls.name}`)}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs gap-1")}
                      >
                        <Download className="h-3 w-3" /> Descargar QR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-5 text-center space-y-3">
              <div className="inline-block rounded-xl overflow-hidden border border-border p-2 bg-white">
                <QRCodeCanvas
                  id={`qr-org-${createdOrg.id}`}
                  value={orgUrl()}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#1A1A2E"
                />
              </div>
              <div>
                <p className="font-semibold text-[#1A1A2E]">{createdOrg.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono break-all">{orgUrl()}</p>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => copyToClipboard(orgUrl())}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar enlace
                </button>
                <button
                  onClick={() => downloadQR(`org-${createdOrg.id}`, `ecored-${createdOrg.name}`)}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
                >
                  <Download className="h-3.5 w-3.5" /> Descargar QR
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/institution/dashboard")}
            className={cn(buttonVariants({ size: "lg" }), "w-full bg-[#00897B] hover:bg-[#00796B] text-white")}
          >
            Ir al panel institucional <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
