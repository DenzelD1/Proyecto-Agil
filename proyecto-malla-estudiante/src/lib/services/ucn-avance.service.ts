export interface RegistroAvance {
  nrc: string
  period: string
  student: string
  course: string
  status: string
}

const UCN_AVANCE_URL = 'https://puclaro.ucn.cl/eross/avance/avance.php'

export async function obtenerAvanceAcademico(
  rut: string,
  codCarrera: string
): Promise<RegistroAvance[]> {
  try {
    const url = `${UCN_AVANCE_URL}?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codCarrera)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No se pudo leer error')
      
      if (response.status === 404 || errorText.includes('no encontrado')) {
        return []
      }
      
      throw new Error(`Error HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    if (data.error) {
      return []
    }

    if (!Array.isArray(data)) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error obteniendo avance académico:', error)
    return []
  }
}

export function parsearPeriodo(period: string): {
  año: number
  semestre: number
  periodoMostrar: string
} {
  const año = parseInt(period.substring(0, 4))
  const semestre = parseInt(period.substring(4, 5))
  const periodoMostrar = `${año}-${semestre}`
  return { año, semestre, periodoMostrar }
}

