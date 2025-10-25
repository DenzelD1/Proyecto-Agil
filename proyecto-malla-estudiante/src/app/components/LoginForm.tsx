"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MensajeError } from "@/components/ui/mensaje-error"
import { UserIcon, LockIcon, GraduationCapIcon } from "@/components/ui/icons"
import { validarFormularioLogin, tieneErrores, type ErroresValidacion } from "@/lib/validaciones"
import { iniciarSesion, guardarSesion, guardarCredencialesTemporales } from "@/lib/servicio-auth"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [errores, setErrores] = useState<ErroresValidacion>({})
  const [estaEnviando, setEstaEnviando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setErrores({})
    
    const erroresValidacion = validarFormularioLogin(email, contraseña)
    
    if (tieneErrores(erroresValidacion)) {
      setErrores(erroresValidacion)
      return
    }

    setEstaEnviando(true)
    
    try {
      const resultado = await iniciarSesion(email, contraseña)
      
      if (resultado.success && resultado.usuario) {
        guardarSesion(resultado.usuario)
        guardarCredencialesTemporales(email, contraseña) // Para obtener RUT después
        router.push("/principal")
      } else {
        setErrores({
          general: resultado.error || 'Error al iniciar sesión'
        })
      }
    } catch (error) {
      console.error('Error en el login:', error)
      setErrores({
        general: 'Error de conexión. Intente nuevamente.'
      })
    } finally {
      setEstaEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Header con logo y titulo */}
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Sistema Académico
        </h1>
        <p className="text-slate-600">
          Ingresa con tu email y contraseña
        </p>
      </div>

      {/* Formulario login */}
      <Card className="w-full max-w-md bg-slate-50 border-slate-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-slate-600">
            Accede a tu información académica
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@alumnos.ucn.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 bg-white focus:ring-slate-500 ${
                    errores.email 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-slate-300 focus:border-slate-500"
                  }`}
                />
              </div>
              <MensajeError mensaje={errores.email} />
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="contraseña" className="text-slate-700 font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <Input
                  id="contraseña"
                  type="password"
                  placeholder="********"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  className={`pl-10 bg-white focus:ring-slate-500 ${
                    errores.contraseña 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-slate-300 focus:border-slate-500"
                  }`}
                />
              </div>
              <MensajeError mensaje={errores.contraseña} />
            </div>

            {errores.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <MensajeError mensaje={errores.general} />
              </div>
            )}

            {/* Botón de login */}
            <Button
              type="submit"
              disabled={estaEnviando}
              className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5"
            >
              {estaEnviando ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
