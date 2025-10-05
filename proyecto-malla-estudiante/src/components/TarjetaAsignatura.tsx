import { cn } from "@/lib/utils"
import { AsignaturaMalla } from "@/types/malla"

interface Props {
  asignatura: AsignaturaMalla
  estado?: 'aprobada' | 'reprobada' | 'cursando' | 'pendiente'
}

export default function TarjetaAsignatura({ asignatura, estado = 'pendiente' }: Props) {
  const color = estado === 'aprobada'
    ? 'bg-green-100 border-green-300'
    : estado === 'reprobada'
    ? 'bg-red-100 border-red-300'
    : estado === 'cursando'
    ? 'bg-yellow-100 border-yellow-300'
    : 'bg-white'

  return (
    <div className={cn('rounded-md border p-3', color)}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-800">{asignatura.asignatura}</h4>
        <span className="text-xs text-slate-600">{asignatura.creditos} créditos</span>
      </div>
      <div className="mt-1 text-xs text-slate-600">{asignatura.codigo}</div>
      {asignatura.prereq && (
        <div className="mt-2 text-[11px] text-slate-500">Prerequisitos: {asignatura.prereq}</div>
      )}
    </div>
  )
}
