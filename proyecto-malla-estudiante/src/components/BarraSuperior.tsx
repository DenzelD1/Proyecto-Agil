"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cerrarSesion, leerSesion } from "@/lib/servicio-auth"
import { useEffect, useState } from "react"

export default function BarraSuperior() {
  const [nombreAlumno, setNombreAlumno] = useState<string>("")
  const [nombreCarrera, setNombreCarrera] = useState<string>("")

  useEffect(() => {
    const sesion = leerSesion()
    if (sesion?.usuario) {
      setNombreAlumno(sesion.usuario.rut)
      const primeraCarrera = sesion.usuario.carreras?.[0]
      setNombreCarrera(primeraCarrera ? primeraCarrera.nombre : "")
    }
  }, [])

  const handleCerrarSesion = () => {
    cerrarSesion()
    window.location.href = "/" 
  }

  return (
    <header className="w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Image src="/LogoUCN_acentuado.png" alt="Logo UCN" width={32} height={32} className="rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Alumno</span>
              <span className="text-sm font-semibold text-slate-800">{nombreAlumno || "—"}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wide">Carrera</span>
            <span className="text-sm font-semibold text-slate-800">{nombreCarrera || "—"}</span>
          </div>
        </div>
        <Button 
          onClick={handleCerrarSesion} 
          className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 text-sm font-medium shadow-sm"
        >
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}
