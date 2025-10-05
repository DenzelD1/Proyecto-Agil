"use client"

import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import { leerSesion } from "@/lib/servicio-auth"
import { useEffect, useState } from "react"

export default function CuentaPage() {
  const [rut, setRut] = useState<string>("")
  const [carrera, setCarrera] = useState<string>("")
  const [codigoCarrera, setCodigoCarrera] = useState<string>("")
  const [catalogo, setCatalogo] = useState<string>("")

  useEffect(() => {
    const s = leerSesion()
    if (s?.usuario) {
      setRut(s.usuario.rut)
      const c = s.usuario.carreras?.[0]
      if (c) {
        setCarrera(c.nombre)
        setCodigoCarrera(c.codigo)
        setCatalogo(c.catalogo)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Datos personales</h2>
            <div className="space-y-2 text-slate-700">
              <div><span className="font-medium">RUT: </span>{rut || '—'}</div>
              <div><span className="font-medium">Carrera: </span>{carrera || '—'}</div>
              <div><span className="font-medium">Código carrera: </span>{codigoCarrera || '—'}</div>
              <div><span className="font-medium">Catálogo: </span>{catalogo || '—'}</div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Acciones</h2>
            <p className="text-slate-600 text-sm">Próximamente: cambiar contraseña, actualizar datos, etc.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
