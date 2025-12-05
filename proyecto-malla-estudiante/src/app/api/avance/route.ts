import { NextRequest, NextResponse } from 'next/server'
import { obtenerAvanceAcademico } from '@/lib/services/ucn-avance.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rut = searchParams.get('rut')
    const codcarrera = searchParams.get('codcarrera')

    if (!rut || !codcarrera) {
      return NextResponse.json(
        { error: 'Parámetros rut y codcarrera son requeridos' },
        { status: 400 }
      )
    }

    const avance = await obtenerAvanceAcademico(rut, codcarrera)
    return NextResponse.json(avance)
  } catch (error) {
    console.error('Error obteniendo avance:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
