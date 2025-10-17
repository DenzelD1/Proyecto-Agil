"use client"

import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import Breadcrumb from "@/components/Breadcrumb"
import { leerSesion } from "@/lib/servicio-auth"
import { useCallback } from "react"
import { calcularResumen } from "@/lib/avance-utils"
import type { MallaCarrera } from "@/types/malla"
import type { Avance } from "@/types/avance"
import { useEffect, useState } from "react"

export default function CuentaPage() {
  const [rut, setRut] = useState<string>("")
  const [carrera, setCarrera] = useState<string>("")
  const [codigoCarrera, setCodigoCarrera] = useState<string>("")
  const [catalogo, setCatalogo] = useState<string>("")
  const [resumen, setResumen] = useState<ReturnType<typeof calcularResumen> | null>(null)

  const cargarDatos = useCallback(async () => {
    const s = leerSesion()
    if (s?.usuario) {
      setRut(s.usuario.rut)
      const c = s.usuario.carreras?.[0]
      if (c) {
        setCarrera(c.nombre)
        setCodigoCarrera(c.codigo)
        setCatalogo(c.catalogo)

        try {
          const slug = `${c.codigo}-${c.catalogo}`
          const [mallaResp, avanceResp] = await Promise.all([
            fetch(`/api/mallas/${slug}`, { cache: 'no-store' }),
            fetch(`/api/avance?rut=${encodeURIComponent(s.usuario.rut)}&codcarrera=${encodeURIComponent(c.codigo)}`, { cache: 'no-store' }),
          ])
          const malla = (await mallaResp.json()) as MallaCarrera
          const avance = (await avanceResp.json()) as Avance

          if (Array.isArray(malla) && Array.isArray(avance)) {
            setResumen(calcularResumen(malla, avance))
          }
        } catch (e) {
        }
      }
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <Breadcrumb />
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
            <h2 className="text-lg font-semibold mb-4">Resumen académico</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Progreso de la carrera</span>
                <span className="text-sm font-semibold text-slate-800">{resumen?.porcentajeCarrera ?? 0}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${resumen?.porcentajeCarrera ?? 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <div className="text-sm text-slate-600">Avance de créditos</div>
                <div className="text-base font-semibold text-slate-800">
                  {resumen ? `${resumen.creditosAprobados} de ${resumen.creditosTotales} SCT` : '—'}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <div className="text-sm text-slate-600">Asignaturas</div>
                <div className="text-base font-semibold text-slate-800">
                  {resumen ? `${resumen.asignaturasAprobadas} de ${resumen.asignaturasTotales} aprobadas` : '—'}
                </div>
              </div>
            </div>

            <div className="my-6 h-px bg-slate-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-white border border-slate-200 p-4">
                <div className="text-sm text-slate-600">Estado académico</div>
                <div className={`text-base font-semibold ${
                  resumen?.estadoAcademico === 'Alerta Académica' ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {resumen?.estadoAcademico ?? '—'}
                </div>
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-4">
                <div className="text-sm text-slate-600">Asignaturas Reprobadas</div>
                <div className="text-base font-semibold text-slate-800">
                  {resumen?.asignaturasReprobadas ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
