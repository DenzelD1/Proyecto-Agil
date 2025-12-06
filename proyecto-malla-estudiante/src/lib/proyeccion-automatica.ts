import { AsignaturaMalla, MallaCarrera } from "@/types/malla"
import { Avance } from "@/types/avance"
import { SemestreProyectado } from "./malla-proyectada-utils"
import { obtenerAsignaturasAprobadas, obtenerMaximoCreditos, calcularCreditosSemestre } from "./malla-proyectada-utils"

const MIN_CREDITOS_SEMESTRE = 12

function obtenerAsignaturasPendientes(
  malla: MallaCarrera,
  avance: Avance,
  semestresProyectados: SemestreProyectado[]
): AsignaturaMalla[] {
  const aprobadas = obtenerAsignaturasAprobadas(avance)
  const proyectadas = new Set<string>()
  
  for (const semestre of semestresProyectados) {
    for (const asignatura of semestre.asignaturas) {
      proyectadas.add(asignatura.codigo)
    }
  }
  
  return malla.filter(asignatura => 
    !aprobadas.has(asignatura.codigo) && !proyectadas.has(asignatura.codigo)
  )
}

function construirGrafoDependencias(
  asignaturasPendientes: AsignaturaMalla[],
  mallaCompleta: MallaCarrera
): Map<string, Set<string>> {
  const grafo = new Map<string, Set<string>>()
  const mallaMap = new Map<string, AsignaturaMalla>()
  
  for (const asignatura of mallaCompleta) {
    mallaMap.set(asignatura.codigo, asignatura)
  }
  
  for (const asignatura of asignaturasPendientes) {
    grafo.set(asignatura.codigo, new Set())
  }
  
  for (const asignatura of asignaturasPendientes) {
    const asignaturaMalla = mallaMap.get(asignatura.codigo)
    if (asignaturaMalla?.prereq) {
      const prereqs = asignaturaMalla.prereq.split(',').map(p => p.trim())
      for (const prereq of prereqs) {
        if (mallaMap.has(prereq)) {
          grafo.get(asignatura.codigo)!.add(prereq)
        }
      }
    }
  }
  
  return grafo
}

function calcularNivelesProfundidad(
  asignaturas: AsignaturaMalla[],
  grafo: Map<string, Set<string>>,
  aprobadas: Set<string>,
  semestresProyectados: SemestreProyectado[],
  mallaCompleta: MallaCarrera
): Map<string, number> {
  const niveles = new Map<string, number>()
  const visitados = new Set<string>()
  
  const completadas = new Set(aprobadas)
  for (const semestre of semestresProyectados) {
    for (const asignatura of semestre.asignaturas) {
      completadas.add(asignatura.codigo)
    }
  }
  
  const mallaMap = new Map<string, AsignaturaMalla>()
  for (const asignatura of mallaCompleta) {
    mallaMap.set(asignatura.codigo, asignatura)
  }
  
  function calcularNivel(codigo: string): number {
    if (visitados.has(codigo)) {
      return niveles.get(codigo) || 0
    }
    
    visitados.add(codigo)
    
    if (completadas.has(codigo)) {
      niveles.set(codigo, 0)
      return 0
    }
    
    const asignaturaMalla = mallaMap.get(codigo)
    const dependencias = new Set<string>()
    
    if (asignaturaMalla?.prereq) {
      const prereqs = asignaturaMalla.prereq.split(',').map(p => p.trim())
      for (const prereq of prereqs) {
        if (mallaMap.has(prereq)) {
          dependencias.add(prereq)
        }
      }
    }
    
    if (dependencias.size === 0) {
      niveles.set(codigo, 1)
      return 1
    }
    
    let maxNivel = 0
    for (const dep of dependencias) {
      if (completadas.has(dep)) continue
      const nivelDep = calcularNivel(dep)
      maxNivel = Math.max(maxNivel, nivelDep)
    }
    
    const nivel = maxNivel + 1
    niveles.set(codigo, nivel)
    return nivel
  }
  
  for (const asignatura of asignaturas) {
    calcularNivel(asignatura.codigo)
  }
  
  return niveles
}

