"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, Camera, MessageCircle, Trophy, Leaf, LogOut, Building2, MapPin, FileBarChart2, UsersRound } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/database"

interface AppShellProps {
  children: React.ReactNode
  profile: {
    full_name: string | null
    avatar_url: string | null
    role:      UserRole
    points:    number
    org_id:    string | null
  }
}

const NAV_ITEMS = [
  { href: "/dashboard",   icon: Home,          label: "Inicio"       },
  { href: "/scan",        icon: Camera,        label: "Escanear"     },
  { href: "/map",         icon: MapPin,        label: "Mapa"         },
  { href: "/community",   icon: UsersRound,    label: "EcoMuro"      },
  { href: "/chat",        icon: MessageCircle, label: "EcoAsistente", shortLabel: "IA" },
  { href: "/leaderboard", icon: Trophy,        label: "Ranking"      },
]

const INSTITUTION_ROLES: UserRole[] = ["school_admin", "municipal_admin", "platform_admin"]

function ProfileAvatar({ profile, size = "md" }: {
  profile: AppShellProps["profile"]
  size?:   "sm" | "md"
}) {
  const sizeClass = size === "sm" ? "h-8 w-8" : "h-9 w-9"
  const initial = (profile.full_name ?? "U")[0].toUpperCase()

  return (
    <span className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E0F2F1] text-sm font-bold text-[#00897B]`}>
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar_url} alt="Avatar de perfil" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  )
}

export function AppShell({ children, profile }: AppShellProps) {
  const pathname  = usePathname()
  const supabase  = createClient()

  const [points, setPoints] = useState(profile.points)

  // Suscripción Realtime: actualiza los puntos en el sidebar sin recargar.
  // El cleanup se retorna directamente del useEffect (no dentro del .then)
  // para garantizar que React lo invoque al desmontar.
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    let isMounted = true

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id
      if (!userId || !isMounted) return

      channel = supabase
        .channel("profile-points")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
          (payload) => {
            const newPoints = (payload.new as { points: number }).points
            if (typeof newPoints === "number" && isMounted) setPoints(newPoints)
          }
        )
        .subscribe()
    })

    return () => {
      isMounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = INSTITUTION_ROLES.includes(profile.role)

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.assign("/")
  }

  return (
    <div className="glass-app flex h-screen overflow-hidden">
      {/* ── Sidebar (desktop) ── */}
      <aside className="glass-sidebar hidden md:flex w-56 flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <div className="glass-brand-mark flex h-7 w-7 items-center justify-center rounded-lg">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "glass-nav-active text-[#00796B]"
                    : "glass-nav-item text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn("glass-nav-icon", active && "glass-nav-icon-active")}>
                  <item.icon className="h-4 w-4" />
                </span>
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "glass-nav-active glass-nav-active-blue text-[#1565C0]"
                        : "glass-nav-item text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className={cn("glass-nav-icon", active && "glass-nav-icon-active")}>
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-border p-3">
          <Link
            href="/profile"
            className="glass-profile-pill flex items-center gap-3 px-2 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:bg-white/55"
          >
            <ProfileAvatar profile={profile} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile.full_name ?? "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {points} pts
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="glass-nav-item mt-2 flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <span className="glass-nav-icon h-8 w-8">
              <LogOut className="h-4 w-4" />
            </span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="glass-content flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header (mobile) */}
        <header className="glass-mobile-top flex md:hidden items-center justify-between h-14 px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="glass-brand-mark flex h-7 w-7 items-center justify-center rounded-lg">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-[#1A1A2E]">EcoRed</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile" aria-label="Editar perfil" className="rounded-full ring-offset-2 transition-transform active:scale-95">
              <ProfileAvatar profile={profile} size="sm" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="glass-scroll flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="glass-bottom-nav flex md:hidden items-center shrink-0 px-1 py-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-all duration-200",
                  active ? "glass-nav-active text-[#00897B]" : "text-muted-foreground hover:bg-white/45"
                )}
              >
                <span className={cn("glass-nav-icon", active && "glass-nav-icon-active")}>
                  <item.icon className={cn("h-4.5 w-4.5", active && "stroke-[2.5]")} />
                </span>
                {item.shortLabel ?? item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
