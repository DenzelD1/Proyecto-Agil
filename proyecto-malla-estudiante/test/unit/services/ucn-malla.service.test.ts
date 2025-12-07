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

  test('obtenerMallaCurricular maneja 404 devolviendo array vacio', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })
    const res = await obtenerMallaCurricular('NOPE', '202410')
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(0)
  })

  test('obtenerMallaCurricular maneja respuesta no-array devolviendo []', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ foo: 'bar' }) })
    const res = await obtenerMallaCurricular('X', '202410')
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(0)
  })

  test('obtenerMallaCurricular atrapa excepcion de fetch y devuelve []', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'))
    const res = await obtenerMallaCurricular('X', '202410')
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(0)
  })
})
