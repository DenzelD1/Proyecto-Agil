import { NextRequest, NextResponse } from 'next/server'
import { obtenerRutEstudiante } from '@/lib/services/ucn-auth.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    const rut = await obtenerRutEstudiante(email)
    
    if (rut) {
      return NextResponse.json({
        success: true,
        rut: rut,
        source: 'email'
      })
    }

    return NextResponse.json({
      error: 'No se pudo obtener RUT del estudiante',
      details: 'Verifique que el email tenga formato RUT válido o que haya iniciado sesión correctamente',
      suggestions: [
        'Use email con formato: 12345678-9@alumnos.ucn.cl',
        'Asegúrese de haber iniciado sesión correctamente',
        'Verifique que las credenciales sean válidas'
      ]
    }, { status: 404 })

  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}