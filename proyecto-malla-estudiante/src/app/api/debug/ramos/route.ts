import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // RUT de prueba (puedes cambiarlo por uno real para testing)
    const rutPrueba = '12345678-9'
    const url = `https://losvilos.ucn.cl/hawaii/api/estudiante/${rutPrueba}/ramos`
    
    console.log('🔍 [Debug] Consultando API para analizar estructura de datos:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-HAWAII-AUTH': 'jf400fejof13f',
        'Accept': 'application/json',
      },
    })

    console.log('📡 [Debug] Status:', response.status, response.statusText)

    if (response.ok) {
      const data = await response.json()
      
      console.log('📊 [Debug] Estructura completa de la respuesta:')
      console.log('- Tipo:', typeof data)
      console.log('- Es Array:', Array.isArray(data))
      console.log('- Cantidad de elementos:', Array.isArray(data) ? data.length : 'N/A')
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('🔍 [Debug] Análisis del primer elemento:')
        const primerRamo = data[0]
        console.log('- Campos disponibles:', Object.keys(primerRamo))
        console.log('- Valores de campos relacionados con nombre:')
        console.log('  * nombre:', primerRamo.nombre)
        console.log('  * asignatura:', primerRamo.asignatura)
        console.log('  * materia:', primerRamo.materia)
        console.log('  * titulo:', primerRamo.titulo)
        console.log('  * descripcion:', primerRamo.descripcion)
        console.log('  * codigo:', primerRamo.codigo)
        console.log('  * sigla:', primerRamo.sigla)
        
        return NextResponse.json({
          success: true,
          message: 'Análisis de estructura de datos de la API',
          data: {
            totalRamos: data.length,
            primerRamo: primerRamo,
            camposDisponibles: Object.keys(primerRamo),
            camposNombre: {
              nombre: primerRamo.nombre,
              asignatura: primerRamo.asignatura,
              materia: primerRamo.materia,
              titulo: primerRamo.titulo,
              descripcion: primerRamo.descripcion,
              codigo: primerRamo.codigo,
              sigla: primerRamo.sigla
            }
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'No hay datos disponibles o datos vacíos',
          data: data
        })
      }
    } else {
      const errorText = await response.text().catch(() => 'No se pudo leer error')
      return NextResponse.json({
        success: false,
        message: `Error HTTP ${response.status}: ${response.statusText}`,
        error: errorText
      }, { status: response.status })
    }
    
  } catch (error) {
    console.error('❌ [Debug] Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}