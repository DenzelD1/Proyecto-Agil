"use client"

import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import Breadcrumb from "@/components/Breadcrumb"

export default function MallaProyectadaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <Breadcrumb />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Malla Proyectada</h1>
            <p className="text-slate-600 mb-6">
              Aquí podrás planificar tu futuro académico y simular diferentes escenarios
            </p>
            <div className="bg-slate-50 rounded-lg p-4 text-slate-500">
              <p className="text-sm">Esta funcionalidad estará disponible próximamente</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
