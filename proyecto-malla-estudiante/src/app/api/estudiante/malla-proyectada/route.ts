import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { obtenerDatosDesdeToken } from '@/lib/servicio-auth';

// Interfaz para la asignatura en la malla proyectada
interface AsignaturaProyectada {
  codigo: string;
  nombre: string;
  estado: 'aprobado' | 'cursando' | 'reprobado' | 'pendiente' | 'convalidado';
  // Añade otros campos si son necesarios, como créditos, prerrequisitos, etc.
}

// Interfaz para el semestre en la malla proyectada
interface SemestreProyectado {
  semestre: number;
  asignaturas: AsignaturaProyectada[];
}

// Interfaz para la malla proyectada completa
interface MallaProyectada {
  nombreCarrera: string;
  semestres: SemestreProyectado[];
}

async function obtenerHistorialAcademico(rut: string, codcarrera: string) {
    const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${rut}&codcarrera=${codcarrera}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener historial: ${response.statusText}`);
        }
        const data = await response.json();
        
        // La API de avance devuelve un objeto con una clave que varía (ej: 'avance', 'ramos', 'asignaturas')
        // Buscamos la primera clave que contenga un array
        const key = Object.keys(data).find(k => Array.isArray(data[k]));
        if (!key) {
            throw new Error("No se encontró un array de asignaturas en la respuesta de la API de avance.");
        }
        
        return data[key] as any[];
    } catch (error) {
        console.error("Error en obtenerHistorialAcademico:", error);
        return [];
    }
}

async function obtenerMallaCurricular(codcarrera: string) {
    // TODO: Reemplazar con la lógica real para obtener la malla curricular.
    // Esto podría ser otra API, un archivo JSON, o una base de datos.
    // Por ahora, usaremos una estructura de ejemplo basada en la que estaba en el frontend.
    console.log(`Obteniendo malla para carrera: ${codcarrera}`);

    // Ejemplo hardcodeado. Esto DEBE ser reemplazado.
    const mallaEjemplo: MallaProyectada = {
        nombreCarrera: "INGENIERÍA CIVIL EN COMPUTACIÓN E INFORMÁTICA",
        semestres: [
            {
                semestre: 1,
                asignaturas: [
                    { codigo: "MAT101", nombre: "CÁLCULO I", estado: 'pendiente' },
                    { codigo: "FIS101", nombre: "FÍSICA I", estado: 'pendiente' },
                    { codigo: "INF101", nombre: "INTRODUCCIÓN A LA PROGRAMACIÓN", estado: 'pendiente' },
                    { codigo: "APU101", nombre: "ACTIVIDADES DEPORTIVAS Y CULTURALES", estado: 'pendiente' },
                ],
            },
            {
                semestre: 2,
                asignaturas: [
                    { codigo: "MAT102", nombre: "CÁLCULO II", estado: 'pendiente' },
                    { codigo: "FIS102", nombre: "FÍSICA II", estado: 'pendiente' },
                    { codigo: "INF102", nombre: "PROGRAMACIÓN AVANZADA", estado: 'pendiente' },
                    { codigo: "APU102", nombre: "FORMACIÓN INTEGRAL", estado: 'pendiente' },
                ],
            },
            // ... más semestres
        ],
    };
    return mallaEjemplo;
}

function determinarEstadoAsignatura(asignaturaHistorial: any): AsignaturaProyectada['estado'] {
    const nota = parseFloat(asignaturaHistorial.NOTA);
    const estado = asignaturaHistorial.ESTADO?.toUpperCase() || '';

    if (estado.includes('APROBADO')) return 'aprobado';
    if (estado.includes('CONVALIDADO')) return 'convalidado';
    if (estado.includes('CURSANDO')) return 'cursando';
    if (nota < 4.0 && nota > 0) return 'reprobado';
    
    return 'pendiente';
}

export async function GET() {
    const cookieStore = cookies(); // Así es correcto
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const datosEstudiante = await obtenerDatosDesdeToken(token);
        if (!datosEstudiante || !datosEstudiante.rut || !datosEstudiante.codcarrera) {
            return NextResponse.json({ error: 'No se pudo obtener el RUT o código de carrera del estudiante' }, { status: 400 });
        }
        const { rut, codcarrera } = datosEstudiante;

        const [historial, mallaCurricular] = await Promise.all([
            obtenerHistorialAcademico(rut, codcarrera),
            obtenerMallaCurricular(codcarrera)
        ]);

        const historialMap = new Map<string, any>();
        historial.forEach(ramo => {
            const codigo = ramo.CODIGO || ramo.ASIGNATURA;
            if (codigo) {
                historialMap.set(codigo, ramo);
            }
        });

        const mallaProyectada: MallaProyectada = {
            ...mallaCurricular,
            semestres: mallaCurricular.semestres.map(semestre => ({
                ...semestre,
                asignaturas: semestre.asignaturas.map(asignatura => {
                    const historialRamo = historialMap.get(asignatura.codigo);
                    const estado = historialRamo ? determinarEstadoAsignatura(historialRamo) : 'pendiente';
                    const nombre = historialRamo?.NOMBRE || historialRamo?.ASIGNATURA || asignatura.nombre;

                    return {
                        ...asignatura,
                        nombre,
                        estado,
                    };
                })
            }))
        };

        return NextResponse.json(mallaProyectada);

    } catch (error) {
        console.error("Error en GET /api/estudiante/malla-proyectada:", error);
        const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió';
        return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
    }
}
