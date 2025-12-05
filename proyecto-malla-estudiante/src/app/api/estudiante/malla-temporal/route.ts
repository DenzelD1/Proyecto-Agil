import { NextRequest, NextResponse } from 'next/server'
import { obtenerRutEstudiante, obtenerDatosEstudiante } from '@/lib/services/ucn-auth.service'
import { obtenerAvanceAcademico, parsearPeriodo } from '@/lib/services/ucn-avance.service'
import { obtenerMallasMultiples } from '@/lib/services/ucn-malla.service'

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

interface MallaTemporal {
  estudiante: {
    rut: string
    nombre: string
    carrera: string
  }
  semestres: {
    numero: number
    periodo?: string
    ramos: RamoMalla[]
    creditosTotal: number
    creditosAprobados: number
  }[]
  progreso: {
    creditosTotal: number
    creditosAprobados: number
    porcentajeAvance: number
    semestreActual: number
    totalRamos?: number
    ramosAprobados?: number
    ramosCursando?: number
    ramosReprobados?: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    const rutParam = searchParams.get('rut')
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    let rut = rutParam || await obtenerRutEstudiante(email, password || undefined)
    
    if (!rut) {
      return NextResponse.json({ 
        error: 'No se pudo obtener RUT válido',
        details: 'Estrategias intentadas: localStorage, login con contraseña, extracción desde email',
        suggestions: [
          'Verifique que haya iniciado sesión correctamente',
          'Use email con formato RUT: 12345678-9@alumnos.ucn.cl',
          'Proporcione contraseña válida'
        ]
      }, { status: 400 })
    }

    const datosEstudiante = await obtenerDatosEstudiante(email, password || undefined)
    const codigoCarrera = datosEstudiante?.carreras?.[0]?.codigo
    const catalogo = datosEstudiante?.carreras?.[0]?.catalogo || '202410'
    
    if (!codigoCarrera) {
      return NextResponse.json({ 
        error: 'No se pudo obtener el código de carrera' 
      }, { status: 400 })
    }
    
    const ramosCursados = await obtenerRamosCursados(rut, codigoCarrera, catalogo)
    const mallaTemporal = construirMallaTemporal(datosEstudiante, ramosCursados)

    return NextResponse.json(mallaTemporal)

  } catch (error) {
    console.error('Error procesando malla temporal:', error)
    
    return NextResponse.json({
      error: 'Error procesando malla temporal',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

async function obtenerRamosCursados(
  rut: string,
  codCarrera: string,
  catalogo: string
): Promise<RamoMalla[]> {
  try {
    const avance = await obtenerAvanceAcademico(rut, codCarrera)
    
    if (avance.length === 0) {
      return []
    }

    const carrerasAConsultar = [
      { codigo: codCarrera, catalogo },
      { codigo: '8266', catalogo: '202410' }, // ITI actual
      { codigo: '8606', catalogo: '201610' }, // ICCI anterior
      { codigo: '8616', catalogo: '201610' }, // ICI anterior
    ]

    const carrerasUnicas = carrerasAConsultar.filter((carrera, index, self) => 
      index === self.findIndex(c => c.codigo === carrera.codigo && c.catalogo === carrera.catalogo)
    )

    const mallaData = await obtenerMallasMultiples(carrerasUnicas)
    
    const creditosPorCodigo = new Map<string, number>()
    const nombresPorCodigo = new Map<string, string>()
    
    for (const asignatura of mallaData) {
      if (asignatura.codigo) {
        if (asignatura.creditos) {
          creditosPorCodigo.set(asignatura.codigo, asignatura.creditos)
        }
        
        const nombre = asignatura.asignatura
        if (nombre && nombre.trim() !== '') {
          nombresPorCodigo.set(asignatura.codigo, nombre.trim())
        }
      }
    }
    
    const ramosTransformados: RamoMalla[] = []
    const ramosPorCodigo = new Map<string, RamoMalla>()
    
    for (const registro of avance) {
      const codigo = registro.course
      const creditos = creditosPorCodigo.get(codigo) || 0
      const nombre = nombresPorCodigo.get(codigo) || codigo
      
      const { periodoMostrar } = parsearPeriodo(registro.period)
      
      const estadoNormalizado = registro.status.toUpperCase()
      let estado: RamoMalla['estado'] = 'pendiente'
      
      if (estadoNormalizado.includes('APROB')) {
        estado = 'aprobado'
      } else if (estadoNormalizado.includes('REPRO')) {
        estado = 'reprobado'
      } else if (estadoNormalizado.includes('CURSANDO') || estadoNormalizado.includes('INSCRIT')) {
        estado = 'cursando'
      }
      
      if (!ramosPorCodigo.has(codigo)) {
        const asignaturaMalla = mallaData.find(a => a.codigo === codigo)
        const prerrequisitos = asignaturaMalla?.prereq 
          ? asignaturaMalla.prereq.split(',').map((p: string) => p.trim()) 
          : []
        
        const nuevoRamo: RamoMalla = {
          id: codigo,
          nombre: nombre,
          codigo: codigo,
          creditos: creditos,
          semestre: parseInt(registro.period.substring(0, 4)),
          estado: estado,
          prerrequisitos: prerrequisitos,
          periodo: periodoMostrar
        }
        
        ramosPorCodigo.set(codigo, nuevoRamo)
        ramosTransformados.push(nuevoRamo)
      }
    }
    
    ramosTransformados.sort((a, b) => {
      if (!a.periodo || !b.periodo) return 0
      return a.periodo.localeCompare(b.periodo)
    })
    
    return ramosTransformados
  } catch (error) {
    console.error('Error obteniendo ramos cursados:', error)
    return []
  }
}

function construirMallaTemporal(
  datosEstudiante: any,
  ramosCursados: RamoMalla[]
): MallaTemporal {
  const semestresPorPeriodo = new Map<string, RamoMalla[]>()
  
  ramosCursados.forEach(ramo => {
    const periodo = ramo.periodo || 'Sin período'
    if (!semestresPorPeriodo.has(periodo)) {
      semestresPorPeriodo.set(periodo, [])
    }
    semestresPorPeriodo.get(periodo)!.push(ramo)
  })

  const semestres = Array.from(semestresPorPeriodo.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodo, ramos], index) => {
      const creditosTotal = ramos.reduce((sum, r) => sum + r.creditos, 0)
      const creditosAprobados = ramos
        .filter(r => r.estado === 'aprobado')
        .reduce((sum, r) => sum + r.creditos, 0)
      
      return {
        numero: index + 1, 
        periodo: periodo,  
        ramos: ramos.sort((a, b) => a.nombre.localeCompare(b.nombre)),
        creditosTotal,
        creditosAprobados
      }
    })

  // Calcular progreso general
  const creditosTotal = semestres.reduce((sum, s) => sum + s.creditosTotal, 0)
  const creditosAprobados = semestres.reduce((sum, s) => sum + s.creditosAprobados, 0)
  const porcentajeAvance = creditosTotal > 0 ? (creditosAprobados / creditosTotal) * 100 : 0

  // Calcular estadísticas adicionales
  const totalRamos = ramosCursados.length
  const ramosAprobados = ramosCursados.filter(r => r.estado === 'aprobado').length
  const ramosCursando = ramosCursados.filter(r => r.estado === 'cursando').length
  const ramosReprobados = ramosCursados.filter(r => r.estado === 'reprobado').length

  return {
    estudiante: {
      rut: datosEstudiante?.rut || 'N/A',
      nombre: datosEstudiante?.nombre || 'Estudiante UCN',
      carrera: datosEstudiante?.carreras?.[0]?.nombre || 'Carrera UCN'
    },
    semestres,
    progreso: {
      creditosTotal,
      creditosAprobados,
      porcentajeAvance: Math.round(porcentajeAvance * 100) / 100,
      semestreActual: semestres.length,
      totalRamos,
      ramosAprobados,
      ramosCursando,
      ramosReprobados
    }
  }
}
