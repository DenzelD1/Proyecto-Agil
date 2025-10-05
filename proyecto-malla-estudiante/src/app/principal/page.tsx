import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"

export default function PrincipalPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-700">
          Bienvenido. Selecciona una opción en la barra superior.
        </div>
      </main>
    </div>
  )
}
