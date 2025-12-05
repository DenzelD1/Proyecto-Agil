"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export interface ProyeccionGuardada {
  id: number
  rut: string
  codigoCarrera: string
  nombre: string
  semestres: any[]
  createdAt: Date
  updatedAt: Date
}

interface Props {
  proyecciones: ProyeccionGuardada[]
  proyeccionActual: ProyeccionGuardada | null
  onSeleccionar: (proyeccion: ProyeccionGuardada | null) => void
  onEliminar: (id: number) => Promise<void>
  onNueva: () => void
}

export default function SelectorProyeccion({
  proyecciones,
  proyeccionActual,
  onSeleccionar,
  onEliminar,
  onNueva
}: Props) {
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  const handleEliminar = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!confirm("¿Está seguro de eliminar esta proyección?")) return

    setEliminandoId(id)
    try {
      await onEliminar(id)
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">
          Proyección:
        </label>
        <div className="relative">
          <button
            onClick={() => setMostrarMenu(!mostrarMenu)}
            className={cn(
              "px-4 py-2 bg-white border rounded-lg text-sm font-medium",
              "hover:bg-slate-50 transition-colors flex items-center gap-2",
              mostrarMenu && "ring-2 ring-blue-500"
            )}
          >
            <span>{proyeccionActual?.nombre || "Nueva Proyección"}</span>
            <span className="text-xs">▼</span>
          </button>

          {mostrarMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMostrarMenu(false)}
              />
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[200px] max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    onSeleccionar(null)
                    setMostrarMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 text-sm border-b"
                >
                  + Nueva Proyección
                </button>
                {proyecciones.map((proyeccion) => (
                  <div
                    key={proyeccion.id}
                    className={cn(
                      "px-4 py-2 hover:bg-slate-100 cursor-pointer flex items-center justify-between group",
                      proyeccionActual?.id === proyeccion.id && "bg-blue-50"
                    )}
                    onClick={() => {
                      onSeleccionar(proyeccion)
                      setMostrarMenu(false)
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {proyeccion.nombre}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(proyeccion.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleEliminar(e, proyeccion.id)}
                      disabled={eliminandoId === proyeccion.id}
                      className="opacity-0 group-hover:opacity-100 ml-2 text-red-600 hover:text-red-800 text-xs px-2 py-1 disabled:opacity-50"
                    >
                      {eliminandoId === proyeccion.id ? "..." : "✕"}
                    </button>
                  </div>
                ))}
                {proyecciones.length === 0 && (
                  <div className="px-4 py-2 text-sm text-slate-500 text-center">
                    No hay proyecciones guardadas
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

