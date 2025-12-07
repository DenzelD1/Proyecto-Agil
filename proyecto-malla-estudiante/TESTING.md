# Testing

Cómo ejecutar los tests y la estrategia usada

Comandos básicos (desde la carpeta `proyecto-malla-estudiante`):

```cmd
npm install
npm test
```

Estructura de tests

- `test/unit/` — Tests unitarios organizados por carpeta (`lib`, `services`, ...)
- `test/integration/` — Tests de integración para endpoints API
- `test/e2e/` — (opcional) pruebas end-to-end

Estrategia resumida

- Tests unitarios cubren la lógica de negocio crítica (avance, proyección, utilidades).
- Los servicios que llaman APIs externas están testeados con mocks de `fetch`.
- Las rutas de API se han testeado en `test/integration` usando mocks de `prisma`.
- CI: workflow `/.github/workflows/ci.yml` ejecuta `npm test` y guarda reporte de cobertura.

Notas

- Ejecuta los tests desde `cmd` en Windows para evitar políticas de PowerShell.
- Para añadir tests nuevos, crea archivos bajo `test/unit/...` o `test/integration/...`.
