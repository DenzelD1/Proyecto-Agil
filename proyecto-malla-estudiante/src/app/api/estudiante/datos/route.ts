import { NextRequest, NextResponse } from 'next/server'
import { obtenerDatosEstudiante } from '@/lib/services/ucn-auth.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      )
    }

    const datosEstudiante = await obtenerDatosEstudiante(email, password)

    if (!datosEstudiante) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      rut: datosEstudiante.rut,
      carreras: datosEstudiante.carreras,
      email: email
    })

  } catch (error) {
    console.error('Error obteniendo datos del estudiante:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}