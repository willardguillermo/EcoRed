import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MapLoader } from "@/components/map/MapLoader"
import type { RecyclingPoint } from "@/components/map/RecyclingMap"
import type { WasteCategory } from "@/types/database"

// Puntos de demo para Lima (se usan si la DB está vacía)
const DEMO_POINTS: RecyclingPoint[] = [
  {
    id: "d1", name: "Ecobox Miraflores",
    address: "Av. Larco 1301, Miraflores",
    lat: -12.1191, lng: -77.0384,
    materials: ["plastic", "paper", "glass"] as WasteCategory[],
    schedule: "Lun–Sáb 8am–6pm",
  },
  {
    id: "d2", name: "Punto Verde San Isidro",
    address: "Av. Rivera Navarrete 600, San Isidro",
    lat: -12.0932, lng: -77.0370,
    materials: ["plastic", "metal", "electronic"] as WasteCategory[],
    schedule: "Lun–Vie 9am–5pm",
  },
  {
    id: "d3", name: "EcoMuni Surco",
    address: "Av. Monte de los Olivos 525, Surco",
    lat: -12.1498, lng: -76.9928,
    materials: ["organic", "paper", "glass"] as WasteCategory[],
    schedule: "Mar y Jue 8am–12pm",
  },
  {
    id: "d4", name: "Reciclaje Barranco",
    address: "Jr. Ayacucho 218, Barranco",
    lat: -12.1469, lng: -77.0209,
    materials: ["plastic", "glass", "metal"] as WasteCategory[],
    schedule: "Lun–Sáb 7am–2pm",
  },
  {
    id: "d5", name: "Ecocentro La Molina",
    address: "Av. La Fontana 800, La Molina",
    lat: -12.0840, lng: -76.9327,
    materials: ["electronic", "hazardous", "plastic"] as WasteCategory[],
    schedule: "Sáb 9am–1pm",
  },
  {
    id: "d6", name: "Punto Verde Jesús María",
    address: "Av. Salaverry 1800, Jesús María",
    lat: -12.0798, lng: -77.0494,
    materials: ["paper", "plastic", "organic"] as WasteCategory[],
    schedule: "Lun–Vie 8am–4pm",
  },
]

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: dbPoints } = await supabase
    .from("recycling_points")
    .select("id, name, address, lat, lng, materials, schedule")
    .order("created_at", { ascending: false })

  const points: RecyclingPoint[] = (dbPoints && dbPoints.length > 0)
    ? (dbPoints as RecyclingPoint[])
    : DEMO_POINTS

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3.5rem)] md:max-h-screen">
      {/* Header */}
      <div className="glass-card shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-[#1A1A2E]">Puntos de acopio</h1>
          <p className="text-xs text-muted-foreground">
            {points.length} punto{points.length !== 1 ? "s" : ""} en tu zona
            {(!dbPoints || dbPoints.length === 0) && " · datos de ejemplo"}
          </p>
        </div>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 relative">
        <MapLoader points={points} />
      </div>
    </div>
  )
}
