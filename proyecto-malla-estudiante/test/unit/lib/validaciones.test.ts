import { validarEmail, validarContraseña, validarFormularioLogin, tieneErrores } from '../../../src/lib/validaciones'

describe('validaciones', () => {
  test('validarEmail detecta vacío e invalidos', () => {
    expect(validarEmail('')).toBe('El email es requerido')
    expect(validarEmail('not-an-email')).toBe('El formato del email no es válido')
    expect(validarEmail('juan@ejemplo.com')).toBeNull()
  })

  test('validarContraseña valida longitud y vacio', () => {
    expect(validarContraseña('')).toBe('La contraseña es requerida')
    expect(validarContraseña('abc')).toBe('La contraseña debe tener al menos 4 caracteres')
    expect(validarContraseña('abcd')).toBeNull()
  })

  test('validarFormularioLogin agrupa errores', () => {
    const errores = validarFormularioLogin('', '')
    expect(tieneErrores(errores)).toBe(true)
    expect(errores.email).toBeDefined()
    expect(errores.contraseña).toBeDefined()
  })
})
