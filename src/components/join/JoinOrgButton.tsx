"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function JoinOrgButton({ orgId }: { orgId: string }) {
  const router  = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleJoin() {
    setBusy(true)
    try {
      const res  = await fetch("/api/org/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ org_id: orgId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) { router.push(`/auth/login?next=/join/org/${orgId}`); return }
        toast.error(data.error ?? "Error al unirse")
        return
      }
      toast.success("¡Te uniste a la organización!")
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
      className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-[#1565C0] hover:bg-[#1255A3] text-white font-semibold text-base transition-colors disabled:opacity-60"
    >
      {busy && <Loader2 className="h-5 w-5 animate-spin" />}
      {busy ? "Uniéndose..." : "Unirse a la organización"}
    </button>
  )
}
