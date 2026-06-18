"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function JoinButton({ code }: { code: string }) {
  const router  = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleJoin() {
    setBusy(true)
    try {
      const res  = await fetch("/api/classrooms/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/login?next=/join/${code}`)
          return
        }
        toast.error(data.error ?? "Error al unirse")
        return
      }
      toast.success(`¡Te uniste a ${data.classroom_name}!`)
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleJoin}
      disabled={busy}
      className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-[#00897B] hover:bg-[#00796B] text-white font-semibold text-base transition-colors disabled:opacity-60"
    >
      {busy && <Loader2 className="h-5 w-5 animate-spin" />}
      {busy ? "Uniéndose..." : "Unirse al aula"}
    </button>
  )
}
