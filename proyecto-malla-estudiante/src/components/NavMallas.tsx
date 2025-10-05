"use client"

import Link from "next/link"

const enlaces = [
  { href: "/principal/cuenta", titulo: "Mi Cuenta" },
  { href: "/principal/malla-curricular", titulo: "Malla Curricular" },
  { href: "/principal/malla-temporal", titulo: "Malla Temporal" },
  { href: "/principal/malla-proyectada", titulo: "Malla Proyectada" },
]

export default function NavMallas() {
  return (
    <nav className="w-full border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <ul className="flex flex-wrap gap-2 py-2">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="inline-block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {e.titulo}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
