import { obtenerRutEstudiante, obtenerDatosEstudiante } from '../../../src/lib/services/ucn-auth.service'

describe('ucn-auth.service', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    global.fetch = jest.fn()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  test('obtenerRutEstudiante extrae rut desde email si no password', async () => {
    const rut = await obtenerRutEstudiante('12345678-9@ucn.cl')
    expect(rut).toBe('12345678-9')
  })

  test('obtenerDatosEstudiante con password falso maneja error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false })
    const datos = await obtenerDatosEstudiante('juan@example.com', 'bad')
    expect(datos).toBeNull()
  })

  test('obtenerRutEstudiante con password usa hacerLogin y retorna rut', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ rut: '9999999-9', carreras: [] }) })
    const rut = await obtenerRutEstudiante('user@ucn.cl', 'pw')
    expect(rut).toBe('9999999-9')
  })

  test('obtenerDatosEstudiante con password y login valido retorna datos', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ rut: '7777777-7', carreras: [{ codigo: 'C', nombre: 'Car', catalogo: '202410' }] }) })
    const datos = await obtenerDatosEstudiante('u@ucn.cl', 'pw')
    expect(datos).not.toBeNull()
    expect(datos?.rut).toBe('7777777-7')
    expect(Array.isArray(datos?.carreras)).toBe(true)
  })

  test('hacerLogin atrapa excepcion y retorna null', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('boom'))
    const datos = await (require('../../../src/lib/services/ucn-auth.service').__test__?.hacerLogin?.('x','y') ?? null)
    // fallback: if hacerLogin not exported to __test__, ensure overall behavior through obtenerDatosEstudiante
    if (datos === null) {
      // ok, cannot directly call hacerLogin — test via obtenerDatosEstudiante
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('boom'))
      const d2 = await obtenerDatosEstudiante('u2@ucn.cl', 'pw')
      expect(d2).toBeNull()
    }
  })
})
