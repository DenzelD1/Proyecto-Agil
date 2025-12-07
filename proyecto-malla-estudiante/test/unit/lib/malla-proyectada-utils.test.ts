import { obtenerAsignaturasAprobadas, obtenerAsignaturasAprobadasEInscritas, calcularAsignaturasDisponibles, prerrequisitosCumplenEnSemestre, validarSemestre, obtenerMaximoCreditos, puedeCrearNuevoSemestre } from '../../../src/lib/malla-proyectada-utils'
import { Avance } from '../../../src/types/avance'
import { AsignaturaMalla } from '../../../src/types/malla'

describe('malla-proyectada-utils', () => {
  const malla: AsignaturaMalla[] = [
    { codigo: 'A', asignatura: 'A', creditos: 6, nivel: 1 },
    { codigo: 'B', asignatura: 'B', creditos: 6, prereq: 'A', nivel: 1 },
    { codigo: 'C', asignatura: 'C', creditos: 6, prereq: 'B', nivel: 1 }
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
    const reg: any = { nrc: '10', period: '202520', student: '1', course: 'B', status: 'INSCRITO', excluded: false }
    const avance: Avance = [reg as unknown as (import('../../../src/types/avance').RegistroAvance & { excluded?: boolean })]

    const comp = obtenerAsignaturasAprobadasEInscritas(avance)
    expect(comp.has('B')).toBe(true)
  })

  test('INSCRITO excluded:true no se considera inscrito (debe aparecer como disponible)', () => {
    const reg2: any = { nrc: '11', period: '202520', student: '1', course: 'C', status: 'INSCRITO', excluded: true }
    const avance: Avance = [reg2 as unknown as (import('../../../src/types/avance').RegistroAvance & { excluded?: boolean })]

    const comp = obtenerAsignaturasAprobadasEInscritas(avance)
    expect(comp.has('C')).toBe(false)
  })

  test('calcularAsignaturasDisponibles excluye aprobadas e inscritas actuales', () => {
    const regA: any = { nrc: '20', period: '202520', student: '1', course: 'A', status: 'APROBADO' }
    const regB: any = { nrc: '21', period: '202520', student: '1', course: 'B', status: 'INSCRITO', excluded: false }
    const avance: Avance = [regA as unknown as import('../../../src/types/avance').RegistroAvance, regB as unknown as (import('../../../src/types/avance').RegistroAvance & { excluded?: boolean })]

    const disponibles = calcularAsignaturasDisponibles(malla as any, avance, [])
    // A está aprobada -> no en disponibles; B está inscrita -> no en disponibles; C pendiente -> sí
    expect(disponibles.map(d => d.codigo)).toEqual(['C'])
  })

  test('prerrequisitosCumplenEnSemestre requiere prereqs en semestres anteriores', () => {
    const avance: Avance = []
    const semestres = [ { numero: 1, asignaturas: [{ codigo: 'A', asignatura: 'A', creditos: 6, nivel: 1 }], creditos: 6 } ]
    const asignaturaB: AsignaturaMalla = { codigo: 'B', asignatura: 'B', creditos: 6, prereq: 'A', nivel: 1 }

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
      { codigo: 'Z', asignatura: 'Z', creditos: 6, nivel: 1 },
      { codigo: 'D', asignatura: 'D', creditos: 6, prereq: 'Z', nivel: 1 }
    ]
    const avance: Avance = []

    const disponibles = calcularAsignaturasDisponibles(malla2 as any, avance, [])
    // No hay aprobadas ni inscritas -> debe aparecer Z y D en la lista de disponibles
    expect(disponibles.map(d => d.codigo).sort()).toEqual(['D','Z'])
  })

  test('estaAprobada detecta estado segun ultimo registro', () => {
    const avance: Avance = [ { nrc: '1', period: '202410', student: '1', course: 'X', status: 'APROBADO' } as import('../../../src/types/avance').RegistroAvance ]
    expect((require('../../../src/lib/malla-proyectada-utils').estaAprobada)('X', avance)).toBe(true)

    const avance2: Avance = [ { nrc: '1', period: '202410', student: '1', course: 'Y', status: 'APROBADO' } as import('../../../src/types/avance').RegistroAvance,
      { nrc: '2', period: '202520', student: '1', course: 'Y', status: 'REPROBADO' } as import('../../../src/types/avance').RegistroAvance ]
    expect((require('../../../src/lib/malla-proyectada-utils').estaAprobada)('Y', avance2)).toBe(false)
  })

  test('obtenerAsignaturasCompletadas combina aprobadas y proyectadas', () => {
    const aprobadas = new Set(['A'])
    const sems: any = [{ numero: 1, asignaturas: [{ codigo: 'B', asignatura: 'B', creditos: 6, nivel: 1 }], creditos: 6 }]
    const comp = (require('../../../src/lib/malla-proyectada-utils').obtenerAsignaturasCompletadas)(aprobadas, sems)
    expect(comp.has('A')).toBe(true)
    expect(comp.has('B')).toBe(true)
  })

  test('prerrequisitosCumplidos retorna false cuando faltan prereqs', () => {
    const aprobadas = new Set<string>()
    const sems: any = [{ numero: 1, asignaturas: [], creditos: 0 }]
    const asign: AsignaturaMalla = { codigo: 'D', asignatura: 'D', creditos: 6, prereq: 'Z', nivel: 1 }
    const ok = (require('../../../src/lib/malla-proyectada-utils').prerrequisitosCumplidos)(asign as any, aprobadas, sems)
    expect(ok).toBe(false)
  })

  test('calcularCreditosSemestre suma correctamente', () => {
    const c = (require('../../../src/lib/malla-proyectada-utils').calcularCreditosSemestre)([
      { codigo: 'A', asignatura: 'A', creditos: 5, nivel: 1 },
      { codigo: 'B', asignatura: 'B', creditos: 7, nivel: 1 }
    ] as any)
    expect(c).toBe(12)
  })

  test('estaEnAlertaAcademica detecta alerta', () => {
    const avance: Avance = [ { nrc: '1', period: '202410', student: '1', course: 'Z', status: 'REPROBADO' } as import('../../../src/types/avance').RegistroAvance,
      { nrc: '2', period: '202520', student: '1', course: 'Z', status: 'REPROBADO' } as import('../../../src/types/avance').RegistroAvance,
      { nrc: '3', period: '202610', student: '1', course: 'Z', status: 'REPROBADO' } as import('../../../src/types/avance').RegistroAvance ]
    const res = (require('../../../src/lib/malla-proyectada-utils').estaEnAlertaAcademica)(avance)
    expect(res).toBe(true)
  })

  test('validarSemestre valido pasa con >=12 creditos', () => {
    const sem: any = { asignaturas: [{ codigo: 'A', creditos: 6, nivel: 1 }, { codigo: 'B', creditos: 6, nivel: 1 }], creditos: 12 }
    expect(validarSemestre(sem, 30).valido).toBe(true)
  })

  test('puedeCrearNuevoSemestre con semestre valido permite crearlo (>=12 créditos)', () => {
    const sems: any = [{ numero: 1, asignaturas: [{ codigo: 'A', creditos: 6, nivel: 1 }, { codigo: 'B', creditos: 6, nivel: 1 }], creditos: 12 }]
    const res = puedeCrearNuevoSemestre(sems, [])
    expect(res.puede).toBe(true)
  })
})
