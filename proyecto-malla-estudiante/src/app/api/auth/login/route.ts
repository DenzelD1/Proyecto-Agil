import { NextRequest, NextResponse } from 'next/server'
import { obtenerDatosEstudiante } from '@/lib/services/ucn-auth.service'

export async function POST(request: NextRequest) {
  try {
    const { email, contraseña } = await request.json()

    if (!email || !contraseña) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const datosEstudiante = await obtenerDatosEstudiante(email, contraseña)

    if (!datosEstudiante) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      usuario: {
        rut: datosEstudiante.rut,
        carreras: datosEstudiante.carreras
      }
    })

  } catch (error) {
    console.error('Error en el login:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
