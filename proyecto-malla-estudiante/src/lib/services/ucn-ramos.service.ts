export interface RamoEstudiante {
  id?: string
  nombre?: string
  asignatura?: string
  materia?: string
  codigo: string
  sigla?: string
  creditos?: number
  sct?: number
  credits?: number
  semestre?: number
  nivel?: number
  period?: string
  estado?: string
  situacion?: string
  status?: string
  profesor?: string
  docente?: string
  teacher?: string
  seccion?: string
  grupo?: string
  section?: string
}

const UCN_RAMOS_URL = 'https://losvilos.ucn.cl/hawaii/api/estudiante'
const UCN_RAMOS_AUTH_HEADER = 'jf400fejof13f'

export async function obtenerRamosEstudiante(
  rut: string
): Promise<RamoEstudiante[]> {
  try {
    const url = `${UCN_RAMOS_URL}/${rut}/ramos`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-HAWAII-AUTH': UCN_RAMOS_AUTH_HEADER,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!Array.isArray(data)) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error obteniendo ramos del estudiante:', error)
    return []
  }
}

export function mapearEstado(
  estadoExterno: string | undefined
): 'cursando' | 'aprobado' | 'reprobado' | 'pendiente' {
  if (!estadoExterno) return 'pendiente'
  
  const estado = estadoExterno.toLowerCase()
  
  if (estado.includes('cursando') || estado.includes('inscrito') || estado.includes('actual')) {
    return 'cursando'
  }
  if (estado.includes('aprobado') || estado.includes('pasado')) {
    return 'aprobado'
  }
  if (estado.includes('reprobado') || estado.includes('reprobada') || estado.includes('fallido')) {
    return 'reprobado'
  }
  
  return 'pendiente'
}

