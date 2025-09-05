This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

COMANDOS PARA LEVANTAR DOCKER E INICIAR PRISMA
```bash
# 1. Instalar dependencias
npm install

# 2. Levantar Docker
docker-compose up -d

# 3. Aplicar migraciones (solo si hay nuevas migraciones)
npx prisma migrate deploy

# 4. Generar cliente de Prisma (solo si hay cambios en schema)
npx prisma generate
```

COMANDOS DE DOCKER
```bash
docker-compose up -d
#¿Para qué sirve? Levanta el contenedor de PostgreSQL en segundo plano
#¿Cuándo usarlo? Siempre al empezar a trabajar en el proyecto
#¿Qué hace? Crea y ejecuta la base de datos PostgreSQL

docker-compose down
#¿Para qué sirve? Detiene y elimina el contenedor de PostgreSQL
#¿Cuándo usarlo? Al terminar de trabajar o para liberar recursos
#¿Qué hace? Cierra la base de datos y libera memoria

docker-compose ps
#¿Para qué sirve? Verifica el estado de los contenedores
#¿Cuándo usarlo? Para verificar si Docker está funcionando
#¿Qué hace? Muestra si los contenedores están corriendo

docker-compose restart
#¿Para qué sirve? Reinicia el contenedor sin eliminarlo
#¿Cuándo usarlo? Si hay problemas de conexión o la BD se comporta raro
#¿Qué hace? Reinicia PostgreSQL manteniendo los datos
```

COMANDOS DE PRISMA
```bash
npx prisma db push
#¿Para qué sirve? Aplica cambios del schema directamente a la base de datos
#¿Cuándo usarlo? Durante desarrollo para cambios rápidos
#¿Qué hace? Sincroniza tu schema.prisma con la BD sin crear migraciones

npx prisma migrate dev --name nombre_migracion
#¿Para qué sirve? Crea y aplica migraciones formales (TU MISMO)
#¿Cuándo usarlo? Para cambios importantes que quieres versionar
#¿Qué hace? Crea archivos de migración y los aplica a la BD

npx prisma migrate deploy
#¿Para qué sirve? Aplica migraciones existentes (sin crear nuevas) (DE OTRAS PERSONAS)
#¿Cuándo usarlo? Cuando descargas cambios del equipo y hay nuevas migraciones
#¿Qué hace? Ejecuta migraciones pendientes en la BD

npx prisma db pull
#¿Para qué sirve? Extrae el esquema de una base de datos existente
#¿Cuándo usarlo? Cuando la BD ya tiene tablas y quieres generar el schema
#¿Qué hace? Lee las tablas de la BD y actualiza tu schema.prisma

npx prisma generate
#¿Para qué sirve? Genera el cliente de Prisma para usar en tu código
#¿Cuándo usarlo? Después de cambiar el schema o instalar Prisma
#¿Qué hace? Crea el código TypeScript para interactuar con la BD

npx prisma migrate reset --force
#¿Para qué sirve? Elimina toda la BD y la recrea desde cero
#¿Cuándo usarlo? Solo en desarrollo, cuando quieres empezar limpio
#¿Qué hace? Borra todos los datos y aplica todas las migraciones


```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
