"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function MenuPrincipal() {
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Obtener el email del localStorage
    const emailGuardado = localStorage.getItem("email")
    setEmail(emailGuardado)
    // Si no hay email, redirigir al login
    if (!emailGuardado) {
      router.push("/")
    }
  }, [router])

  const cerrarSesion = () => {
    localStorage.removeItem("email")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/LogoUCN_acentuado.png"
              alt="Logo UCN"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sistema Académico UCN
          </h1>
          {email && (
            <p className="text-gray-600">
              Bienvenido: <span className="font-mono text-blue-600">{email}</span>
            </p>
          )}
        </div>

        {/* Botón de prueba directo */}
        <div className="mb-8 text-center">
          <button
            onClick={() => {
              console.log("Botón directo - navegando a malla temporal")
              router.push("/malla-temporal")
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
          >
            🧪 PRUEBA DIRECTA - IR A MALLA TEMPORAL
          </button>
        </div>

        {/* Opciones del menú */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            onClick={() => {
              console.log("Navegando a malla temporal...")
              router.push("/malla-temporal")
            }}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="text-blue-600 text-3xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Malla Curricular ✅
            </h3>
            <p className="text-gray-600">
              Ver los ramos que estás cursando y tu progreso académico (CLICK AQUÍ)
            </p>
          </div>

          <div 
            onClick={() => alert("Próximamente disponible - NOTAS")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="text-green-600 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Notas ❌
            </h3>
            <p className="text-gray-600">
              Consulta tus calificaciones y promedio académico (NO DISPONIBLE)
            </p>
          </div>

          <div 
            onClick={() => alert("Próximamente disponible - HORARIOS")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="text-purple-600 text-3xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Horarios ❌
            </h3>
            <p className="text-gray-600">
              Revisa tu horario de clases y horarios de evaluaciones (NO DISPONIBLE)
            </p>
          </div>

          <div 
            onClick={() => alert("Próximamente disponible")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="text-orange-600 text-3xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Perfil
            </h3>
            <p className="text-gray-600">
              Información personal y datos académicos
            </p>
          </div>

          <div 
            onClick={() => alert("Próximamente disponible")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="text-red-600 text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Matrícula
            </h3>
            <p className="text-gray-600">
              Gestiona tu matrícula y inscripción de ramos
            </p>
          </div>

          <div 
            onClick={() => alert("Próximamente disponible")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="text-cyan-600 text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Estado Financiero
            </h3>
            <p className="text-gray-600">
              Consulta el estado de tus pagos y aranceles
            </p>
          </div>
        </div>

        {/* Botón cerrar sesión */}
        <div className="text-center mt-8">
          <button
            onClick={cerrarSesion}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}