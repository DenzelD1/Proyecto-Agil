import { obtenerAvanceAcademico, parsearPeriodo } from '../../../src/lib/services/ucn-avance.service'

describe('ucn-avance.service', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    global.fetch = jest.fn()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  test('obtenerAvanceAcademico retorna array cuando ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => [{ course: 'A' }] })
    const res = await obtenerAvanceAcademico('123', 'C')
    expect(Array.isArray(res)).toBe(true)
  })

  test('parsearPeriodo descompone correctamente', () => {
    const res = parsearPeriodo('202520')
    expect(res.año).toBe(2025)
    expect(res.semestre).toBe(2)
    expect(res.periodoMostrar).toBe('2025-2')
  })
})