function distribuirEnSemestres(
  asignaturas: AsignaturaMalla[],
  niveles: Map<string, number>,
  avance: Avance,
  semestresExistentes: SemestreProyectado[],
  mallaCompleta: MallaCarrera 
): SemestreProyectado[] {
  const semestres: SemestreProyectado[] = []
  const asignaturasPorNivel = new Map<number, AsignaturaMalla[]>()
  const ubicacionAsignaturas = new Map<string, number>()

  semestresExistentes.forEach(s => {
    s.asignaturas.forEach(a => ubicacionAsignaturas.set(a.codigo, s.numero))
  })

  for (const asignatura of asignaturas) {
    const nivel = niveles.get(asignatura.codigo) || 1
    if (!asignaturasPorNivel.has(nivel)) {
      asignaturasPorNivel.set(nivel, [])
    }
    asignaturasPorNivel.get(nivel)!.push(asignatura)
  }
  
  const nivelesOrdenados = Array.from(asignaturasPorNivel.keys()).sort((a, b) => a - b)
  
  const primerSemestreNumero = semestresExistentes.length > 0
    ? Math.max(...semestresExistentes.map(s => s.numero)) + 1
    : 1
  
  let numeroSemestreActual = primerSemestreNumero
  
  const mallaMap = new Map(mallaCompleta.map(a => [a.codigo, a]))

  for (const nivel of nivelesOrdenados) {
    const asignaturasNivel = asignaturasPorNivel.get(nivel) || []
    asignaturasNivel.sort((a, b) => b.creditos - a.creditos)
    
    for (const asignatura of asignaturasNivel) {
      
      let semestreMinimoPermitido = primerSemestreNumero;

      const infoAsignatura = mallaMap.get(asignatura.codigo)
      if (infoAsignatura?.prereq) {
        const prereqs = infoAsignatura.prereq.split(',').map(p => p.trim())
        
        for (const p of prereqs) {
          if (ubicacionAsignaturas.has(p)) {
            const semestrePrereq = ubicacionAsignaturas.get(p)!
            if (semestrePrereq + 1 > semestreMinimoPermitido) {
              semestreMinimoPermitido = semestrePrereq + 1
            }
          }
        }
      }

      let asignada = false
      
      for (let i = 0; i < semestres.length; i++) {
        const semestre = semestres[i]
        
        if (semestre.numero < semestreMinimoPermitido) continue;

        const semestreAnterior = i > 0 
            ? semestres[i - 1] 
            : (semestresExistentes.length > 0 ? semestresExistentes[semestresExistentes.length - 1] : undefined)
        
        const maxCreditos = obtenerMaximoCreditos(avance, semestreAnterior)
        const creditosActuales = calcularCreditosSemestre(semestre.asignaturas)
        
        if (creditosActuales + asignatura.creditos <= maxCreditos) {
          semestre.asignaturas.push(asignatura)
          semestre.creditos = calcularCreditosSemestre(semestre.asignaturas)
          ubicacionAsignaturas.set(asignatura.codigo, semestre.numero) 
          asignada = true
          break
        }
      }
      
      if (!asignada) {
        const numeroNuevo = Math.max(numeroSemestreActual, semestreMinimoPermitido)
        const ultimoSemestreCreado = semestres.length > 0 ? semestres[semestres.length-1].numero : (primerSemestreNumero - 1)
        const nuevoNumeroReal = ultimoSemestreCreado + 1
        
        const semestreAnterior = semestres.length > 0 
          ? semestres[semestres.length - 1]
          : (semestresExistentes.length > 0 ? semestresExistentes[semestresExistentes.length - 1] : undefined)
        
        const maxCreditos = obtenerMaximoCreditos(avance, semestreAnterior)
        
        const nuevoSemestre: SemestreProyectado = {
            numero: nuevoNumeroReal,
            asignaturas: [asignatura],
            creditos: asignatura.creditos
        }

        semestres.push(nuevoSemestre)
        ubicacionAsignaturas.set(asignatura.codigo, nuevoNumeroReal)
        
        if (nuevoNumeroReal >= numeroSemestreActual) {
            numeroSemestreActual = nuevoNumeroReal + 1
        }
      }
    }
  }
  return semestres.filter(s => s.asignaturas.length > 0)
}

export function proyectarEgresoAutomatico(
  malla: MallaCarrera,
  avance: Avance,
  semestresProyectados: SemestreProyectado[]
): SemestreProyectado[] {
  const asignaturasPendientes = obtenerAsignaturasPendientes(malla, avance, semestresProyectados)
  
  if (asignaturasPendientes.length === 0) {
    return []
  }
  
  const grafo = construirGrafoDependencias(asignaturasPendientes, malla)
  const aprobadas = obtenerAsignaturasAprobadas(avance)
  
  const niveles = calcularNivelesProfundidad(
    asignaturasPendientes, 
    grafo, 
    aprobadas,
    semestresProyectados,
    malla
  )
  
  const nuevosSemestres = distribuirEnSemestres(
    asignaturasPendientes,
    niveles,
    avance,
    semestresProyectados,
    malla 
  )
  
  return nuevosSemestres
}