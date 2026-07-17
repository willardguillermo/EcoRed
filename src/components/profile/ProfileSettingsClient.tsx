"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Building2,
  Camera,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Database, UserRole } from "@/types/database"

type ProfileSummary = {
  id:           string
  full_name:    string | null
  avatar_url:   string | null
  role:         UserRole
  points:       number
  org_name:     string | null
  classroom:    string | null
}

type Props = {
  profile: ProfileSummary
  email:   string
}

const ROLE_LABELS: Record<UserRole, string> = {
  citizen:         "Ciudadano",
  student:         "Estudiante",
  teacher:         "Docente",
  school_admin:    "Administrador educativo",
  municipal_admin: "Administrador municipal",
  platform_admin:  "Administrador EcoRed",
}

function initials(name: string | null) {
  const parts = (name ?? "Usuario").trim().split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] ?? "U").toUpperCase()
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function ProfileSettingsClient({ profile, email }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [fullName,  setFullName] = useState(profile.full_name ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "")
  const [accountEmail, setAccountEmail] = useState(email)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nextName = fullName.trim()
    const nextAvatar = avatarUrl.trim()

    if (nextName.length < 3) {
      toast.error("Escribe un nombre de al menos 3 caracteres.")
      return
    }

    setSavingProfile(true)
    const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
      full_name:  nextName,
      avatar_url: nextAvatar || null,
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates as never)
      .eq("id", profile.id)

    setSavingProfile(false)

    if (error) {
      toast.error(error.message || "No se pudo actualizar el perfil.")
      return
    }

    toast.success("Perfil actualizado.")
    router.refresh()
  }

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nextEmail = accountEmail.trim().toLowerCase()

    if (!isValidEmail(nextEmail)) {
      toast.error("Escribe un correo válido.")
      return
    }

    if (nextEmail === email.toLowerCase()) {
      toast.info("Ese correo ya está asociado a tu cuenta.")
      return
    }

    setSavingEmail(true)
    const { error } = await supabase.auth.updateUser(
      { email: nextEmail },
      { emailRedirectTo: `${window.location.origin}/profile` }
    )
    setSavingEmail(false)

    if (error) {
      toast.error(error.message || "No se pudo solicitar el cambio de correo.")
      return
    }

    toast.success("Te enviamos un correo para confirmar el cambio.")
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.")
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSavingPassword(false)

    if (error) {
      toast.error(error.message || "No se pudo cambiar la contraseña.")
      return
    }

    setPassword("")
    setConfirmPassword("")
    toast.success("Contraseña actualizada.")
  }

  const avatar = avatarUrl.trim() || profile.avatar_url

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 md:grid md:grid-cols-[19rem_1fr] md:gap-6 md:py-7">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/60 bg-white/40 p-5 shadow-[0_22px_62px_rgba(0,65,58,0.10)] backdrop-blur-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Avatar de perfil" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#E0F2F1] text-3xl font-extrabold text-[#00897B]">
                  {initials(fullName || profile.full_name)}
                </div>
              )}
            </div>
            <p className="text-lg font-extrabold leading-tight text-[#1A1A2E]">
              {fullName.trim() || "Usuario EcoRed"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{ROLE_LABELS[profile.role]}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <InfoPill icon={<Trophy className="h-4 w-4" />} label="Puntos" value={`${profile.points.toLocaleString("es-PE")} pts`} />
            <InfoPill icon={<ShieldCheck className="h-4 w-4" />} label="Cuenta" value="Activa" />
          </div>
        </section>

        <section className="rounded-2xl border border-white/60 bg-white/32 p-4 text-sm shadow-[0_18px_52px_rgba(0,65,58,0.08)] backdrop-blur-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Datos bloqueados
          </p>
          <ReadOnlyRow icon={<Building2 className="h-4 w-4" />} label="Institución" value={profile.org_name ?? "Sin institución"} />
          <ReadOnlyRow icon={<UserRound className="h-4 w-4" />} label="Aula" value={profile.classroom ?? "Sin aula"} />
          <ReadOnlyRow icon={<ShieldCheck className="h-4 w-4" />} label="Rol" value={ROLE_LABELS[profile.role]} />
        </section>
      </aside>

      <main className="space-y-4">
        <header className="rounded-2xl border border-white/60 bg-white/36 p-5 shadow-[0_22px_62px_rgba(0,65,58,0.09)] backdrop-blur-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#00897B]">Mi perfil</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A1A2E] md:text-3xl">
            Configura tu cuenta
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Actualiza tus datos visibles, cambia tu correo y protege tu acceso. Tus puntos, rol e institución se mantienen como datos verificados.
          </p>
        </header>

        <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-white/60 bg-white/40 p-5 shadow-[0_18px_52px_rgba(0,65,58,0.09)] backdrop-blur-2xl">
          <SectionTitle icon={<UserRound className="h-4 w-4" />} title="Datos personales" description="Estos datos se usan dentro del sistema y en tus vistas de comunidad." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Nombre completo">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" className="h-11 rounded-xl bg-white/50" />
            </Field>
            <Field label="Avatar por URL">
              <div className="relative">
                <Camera className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="h-11 rounded-xl bg-white/50 pl-9" />
              </div>
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit" disabled={savingProfile} className="h-10 rounded-xl bg-[#00897B] px-4 text-white hover:bg-[#00796B]">
              <Save className="h-4 w-4" />
              {savingProfile ? "Guardando..." : "Guardar perfil"}
            </Button>
          </div>
        </form>

        <form onSubmit={handleEmailSubmit} className="rounded-2xl border border-white/60 bg-white/40 p-5 shadow-[0_18px_52px_rgba(0,65,58,0.09)] backdrop-blur-2xl">
          <SectionTitle icon={<Mail className="h-4 w-4" />} title="Correo de acceso" description="Supabase enviará una confirmación al nuevo correo antes de aplicar el cambio." />
          <div className="mt-5">
            <Field label="Correo electrónico">
              <Input type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="correo@ejemplo.com" className="h-11 rounded-xl bg-white/50" />
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit" disabled={savingEmail} variant="outline" className="h-10 rounded-xl border-white/70 bg-white/45 px-4">
              <Mail className="h-4 w-4" />
              {savingEmail ? "Enviando..." : "Cambiar correo"}
            </Button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-white/60 bg-white/40 p-5 shadow-[0_18px_52px_rgba(0,65,58,0.09)] backdrop-blur-2xl">
          <SectionTitle icon={<LockKeyhole className="h-4 w-4" />} title="Seguridad" description="Usa una contraseña nueva con al menos 8 caracteres." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Nueva contraseña">
              <PasswordInput value={password} onChange={setPassword} show={showPassword} />
            </Field>
            <Field label="Confirmar contraseña">
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} show={showPassword} />
            </Field>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[#00897B]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
            <Button type="submit" disabled={savingPassword} className="h-10 rounded-xl bg-[#00897B] px-4 text-white hover:bg-[#00796B]">
              <LockKeyhole className="h-4 w-4" />
              {savingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

function InfoPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/42 p-3">
      <div className="mb-2 text-[#00897B]">{icon}</div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#1A1A2E]">{value}</p>
    </div>
  )
}

function ReadOnlyRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-white/50 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/60 bg-white/45 text-[#00897B]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-[#1A1A2E]">{value}</p>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/60 bg-white/45 text-[#00897B]">
        {icon}
      </span>
      <div>
        <h2 className="text-base font-bold text-[#1A1A2E]">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function PasswordInput({ value, onChange, show }: { value: string; onChange: (value: string) => void; show: boolean }) {
  return (
    <Input
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="new-password"
      className="h-11 rounded-xl bg-white/50"
    />
  )
}
