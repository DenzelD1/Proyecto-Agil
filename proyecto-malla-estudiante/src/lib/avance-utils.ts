// src/lib/avance-utils.ts
import type { Avance, RegistroAvance } from "@/types/avance"
import type { MallaCarrera, AsignaturaMalla } from "@/types/malla"

export interface ResumenAcademico {
  porcentajeCarrera: number
  creditosAprobados: number
  creditosTotales: number
  asignaturasAprobadas: number
  asignaturasTotales: number
  asignaturasReprobadas: number
  estadoAcademico: 'Normal' | 'Alerta Académica'
}

function normalizarEstado(estado: string): 'APROBADO' | 'REPROBADO' | 'OTRO' {
  const e = estado.toUpperCase()
  if (e.includes('APRO')) return 'APROBADO'
  if (e.includes('REPRO')) return 'REPROBADO'
  return 'OTRO'
}

export function verificarAlertaAcademica(avance: Avance): 'Normal' | 'Alerta Académica' {
  const avanceOrdenado = [...avance].sort((a, b) => parseInt(a.period) - parseInt(b.period))

  // intentosPorCurso: cuenta de reprobs por curso (incluye duplicados si el mismo curso aparece varias veces)
  const intentosPorCurso: Map<string, number> = new Map()
  // reprobadosPorSemestre: lista (con duplicados) de cursos reprobados por periodo
  const reprobadosPorSemestre: Map<string, string[]> = new Map()
  // registrosPorCurso para determinar estado final por curso
  const registrosPorCurso: Map<string, RegistroAvance[]> = new Map()

  for (const reg of avanceOrdenado) {
    const lista = registrosPorCurso.get(reg.course) || []
    lista.push(reg)
    registrosPorCurso.set(reg.course, lista)

    const estado = normalizarEstado(reg.status)
    if (estado === 'REPROBADO') {
      intentosPorCurso.set(reg.course, (intentosPorCurso.get(reg.course) || 0) + 1)
      const arr = reprobadosPorSemestre.get(reg.period) || []
      arr.push(reg.course)
      reprobadosPorSemestre.set(reg.period, arr)
    }
  }

  // Primero: si algún curso que actualmente NO está aprobado acumula >=3 reprobs -> alerta
  for (const [curso, registros] of registrosPorCurso.entries()) {
    const ultimo = registros[registros.length - 1]
    const estadoFinal = ultimo ? normalizarEstado(ultimo.status) : 'OTRO'

    if (estadoFinal === 'APROBADO') continue

    const reprobs = intentosPorCurso.get(curso) || 0
    if (reprobs >= 3) return 'Alerta Académica'
  }

  // Segundo: evaluar reprobados por semestre (se cuentan duplicados como en la lógica original)
  for (const reprobados of reprobadosPorSemestre.values()) {
    if (reprobados.length >= 2) {
      const enSegundaOportunidad = reprobados.filter(curso => {
        const reprobs = intentosPorCurso.get(curso) || 0
        const registros = registrosPorCurso.get(curso) || []
        const ultimo = registros[registros.length - 1]
        const estadoFinal = ultimo ? normalizarEstado(ultimo.status) : 'OTRO'
        // solo contar si el curso tiene exactamente 2 reprobs y no fue aprobado al final
        return reprobs === 2 && estadoFinal !== 'APROBADO'
      }).length

      if (enSegundaOportunidad >= 2) return 'Alerta Académica'
    }
  }

  return 'Normal'
}


export function calcularResumen(malla: MallaCarrera, avance: Avance): ResumenAcademico {
  const mallaMap = new Map<string, AsignaturaMalla>(malla.map(a => [a.codigo, a]));
  const cursoAEstadoFinal: Map<string, 'APROBADO' | 'REPROBADO'> = new Map();

  for (const reg of avance) {
    const estado = normalizarEstado(reg.status)
    if (estado !== 'APROBADO' && estado !== 'REPROBADO') continue;
    
    const estadoPrevio = cursoAEstadoFinal.get(reg.course);
    if (estadoPrevio === 'APROBADO') continue; 

    cursoAEstadoFinal.set(reg.course, estado);
  }

  let creditosAprobados = 0
  let asignaturasAprobadas = 0
  let asignaturasReprobadas = 0

  for (const asignatura of malla) {
    const estado = cursoAEstadoFinal.get(asignatura.codigo);
    
    if (estado === 'APROBADO') {
      asignaturasAprobadas++;
      creditosAprobados += asignatura.creditos || 0;
    } else if (estado === 'REPROBADO') {
      asignaturasReprobadas++;
    }
  }

  const creditosTotales = malla.reduce((s, a) => s + (a.creditos || 0), 0);
  const asignaturasTotales = malla.length;
  const porcentajeCarrera = creditosTotales > 0 ? Math.round((creditosAprobados / creditosTotales) * 100) : 0;
  const estadoAcademico = verificarAlertaAcademica(avance);

  return {
    porcentajeCarrera,
    creditosAprobados,
    creditosTotales,
    asignaturasAprobadas,
    asignaturasTotales,
    asignaturasReprobadas,
    estadoAcademico,
  }
}