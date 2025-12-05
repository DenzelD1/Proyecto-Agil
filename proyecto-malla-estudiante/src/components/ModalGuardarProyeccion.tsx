"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (nombre: string) => Promise<void>
  nombreActual?: string
  isGuardando?: boolean
}

export default function ModalGuardarProyeccion({
  isOpen,
  onClose,
  onSave,
  nombreActual,
  isGuardando = false
}: Props) {
  const [nombre, setNombre] = useState(nombreActual || "")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setNombre(nombreActual || "")
      setError(null)
    }
  }, [isOpen, nombreActual])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError("El nombre es obligatorio")
      return
    }

    try {
      await onSave(nombre.trim())
      onClose()
    } catch (err: any) {
      setError(err.message || "Error al guardar la proyección")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            {nombreActual ? "Actualizar Proyección" : "Guardar Proyección"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de la proyección <span className="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value)
                  setError(null)
                }}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                  error ? "border-red-500" : "border-slate-300"
                )}
                placeholder="Ej: Proyección X"
                disabled={isGuardando}
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isGuardando}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isGuardando || !nombre.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGuardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

