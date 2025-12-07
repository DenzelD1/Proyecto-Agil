import { AsignaturaMalla, MallaCarrera } from "@/types/malla"
import { Avance } from "@/types/avance"
import { verificarAlertaAcademica } from "./avance-utils"

export interface SemestreProyectado {
  numero: number
  asignaturas: AsignaturaMalla[]
  creditos: number
}

export interface ProyeccionMalla {
  semestres: SemestreProyectado[]
}

/**
 * Determina si una asignatura está aprobada
 */
function estaAprobada(codigo: string, avance: Avance): boolean {
  const registros = avance
    .filter(reg => reg.course === codigo)
    .sort((a, b) => parseInt(a.period) - parseInt(b.period))

  if (registros.length === 0) return false

  const ultimoRegistro = registros[registros.length - 1]
  const statusNormalizado = ultimoRegistro.status.toUpperCase()
  return statusNormalizado.includes('APROB')
}

/**
 * Obtiene las asignaturas aprobadas
 */
export function obtenerAsignaturasAprobadas(avance: Avance): Set<string> {
  const ultimaPorCurso = new Map<string, any>()

  for (const registro of avance) {
    const codigo = registro.course
    const periodo = parseInt(registro.period || '0')
    const existente = ultimaPorCurso.get(codigo)
    if (!existente || periodo >= parseInt(existente.period || '0')) {
      ultimaPorCurso.set(codigo, registro)
    }
  }

  const aprobadas = new Set<string>()
  for (const registro of ultimaPorCurso.values()) {
    const statusNormalizado = (registro.status || '').toUpperCase()
    if (statusNormalizado.includes('APROB')) {
      aprobadas.add(registro.course)
    }
  }

  return aprobadas
}

/**
 * Obtiene las asignaturas que deben considerarse completadas para efectos
 * de prerrequisitos: las aprobadas y las inscritas actualmente (status 'INSCRITO'
 * con `excluded: false`).
 */
export function obtenerAsignaturasAprobadasEInscritas(avance: Avance): Set<string> {
  const ultimaPorCurso = new Map<string, any>()

  for (const registro of avance) {
    const codigo = registro.course
    const periodo = parseInt(registro.period || '0')
    const existente = ultimaPorCurso.get(codigo)
    if (!existente || periodo >= parseInt(existente.period || '0')) {
      ultimaPorCurso.set(codigo, registro)
    }
  }

  const completadas = new Set<string>()

  for (const registro of ultimaPorCurso.values()) {
    const status = (registro.status || '').toUpperCase()
    if (status.includes('APROB')) {
      completadas.add(registro.course)
      continue
    }

    if (status.includes('INSCRITO')) {
      // Considerar inscrito solo si excluded === false (está cursando actualmente)
      if ((registro as any).excluded === false) {
        completadas.add(registro.course)
      }
    }
  }

  return completadas
}

export function prerrequisitosCumplenEnSemestre(
  asignatura: AsignaturaMalla,
  aprobadas: Set<string>,
  semestresProyectados: SemestreProyectado[],
  semestreNumero: number
): { cumplen: boolean; faltantes: string[] } {
  if (!asignatura.prereq) return { cumplen: true, faltantes: [] }

  const prereqs = asignatura.prereq.split(',').map(p => p.trim())
  const faltantes: string[] = []

  for (const prereq of prereqs) {
    if (aprobadas.has(prereq)) continue

    const encontrado = semestresProyectados.find(s =>
      s.asignaturas.some(a => a.codigo === prereq && s.numero < semestreNumero)
    )

    if (!encontrado) {
      faltantes.push(prereq)
    }
  }

  return { cumplen: faltantes.length === 0, faltantes }
}

/**
 * Obtiene todas las asignaturas que están aprobadas o proyectadas
 */
function obtenerAsignaturasCompletadas(
  aprobadas: Set<string>,
  semestresProyectados: SemestreProyectado[]
): Set<string> {
  const completadas = new Set(aprobadas)
  
  // Agregar todas las asignaturas de semestres proyectados
  for (const semestre of semestresProyectados) {
    for (const asignatura of semestre.asignaturas) {
      completadas.add(asignatura.codigo)
    }
  }
  
  return completadas
}

/**
 * Verifica si los prerrequisitos están cumplidos
 */
