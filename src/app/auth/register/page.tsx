"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Building2 } from "lucide-react"
import { toast } from "sonner"

type AccountType = "citizen" | "institution"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [accountType, setAccountType] = useState<AccountType>("citizen")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)

    const role = accountType === "citizen" ? "citizen" : "school_admin"

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      toast.error(error.message === "User already registered"
        ? "Este correo ya está registrado"
        : error.message
      )
      setLoading(false)
      return
    }

    // Si no hay sesión activa, Supabase requiere confirmación de email
    if (!data.session) {
      setConfirmEmail(email)
      setLoading(false)
      return
    }

    // Sesión activa (confirmación desactivada) → redirigir directo
    toast.success("¡Cuenta creada!")
    router.push(accountType === "institution" ? "/onboarding" : "/dashboard")
    router.refresh()
  }

  if (confirmEmail) {
    return (
      <Card className="w-full max-w-sm shadow-sm border-border">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E0F2F1]">
            <svg className="h-7 w-7 text-[#00897B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-1">Revisa tu correo</h2>
            <p className="text-sm text-muted-foreground">
              Enviamos un enlace de confirmación a
            </p>
            <p className="text-sm font-medium text-[#00897B] mt-0.5">{confirmEmail}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Haz clic en el enlace del correo para activar tu cuenta y poder iniciar sesión.
          </p>
          <Link href="/auth/login" className="text-sm font-medium text-[#00897B] hover:underline">
            Ir al inicio de sesión
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm shadow-sm border-border">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-[#1A1A2E]">Crear cuenta</CardTitle>
        <CardDescription>Elige cómo quieres unirte a EcoRed</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={accountType}
          onValueChange={(v) => setAccountType(v as AccountType)}
          className="mb-5"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="citizen" className="flex items-center gap-1.5 text-sm">
              <User className="h-3.5 w-3.5" />
              Ciudadano
            </TabsTrigger>
            <TabsTrigger value="institution" className="flex items-center gap-1.5 text-sm">
              <Building2 className="h-3.5 w-3.5" />
              Institución
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              {accountType === "citizen" ? "Nombre completo" : "Nombre del responsable"}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={accountType === "citizen" ? "Ana García" : "Carlos Mendoza"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder={accountType === "citizen" ? "tu@correo.com" : "admin@colegio.edu.pe"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {accountType === "institution" && (
            <p className="text-xs text-muted-foreground bg-[#E3F2FD] rounded-lg p-3">
              Después del registro completarás el perfil de tu institución para activar el panel de gestión.
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#00897B] hover:bg-[#00796B] text-white mt-2"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="font-medium text-[#00897B] hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
