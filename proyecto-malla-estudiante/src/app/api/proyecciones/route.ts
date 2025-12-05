import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SemestreProyectado } from '@/lib/malla-proyectada-utils'

export interface ProyeccionGuardada {
  id: number
  rut: string
  codigoCarrera: string
  nombre: string
  semestres: SemestreProyectado[]
  createdAt: Date
  updatedAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rut = searchParams.get('rut')
    const codigoCarrera = searchParams.get('codigoCarrera')

    if (!rut || !codigoCarrera) {
      return NextResponse.json(
        { error: 'Parámetros rut y codigoCarrera son requeridos' },
        { status: 400 }
      )
    }

    const proyecciones = await prisma.proyeccionMalla.findMany({
      where: {
        rut,
        codigoCarrera
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const proyeccionesFormateadas: ProyeccionGuardada[] = proyecciones.map(p => ({
      id: p.id,
      rut: p.rut,
      codigoCarrera: p.codigoCarrera,
      nombre: p.nombre,
      semestres: p.semestres as unknown as SemestreProyectado[],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }))

    return NextResponse.json(proyeccionesFormateadas)
  } catch (error) {
    console.error('Error obteniendo proyecciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rut, codigoCarrera, nombre, semestres } = body

    if (!rut || !codigoCarrera || !nombre || !semestres) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos: rut, codigoCarrera, nombre, semestres' },
        { status: 400 }
      )
    }

    const existente = await prisma.proyeccionMalla.findUnique({
      where: {
        rut_codigoCarrera_nombre: {
          rut,
          codigoCarrera,
          nombre
        }
      }
    })

    let proyeccion
    if (existente) {
      proyeccion = await prisma.proyeccionMalla.update({
        where: {
          id: existente.id
        },
        data: {
          semestres: semestres as any,
          updatedAt: new Date()
        }
      })
    } else {
      proyeccion = await prisma.proyeccionMalla.create({
        data: {
          rut,
          codigoCarrera,
          nombre,
          semestres: semestres as any
        }
      })
    }

    return NextResponse.json({
      success: true,
      proyeccion: {
        id: proyeccion.id,
        rut: proyeccion.rut,
        codigoCarrera: proyeccion.codigoCarrera,
        nombre: proyeccion.nombre,
        semestres: proyeccion.semestres,
        createdAt: proyeccion.createdAt,
        updatedAt: proyeccion.updatedAt
      }
    })
  } catch (error: any) {
    console.error('Error guardando proyección:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una proyección con ese nombre' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