function prerrequisitosCumplidos(
  asignatura: AsignaturaMalla,
  aprobadas: Set<string>,
  semestresProyectados: SemestreProyectado[]
): boolean {
  if (!asignatura.prereq) return true

  const completadas = obtenerAsignaturasCompletadas(aprobadas, semestresProyectados)
  const prereqs = asignatura.prereq.split(',').map(p => p.trim())
  
  // Todos los prerrequisitos deben estar completados
  for (const prereq of prereqs) {
    if (!completadas.has(prereq)) {
      return false
    }
  }
  
  return true
}

/**
 * Calcula las asignaturas disponibles para proyectar
 */
export function calcularAsignaturasDisponibles(
  malla: MallaCarrera,
  avance: Avance,
  semestresProyectados: SemestreProyectado[]
): AsignaturaMalla[] {
  // Para calcular disponibilidad, tratamos como "completadas" las asignaturas
  // aprobadas y las inscritas actualmente (excluded:false). Sin embargo, las
  // inscritas NO deben aparecer como disponibles en la lista.
  const completadasParaPrereq = obtenerAsignaturasAprobadasEInscritas(avance)
  const aprobadas = obtenerAsignaturasAprobadas(avance)
  
  return malla.filter(asignatura => {
    // No incluir si ya está aprobada o si está inscrita actualmente (excluded:false)
    if (aprobadas.has(asignatura.codigo)) return false

    // Si está en completadasParaPrereq pero no en `aprobadas`, significa que
    // está inscrita (excluded:false) — no debe mostrarse en la lista disponible.
    if (completadasParaPrereq.has(asignatura.codigo) && !aprobadas.has(asignatura.codigo)) return false
    
    // No incluir si ya está en algún semestre proyectado
    const yaProyectada = semestresProyectados.some(semestre =>
      semestre.asignaturas.some(a => a.codigo === asignatura.codigo)
    )
    if (yaProyectada) return false
    
    return true
  })
}

/**
 * Calcula el crédito total de un semestre
 */
export function calcularCreditosSemestre(asignaturas: AsignaturaMalla[]): number {
  return asignaturas.reduce((sum, a) => sum + a.creditos, 0)
}

/**
 * Verifica si el estudiante está en alerta académica
 */
export function estaEnAlertaAcademica(avance: Avance): boolean {
  return verificarAlertaAcademica(avance) === 'Alerta Académica'
}

/**
 * Obtiene el máximo de créditos permitidos para un semestre
 */
export function obtenerMaximoCreditos(
  avance: Avance,
  semestreAnterior?: SemestreProyectado
): number {
  // Si hay un semestre anterior proyectado, asumimos que aprobó todo
  if (semestreAnterior) {
    return 30
  }
  
  // Si está en alerta académica, máximo 15 créditos
  if (estaEnAlertaAcademica(avance)) {
    return 15
  }
  
  return 30
}

/**
 * Valida un semestre proyectado
 */
export function validarSemestre(
  semestre: SemestreProyectado,
  maxCreditos: number
): { valido: boolean; error?: string } {
  const creditos = calcularCreditosSemestre(semestre.asignaturas)
  
  if (creditos > maxCreditos) {
    return {
      valido: false,
      error: `El semestre excede el máximo de ${maxCreditos} créditos (tiene ${creditos} créditos)`
    }
  }
  
  if (creditos < 12 && semestre.asignaturas.length > 0) {
    return {
      valido: false,
      error: `El semestre debe tener mínimo 12 créditos (tiene ${creditos} créditos)`
    }
  }
  
  return { valido: true }
}

/**
 * Valida que se pueda crear un nuevo semestre
 */
export function puedeCrearNuevoSemestre(
  semestres: SemestreProyectado[],
  avance: Avance
): { puede: boolean; error?: string } {
  if (semestres.length === 0) {
    return { puede: true }
  }
  
  const ultimoSemestre = semestres[semestres.length - 1]
  
  if (ultimoSemestre.asignaturas.length === 0) {
    return {
      puede: false,
      error: 'Debe agregar asignaturas al semestre actual antes de crear uno nuevo'
    }
  }
  
  const maxCreditos = obtenerMaximoCreditos(avance, semestres.length > 1 ? semestres[semestres.length - 2] : undefined)
  const validacion = validarSemestre(ultimoSemestre, maxCreditos)
  
  if (!validacion.valido) {
    return {
      puede: false,
      error: validacion.error
    }
  }
  
  return { puede: true }
}

