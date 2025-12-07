// Mock prisma module before importing route handlers
jest.mock('../../../src/lib/prisma', () => ({
  prisma: {
    proyeccionMalla: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}))

import { prisma } from '../../../src/lib/prisma'
import { GET, POST } from '../../../src/app/api/proyecciones/route'

describe('API /api/proyecciones', () => {
  beforeEach(() => {
    // reset mocks
    jest.clearAllMocks()
  })

  test('GET sin params devuelve 400', async () => {
    const req: any = { url: 'http://localhost/api/proyecciones' }
    const res: any = await GET(req)
    expect(res.status).toBe(400)
  })

  test('GET devuelve lista cuando hay proyecciones', async () => {
    ;(prisma.proyeccionMalla.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 1, rut: '1', codigoCarrera: 'C', nombre: 'P', semestres: [], createdAt: new Date(), updatedAt: new Date() }
    ])

    const req: any = { url: 'http://localhost/api/proyecciones?rut=1&codigoCarrera=C' }
    const res: any = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  test('POST crea nueva proyeccion', async () => {
    (prisma.proyeccionMalla.findUnique as jest.Mock).mockResolvedValueOnce(null)
    ;(prisma.proyeccionMalla.create as jest.Mock).mockResolvedValueOnce({ id: 2, rut: '1', codigoCarrera: 'C', nombre: 'X', semestres: [], createdAt: new Date(), updatedAt: new Date() })

    const req: any = { json: async () => ({ rut: '1', codigoCarrera: 'C', nombre: 'X', semestres: [] }), url: 'http://localhost/api/proyecciones' }
    const res: any = await POST(req)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.proyeccion.id).toBe(2)
  })

  test('POST actualiza proyeccion cuando existe', async () => {
    (prisma.proyeccionMalla.findUnique as jest.Mock).mockResolvedValueOnce({ id: 3, rut: '1', codigoCarrera: 'C', nombre: 'Y' })
    ;(prisma.proyeccionMalla.update as jest.Mock).mockResolvedValueOnce({ id: 3, rut: '1', codigoCarrera: 'C', nombre: 'Y', semestres: [], createdAt: new Date(), updatedAt: new Date() })

    const req: any = { json: async () => ({ rut: '1', codigoCarrera: 'C', nombre: 'Y', semestres: [] }), url: 'http://localhost/api/proyecciones' }
    const res: any = await POST(req)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.proyeccion.id).toBe(3)
  })
})
