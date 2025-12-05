import { NextRequest, NextResponse } from 'next/server'
import { obtenerRutEstudiante } from '@/lib/services/ucn-auth.service'
import { obtenerRamosEstudiante, mapearEstado } from '@/lib/services/ucn-ramos.service'

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
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    const rut = await obtenerRutEstudiante(email, password || undefined)
    
    if (!rut) {
      return NextResponse.json({ 
        error: 'No se pudo obtener RUT válido. Use email con formato RUT (ej: 12345678-9@alumnos.ucn.cl) o proporcione contraseña',
        details: `Email analizado: ${email.split('@')[0]}`,
        isRealApiError: true,
        attemptedEmail: email
      }, { status: 400 })
    }
    
    const ramos = await obtenerRamosEstudiante(rut)
    
    // Transformar los datos de la API externa al formato esperado por nuestro frontend
    const ramosTransformados: RamoTransformado[] = ramos.map((ramo, index) => {
      const codigo = ramo.codigo || ramo.sigla || `RAMO-${index + 1}`
      const nombre = ramo.nombre || ramo.asignatura || ramo.materia || codigo
      
      return {
        id: ramo.id?.toString() || `${codigo}-${index}`,
        nombre: nombre,
        codigo: codigo,
        creditos: parseInt(String(ramo.creditos || ramo.sct || ramo.credits || '0')) || 0,
        semestre: parseInt(String(ramo.semestre || ramo.nivel || ramo.period || '1')) || 1,
        estado: mapearEstado(ramo.estado || ramo.situacion || ramo.status),
        profesor: ramo.profesor || ramo.docente || ramo.teacher || 'No asignado',
        seccion: ramo.seccion || ramo.grupo || ramo.section || 'A'
      }
    })

    // Filtrar ramos que no tengan información mínima válida
    const ramosValidos = ramosTransformados.filter((ramo) => 
      ramo.codigo && ramo.codigo !== '' && ramo.nombre && ramo.nombre !== ''
    )

    return NextResponse.json(ramosValidos)
    
  } catch (error) {
    console.error('Error interno en API de ramos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}