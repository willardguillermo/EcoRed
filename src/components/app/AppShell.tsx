"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Camera, MessageCircle, Trophy, Leaf, LogOut, Building2, MapPin, FileBarChart2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/database"

interface AppShellProps {
  children: React.ReactNode
  profile: {
    full_name: string | null
    role:      UserRole
    points:    number
    org_id:    string | null
  }
}

const NAV_ITEMS = [
  { href: "/dashboard",   icon: Home,          label: "Inicio"       },
  { href: "/scan",        icon: Camera,        label: "Escanear"     },
  { href: "/map",         icon: MapPin,        label: "Mapa"         },
  { href: "/chat",        icon: MessageCircle, label: "EcoAsistente" },
  { href: "/leaderboard", icon: Trophy,        label: "Ranking"      },
]

const INSTITUTION_ROLES: UserRole[] = ["school_admin", "municipal_admin", "platform_admin"]

export function AppShell({ children, profile }: AppShellProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  const isAdmin = INSTITUTION_ROLES.includes(profile.role)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-white shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00897B]">
            <Leaf className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-[#1A1A2E]">EcoRed</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[#E0F2F1] text-[#00897B]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Institución
                </span>
              </div>
              {[
                { href: "/institution/dashboard", icon: Building2,     label: "Panel"    },
                { href: "/institution/reports",   icon: FileBarChart2, label: "Reporte"  },
              ].map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-[#E3F2FD] text-[#1565C0]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0F2F1] text-[#00897B] text-sm font-bold">
              {(profile.full_name ?? "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile.full_name ?? "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {profile.points} pts
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header (mobile) */}
        <header className="flex md:hidden items-center justify-between h-14 px-4 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00897B]">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-[#1A1A2E]">EcoRed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0F2F1] text-[#00897B] text-sm font-bold">
              {(profile.full_name ?? "U")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="flex md:hidden items-center border-t border-border bg-white shrink-0">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-[#00897B]" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
