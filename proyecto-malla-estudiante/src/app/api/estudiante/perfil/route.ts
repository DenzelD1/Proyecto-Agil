import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    console.log('🔍 [Perfil] Obteniendo perfil del estudiante para:', email)

    // Intentar obtener datos del estudiante desde localStorage guardado en el login
    // Nota: En un entorno real, esto debería venir de una base de datos o sesión del servidor
    
    // Estrategia 1: Obtener datos desde la sesión guardada
    const rutDesdeSession = await obtenerRutDesdeSession(email)
    if (rutDesdeSession) {
      return NextResponse.json({
        success: true,
        rut: rutDesdeSession,
        source: 'session'
      })
    }

    // Estrategia 2: Validar formato RUT en email
    const emailPart = email.split('@')[0]
    if (/^\d{7,8}-?[\dk]$/i.test(emailPart)) {
      console.log('✅ [Perfil] RUT extraído del email:', emailPart)
      return NextResponse.json({
        success: true,
        rut: emailPart,
        source: 'email'
      })
    }

    // Estrategia 3: Obtener desde el login si tenemos datos de sesión
    const datosDesdeLogin = await obtenerDatosDesdeLoginStorage(email)
    if (datosDesdeLogin) {
      return NextResponse.json({
        success: true,
        rut: datosDesdeLogin.rut,
        nombre: datosDesdeLogin.nombre,
        carreras: datosDesdeLogin.carreras,
        source: 'login_storage'
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
    console.error('❌ [Perfil] Error:', error)
    
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// Funciones auxiliares
async function obtenerRutDesdeSession(email: string): Promise<string | null> {
  try {
    // En un entorno real, aquí consultarías una base de datos o Redis
    // Por ahora, simulamos verificando si hay datos en memoria
    console.log('💾 [Perfil] Buscando RUT en sesión para:', email)
    
    // TODO: Implementar consulta a base de datos o sesión real
    // Por ahora retornamos null para que use otras estrategias
    return null
  } catch (error) {
    console.error('Error obteniendo RUT desde sesión:', error)
    return null
  }
}

async function obtenerDatosDesdeLoginStorage(email: string): Promise<any | null> {
  try {
    // Simular obtención de datos desde storage/cache del login
    // En una implementación real, esto vendría de una base de datos
    console.log('🔍 [Perfil] Intentando obtener datos desde login storage')
    
    // TODO: Implementar cache/storage real
    return null
  } catch (error) {
    console.error('Error obteniendo datos desde login storage:', error)
    return null
  }
}