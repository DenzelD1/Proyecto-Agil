"use client"

interface Props {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  mensaje?: string
}

export default function ModalAdvertencia({
  isOpen,
  onConfirm,
  onCancel,
  mensaje = "¿Desea guardar la proyección? Si no lo hace perderá la proyección activa"
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-xl font-bold text-slate-800">
                Advertencia
              </h2>
            </div>
            <p className="text-slate-600 mt-2">{mensaje}</p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              No
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sí
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

