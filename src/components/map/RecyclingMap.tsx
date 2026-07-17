"use client"

import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import { MapPin, Navigation, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WasteCategory } from "@/types/database"

export type RecyclingPoint = {
  id:        string
  name:      string
  address:   string
  lat:       number
  lng:       number
  materials: WasteCategory[]
  schedule:  string | null
}

const MATERIAL_LABELS: Record<WasteCategory, string> = {
  plastic:    "Plástico",
  paper:      "Papel",
  glass:      "Vidrio",
  metal:      "Metal",
  organic:    "Orgánico",
  electronic: "Electrónico",
  hazardous:  "Peligroso",
  other:      "Otros",
}

const MATERIAL_COLORS: Record<WasteCategory, string> = {
  plastic:    "#1565C0",
  paper:      "#F57F17",
  glass:      "#00838F",
  metal:      "#546E7A",
  organic:    "#2E7D32",
  electronic: "#6A1B9A",
  hazardous:  "#C62828",
  other:      "#424242",
}

const ALL_CATS: WasteCategory[] = ["plastic", "paper", "glass", "metal", "organic", "electronic", "hazardous", "other"]

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      transform:rotate(-45deg);
    "></div>`,
    iconSize:   [28, 28],
    iconAnchor: [14, 28],
    popupAnchor:[0, -30],
  })
}

const DEFAULT_CENTER: [number, number] = [-12.0464, -77.0428] // Lima

interface Props {
  points: RecyclingPoint[]
}

export function RecyclingMap({ points }: Props) {
  const mapRef       = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter]     = useState<WasteCategory | null>(null)
  const [selected, setSelected] = useState<RecyclingPoint | null>(null)

  const filtered = filter
    ? points.filter((p) => p.materials.includes(filter))
    : points

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom:   12,
      zoomControl: false,
    })

    L.control.zoom({ position: "bottomright" }).addTo(map)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Re-render markers when filter or points change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove existing markers layer
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer)
    })

    filtered.forEach((point) => {
      const primary = point.materials[0] ?? "other"
      const color   = MATERIAL_COLORS[primary] ?? "#00897B"
      const icon    = makeIcon(color)

      const marker = L.marker([point.lat, point.lng], { icon })
        .addTo(map)
        .on("click", () => setSelected(point))

      marker.bindTooltip(point.name, { direction: "top", offset: [0, -30] })
    })
  }, [filtered])

  function locateUser() {
    mapRef.current?.locate({ setView: true, maxZoom: 15 })
  }

  return (
    <div className="relative h-full w-full">
      {/* Material filter chips */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-1.5 flex-wrap pointer-events-none">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            "pointer-events-auto px-3 py-1 rounded-full text-xs font-semibold shadow transition-colors",
            !filter
              ? "bg-[#00897B] text-white"
              : "glass-card text-muted-foreground hover:bg-white/70"
          )}
        >
          Todos
        </button>
        {ALL_CATS.filter((c) => points.some((p) => p.materials.includes(c))).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(filter === cat ? null : cat)}
            className={cn(
              "pointer-events-auto px-3 py-1 rounded-full text-xs font-semibold shadow transition-colors",
              filter === cat
                ? "text-white"
                : "glass-card text-muted-foreground hover:bg-white/70"
            )}
            style={filter === cat ? { backgroundColor: MATERIAL_COLORS[cat] } : {}}
          >
            {MATERIAL_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Locate me button */}
      <button
        onClick={locateUser}
        className="glass-card absolute bottom-24 right-3 z-[1000] h-10 w-10 rounded-xl shadow-md flex items-center justify-center hover:bg-white/70 transition-colors"
        title="Mi ubicación"
      >
        <Navigation className="h-4 w-4 text-[#00897B]" />
      </button>

      {/* Selected point popup */}
      {selected && (
        <div className="absolute bottom-6 left-3 right-3 z-[1000] bg-white rounded-2xl shadow-lg border border-border p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#E0F2F1] flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-[#00897B]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1A1A2E]">{selected.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.address}</p>
                {selected.schedule && (
                  <p className="text-xs text-muted-foreground">{selected.schedule}</p>
                )}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="shrink-0 p-1 hover:bg-muted rounded-lg">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selected.materials.map((m) => (
              <span
                key={m}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: MATERIAL_COLORS[m] }}
              >
                {MATERIAL_LABELS[m]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
          <div className="bg-white rounded-2xl px-6 py-4 shadow text-center">
            <p className="text-sm font-medium text-foreground">Sin puntos para este material</p>
            <p className="text-xs text-muted-foreground mt-1">Prueba con otro filtro</p>
          </div>
        </div>
      )}
    </div>
  )
}
