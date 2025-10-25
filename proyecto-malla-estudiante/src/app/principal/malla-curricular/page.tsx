"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import Breadcrumb from "@/components/Breadcrumb"
import { leerSesion } from "@/lib/servicio-auth"
import { AsignaturaMalla, MallaCarrera } from "@/types/malla"
import { Avance, RegistroAvance } from "@/types/avance" // <-- Importar tipos de avance
import TarjetaAsignatura, { EstadoAsignatura } from "@/components/TarjetaAsignatura" // <-- Importar EstadoAsignatura

// Función auxiliar para determinar el estado (puedes moverla a avance-utils.ts si prefieres)
function determinarEstadoAsignatura(codigoAsignatura: string, avance: Avance): EstadoAsignatura {
  // Busca todos los registros de esta asignatura en el avance, ordenados por periodo
  const registros = avance
    .filter(reg => reg.course === codigoAsignatura)
    .sort((a, b) => parseInt(a.period) - parseInt(b.period));

  if (registros.length === 0) {
    return 'pendiente'; 
  }

  const ultimoRegistro = registros[registros.length - 1];

  // Simplificamos la lógica de estado
  const statusNormalizado = ultimoRegistro.status.toUpperCase();
  if (statusNormalizado.includes('APROB')) {
    return 'aprobada';
  }
  if (statusNormalizado.includes('REPRO')) {
    return 'reprobada';
  }
  if (statusNormalizado.includes('CURSANDO') || statusNormalizado.includes('INSCRIT')) {
    return 'cursando';
  }
  if (registros.some(r => r.status.toUpperCase().includes('REPRO'))) {
       return 'reprobada';
  }


  return 'pendiente'; // Estado por defecto 
}


export default function MallaCurricularPage() {
  const [malla, setMalla] = useState<MallaCarrera>([])
  const [avance, setAvance] = useState<Avance>([]) // <-- Estado para el avance
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<any>(null); // Estado para guardar datos del usuario

  // Obtenemos datos del usuario al montar
  useEffect(() => {
    const sesion = leerSesion();
    if (sesion?.usuario) {
      setUsuario(sesion.usuario);
    } else {
       setError('No hay sesión activa.');
       setCargando(false);
    }
  }, []);


  const cargarDatos = useCallback(async () => {
    if (!usuario) {
       // Si no hay usuario aún, o ya hay error, no cargar.
       if (!error) setError('Esperando datos de sesión...');
       return;
    }

    const c = usuario.carreras?.[0];
    if (!c || !usuario.rut) {
      setError('No hay datos de carrera o RUT en la sesión');
      setCargando(false);
      return;
    }

    const slug = `${c.codigo}-${c.catalogo}`;
    const rut = usuario.rut;
    const codCarrera = c.codigo;

    try {
      setCargando(true);
      setError(null); // Limpiar errores previos

      // Hacemos las dos peticiones en paralelo
      const [mallaResp, avanceResp] = await Promise.all([
        fetch(`/api/mallas/${slug}`, { cache: 'no-store' }),
        fetch(`/api/avance?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codCarrera)}`, { cache: 'no-store' }),
      ]);

      // Procesar respuesta de la malla
      const mallaData = await mallaResp.json();
      if (!mallaResp.ok) {
        throw new Error(mallaData?.error || 'No se pudo cargar la malla');
      }
      setMalla(mallaData as MallaCarrera);

      // Procesar respuesta del avance
      const avanceData = await avanceResp.json();
      if (!avanceResp.ok) {
        // Podríamos querer mostrar la malla aunque falle el avance, o manejar el error
        console.warn("Error al cargar el avance:", avanceData?.error || 'Respuesta no OK');
        // Lanzamos error para que se muestre mensaje, o puedes poner setAvance([])
        throw new Error(avanceData?.error || 'No se pudo cargar el avance académico');
      }
      setAvance(avanceData as Avance);

    } catch (e: any) {
      console.error("Error en cargarDatos:", e);
      setError(e.message || 'Error de conexión al cargar datos');
      setMalla([]); // Limpiar datos si falla
      setAvance([]);
    } finally {
      setCargando(false);
    }
  }, [usuario, error]); 

  // Llamamos a cargarDatos cuando el usuario esté listo
  useEffect(() => {
    if (usuario) {
       cargarDatos();
    }
  }, [usuario, cargarDatos]);


  // Agrupar por nivel (semestre)
  const niveles = useMemo(() => {
    const mapa = new Map<number, AsignaturaMalla[]>();
    for (const a of malla) {
      const arr = mapa.get(a.nivel) || [];
      arr.push(a);
      mapa.set(a.nivel, arr);
    }
    // Ordenar asignaturas dentro de cada nivel alfabéticamente
    mapa.forEach((asignaturas) => {
        asignaturas.sort((a, b) => a.asignatura.localeCompare(b.asignatura));
    });
    return Array.from(mapa.entries()).sort((a, b) => a[0] - b[0]);
  }, [malla]);

  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <Breadcrumb />
      <main className="max-w-7xl mx-auto px-4 py-8"> {/* Ajustado max-w y padding */}
        {cargando && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <div className="animate-pulse">Cargando datos de malla y avance... ⏳</div>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-100 p-6 text-red-700">{error}</div>
        )}
        {!cargando && !error && malla.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-700 text-center">
            No se encontraron datos de la malla curricular para tu carrera y catálogo. Verifica la información de tu sesión.
          </div>
        )}
        {!cargando && !error && malla.length > 0 && (
          <div className="space-y-8">
            {niveles.map(([nivel, asignaturas]) => {
              // Calculamos estado para cada asignatura de este nivel
              const asignaturasConEstado = asignaturas.map(a => ({
                ...a,
                estado: determinarEstadoAsignatura(a.codigo, avance)
              }));

              return (
                <section key={nivel} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                   <h2 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">
                     Semestre {nivel}
                   </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Grid responsivo */}
                    {asignaturasConEstado.map((a) => (
                      <TarjetaAsignatura
                        key={a.codigo}
                        asignatura={a}
                        estado={a.estado} // <-- Pasamos el estado calculado
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  )
}