"use client"

export default function MallaDebug() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Malla Temporal - Página de Prueba
        </h1>
        <p className="text-lg text-gray-600">
          Si ves este mensaje, la página está funcionando correctamente.
        </p>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Estado del Sistema:</h2>
          <div className="space-y-2">
            <p>✅ Página carga correctamente</p>
            <p>✅ Routing funciona</p>
            <p>✅ Componente se renderiza</p>
          </div>
        </div>

        <div className="mt-4">
          <button 
            onClick={() => window.location.href = '/menu'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    </div>
  )
}