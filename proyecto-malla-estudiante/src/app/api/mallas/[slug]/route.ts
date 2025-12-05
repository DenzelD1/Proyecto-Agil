import { NextRequest, NextResponse } from 'next/server'
import { obtenerMallaCurricular } from '@/lib/services/ucn-malla.service'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json(
        { error: 'Parámetro slug requerido' },
        { status: 400 }
      )
    }

    const [codigoCarrera, catalogo] = slug.split('-')
    
    if (!codigoCarrera) {
      return NextResponse.json(
        { error: 'Formato de slug inválido. Debe ser CODIGO-CATALOGO' },
        { status: 400 }
      )
    }

    const malla = await obtenerMallaCurricular(codigoCarrera, catalogo || '202410')
    return NextResponse.json(malla)
  } catch (error) {
    console.error('Error obteniendo malla:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}