import { obtenerRamosEstudiante, mapearEstado } from '../../../src/lib/services/ucn-ramos.service'

describe('ucn-ramos.service', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    global.fetch = jest.fn()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  test('obtenerRamosEstudiante retorna array cuando ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => [{ codigo: 'MAT101', nombre: 'Mat' }] })
    const res = await obtenerRamosEstudiante('123')
    expect(Array.isArray(res)).toBe(true)
  })

  test('obtenerRamosEstudiante maneja fetch no-ok devolviendo []', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })
    const res = await obtenerRamosEstudiante('123')
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(0)
  })

  test('obtenerRamosEstudiante maneja json no-array devolviendo []', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ foo: 'bar' }) })
    const res = await obtenerRamosEstudiante('123')
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(0)
  })

  test('mapearEstado convierte estados conocidos', () => {
    expect(mapearEstado('APROBADO')).toBe('aprobado')
    expect(mapearEstado('INSCRITO')).toBe('cursando')
    expect(mapearEstado('RENUNCIA')).toBe('pendiente')
    expect(mapearEstado('OTRO')).toBe('pendiente')
  })
})
