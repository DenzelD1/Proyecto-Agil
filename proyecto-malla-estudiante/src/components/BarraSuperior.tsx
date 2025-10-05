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
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/LogoUCN_acentuado.png" alt="Logo UCN" width={36} height={36} className="rounded-full" />
          <div className="flex flex-col">
            <span className="text-sm text-slate-500">Alumno</span>
            <span className="text-base font-semibold text-slate-800">{nombreAlumno || "—"}</span>
          </div>
          <div className="h-6 w-px bg-slate-300 mx-2" />
          <div className="flex flex-col">
            <span className="text-sm text-slate-500">Carrera</span>
            <span className="text-base font-semibold text-slate-800">{nombreCarrera || "—"}</span>
          </div>
        </div>
        <Button onClick={handleCerrarSesion} className="bg-slate-700 hover:bg-slate-800 text-white">Cerrar sesión</Button>
      </div>
    </header>
  )
}
