import { obtenerAsignaturasAprobadas, obtenerAsignaturasAprobadasEInscritas, calcularAsignaturasDisponibles, prerrequisitosCumplenEnSemestre, validarSemestre, obtenerMaximoCreditos, puedeCrearNuevoSemestre } from '../../../src/lib/malla-proyectada-utils'
import { Avance } from '../../../src/types/avance'
import { AsignaturaMalla } from '../../../src/types/malla'

describe('malla-proyectada-utils', () => {
  const malla: AsignaturaMalla[] = [
    { codigo: 'A', asignatura: 'A', creditos: 6 },
    { codigo: 'B', asignatura: 'B', creditos: 6, prereq: 'A' },
    { codigo: 'C', asignatura: 'C', creditos: 6, prereq: 'B' }
  ]

  test('obtenerAsignaturasAprobadas considera ultimo registro por periodo', () => {
    const avance: Avance = [
      { nrc: '1', period: '202410', student: '1', course: 'A', status: 'APROBADO' },
      { nrc: '2', period: '202520', student: '1', course: 'A', status: 'REPROBADO' }
    ]

    const aprob = obtenerAsignaturasAprobadas(avance)
    expect(aprob.has('A')).toBe(false)
  })

  test('obtenerAsignaturasAprobadasEInscritas marca INSCRITO excluded:false como completadas', () => {
    const avance: Avance = [
      { nrc: '10', period: '202520', student: '1', course: 'B', status: 'INSCRITO', /* @ts-ignore */ excluded: false }
    ]

    const comp = obtenerAsignaturasAprobadasEInscritas(avance)
    expect(comp.has('B')).toBe(true)
  })

  test('INSCRITO excluded:true no se considera inscrito (debe aparecer como disponible)', () => {
    const avance: Avance = [
      { nrc: '11', period: '202520', student: '1', course: 'C', status: 'INSCRITO', /* @ts-ignore */ excluded: true }
    ]

    const comp = obtenerAsignaturasAprobadasEInscritas(avance)
    expect(comp.has('C')).toBe(false)
  })

  test('calcularAsignaturasDisponibles excluye aprobadas e inscritas actuales', () => {
    const avance: Avance = [
      { nrc: '20', period: '202520', student: '1', course: 'A', status: 'APROBADO' },
      { nrc: '21', period: '202520', student: '1', course: 'B', status: 'INSCRITO', /* @ts-ignore */ excluded: false }
    ]

    const disponibles = calcularAsignaturasDisponibles(malla as any, avance, [])
    // A está aprobada -> no en disponibles; B está inscrita -> no en disponibles; C pendiente -> sí
    expect(disponibles.map(d => d.codigo)).toEqual(['C'])
  })

  test('prerrequisitosCumplenEnSemestre requiere prereqs en semestres anteriores', () => {
    const avance: Avance = []
    const semestres = [ { numero: 1, asignaturas: [{ codigo: 'A', asignatura: 'A', creditos: 6 }], creditos: 6 } ]
    const asignaturaB: AsignaturaMalla = { codigo: 'B', asignatura: 'B', creditos: 6, prereq: 'A' }

    const result = prerrequisitosCumplenEnSemestre(asignaturaB as any, new Set(), semestres as any, 2)
    expect(result.cumplen).toBe(true)
  })

  test('validarSemestre detecta creditos mayores o menores', () => {
    const sem: any = { numero: 1, asignaturas: [{ codigo: 'X', asignatura: 'X', creditos: 20 }], creditos: 20 }
    expect(validarSemestre(sem, 15).valido).toBe(false)

    const sem2: any = { numero: 2, asignaturas: [{ codigo: 'Y', asignatura: 'Y', creditos: 6 }], creditos: 6 }
    expect(validarSemestre(sem2, 30).valido).toBe(false)
  })

  test('obtenerMaximoCreditos respeta alerta academica', () => {
    const avanceAlerta: Avance = [
      { nrc: 'r1', period: '202410', student: '1', course: 'Z', status: 'REPROBADO' },
      { nrc: 'r2', period: '202410', student: '1', course: 'W', status: 'REPROBADO' },
      { nrc: 'r3', period: '202410', student: '1', course: 'Z', status: 'REPROBADO' }
    ]

    // Sin semestre anterior y en alerta -> 15
    expect(obtenerMaximoCreditos(avanceAlerta)).toBe(15)

    // Con semestre anterior -> 30
    expect(obtenerMaximoCreditos([], { numero: 1, asignaturas: [], creditos: 0 } as any)).toBe(30)
  })

  test('puedeCrearNuevoSemestre valida condiciones', () => {
    expect(puedeCrearNuevoSemestre([], []).puede).toBe(true)

    const sems: any = [{ numero: 1, asignaturas: [], creditos: 0 }]
    expect(puedeCrearNuevoSemestre(sems, []).puede).toBe(false)
  })

  test('calcularAsignaturasDisponibles incluye asignatura con prereq no cumplido (lista completa)', () => {
    const malla2: AsignaturaMalla[] = [
      { codigo: 'Z', asignatura: 'Z', creditos: 6 },
      { codigo: 'D', asignatura: 'D', creditos: 6, prereq: 'Z' }
    ]
    const avance: Avance = []

    const disponibles = calcularAsignaturasDisponibles(malla2 as any, avance, [])
    // No hay aprobadas ni inscritas -> debe aparecer Z y D en la lista de disponibles
    expect(disponibles.map(d => d.codigo).sort()).toEqual(['D','Z'])
  })
})
