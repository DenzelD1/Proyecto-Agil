import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const proyeccionId = parseInt(id)

    if (isNaN(proyeccionId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const proyeccion = await prisma.proyeccionMalla.findUnique({
      where: { id: proyeccionId }
    })

    if (!proyeccion) {
      return NextResponse.json(
        { error: 'Proyección no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: proyeccion.id,
      rut: proyeccion.rut,
      codigoCarrera: proyeccion.codigoCarrera,
      nombre: proyeccion.nombre,
      semestres: proyeccion.semestres,
      createdAt: proyeccion.createdAt,
      updatedAt: proyeccion.updatedAt
    })
  } catch (error) {
    console.error('Error obteniendo proyección:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const proyeccionId = parseInt(id)
    const body = await request.json()
    const { nombre, semestres } = body

    if (isNaN(proyeccionId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const datosActualizacion: any = {
      updatedAt: new Date()
    }

    if (nombre !== undefined) {
      datosActualizacion.nombre = nombre
    }

    if (semestres !== undefined) {
      datosActualizacion.semestres = semestres
    }

    const proyeccion = await prisma.proyeccionMalla.update({
      where: { id: proyeccionId },
      data: datosActualizacion
    })

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
    console.error('Error actualizando proyección:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Proyección no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const proyeccionId = parseInt(id)

    if (isNaN(proyeccionId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    await prisma.proyeccionMalla.delete({
      where: { id: proyeccionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Proyección eliminada correctamente'
    })
  } catch (error: any) {
    console.error('Error eliminando proyección:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Proyección no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

