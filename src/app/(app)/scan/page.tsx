import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ScanCamera } from "@/components/scan/ScanCamera"

export default async function ScanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div className="min-h-full">
      <ScanCamera />
    </div>
  )
}
