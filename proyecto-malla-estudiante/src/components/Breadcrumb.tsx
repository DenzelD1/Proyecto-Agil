"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const rutas = {
  "/principal": "Inicio",
  "/principal/cuenta": "Mi Cuenta",
  "/principal/malla-curricular": "Malla Curricular",
  "/principal/malla-temporal": "Malla Temporal",
  "/principal/malla-proyectada": "Malla Proyectada",
}

export default function Breadcrumb() {
  const pathname = usePathname()
  
  if (pathname === "/principal") {
    return null
  }

  const tituloActual = rutas[pathname as keyof typeof rutas] || "Página"

  return (
    <nav className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link 
            href="/principal" 
            className="text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <span>🏠</span>
            <span>Inicio</span>
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-medium">{tituloActual}</span>
        </div>
      </div>
    </nav>
  )
}
