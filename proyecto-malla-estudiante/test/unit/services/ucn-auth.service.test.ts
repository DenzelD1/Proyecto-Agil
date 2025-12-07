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
})
