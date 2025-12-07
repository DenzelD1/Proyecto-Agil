import { proyectarEgresoAutomatico } from '../../../src/lib/proyeccion-automatica'
import { Avance } from '../../../src/types/avance'
import { AsignaturaMalla } from '../../../src/types/malla'

describe('proyeccion-automatica', () => {
  test('genera proyeccion incluyendo todas las asignaturas pendientes simples', () => {
    const malla: AsignaturaMalla[] = [
      { codigo: 'A', asignatura: 'A', creditos: 6 },
      { codigo: 'B', asignatura: 'B', creditos: 6, prereq: 'A' },
      { codigo: 'C', asignatura: 'C', creditos: 6, prereq: 'B' }
    ]

    const avance: Avance = [
      { nrc: '1', period: '202420', student: '1', course: 'A', status: 'APROBADO' }
    ]

    const semestresExistentes = []
    const proyeccion = proyectarEgresoAutomatico(malla as any, avance, semestresExistentes as any)

    // Debe proyectar B y C en alguno de los semestres resultantes
    const codigosProyectados = proyeccion.flatMap(s => s.asignaturas.map(a => a.codigo))
    expect(codigosProyectados).toEqual(expect.arrayContaining(['B','C']))
  })
})
