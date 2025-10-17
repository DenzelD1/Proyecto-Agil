"use client"

import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import { leerSesion } from "@/lib/servicio-auth"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function PrincipalPage() {
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    const sesion = leerSesion()
    if (sesion?.usuario) {
      setUsuario(sesion.usuario)
    }
  }, [])

  const tarjetas = [
    {
      titulo: "Mi Cuenta",
      descripcion: "Revisa tus datos personales y resumen académico",
      icono: "👤",
      href: "/principal/cuenta",
      color: "bg-blue-50 border-blue-200 text-blue-800"
    },
    {
      titulo: "Malla Curricular",
      descripcion: "Visualiza el plan de estudios de tu carrera",
      icono: "📚",
      href: "/principal/malla-curricular",
      color: "bg-green-50 border-green-200 text-green-800"
    },
    {
      titulo: "Malla Temporal",
      descripcion: "Revisa tu historial académico por semestres",
      icono: "📅",
      href: "/principal/malla-temporal",
      color: "bg-purple-50 border-purple-200 text-purple-800"
    },
    {
      titulo: "Malla Proyectada",
      descripcion: "Planifica tu futuro académico",
      icono: "🎯",
      href: "/principal/malla-proyectada",
      color: "bg-orange-50 border-orange-200 text-orange-800"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Bienvenido al Sistema Académico Totoralillo 3
          </h1>
          <p className="text-slate-600">
            Visualiza o gestiona tu información académica y planifica tu futuro profesional
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tarjetas.map((tarjeta) => (
            <Link
              key={tarjeta.href}
              href={tarjeta.href}
              className={`group block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${tarjeta.color}`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{tarjeta.icono}</div>
                <h3 className="text-lg font-semibold mb-2">{tarjeta.titulo}</h3>
                <p className="text-sm opacity-80">{tarjeta.descripcion}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">📊 Resumen Académico</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">RUT:</span>
                <span className="font-medium">{usuario?.rut || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Carrera:</span>
                <span className="font-medium">{usuario?.carreras?.[0]?.nombre || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Catálogo:</span>
                <span className="font-medium">{usuario?.carreras?.[0]?.catalogo || "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">🚀 Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link 
                href="/principal/malla-curricular" 
                className="block w-full text-left px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Ver mi malla curricular
              </Link>
              <Link 
                href="/principal/cuenta" 
                className="block w-full text-left px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Ver datos personales y resumen académico
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
