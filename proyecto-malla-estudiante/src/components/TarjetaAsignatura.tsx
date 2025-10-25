import { cn } from "@/lib/utils"
import { AsignaturaMalla } from "@/types/malla"

// Estados a manejar
export type EstadoAsignatura = 'aprobada' | 'reprobada' | 'cursando' | 'pendiente' | 'disponible' | 'bloqueado';

interface Props {
  asignatura: AsignaturaMalla
  estado?: EstadoAsignatura
}

export default function TarjetaAsignatura({ asignatura, estado = 'pendiente' }: Props) {
  // --- Lógica de Color ---
  const color = estado === 'aprobada' // <-- Verde para aprobada
    ? 'bg-green-100 border-green-300 text-green-800' 
    : estado === 'reprobada' // <-- Rojo para reprobada
    ? 'bg-red-100 border-red-300 text-red-800' // <-- Clases de Tailwind para rojo
    : estado === 'cursando'
    ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
    : 'bg-white border-slate-200 text-slate-800' // Color por defecto 

  // Icono según el estado y mayúscula
  const icono = estado === 'aprobada' ? '✅' : estado === 'reprobada' ? '❌' : estado === 'cursando' ? '⭐' : '📄';
  const estadoCapitalizado = estado.charAt(0).toUpperCase() + estado.slice(1);

  return (
    // Aplicamos la clase de color al div principal
    <div className={cn('rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md', color)}>
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-sm leading-tight mr-2">{asignatura.asignatura}</h4>
        {/* Mostramos el icono */}
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-opacity-80 flex-shrink-0">{icono} {estadoCapitalizado}</span>
      </div>
      <div className="mt-1 text-xs opacity-80">{asignatura.codigo}</div>
      <div className="mt-2 text-xs opacity-80">{asignatura.creditos} créditos</div>
      {asignatura.prereq && (
        <div className="mt-2 text-[10px] opacity-70">Prerreq: {asignatura.prereq}</div>
      )}
    </div>
  )
}