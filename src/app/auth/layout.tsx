import Link from "next/link"
import { Leaf } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <header className="flex items-center h-14 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00897B]">
            <Leaf className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-[#1A1A2E]">EcoRed</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="text-center py-4 text-xs text-muted-foreground">
        QuipuSoft 2026 · Tecsup
      </footer>
    </div>
  )
}
