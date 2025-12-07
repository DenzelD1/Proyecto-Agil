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

  test('GET cuando prisma lanza error devuelve 500', async () => {
    (prisma.proyeccionMalla.findMany as jest.Mock).mockRejectedValueOnce(new Error('boom'))
    const req: any = { url: 'http://localhost/api/proyecciones?rut=1&codigoCarrera=C' }
    const res: any = await GET(req)
    expect(res.status).toBe(500)
  })

  test('POST valida campos y retorna 400 si faltan', async () => {
    const req: any = { json: async () => ({ rut: '1' }), url: 'http://localhost/api/proyecciones' }
    const res: any = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  test('POST maneja error P2002 (unique) retornando 409', async () => {
    (prisma.proyeccionMalla.findUnique as jest.Mock).mockResolvedValueOnce(null)
    ;(prisma.proyeccionMalla.create as jest.Mock).mockRejectedValueOnce({ code: 'P2002' })
    const req: any = { json: async () => ({ rut: '1', codigoCarrera: 'C', nombre: 'X', semestres: [] }), url: 'http://localhost/api/proyecciones' }
    const res: any = await POST(req)
    expect(res.status).toBe(409)
  })

  test('POST maneja error inesperado devolviendo 500', async () => {
    (prisma.proyeccionMalla.findUnique as jest.Mock).mockResolvedValueOnce(null)
    ;(prisma.proyeccionMalla.create as jest.Mock).mockRejectedValueOnce(new Error('fatal'))
    const req: any = { json: async () => ({ rut: '1', codigoCarrera: 'C', nombre: 'X', semestres: [] }), url: 'http://localhost/api/proyecciones' }
    const res: any = await POST(req)
    expect(res.status).toBe(500)
  })
})
