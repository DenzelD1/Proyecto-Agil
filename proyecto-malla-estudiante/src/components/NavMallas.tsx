"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const enlaces = [
  { href: "/principal/cuenta", titulo: "Mi Cuenta", icono: "👤" },
  { href: "/principal/malla-curricular", titulo: "Malla Curricular", icono: "📚" },
  { href: "/principal/malla-temporal", titulo: "Malla Temporal", icono: "📅" },
  { href: "/principal/malla-proyectada", titulo: "Malla Proyectada", icono: "🎯" },
]

export default function NavMallas() {
  const pathname = usePathname()

  return (
    <nav className="w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex flex-wrap gap-1 py-3">
          {enlaces.map((e) => {
            const isActive = pathname === e.href
            return (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <span className="text-base">{e.icono}</span>
                  {e.titulo}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
