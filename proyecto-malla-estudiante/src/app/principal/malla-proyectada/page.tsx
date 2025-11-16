"use client"

import BarraSuperior from "@/components/BarraSuperior"
import NavMallas from "@/components/NavMallas"
import Breadcrumb from "@/components/Breadcrumb"

// Datos de ejemplo para la malla proyectada
const mallaSemestres = [
  {
    numero: 1,
    nombre: "Primer Semestre",
    ramos: [
      { codigo: "MAT101", nombre: "Matemáticas I", creditos: 6, estado: "aprobado" },
      { codigo: "FIS101", nombre: "Física I", creditos: 6, estado: "aprobado" },
      { codigo: "QUI101", nombre: "Química General", creditos: 5, estado: "aprobado" },
      { codigo: "ING101", nombre: "Introducción a la Ingeniería", creditos: 3, estado: "aprobado" },
      { codigo: "LEN101", nombre: "Lenguaje y Comunicación", creditos: 4, estado: "aprobado" }
    ]
  },
  {
    numero: 2,
    nombre: "Segundo Semestre", 
    ramos: [
      { codigo: "MAT102", nombre: "Matemáticas II", creditos: 6, estado: "aprobado" },
      { codigo: "FIS102", nombre: "Física II", creditos: 6, estado: "aprobado" },
      { codigo: "PRO101", nombre: "Programación I", creditos: 5, estado: "cursando" },
      { codigo: "EST101", nombre: "Estadística", creditos: 4, estado: "cursando" },
      { codigo: "HIS101", nombre: "Historia y Ciencias Sociales", creditos: 3, estado: "cursando" }
    ]
  },
  {
    numero: 3,
    nombre: "Tercer Semestre",
    ramos: [
      { codigo: "MAT201", nombre: "Matemáticas III", creditos: 6, estado: "pendiente" },
      { codigo: "FIS201", nombre: "Física III", creditos: 6, estado: "pendiente" },
      { codigo: "PRO201", nombre: "Programación II", creditos: 5, estado: "pendiente" },
      { codigo: "EST201", nombre: "Estadística II", creditos: 4, estado: "pendiente" },
      { codigo: "ECO101", nombre: "Economía", creditos: 3, estado: "pendiente" }
    ]
  },
  {
    numero: 4,
    nombre: "Cuarto Semestre",
    ramos: [
      { codigo: "MAT202", nombre: "Matemáticas IV", creditos: 6, estado: "pendiente" },
      { codigo: "ING201", nombre: "Ingeniería de Software", creditos: 6, estado: "pendiente" },
      { codigo: "BD101", nombre: "Base de Datos", creditos: 5, estado: "pendiente" },
      { codigo: "ALG101", nombre: "Algoritmos", creditos: 4, estado: "pendiente" },
      { codigo: "FIL101", nombre: "Filosofía", creditos: 3, estado: "pendiente" }
    ]
  },
  {
    numero: 5,
    nombre: "Quinto Semestre",
    ramos: [
      { codigo: "ING301", nombre: "Análisis de Sistemas", creditos: 6, estado: "pendiente" },
      { codigo: "RED101", nombre: "Redes de Computadores", creditos: 6, estado: "pendiente" },
      { codigo: "WEB101", nombre: "Desarrollo Web", creditos: 5, estado: "pendiente" },
      { codigo: "SEG101", nombre: "Seguridad Informática", creditos: 4, estado: "pendiente" },
      { codigo: "ELE101", nombre: "Electivo I", creditos: 3, estado: "pendiente" }
    ]
  },
  {
    numero: 6,
    nombre: "Sexto Semestre",
    ramos: [
      { codigo: "ING302", nombre: "Proyecto de Software", creditos: 6, estado: "pendiente" },
      { codigo: "IA101", nombre: "Inteligencia Artificial", creditos: 6, estado: "pendiente" },
      { codigo: "MOV101", nombre: "Desarrollo Móvil", creditos: 5, estado: "pendiente" },
      { codigo: "GES101", nombre: "Gestión de Proyectos", creditos: 4, estado: "pendiente" },
      { codigo: "ELE102", nombre: "Electivo II", creditos: 3, estado: "pendiente" }
    ]
  }
]

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'aprobado':
      return 'bg-green-100 border-green-300 text-green-800'
    case 'cursando':
      return 'bg-blue-100 border-blue-300 text-blue-800'
    case 'reprobado':
      return 'bg-red-100 border-red-300 text-red-800'
    case 'pendiente':
      return 'bg-gray-50 border-gray-300 text-gray-600'
    default:
      return 'bg-gray-50 border-gray-300 text-gray-600'
  }
}

