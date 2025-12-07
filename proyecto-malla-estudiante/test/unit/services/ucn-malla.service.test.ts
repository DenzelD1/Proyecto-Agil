import { obtenerMallaCurricular, obtenerMallasMultiples } from '../../../src/lib/services/ucn-malla.service'

describe('ucn-malla.service', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    global.fetch = jest.fn()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  test('obtenerMallaCurricular retorna array cuando fetch ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => [{ codigo: 'X', asignatura: 'X', creditos: 6, nivel: 1 }] })
    const res = await obtenerMallaCurricular('ABC', '202410')
    expect(Array.isArray(res)).toBe(true)
    expect(res[0].codigo).toBe('X')
  })

  test('obtenerMallasMultiples concatena resultados', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] })
    const res = await obtenerMallasMultiples([{ codigo: 'A', catalogo: '202410' }, { codigo: 'B', catalogo: '202410' }])
    expect(Array.isArray(res)).toBe(true)
  })
})
