export interface AsignaturaMalla {
  codigo: string
  asignatura: string
  creditos: number
  nivel: number
  prereq?: string
}

const UCN_MALLA_URL = 'https://losvilos.ucn.cl/hawaii/api/mallas'
const UCN_MALLA_AUTH_HEADER = 'jf400fejof13f'

export async function obtenerMallaCurricular(
  codigoCarrera: string,
  catalogo: string = '202410'
): Promise<AsignaturaMalla[]> {
  try {
    const url = `${UCN_MALLA_URL}?${codigoCarrera}-${catalogo}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-HAWAII-AUTH': UCN_MALLA_AUTH_HEADER,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!Array.isArray(data)) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error obteniendo malla curricular:', error)
    return []
  }
}

export async function obtenerMallasMultiples(
  carreras: Array<{ codigo: string; catalogo: string }>
): Promise<AsignaturaMalla[]> {
  const mallasPromesas = carreras.map(carrera =>
    obtenerMallaCurricular(carrera.codigo, carrera.catalogo)
  )

  const mallas = await Promise.all(mallasPromesas)
  return mallas.flat()
}

