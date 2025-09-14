"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, LockIcon, GraduationCapIcon } from "@/components/ui/icons"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt:", { email, password })
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
                  className="pl-10 bg-white border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>
            </div>

            {/* Botón de login */}
            <Button
              type="submit"
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2.5"
            >
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
