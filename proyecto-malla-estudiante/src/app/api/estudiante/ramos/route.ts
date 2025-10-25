import { NextRequest, NextResponse } from 'next/server'

// Tipo para el ramo transformado
interface RamoTransformado {
  id: string
  nombre: string
  codigo: string
  creditos: number
  semestre: number
  estado: 'cursando' | 'aprobado' | 'reprobado' | 'pendiente'
  profesor: string
  seccion: string
}

export async function GET(request: NextRequest) {
  try {
    // Obtener el email del query parameter
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    let rut = ''

    // Si tenemos contraseña, obtenemos el RUT desde el login
    if (password) {
      console.log('🔍 Obteniendo RUT desde login para:', email)
      
      const urlLogin = `https://puclaro.ucn.cl/eross/avance/login.php?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      
      const respuestaLogin = await fetch(urlLogin, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (respuestaLogin.ok) {
        const datosLogin = await respuestaLogin.json()
        if (datosLogin.rut && !datosLogin.error) {
          rut = datosLogin.rut
          console.log('✅ RUT obtenido desde login:', rut)
        }
      }
    }

    // Si no pudimos obtener el RUT desde login, intentamos extraerlo del email
    if (!rut) {
      // Extraer del email - buscar patrones de RUT
      const emailPart = email.split('@')[0]
      
      // Verificar si parece un RUT (contiene números y posiblemente guión)
      if (/^\d{7,8}-?[\dk]$/i.test(emailPart)) {
        rut = emailPart
        console.log('✅ RUT extraído del email:', rut)
      } else {
        console.log('❌ Email no contiene RUT válido:', emailPart)
        return NextResponse.json({ 
          error: 'No se pudo obtener RUT válido. Use email con formato RUT (ej: 12345678-9@alumnos.ucn.cl) o proporcione contraseña',
          details: `Email analizado: ${emailPart}`,
          isRealApiError: true,
          attemptedEmail: email
        }, { status: 400 })
      }
    }
    
    console.log('🔍 Debug API - Email recibido:', email)
    console.log('🔍 Debug API - RUT a usar:', rut)
    
    // Hacer petición a la API de UCN para obtener los ramos del estudiante
    const url = `https://losvilos.ucn.cl/hawaii/api/estudiante/${rut}/ramos`
    console.log('🔍 Debug API - URL a consultar:', url)

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-HAWAII-AUTH': 'jf400fejof13f',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    console.log('🔍 Debug API - Respuesta status:', resp.status)
    console.log('🔍 Debug API - Respuesta headers:', Object.fromEntries(resp.headers.entries()))

    if (!resp.ok) {
      const texto = await resp.text().catch(() => '')
      console.error('Error obteniendo ramos del estudiante', { 
        url, 
        email, 
        rut, 
        status: resp.status, 
        body: texto 
      })
      
      // Retornar el error real en lugar de datos de ejemplo
      return NextResponse.json(
        { 
          error: `Error ${resp.status}: No se pudieron obtener los ramos del estudiante`,
          details: texto,
          isRealApiError: true,
          attemptedUrl: url,
          studentRut: rut
        }, 
        { status: resp.status }
      )
    }

    const data = await resp.json()
    
    // Transformar los datos de la API externa al formato esperado por nuestro frontend
    const ramosTransformados: RamoTransformado[] = data.map((ramo: any, index: number) => {
      // Obtener nombre y código
      const codigo = ramo.codigo || ramo.sigla || ramo.cod || `RAMO-${index + 1}`
      const nombre = ramo.nombre || ramo.asignatura || ramo.materia || ramo.subject || codigo
      
      return {
        id: ramo.id?.toString() || `${codigo}-${index}`,
        nombre: nombre,
        codigo: codigo,
        creditos: parseInt(ramo.creditos || ramo.sct || ramo.credits || '0') || 0,
        semestre: parseInt(ramo.semestre || ramo.nivel || ramo.period || '1') || 1,
        estado: mapearEstado(ramo.estado || ramo.situacion || ramo.status),
        profesor: ramo.profesor || ramo.docente || ramo.teacher || 'No asignado',
        seccion: ramo.seccion || ramo.grupo || ramo.section || 'A'
      }
    })

    // Filtrar ramos que no tengan información mínima válida
    const ramosValidos = ramosTransformados.filter((ramo: RamoTransformado) => 
      ramo.codigo && ramo.codigo !== '' && ramo.nombre && ramo.nombre !== ''
    )

    console.log(`Ramos procesados: ${ramosTransformados.length}, Ramos válidos: ${ramosValidos.length}`)

    return NextResponse.json(ramosValidos)
    
  } catch (error) {
    console.error('Error interno en API de ramos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Función auxiliar para mapear estados de la API externa a nuestros estados
function mapearEstado(estadoExterno: string): 'cursando' | 'aprobado' | 'reprobado' | 'pendiente' {
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