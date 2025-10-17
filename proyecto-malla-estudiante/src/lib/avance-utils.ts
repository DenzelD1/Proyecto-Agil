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

function verificarAlertaAcademica(avance: Avance): 'Normal' | 'Alerta Académica' {
  const intentosPorCurso: Map<string, number> = new Map()
  const reprobadosPorSemestre: Map<string, string[]> = new Map()

  const avanceOrdenado = [...avance].sort((a, b) => parseInt(a.period) - parseInt(b.period));

  for (const reg of avanceOrdenado) {
    const estado = normalizarEstado(reg.status)
    if (estado !== 'REPROBADO') continue;

    const conteoActual = intentosPorCurso.get(reg.course) || 0;
    intentosPorCurso.set(reg.course, conteoActual + 1);

    if (intentosPorCurso.get(reg.course) === 3) {
      return 'Alerta Académica';
    }

    if (!reprobadosPorSemestre.has(reg.period)) {
      reprobadosPorSemestre.set(reg.period, []);
    }
    reprobadosPorSemestre.get(reg.period)!.push(reg.course);
  }

  for (const reprobados of reprobadosPorSemestre.values()) {
    if (reprobados.length >= 2) {
      const enSegundaOportunidad = reprobados.filter(curso => intentosPorCurso.get(curso) === 2).length;
      if (enSegundaOportunidad >= 2) {
        return 'Alerta Académica';
      }
    }
  }

  return 'Normal';
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