const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case 'aprobado':
      return '✅'
    case 'cursando':
      return '📚'
    case 'reprobado':
      return '❌'
    case 'pendiente':
      return '⏳'
    default:
      return '❓'
  }
}

export default function MallaProyectadaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior />
      <NavMallas />
      <Breadcrumb />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Malla Proyectada</h1>
            <p className="text-slate-600 mb-6">
              Planifica tu futuro académico semestre a semestre
            </p>
          </div>

          {/* Leyenda de estados */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <span>✅</span>
              <span className="text-sm text-green-800">Aprobado</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              <span>📚</span>
              <span className="text-sm text-blue-800">Cursando</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
              <span>❌</span>
              <span className="text-sm text-red-800">Reprobado</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
              <span>⏳</span>
              <span className="text-sm text-gray-600">Pendiente</span>
            </div>
          </div>

          {/* Malla en columnas verticales */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
              {mallaSemestres.map((semestre) => (
                <div 
                  key={semestre.numero}
                  className="flex-shrink-0 w-64 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden"
                >
                  {/* Header del semestre */}
                  <div className="bg-slate-800 text-white p-4 text-center">
                    <h3 className="font-bold text-lg">{semestre.numero}° Semestre</h3>
                    <p className="text-sm text-slate-300">{semestre.nombre}</p>
                    <div className="text-xs text-slate-400 mt-1">
                      {semestre.ramos.length} ramos • {semestre.ramos.reduce((sum, ramo) => sum + ramo.creditos, 0)} créditos
                    </div>
                  </div>

                  {/* Columna de ramos */}
                  <div className="p-3 space-y-3 min-h-96">
                    {semestre.ramos.map((ramo) => (
                      <div
                        key={ramo.codigo}
                        className={`p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getEstadoColor(ramo.estado)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm leading-tight">
                              {ramo.nombre}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {ramo.codigo}
                            </p>
                          </div>
                          <span className="text-lg ml-2 flex-shrink-0">
                            {getEstadoIcon(ramo.estado)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium">
                            {ramo.creditos} créditos
                          </span>
                          <span className="capitalize font-medium">
                            {ramo.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer con resumen */}
                  <div className="bg-slate-100 p-3 border-t border-slate-200">
                    <div className="text-center text-xs text-slate-600">
                      <div className="font-medium">
                        Total: {semestre.ramos.reduce((sum, ramo) => sum + ramo.creditos, 0)} créditos
                      </div>
                      <div className="mt-1">
                        {semestre.ramos.filter(r => r.estado === 'aprobado').length} aprobados • 
                        {semestre.ramos.filter(r => r.estado === 'cursando').length} cursando • 
                        {semestre.ramos.filter(r => r.estado === 'pendiente').length} pendientes
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen general */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-800">
                {mallaSemestres.flatMap(s => s.ramos).filter(r => r.estado === 'aprobado').length}
              </div>
              <div className="text-sm text-green-600">Ramos Aprobados</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-800">
                {mallaSemestres.flatMap(s => s.ramos).filter(r => r.estado === 'cursando').length}
              </div>
              <div className="text-sm text-blue-600">Ramos Cursando</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {mallaSemestres.flatMap(s => s.ramos).filter(r => r.estado === 'pendiente').length}
              </div>
              <div className="text-sm text-gray-600">Ramos Pendientes</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
              <div className="text-2xl font-bold text-purple-800">
                {mallaSemestres.flatMap(s => s.ramos).reduce((sum, r) => sum + r.creditos, 0)}
              </div>
              <div className="text-sm text-purple-600">Total Créditos</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
