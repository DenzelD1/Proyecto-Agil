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

    test('obtenerAvanceAcademico maneja fetch no-ok devolviendo []', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error', text: async () => 'error' })
      const res = await obtenerAvanceAcademico('123', 'C')
      expect(Array.isArray(res)).toBe(true)
      expect(res.length).toBe(0)
    })

    test('obtenerAvanceAcademico maneja json con error devolviendo []', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ error: true, message: 'falla' }) })
      const res = await obtenerAvanceAcademico('123', 'C')
      expect(Array.isArray(res)).toBe(true)
      expect(res.length).toBe(0)
    })

    test('obtenerAvanceAcademico atrapa excepcion de fetch y devuelve []', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'))
      const res = await obtenerAvanceAcademico('123', 'C')
      expect(Array.isArray(res)).toBe(true)
      expect(res.length).toBe(0)
    })
})
