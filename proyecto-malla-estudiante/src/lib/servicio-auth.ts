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

export interface Sesion {
  usuario: Usuario
}

const CLAVE_SESION = 'sesion_usuario'

export function guardarSesion(usuario: Usuario): void {
  if (typeof window === 'undefined') return
  const sesion: Sesion = { usuario }
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
}

export function guardarCredencialesTemporales(email: string, contraseña: string): void {
  if (typeof window === 'undefined') return
  // Solo guardar si el email no contiene un RUT válido (para obtener RUT después)
  const emailPart = email.split('@')[0]
  if (!/^\d{7,8}-?[\dk]$/i.test(emailPart)) {
    localStorage.setItem('email', email)
    localStorage.setItem('password', contraseña) // Temporal para obtener RUT
  } else {
    localStorage.setItem('email', email)
    // No necesitamos guardar contraseña si el email ya tiene RUT
  }
}

export function leerSesion(): Sesion | null {
  if (typeof window === 'undefined') return null
  const texto = localStorage.getItem(CLAVE_SESION)
  if (!texto) return null
  try {
    return JSON.parse(texto) as Sesion
  } catch {
    return null
  }
}

export function cerrarSesion(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CLAVE_SESION)
}
