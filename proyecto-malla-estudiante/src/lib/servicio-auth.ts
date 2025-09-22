export interface Usuario {
  rut: string
  carreras: Array<{
    codigo: string
    nombre: string
    catalogo: string
  }>
}

export interface RespuestaLogin {
  success: boolean
  usuario?: Usuario
  error?: string
}

export async function iniciarSesion(email: string, contraseña: string): Promise<RespuestaLogin> {
  try {
    const respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        contraseña
      })
    })

    const datos = await respuesta.json()

    if (!respuesta.ok) {
      return {
        success: false,
        error: datos.error || 'Error al iniciar sesión'
      }
    }

    return {
      success: true,
      usuario: datos.usuario
    }

  } catch (error) {
    console.error('Error en iniciarSesion:', error)
    return {
      success: false,
      error: 'Error de conexión. Intenta nuevamente.'
    }
  }
}
