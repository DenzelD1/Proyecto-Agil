export interface DatosEstudiante {
  rut: string
  nombre?: string
  carreras: Array<{
    codigo: string
    nombre: string
    catalogo: string
  }>
}

export interface RespuestaLogin {
  rut: string
  carreras: Array<{
    codigo: string
    nombre: string
    catalogo: string
  }>
  error?: string
}

const UCN_LOGIN_URL = 'https://puclaro.ucn.cl/eross/avance/login.php'

export async function obtenerRutEstudiante(
  email: string,
  password?: string
): Promise<string | null> {
  if (password) {
    const datosLogin = await hacerLogin(email, password)
    if (datosLogin?.rut && !datosLogin.error) {
      return datosLogin.rut
    }
  }

  const emailPart = email.split('@')[0]
  if (/^\d{7,8}-?[\dk]$/i.test(emailPart)) {
    return emailPart
  }

  return null
}

export async function obtenerDatosEstudiante(
  email: string,
  password?: string
): Promise<DatosEstudiante | null> {
  if (!password) {
    const emailPart = email.split('@')[0]
    if (/^\d{7,8}-?[\dk]$/i.test(emailPart)) {
      return {
        rut: emailPart,
        nombre: 'Estudiante UCN',
        carreras: [{ nombre: 'Carrera UCN', codigo: 'UCN', catalogo: '202410' }]
      }
    }
    return null
  }

  const datosLogin = await hacerLogin(email, password)
  if (!datosLogin || datosLogin.error) {
    return null
  }

  return {
    rut: datosLogin.rut || 'N/A',
    nombre: 'Estudiante UCN',
    carreras: datosLogin.carreras || []
  }
}

async function hacerLogin(
  email: string,
  password: string
): Promise<RespuestaLogin | null> {
  try {
    const url = `${UCN_LOGIN_URL}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error en login UCN:', error)
    return null
  }
}

