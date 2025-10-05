"use client"

import { useEffect, useMemo, useState } from "react"
import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import { leerSesion } from "@/lib/servicio-auth"
import { AsignaturaMalla, MallaCarrera } from "@/types/malla"
import TarjetaAsignatura from "@/components/TarjetaAsignatura"

export default function MallaCurricularPage() {
  const [malla, setMalla] = useState<MallaCarrera>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const slug = useMemo(() => {
    const s = leerSesion()
    const c = s?.usuario.carreras?.[0]
    if (!c) return null
    return `${c.codigo}-${c.catalogo}`
  }, [])

  useEffect(() => {
    async function cargar() {
      if (!slug) {
        setError('No hay datos de carrera en la sesión')
        setCargando(false)
        return
      }
      try {
        setCargando(true)
        const resp = await fetch(`/api/mallas/${slug}`, { cache: 'no-store' })
        const data = await resp.json()
        if (!resp.ok) {
          setError(data?.error || 'No se pudo cargar la malla')
          setCargando(false)
          return
        }
        setMalla(data as MallaCarrera)
      } catch (e) {
        setError('Error de conexión al cargar la malla')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [slug])

  // Agrupar por nivel (semestre)
  const niveles = useMemo(() => {
    const mapa = new Map<number, AsignaturaMalla[]>()
    for (const a of malla) {
      const arr = mapa.get(a.nivel) || []
      arr.push(a)
      mapa.set(a.nivel, arr)
    }
    return Array.from(mapa.entries()).sort((a, b) => a[0] - b[0])
  }, [malla])

  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {cargando && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">Cargando malla...</div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
        )}
        {!cargando && !error && malla.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-700">
            No hay datos de malla para la combinación de carrera y catálogo actuales.
          </div>
        )}
        {!cargando && !error && malla.length > 0 && (
          <div className="space-y-8">
            {niveles.map(([nivel, asignaturas]) => (
              <section key={nivel}>
                <h2 className="text-lg font-semibold mb-3">{nivel}. Semestre</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {asignaturas.map((a) => (
                    <TarjetaAsignatura key={a.codigo} asignatura={a} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
