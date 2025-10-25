import { NextRequest, NextResponse } from 'next/server'

// Interfaces para la malla temporal
interface RamoMalla {
  id: string
  nombre: string
  codigo: string
  creditos: number
  semestre: number
  estado: 'cursando' | 'aprobado' | 'reprobado' | 'pendiente' | 'disponible' | 'bloqueado'
  prerrequisitos: string[]
  profesor?: string
  seccion?: string
  nota?: number
  periodo?: string
}

interface MallaTemporal {
  estudiante: {
    rut: string
    nombre: string
    carrera: string
  }
  semestres: {
    numero: number
    ramos: RamoMalla[]
    creditosTotal: number
    creditosAprobados: number
  }[]
  progreso: {
    creditosTotal: number
    creditosAprobados: number
    porcentajeAvance: number
    semestreActual: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    const rutParam = searchParams.get('rut') // RUT desde localStorage
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    console.log('🔍 [Malla Temporal] Procesando solicitud para:', email)
    console.log('🔍 [Malla Temporal] RUT desde parámetro:', rutParam)

    let rut = rutParam // Usar RUT del parámetro si está disponible

    // Si no tenemos RUT desde parámetro, intentar obtenerlo
    if (!rut) {
      console.log('🔍 [Malla Temporal] No hay RUT en parámetros, intentando obtenerlo...')
      rut = await obtenerRutEstudiante(email, password || undefined)
    }
    
    if (!rut) {
      return NextResponse.json({ 
        error: 'No se pudo obtener RUT válido',
        details: 'Estrategias intentadas: localStorage, login con contraseña, extracción desde email',
        suggestions: [
          'Verifique que haya iniciado sesión correctamente',
          'Use email con formato RUT: 12345678-9@alumnos.ucn.cl',
          'Proporcione contraseña válida'
        ]
      }, { status: 400 })
    }

    console.log('✅ [Malla Temporal] RUT final a usar:', rut)

    // 2. Obtener datos del estudiante y su carrera
    const datosEstudiante = await obtenerDatosEstudiante(email, password || undefined)
    
    // 3. Obtener ramos cursados/aprobados
    const ramosCursados = await obtenerRamosCursados(rut)
    
    // 4. Obtener malla curricular de la carrera
    const mallaCurricular = await obtenerMallaCurricular(datosEstudiante?.carreras?.[0]?.codigo)
    
    // 5. Construir malla temporal (combinar datos)
    const mallatemporal = construirMallaTemporal(
      datosEstudiante,
      ramosCursados,
      mallaCurricular
    )

    console.log('📊 [Malla Temporal] Malla construida exitosamente')
    
    return NextResponse.json(mallatemporal)

  } catch (error) {
    console.error('❌ [Malla Temporal] Error:', error)
    
    return NextResponse.json({
      error: 'Error procesando malla temporal',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// Funciones auxiliares
async function obtenerRutEstudiante(email: string, password?: string): Promise<string | null> {
  try {
    console.log('🔍 [RUT] Iniciando obtención de RUT para:', email)

    // Estrategia 1: Si tenemos contraseña, obtener RUT desde login
    if (password) {
      console.log('🔑 [RUT] Intentando obtener RUT desde login con contraseña')
      const urlLogin = `https://puclaro.ucn.cl/eross/avance/login.php?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      
      const response = await fetch(urlLogin, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.rut && !data.error) {
          console.log('✅ [RUT] RUT obtenido desde login:', data.rut)
          return data.rut
        }
      }
      console.log('⚠️ [RUT] No se pudo obtener RUT desde login')
    }

    // Estrategia 2: Extraer del email si tiene formato RUT válido
    console.log('📧 [RUT] Intentando extraer RUT del email')
    const emailPart = email.split('@')[0]
    if (/^\d{7,8}-?[\dk]$/i.test(emailPart)) {
      console.log('✅ [RUT] RUT válido extraído del email:', emailPart)
      return emailPart
    }

    // Estrategia 3: Buscar en localStorage (desde el frontend)
    // Nota: Esta estrategia se maneja en el frontend, aquí solo logueamos
    console.log('💾 [RUT] Email no contiene RUT válido, necesitará obtenerlo desde localStorage del frontend')
    console.log('📧 [RUT] Email parte analizada:', emailPart)
    console.log('❌ [RUT] No se pudo obtener RUT por ninguna estrategia del backend')
    
    return null
  } catch (error) {
    console.error('❌ [RUT] Error obteniendo RUT:', error)
    return null
  }
}

async function obtenerDatosEstudiante(email: string, password?: string) {
  try {
    console.log('👤 [Datos] Obteniendo datos del estudiante...')
    
    if (!password) {
      console.log('⚠️ [Datos] No hay contraseña, intentando extraer datos básicos del email')
      // Si no hay contraseña, al menos intentar obtener info básica
      const emailPart = email.split('@')[0]
      if (/^\d{7,8}-?[\dk]$/i.test(emailPart)) {
        return {
          rut: emailPart,
          nombre: 'Estudiante UCN', // Nombre genérico
          carreras: [{ nombre: 'Carrera UCN', codigo: 'UCN' }]
        }
      }
      return null
    }

    const urlLogin = `https://puclaro.ucn.cl/eross/avance/login.php?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    
    console.log('🌐 [Datos] Consultando:', urlLogin)
    
    const response = await fetch(urlLogin, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()
      console.log('📊 [Datos] Respuesta del login:', data)
      
      if (!data.error) {
        const datosEstudiante = {
          rut: data.rut || 'N/A',
          nombre: data.nombre || data.name || data.usuario || 'Estudiante UCN',
          carreras: data.carreras || [{ 
            nombre: data.carrera || 'Carrera UCN', 
            codigo: data.codigoCarrera || 'UCN' 
          }]
        }
        
        console.log('✅ [Datos] Datos del estudiante procesados:', datosEstudiante)
        return datosEstudiante
      } else {
        console.log('❌ [Datos] Error en respuesta:', data.error)
      }
    } else {
      console.log('❌ [Datos] Error HTTP:', response.status, response.statusText)
    }
    
    return null
  } catch (error) {
    console.error('❌ [Datos] Error obteniendo datos estudiante:', error)
    return null
  }
}

async function obtenerRamosCursados(rut: string): Promise<RamoMalla[]> {
  try {
    const url = `https://losvilos.ucn.cl/hawaii/api/estudiante/${rut}/ramos`
    console.log('📚 [Ramos] Consultando ramos en:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-HAWAII-AUTH': 'jf400fejof13f',
        'Accept': 'application/json',
      },
    })

    console.log('📡 [Ramos] Status:', response.status, response.statusText)

    if (response.ok) {
      const data = await response.json()
      console.log('📊 [Ramos] Datos recibidos:', data)
      console.log('📈 [Ramos] Cantidad de ramos:', Array.isArray(data) ? data.length : 'No es array')
      
      // Analizar estructura de los primeros ramos para entender qué campos están disponibles
      if (Array.isArray(data) && data.length > 0) {
        console.log('🔍 [Ramos] Analizando estructura del primer ramo:')
        console.log('  📝 Campos disponibles:', Object.keys(data[0]))
        console.log('  📝 Primer ramo completo:', data[0])
        
        // Verificar específicamente campos de nombre
        console.log('  📝 Campos de nombre disponibles:')
        console.log('    - nombre:', data[0].nombre)
        console.log('    - asignatura:', data[0].asignatura)
        console.log('    - materia:', data[0].materia)
        console.log('    - codigo:', data[0].codigo)
      }
      
      if (!Array.isArray(data)) {
        console.log('⚠️ [Ramos] Los datos no son un array:', typeof data)
        return []
      }
      
      // Transformar datos de la API a formato RamoMalla
      const ramosTransformados = data.map((ramo: any) => {
        // Priorizar nombre, luego usar código si no hay nombre
        let nombreRamo = ramo.nombre || ramo.asignatura || ramo.materia || null
        const codigoRamo = ramo.codigo || 'SIN-COD'
        
        // Si no hay nombre disponible, usar el código
        if (!nombreRamo || nombreRamo.trim() === '') {
          nombreRamo = codigoRamo
          console.log(`📝 [Ramos] Usando código como nombre para: ${codigoRamo}`)
        }
        
        const ramoTransformado = {
          id: ramo.id || `${codigoRamo}-${ramo.semestre}` || Math.random().toString(),
          nombre: nombreRamo,
          codigo: codigoRamo,
          creditos: parseInt(ramo.creditos) || parseInt(ramo.unidades) || 0,
          semestre: parseInt(ramo.semestre) || parseInt(ramo.nivel) || 1,
          estado: determinarEstadoRamo(ramo),
          prerrequisitos: ramo.prerrequisitos || [],
          profesor: ramo.profesor || ramo.docente || undefined,
          seccion: ramo.seccion || ramo.grupo || undefined,
          nota: ramo.nota ? parseFloat(ramo.nota) : undefined,
          periodo: ramo.periodo || ramo.year || undefined
        }
        
        console.log('🔄 [Ramos] Ramo transformado:', {
          codigo: ramoTransformado.codigo,
          nombre: ramoTransformado.nombre,
          campoOriginal: {
            nombre: ramo.nombre,
            asignatura: ramo.asignatura,
            materia: ramo.materia,
            codigo: ramo.codigo
          }
        })
        return ramoTransformado
      })
      
      // Calcular estadísticas
      const ramosAprobados = ramosTransformados.filter(r => r.estado === 'aprobado')
      const ramosCursando = ramosTransformados.filter(r => r.estado === 'cursando')
      const ramosReprobados = ramosTransformados.filter(r => r.estado === 'reprobado')
      
      console.log('📊 [Ramos] Estadísticas:')
      console.log('  ✅ Aprobados:', ramosAprobados.length)
      console.log('  📚 Cursando:', ramosCursando.length)
      console.log('  ❌ Reprobados:', ramosReprobados.length)
      console.log('  📈 Total:', ramosTransformados.length)
      
      return ramosTransformados
    } else {
      console.log('❌ [Ramos] Error HTTP:', response.status)
      const errorText = await response.text().catch(() => 'No se pudo leer error')
      console.log('❌ [Ramos] Error details:', errorText)
    }
    
    return []
  } catch (error) {
    console.error('❌ [Ramos] Error obteniendo ramos cursados:', error)
    return []
  }
}

async function obtenerMallaCurricular(codigoCarrera?: string): Promise<RamoMalla[]> {
  // TODO: Implementar obtención de malla curricular
  // Por ahora retorna array vacío, pero aquí iría la lógica para:
  // 1. Consultar API de mallas curriculares
  // 2. Obtener todos los ramos de la carrera por semestre
  // 3. Incluir prerrequisitos y dependencias
  
  console.log('⚠️ [Malla Temporal] Malla curricular no implementada para carrera:', codigoCarrera)
  return []
}

function determinarEstadoRamo(ramo: any): RamoMalla['estado'] {
  console.log('🔍 [Estado] Analizando ramo:', { 
    nombre: ramo.nombre || ramo.asignatura,
    nota: ramo.nota,
    inscrito: ramo.inscrito,
    cursando: ramo.cursando,
    aprobado: ramo.aprobado,
    estado: ramo.estado
  })

  // Prioridad 1: Si hay nota, determinar por nota
  if (ramo.nota !== undefined && ramo.nota !== null && ramo.nota !== '') {
    const nota = parseFloat(ramo.nota)
    if (!isNaN(nota)) {
      if (nota >= 4.0) {
        console.log('✅ [Estado] Aprobado por nota:', nota)
        return 'aprobado'
      } else {
        console.log('❌ [Estado] Reprobado por nota:', nota)
        return 'reprobado'
      }
    }
  }

  // Prioridad 2: Verificar campos de estado específicos
  if (ramo.aprobado === true || ramo.estado === 'aprobado' || ramo.estado === 'APROBADO') {
    console.log('✅ [Estado] Aprobado por campo estado')
    return 'aprobado'
  }

  if (ramo.reprobado === true || ramo.estado === 'reprobado' || ramo.estado === 'REPROBADO') {
    console.log('❌ [Estado] Reprobado por campo estado')
    return 'reprobado'
  }

  // Prioridad 3: Si está inscrito o cursando actualmente
  if (ramo.inscrito === true || ramo.cursando === true || ramo.estado === 'cursando' || ramo.estado === 'CURSANDO') {
    console.log('📚 [Estado] Cursando')
    return 'cursando'
  }

  // Prioridad 4: Default pendiente
  console.log('⏳ [Estado] Pendiente (default)')
  return 'pendiente'
}

function construirMallaTemporal(
  datosEstudiante: any,
  ramosCursados: RamoMalla[],
  mallaCurricular: RamoMalla[]
): MallaTemporal {
  
  console.log('🏗️ [Construcción] Iniciando construcción de malla temporal')
  console.log('👤 [Construcción] Datos estudiante:', datosEstudiante)
  console.log('📚 [Construcción] Ramos cursados:', ramosCursados.length)
  
  // Agrupar ramos por semestre
  const semestresPorNumero = new Map<number, RamoMalla[]>()
  
  // Agregar ramos cursados
  ramosCursados.forEach(ramo => {
    if (!semestresPorNumero.has(ramo.semestre)) {
      semestresPorNumero.set(ramo.semestre, [])
    }
    semestresPorNumero.get(ramo.semestre)!.push(ramo)
  })

  // Convertir a array ordenado
  const semestres = Array.from(semestresPorNumero.entries())
    .sort(([a], [b]) => a - b)
    .map(([numero, ramos]) => {
      const creditosTotal = ramos.reduce((sum, r) => sum + r.creditos, 0)
      const creditosAprobados = ramos
        .filter(r => r.estado === 'aprobado')
        .reduce((sum, r) => sum + r.creditos, 0)
      
      console.log(`📊 [Construcción] Semestre ${numero}: ${ramos.length} ramos, ${creditosAprobados}/${creditosTotal} créditos`)
      
      return {
        numero,
        ramos: ramos.sort((a, b) => a.nombre.localeCompare(b.nombre)),
        creditosTotal,
        creditosAprobados
      }
    })

  // Calcular progreso general
  const creditosTotal = semestres.reduce((sum, s) => sum + s.creditosTotal, 0)
  const creditosAprobados = semestres.reduce((sum, s) => sum + s.creditosAprobados, 0)
  const porcentajeAvance = creditosTotal > 0 ? (creditosAprobados / creditosTotal) * 100 : 0

  // Calcular estadísticas adicionales
  const totalRamos = ramosCursados.length
  const ramosAprobados = ramosCursados.filter(r => r.estado === 'aprobado').length
  const ramosCursando = ramosCursados.filter(r => r.estado === 'cursando').length
  const ramosReprobados = ramosCursados.filter(r => r.estado === 'reprobado').length

  const mallaTemporal = {
    estudiante: {
      rut: datosEstudiante?.rut || 'N/A',
      nombre: datosEstudiante?.nombre || 'Estudiante UCN',
      carrera: datosEstudiante?.carreras?.[0]?.nombre || 'Carrera UCN'
    },
    semestres,
    progreso: {
      creditosTotal,
      creditosAprobados,
      porcentajeAvance: Math.round(porcentajeAvance * 100) / 100,
      semestreActual: semestres.length,
      // Estadísticas adicionales
      totalRamos,
      ramosAprobados,
      ramosCursando,
      ramosReprobados
    }
  }

  console.log('✅ [Construcción] Malla temporal construida:')
  console.log('  👤 Estudiante:', mallaTemporal.estudiante.nombre)
  console.log('  🎓 Carrera:', mallaTemporal.estudiante.carrera)
  console.log('  📊 Progreso:', `${porcentajeAvance.toFixed(1)}% (${creditosAprobados}/${creditosTotal} créditos)`)
  console.log('  📚 Ramos:', `${ramosAprobados} aprobados, ${ramosCursando} cursando, ${ramosReprobados} reprobados`)
  console.log('  🗓️ Semestres:', semestres.length)

  return mallaTemporal
}