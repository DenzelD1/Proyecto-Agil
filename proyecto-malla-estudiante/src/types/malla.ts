export interface AsignaturaMalla {
  codigo: string
  asignatura: string
  creditos: number
  nivel: number
  prereq?: string
}

export type MallaCarrera = AsignaturaMalla[]
