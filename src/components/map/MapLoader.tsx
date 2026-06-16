"use client"

import dynamic from "next/dynamic"
import type { RecyclingPoint } from "./RecyclingMap"

const RecyclingMap = dynamic(
  () => import("./RecyclingMap").then((m) => m.RecyclingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    ),
  }
)

export function MapLoader({ points }: { points: RecyclingPoint[] }) {
  return <RecyclingMap points={points} />
}
