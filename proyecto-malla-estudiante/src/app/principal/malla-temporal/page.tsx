"use client"

import { useEffect, useState } from "react"
import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import Breadcrumb from "@/components/Breadcrumb"

// Interfaces para la malla temporal
interface RamoMalla {
  id: string
  nombre: string
  codigo: string
  creditos: number
  semestre: number
  estado: 'cursando' | 'aprobado' | 'reprobado' | 'pendiente' | 'disponible' | 'bloqueado'
  prerrequisitos: string[]
  profesor?: string
  seccion?: string
  nota?: number
  periodo?: string
}

interface Ramo {
  id: string
  nombre: string
  codigo: string
  creditos: number
  semestre: number
  estado: 'cursando' | 'aprobado' | 'reprobado' | 'pendiente' | 'disponible' | 'bloqueado'
  prerrequisitos: string[]
  profesor?: string
  seccion?: string
  nota?: number
  periodo?: string
}

interface EstudianteMalla {
  rut: string
  nombre: string
  carrera: string
}

interface SemestreMalla {
  numero: number
  ramos: Ramo[]
  creditosTotal: number
  creditosAprobados: number
}

interface ProgresoMalla {
  creditosTotal: number
  creditosAprobados: number
  porcentajeAvance: number
  semestreActual: number
  totalRamos: number
  ramosAprobados: number
  ramosCursando: number
  ramosReprobados: number
}

interface MallaTemporal {
  estudiante: EstudianteMalla
  semestres: SemestreMalla[]
  progreso: ProgresoMalla
}

interface EstudianteMalla {
  rut: string
  nombre: string
  carrera: string
}

interface SemestreMalla {
  numero: number
  ramos: RamoMalla[]
  creditosTotal: number
  creditosAprobados: number
}

interface ProgresoMalla {
  creditosTotal: number
  creditosAprobados: number
  porcentajeAvance: number
  semestreActual: number
  totalRamos: number
  ramosAprobados: number
  ramosCursando: number
  ramosReprobados: number
}

interface MallaTemporal {
  estudiante: EstudianteMalla
  semestres: SemestreMalla[]
  progreso: ProgresoMalla
}

