import { verificarAlertaAcademica, calcularResumen } from '../../../src/lib/avance-utils'
import { Avance } from '../../../src/types/avance'

describe('avance-utils', () => {
  test('verificarAlertaAcademica normal', () => {
    const avance: Avance = [
      { nrc: '1', period: '202410', student: '1', course: 'A', status: 'APROBADO' }
    ]
    expect(verificarAlertaAcademica(avance)).toBe('Normal')
  })

  test('verificarAlertaAcademica alerta por tercer intento', () => {
    const avance: Avance = [
      { nrc: '1', period: '202410', student: '1', course: 'X', status: 'REPROBADO' },
      { nrc: '2', period: '202420', student: '1', course: 'X', status: 'REPROBADO' },
      { nrc: '3', period: '202430', student: '1', course: 'X', status: 'REPROBADO' }
    ]
    expect(verificarAlertaAcademica(avance)).toBe('Alerta Académica')
  })

  test('verificarAlertaAcademica alerta por dos reprobados en segunda oportunidad mismo semestre', () => {
    const avance: Avance = [
      { nrc: '1', period: '202410', student: '1', course: 'A', status: 'REPROBADO' },
      { nrc: '2', period: '202410', student: '1', course: 'A', status: 'REPROBADO' },
      { nrc: '3', period: '202410', student: '1', course: 'B', status: 'REPROBADO' },
      { nrc: '4', period: '202410', student: '1', course: 'B', status: 'REPROBADO' }
    ]
    expect(verificarAlertaAcademica(avance)).toBe('Alerta Académica')
  })

  test('calcularResumen produce resumen coherente', () => {
    const malla = [ { codigo: 'A', asignatura: 'A', creditos: 6 }, { codigo: 'B', asignatura: 'B', creditos: 6 } ]
    const avance: Avance = [
      { nrc: '1', period: '202410', student: '1', course: 'A', status: 'APROBADO' },
      { nrc: '2', period: '202410', student: '1', course: 'B', status: 'REPROBADO' }
    ]

    const resumen = calcularResumen(malla as any, avance)
    expect(resumen.creditosAprobados).toBe(6)
    expect(resumen.asignaturasAprobadas).toBe(1)
    expect(resumen.asignaturasReprobadas).toBe(1)
    expect(resumen.estadoAcademico).toBe('Normal')
  })
})
