export interface ErroresValidacion {
  email?: string
  contraseña?: string
  general?: string
}

export function validarEmail(email: string): string | null {
  if (!email.trim()) {
    return "El email es requerido"
  }

  const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!patronEmail.test(email)) {
    return "El formato del email no es válido"
  }

  return null
}

export function validarContraseña(contraseña: string): string | null {
  if (!contraseña.trim()) {
    return "La contraseña es requerida"
  }

  if (contraseña.length < 4) {
    return "La contraseña debe tener al menos 4 caracteres"
  }

  return null
}

export function validarFormularioLogin(email: string, contraseña: string): ErroresValidacion {
  const errores: ErroresValidacion = {}

  const errorEmail = validarEmail(email)
  if (errorEmail) {
    errores.email = errorEmail
  }

  const errorContraseña = validarContraseña(contraseña)
  if (errorContraseña) {
    errores.contraseña = errorContraseña
  }

  return errores
}

export function tieneErrores(errores: ErroresValidacion): boolean {
  return Object.keys(errores).length > 0
}
