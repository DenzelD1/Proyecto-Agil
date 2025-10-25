import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    console.log('🔍 Obteniendo datos del estudiante para:', email)

    const urlUCN = `https://puclaro.ucn.cl/eross/avance/login.php?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`

    const respuesta = await fetch(urlUCN, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error en la API externa: ${respuesta.status}`)
    }

    const datos = await respuesta.json()

    if (datos.error) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    console.log('✅ Datos del estudiante obtenidos:', { rut: datos.rut, carreras: datos.carreras })

    return NextResponse.json({
      success: true,
      rut: datos.rut,
      carreras: datos.carreras,
      email: email
    })

  } catch (error) {
    console.error('❌ Error obteniendo datos del estudiante:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}