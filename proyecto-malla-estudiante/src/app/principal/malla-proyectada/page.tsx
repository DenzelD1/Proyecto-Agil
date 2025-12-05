"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import Breadcrumb from "@/components/Breadcrumb"
import { leerSesion } from "@/lib/servicio-auth"
import { AsignaturaMalla, MallaCarrera } from "@/types/malla"
import { Avance } from "@/types/avance"
import TarjetaAsignatura from "@/components/TarjetaAsignatura"
import ModalGuardarProyeccion from "@/components/ModalGuardarProyeccion"
import ModalAdvertencia from "@/components/ModalAdvertencia"
import SelectorProyeccion, { ProyeccionGuardada } from "@/components/SelectorProyeccion"
import {
  calcularAsignaturasDisponibles,
  calcularCreditosSemestre,
  obtenerMaximoCreditos,
  validarSemestre,
  puedeCrearNuevoSemestre,
  estaEnAlertaAcademica,
  SemestreProyectado
} from "@/lib/malla-proyectada-utils"
import { cn } from "@/lib/utils"

export default function MallaProyectadaPage() {
  const router = useRouter()
  const pathname = usePathname()
  
  const [malla, setMalla] = useState<MallaCarrera>([])
  const [avance, setAvance] = useState<Avance>([])
  const [semestresProyectados, setSemestresProyectados] = useState<SemestreProyectado[]>([])
  const [proyeccionesGuardadas, setProyeccionesGuardadas] = useState<ProyeccionGuardada[]>([])
  const [proyeccionActual, setProyeccionActual] = useState<ProyeccionGuardada | null>(null)
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<any>(null)
  const [asignaturaArrastrando, setAsignaturaArrastrando] = useState<AsignaturaMalla | null>(null)
  const [semestreDestino, setSemestreDestino] = useState<number | null>(null)
  const [mostrarModalGuardar, setMostrarModalGuardar] = useState(false)
  const [mostrarModalAdvertencia, setMostrarModalAdvertencia] = useState(false)
  const [isGuardando, setIsGuardando] = useState(false)
  const [accionPendiente, setAccionPendiente] = useState<(() => void) | null>(null)
  const [autoGuardadoHabilitado, setAutoGuardadoHabilitado] = useState(false)
  const [tieneCambiosSinGuardar, setTieneCambiosSinGuardar] = useState(false)
  const ultimoGuardadoRef = useRef<string>("")

  // Cargar datos del usuario
  useEffect(() => {
    const sesion = leerSesion()
    if (sesion?.usuario) {
      setUsuario(sesion.usuario)
    } else {
      setError('No hay sesión activa.')
      setCargando(false)
    }
  }, [])

  const cargarProyecciones = useCallback(async () => {
    if (!usuario?.rut || !usuario?.carreras?.[0]?.codigo) return

    try {
      const response = await fetch(
        `/api/proyecciones?rut=${encodeURIComponent(usuario.rut)}&codigoCarrera=${encodeURIComponent(usuario.carreras[0].codigo)}`
      )
      if (response.ok) {
        const data = await response.json()
        setProyeccionesGuardadas(data)
      }
    } catch (error) {
      console.error('Error cargando proyecciones:', error)
    }
  }, [usuario])

  // Cargar datos de malla y avance
  const cargarDatos = useCallback(async () => {
    if (!usuario) {
      if (!error) setError('Esperando datos de sesión...')
      return
    }

    const c = usuario.carreras?.[0]
    if (!c || !usuario.rut) {
      setError('No hay datos de carrera o RUT en la sesión')
      setCargando(false)
      return
    }

    const slug = `${c.codigo}-${c.catalogo}`
    const rut = usuario.rut
    const codCarrera = c.codigo

    try {
      setCargando(true)
      setError(null)

      const [mallaResp, avanceResp] = await Promise.all([
        fetch(`/api/mallas/${slug}`, { cache: 'no-store' }),
        fetch(`/api/avance?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codCarrera)}`, { cache: 'no-store' }),
      ])

      const mallaData = await mallaResp.json()
      if (!mallaResp.ok) {
        throw new Error(mallaData?.error || 'No se pudo cargar la malla')
      }
      setMalla(mallaData as MallaCarrera)

      const avanceData = await avanceResp.json()
      if (!avanceResp.ok) {
        throw new Error(avanceData?.error || 'No se pudo cargar el avance académico')
      }
      setAvance(avanceData as Avance)

      await cargarProyecciones()

    } catch (e: any) {
      console.error("Error en cargarDatos:", e)
      setError(e.message || 'Error de conexión al cargar datos')
      setMalla([])
      setAvance([])
    } finally {
      setCargando(false)
    }
  }, [usuario, error, cargarProyecciones])

  useEffect(() => {
    if (usuario) {
      cargarDatos()
    }
  }, [usuario, cargarDatos])

  const tieneAsignaturas = useMemo(() => {
    return semestresProyectados.some(semestre => semestre.asignaturas.length > 0)
  }, [semestresProyectados])

  const guardarProyeccionEnBD = useCallback(async (nombre: string): Promise<void> => {
    if (!usuario?.rut || !usuario?.carreras?.[0]?.codigo) {
      throw new Error('No hay datos de usuario')
    }

    setIsGuardando(true)
    try {
      const response = await fetch('/api/proyecciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut: usuario.rut,
          codigoCarrera: usuario.carreras[0].codigo,
          nombre,
          semestres: semestresProyectados
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar la proyección')
      }

      const data = await response.json()
      setProyeccionActual(data.proyeccion)
      setAutoGuardadoHabilitado(true)
      setTieneCambiosSinGuardar(false)
      ultimoGuardadoRef.current = JSON.stringify(semestresProyectados)
      
      await cargarProyecciones()
    } finally {
      setIsGuardando(false)
    }
  }, [semestresProyectados, usuario, cargarProyecciones])

  const guardarProyeccionAutomatica = useCallback(async () => {
    if (!proyeccionActual || !autoGuardadoHabilitado) return

    try {
      const response = await fetch(`/api/proyecciones/${proyeccionActual.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          semestres: semestresProyectados
        })
      })

      if (response.ok) {
        ultimoGuardadoRef.current = JSON.stringify(semestresProyectados)
        setTieneCambiosSinGuardar(false)
        await cargarProyecciones()
      }
    } catch (error) {
      console.error('Error en guardado automático:', error)
    }
  }, [semestresProyectados, proyeccionActual, autoGuardadoHabilitado, cargarProyecciones])

  useEffect(() => {
    const estadoActual = JSON.stringify(semestresProyectados)
    const tieneCambios = estadoActual !== ultimoGuardadoRef.current
    
    const tieneCambiosReales = tieneCambios && tieneAsignaturas
    
    if (autoGuardadoHabilitado && tieneCambiosReales && semestresProyectados.length > 0) {
      guardarProyeccionAutomatica()
    } else {
      setTieneCambiosSinGuardar(tieneCambiosReales)
    }
  }, [semestresProyectados, autoGuardadoHabilitado, tieneAsignaturas, guardarProyeccionAutomatica])

  const handleGuardarManual = useCallback(async (nombre: string) => {
    await guardarProyeccionEnBD(nombre)
  }, [guardarProyeccionEnBD])

  const handleAdvertenciaConfirmar = useCallback(async () => {
    setMostrarModalAdvertencia(false)
    setMostrarModalGuardar(true)
  }, [])

  const handleAdvertenciaCancelar = useCallback(() => {
    setMostrarModalAdvertencia(false)
    setTieneCambiosSinGuardar(false)
    setAutoGuardadoHabilitado(false)
    setProyeccionActual(null)
    setSemestresProyectados([])
    ultimoGuardadoRef.current = ""
    
    if (accionPendiente) {
      accionPendiente()
      setAccionPendiente(null)
    }
  }, [accionPendiente])

  useEffect(() => {
    if (!tieneCambiosSinGuardar || !tieneAsignaturas) return

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement

      if (!link) return

      const href = link.getAttribute('href')
      if (!href || href === pathname || href.startsWith('http') || href.startsWith('#')) return

      e.preventDefault()
      e.stopPropagation()

      setAccionPendiente(() => () => router.push(href))
      setMostrarModalAdvertencia(true)
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
    }, [tieneCambiosSinGuardar, tieneAsignaturas, pathname, router])

  const handleSeleccionarProyeccion = useCallback(async (proyeccion: ProyeccionGuardada | null) => {
    if (tieneCambiosSinGuardar && tieneAsignaturas && !proyeccionActual) {
      setAccionPendiente(() => () => {
        if (proyeccion) {
          setProyeccionActual(proyeccion)
          setSemestresProyectados(proyeccion.semestres as SemestreProyectado[])
          setAutoGuardadoHabilitado(true)
          ultimoGuardadoRef.current = JSON.stringify(proyeccion.semestres)
          setTieneCambiosSinGuardar(false)
        } else {
          setProyeccionActual(null)
          setSemestresProyectados([])
          setAutoGuardadoHabilitado(false)
          ultimoGuardadoRef.current = ""
          setTieneCambiosSinGuardar(false)
        }
      })
      setMostrarModalAdvertencia(true)
      return
    }

    if (proyeccion) {
      setProyeccionActual(proyeccion)
      setSemestresProyectados(proyeccion.semestres as SemestreProyectado[])
      setAutoGuardadoHabilitado(true)
      ultimoGuardadoRef.current = JSON.stringify(proyeccion.semestres)
      setTieneCambiosSinGuardar(false)
    } else {
      setProyeccionActual(null)
      setSemestresProyectados([])
      setAutoGuardadoHabilitado(false)
      ultimoGuardadoRef.current = ""
      setTieneCambiosSinGuardar(false)
    }
  }, [tieneCambiosSinGuardar, tieneAsignaturas, proyeccionActual])

  const handleEliminarProyeccion = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/proyecciones/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await cargarProyecciones()
        if (proyeccionActual?.id === id) {
          setProyeccionActual(null)
          setSemestresProyectados([])
          setAutoGuardadoHabilitado(false)
          ultimoGuardadoRef.current = ""
          setTieneCambiosSinGuardar(false)
        }
      }
    } catch (error) {
      console.error('Error eliminando proyección:', error)
      throw error
    }
  }, [proyeccionActual, cargarProyecciones])

  // Calcular asignaturas disponibles
  const asignaturasDisponibles = useMemo(() => {
    return calcularAsignaturasDisponibles(malla, avance, semestresProyectados)
  }, [malla, avance, semestresProyectados])

  // Handlers de drag and drop
  const handleDragStart = (asignatura: AsignaturaMalla) => {
    setAsignaturaArrastrando(asignatura)
  }

  const handleDragOver = (e: React.DragEvent, semestreNumero: number) => {
    e.preventDefault()
    setSemestreDestino(semestreNumero)
  }

  const handleDragLeave = () => {
    setSemestreDestino(null)
  }

  const handleDrop = (e: React.DragEvent, semestreNumero: number) => {
    e.preventDefault()
    setSemestreDestino(null)

    if (!asignaturaArrastrando) return

    const semestre = semestresProyectados.find(s => s.numero === semestreNumero)
    if (semestre?.asignaturas.some(a => a.codigo === asignaturaArrastrando.codigo)) {
      setAsignaturaArrastrando(null)
      return
    }

    const semestreAnterior = semestreNumero > 1
      ? semestresProyectados.find(s => s.numero === semestreNumero - 1)
      : undefined

    const maxCreditos = obtenerMaximoCreditos(avance, semestreAnterior)
    const creditosActuales = semestre
      ? calcularCreditosSemestre(semestre.asignaturas)
      : 0

    if (creditosActuales + asignaturaArrastrando.creditos > maxCreditos) {
      alert(`No se puede agregar: excedería el máximo de ${maxCreditos} créditos para este semestre`)
      setAsignaturaArrastrando(null)
      return
    }

    setSemestresProyectados(prev => {
      const nuevo = [...prev]
      const indice = nuevo.findIndex(s => s.numero === semestreNumero)

      if (indice >= 0) {
        nuevo[indice] = {
          ...nuevo[indice],
          asignaturas: [...nuevo[indice].asignaturas, asignaturaArrastrando],
          creditos: calcularCreditosSemestre([...nuevo[indice].asignaturas, asignaturaArrastrando])
        }
      } else {
        nuevo.push({
          numero: semestreNumero,
          asignaturas: [asignaturaArrastrando],
          creditos: asignaturaArrastrando.creditos
        })
      }

      return nuevo.sort((a, b) => a.numero - b.numero)
    })

    setAsignaturaArrastrando(null)
  }

  const eliminarAsignatura = (semestreNumero: number, codigoAsignatura: string) => {
    setSemestresProyectados(prev => {
      const nuevo = prev.map(semestre => {
        if (semestre.numero === semestreNumero) {
          const nuevasAsignaturas = semestre.asignaturas.filter(a => a.codigo !== codigoAsignatura)
          return {
            ...semestre,
            asignaturas: nuevasAsignaturas,
            creditos: calcularCreditosSemestre(nuevasAsignaturas)
          }
        }
        return semestre
      })

      return nuevo.filter((s, index) => {
        if (s.asignaturas.length === 0 && index > 0) return false
        return true
      })
    })
  }

  const agregarNuevoSemestre = () => {
    if (tieneCambiosSinGuardar && tieneAsignaturas && !proyeccionActual) {
      setAccionPendiente(() => () => {
        const validacion = puedeCrearNuevoSemestre(semestresProyectados, avance)
        if (!validacion.puede) {
          alert(validacion.error)
          return
        }
        const nuevoNumero = semestresProyectados.length > 0
          ? Math.max(...semestresProyectados.map(s => s.numero)) + 1
          : 1
        setSemestresProyectados(prev => [
          ...prev,
          { numero: nuevoNumero, asignaturas: [], creditos: 0 }
        ])
      })
      setMostrarModalAdvertencia(true)
      return
    }

    const validacion = puedeCrearNuevoSemestre(semestresProyectados, avance)
    if (!validacion.puede) {
      alert(validacion.error)
      return
    }

    const nuevoNumero = semestresProyectados.length > 0
      ? Math.max(...semestresProyectados.map(s => s.numero)) + 1
      : 1

    setSemestresProyectados(prev => [
      ...prev,
      { numero: nuevoNumero, asignaturas: [], creditos: 0 }
    ])
  }

  const eliminarSemestre = (semestreNumero: number) => {
    setSemestresProyectados(prev => {
      const nuevo = prev.filter(s => s.numero !== semestreNumero)
      return nuevo.map((s, index) => ({
        ...s,
        numero: index + 1
      }))
    })
  }

  const proximoSemestre = semestresProyectados.length > 0
    ? Math.max(...semestresProyectados.map(s => s.numero)) + 1
    : 1

  const enAlerta = estaEnAlertaAcademica(avance)

  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <Breadcrumb />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Malla Proyectada</h1>
              <p className="text-slate-600">
                Organiza tus semestres futuros arrastrando asignaturas disponibles
                {enAlerta && (
                  <span className="ml-2 text-red-600 font-semibold">
                    (Alerta Académica: máximo 15 créditos en el próximo semestre)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SelectorProyeccion
                proyecciones={proyeccionesGuardadas}
                proyeccionActual={proyeccionActual}
                onSeleccionar={handleSeleccionarProyeccion}
                onEliminar={handleEliminarProyeccion}
                onNueva={() => handleSeleccionarProyeccion(null)}
              />
              <button
                onClick={() => setMostrarModalGuardar(true)}
                disabled={semestresProyectados.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                💾 Guardar Proyección
              </button>
              {tieneCambiosSinGuardar && (
                <span className="text-sm text-orange-600 font-medium">
                  ● Cambios sin guardar
                </span>
              )}
            </div>
          </div>
        </div>

        {cargando && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <div className="animate-pulse">Cargando datos... ⏳</div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-100 p-6 text-red-700">{error}</div>
        )}

        {!cargando && !error && (
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">
                Asignaturas Disponibles ({asignaturasDisponibles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {asignaturasDisponibles.map((asignatura) => (
                  <div
                    key={asignatura.codigo}
                    draggable
                    onDragStart={() => handleDragStart(asignatura)}
                    className="cursor-move hover:opacity-80 transition-opacity"
                  >
                    <TarjetaAsignatura asignatura={asignatura} estado="disponible" />
                  </div>
                ))}
                {asignaturasDisponibles.length === 0 && (
                  <div className="col-span-full text-center text-slate-500 py-8">
                    No hay asignaturas disponibles para proyectar
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-700">
                  Semestres Proyectados ({semestresProyectados.length})
                </h2>
                <button
                  onClick={agregarNuevoSemestre}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span className="text-xl">+</span>
                  <span>Agregar Semestre {proximoSemestre}</span>
                </button>
              </div>

              <div className="flex flex-row gap-6 overflow-x-auto pb-4">
                {semestresProyectados.map((semestre) => {
                  const semestreAnterior = semestre.numero > 1
                    ? semestresProyectados.find(s => s.numero === semestre.numero - 1)
                    : undefined

                  const maxCreditos = obtenerMaximoCreditos(avance, semestreAnterior)
                  const validacion = validarSemestre(semestre, maxCreditos)
                  const isDragOver = semestreDestino === semestre.numero

                  return (
                    <div
                      key={semestre.numero}
                      onDragOver={(e) => handleDragOver(e, semestre.numero)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, semestre.numero)}
                      className={cn(
                        "bg-white rounded-xl border p-4 shadow-sm w-72 flex-shrink-0 min-h-[400px] transition-colors",
                        isDragOver && "border-blue-500 bg-blue-50",
                        !validacion.valido && "border-red-300 bg-red-50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold text-slate-700">
                          Semestre {semestre.numero}
                        </h3>
                        {semestre.numero > 1 && (
                          <button
                            onClick={() => eliminarSemestre(semestre.numero)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="mb-2 text-sm text-slate-600">
                        <span className={cn(
                          "font-semibold",
                          semestre.creditos > maxCreditos && "text-red-600",
                          semestre.creditos < 12 && semestre.asignaturas.length > 0 && "text-orange-600"
                        )}>
                          {semestre.creditos} / {maxCreditos} créditos
                        </span>
                        {semestre.creditos < 12 && semestre.asignaturas.length > 0 && (
                          <span className="text-orange-600 ml-2">(Mínimo 12)</span>
                        )}
                      </div>

                      {!validacion.valido && (
                        <div className="mb-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                          {validacion.error}
                        </div>
                      )}

                      <div className="space-y-2">
                        {semestre.asignaturas.map((asignatura) => (
                          <div key={asignatura.codigo} className="relative group">
                            <TarjetaAsignatura asignatura={asignatura} estado="disponible" />
                            <button
                              onClick={() => eliminarAsignatura(semestre.numero, asignatura.codigo)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {semestre.asignaturas.length === 0 && (
                          <div className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-300 rounded-lg">
                            Arrastra asignaturas aquí
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {semestresProyectados.length === 0 && (
                  <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 w-full">
                    <p className="mb-4">No hay semestres proyectados</p>
                    <button
                      onClick={agregarNuevoSemestre}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Crear Primer Semestre
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <ModalGuardarProyeccion
        isOpen={mostrarModalGuardar}
        onClose={() => setMostrarModalGuardar(false)}
        onSave={handleGuardarManual}
        nombreActual={proyeccionActual?.nombre}
        isGuardando={isGuardando}
      />

      <ModalAdvertencia
        isOpen={mostrarModalAdvertencia}
        onConfirm={handleAdvertenciaConfirmar}
        onCancel={handleAdvertenciaCancelar}
      />
    </div>
  )
}
