import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, contraseña } = await request.json()

    if (!email || !contraseña) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const urlUCN = `https://puclaro.ucn.cl/eross/avance/login.php?email=${encodeURIComponent(email)}&password=${encodeURIComponent(contraseña)}`

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

    return NextResponse.json({
      success: true,
      usuario: {
        rut: datos.rut,
        carreras: datos.carreras
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