export default function MallaTemporalPage() {
  const [mallaTemporal, setMallaTemporal] = useState<MallaTemporal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarMallaTemporal()
  }, [])

  const cargarMallaTemporal = async () => {
    const email = localStorage?.getItem("email")
    const password = localStorage?.getItem("password") // Para obtener RUT
    
    if (!email) {
      setError("No hay sesión activa")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Cargando malla temporal...")
      console.log("📧 Email usado:", email)

      // Estrategia 1: Obtener RUT desde localStorage si está disponible
      let rutFromStorage = null
      try {
        const sesionData = localStorage.getItem('sesion_usuario')
        if (sesionData) {
          const sesion = JSON.parse(sesionData)
          rutFromStorage = sesion?.usuario?.rut
          console.log("💾 RUT encontrado en localStorage:", rutFromStorage)
        }
      } catch (e) {
        console.log("⚠️ No se pudo obtener RUT desde localStorage")
      }
      
      // Usar la nueva API de malla temporal
      let apiUrl = `/api/estudiante/malla-temporal?email=${encodeURIComponent(email)}`
      if (password) {
        apiUrl += `&password=${encodeURIComponent(password)}`
      }
      
      // Si tenemos RUT desde localStorage, agregarlo como parámetro
      if (rutFromStorage) {
        apiUrl += `&rut=${encodeURIComponent(rutFromStorage)}`
      }
      
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(15000) // 15 segundos timeout
      })
      
      console.log("📡 Status de respuesta:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.log("❌ Error response:", errorData)
        
        // Mostrar sugerencias específicas si es un error de RUT
        if (errorData.error && errorData.error.includes('RUT válido')) {
          setError(`${errorData.error}\n\nSugerencias:\n• Use email con formato: 12345678-9@alumnos.ucn.cl\n• O asegúrese de haber iniciado sesión correctamente`)
        } else {
          setError(`${errorData.error}. ${errorData.details || ''}`)
        }
        setLoading(false)
        return
      }
      
      const data = await response.json()
      console.log("📊 Malla temporal obtenida:", data)
      
      setMallaTemporal(data)
      setError(null)
      
    } catch (error) {
      console.error("❌ Error cargando malla temporal:", error)
      setError(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
    
    setLoading(false)
  }

  const getEstadoColor = (estado: RamoMalla['estado']) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-100 text-green-800'
      case 'cursando': return 'bg-blue-100 text-blue-800'
      case 'reprobado': return 'bg-red-100 text-red-800'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'disponible': return 'bg-purple-100 text-purple-800'
      case 'bloqueado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoIcon = (estado: RamoMalla['estado']) => {
    switch (estado) {
      case 'aprobado': return '✅'
      case 'cursando': return '📚'
      case 'reprobado': return '❌'
      case 'pendiente': return '⏳'
      case 'disponible': return '🟢'
      case 'bloqueado': return '🔒'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <BarraSuperior />
        <NavMallas />
        <Breadcrumb />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-xl text-gray-600">Cargando malla temporal...</div>
              <div className="text-sm text-gray-500 mt-2">Procesando datos académicos...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <Breadcrumb />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          
          {/* Header con información del estudiante */}
          <header className="mb-8">
            {mallaTemporal && (
              <>
                {/* Información del Estudiante */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {mallaTemporal.estudiante.nombre}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        RUT: {mallaTemporal.estudiante.rut}
                      </p>
                      <p className="text-blue-600 font-semibold text-lg">
                        {mallaTemporal.estudiante.carrera}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-100 px-4 py-2 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Progreso Total</p>
                        <p className="text-2xl font-bold text-blue-800">
                          {mallaTemporal.progreso.porcentajeAvance.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de Progreso */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Ramos Aprobados</p>
                        <p className="text-2xl font-bold text-green-800">{mallaTemporal.progreso.ramosAprobados}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Ramos Cursando</p>
                        <p className="text-2xl font-bold text-blue-800">{mallaTemporal.progreso.ramosCursando}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Ramos Reprobados</p>
                        <p className="text-2xl font-bold text-red-800">{mallaTemporal.progreso.ramosReprobados}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Total Ramos</p>
                        <p className="text-2xl font-bold text-purple-800">{mallaTemporal.progreso.totalRamos}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Créditos */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Progreso de Créditos</h3>
                      <p className="text-gray-600">
                        {mallaTemporal.progreso.creditosAprobados} de {mallaTemporal.progreso.creditosTotal} créditos aprobados
                      </p>
                    </div>
                    <div className="w-64">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${mallaTemporal.progreso.porcentajeAvance}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 text-center">
                        {mallaTemporal.progreso.porcentajeAvance.toFixed(1)}% completado
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {!mallaTemporal && (
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Malla Temporal</h1>
                <p className="text-slate-600">Cargando información del estudiante...</p>
              </div>
            )}
            
            {error && (
              <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-red-800 font-medium mb-2">❌ Error</h3>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <button
                  onClick={cargarMallaTemporal}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  🔄 Reintentar
                </button>
              </div>
            )}
          </header>

          {/* Contenido principal */}
          {!mallaTemporal ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay datos disponibles</h3>
              <p className="text-slate-600 mb-6">
                No se pudo cargar la información de la malla temporal.
              </p>
              <button
                onClick={cargarMallaTemporal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 Cargar datos
              </button>
            </div>
          ) : mallaTemporal.semestres.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay ramos registrados</h3>
              <p className="text-slate-600">
                No se encontraron ramos en el sistema para este estudiante.
              </p>
            </div>
          ) : (
            /* Semestres y ramos */
            <div className="space-y-8">
              {mallaTemporal.semestres.map((semestre) => (
                <div key={semestre.numero} className="bg-slate-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">
                      📚 Semestre {semestre.numero}
                    </h2>
                    <div className="flex space-x-4 text-sm text-slate-600">
                      <span>
                        <strong>Total:</strong> {semestre.creditosTotal} créditos
                      </span>
                      <span>
                        <strong>Aprobados:</strong> {semestre.creditosAprobados} créditos
                      </span>
                      <span className="text-green-600">
                        <strong>{semestre.ramos.length}</strong> ramos
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {semestre.ramos.map((ramo) => (
                      <div key={ramo.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-2">
                            <h3 className="font-medium text-slate-800 leading-tight">
                              {ramo.nombre}
                            </h3>
                            {ramo.nombre !== ramo.codigo && (
                              <p className="text-xs text-slate-500 mt-1">
                                Código: {ramo.codigo}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getEstadoColor(ramo.estado)}`}>
                            {getEstadoIcon(ramo.estado)} {ramo.estado}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-slate-600">
                          {/* Solo mostrar código si es diferente del nombre */}
                          {ramo.nombre === ramo.codigo && (
                            <p><strong>Código:</strong> {ramo.codigo}</p>
                          )}
                          <p><strong>Créditos:</strong> {ramo.creditos}</p>
                          
                          {ramo.profesor && (
                            <p><strong>Profesor:</strong> {ramo.profesor}</p>
                          )}
                          
                          {ramo.seccion && (
                            <p><strong>Sección:</strong> {ramo.seccion}</p>
                          )}
                          
                          {ramo.nota && (
                            <p className={`font-medium ${ramo.nota >= 4.0 ? 'text-green-600' : 'text-red-600'}`}>
                              <strong>Nota:</strong> {ramo.nota.toFixed(1)}
                            </p>
                          )}
                          
                          {ramo.periodo && (
                            <p><strong>Período:</strong> {ramo.periodo}</p>
                          )}
                          
                          {ramo.prerrequisitos.length > 0 && (
                            <p className="text-xs text-slate-500">
                              <strong>Prerrequisitos:</strong> {ramo.prerrequisitos.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Footer con resumen */}
          {mallaTemporal && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900">{mallaTemporal.progreso.semestreActual}</div>
                  <div className="text-sm text-blue-700">Semestres cursados</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-900">{mallaTemporal.progreso.creditosAprobados}</div>
                  <div className="text-sm text-green-700">Créditos aprobados</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-900">{mallaTemporal.progreso.porcentajeAvance}%</div>
                  <div className="text-sm text-purple-700">Progreso total</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
