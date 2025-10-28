# Practica TS Clean Architecture

Microservicio de pedidos escrito en TypeScript que aplica arquitectura limpia, Fastify como servidor HTTP y PostgreSQL como persistencia principal (con alternativa en memoria para desarrollo y pruebas).

## Resumen
- Capas separadas (`domain`, `application`, `infrastructure`, `composition`, `shared`) para aislar reglas de negocio de la infraestructura.
- Casos de uso `CreateOrder` y `AddItemToOrder`, con validaciones ricas, generacion opcional de identificadores y publicacion de eventos a outbox.
- Servidor Fastify con endpoints `/`, `/health`, `/orders` y `/orders/:orderId/items`; registra cada peticion `POST` cuando se ejecuta `npm run dev`.
- Persistencia mediante repositorios en memoria o PostgreSQL (Docker Compose + migraciones SQL).
- Worker `npm run worker:outbox` para despachar eventos almacenados en la tabla outbox.
- Pruebas con Vitest (unidades, aceptacion e infraestructura) y tooling listo para CI.

## Tecnologias y lenguajes
- Node.js 18+, TypeScript 5.9, ES2022 modules.
- Fastify 4, Pino 9, Zod 3 para validar y loguear.
- PostgreSQL 16 (contenedor Docker) con cliente `pg`.
- Tooling: `tsx` para ejecucion en desarrollo, `vitest` para pruebas, `eslint` para linting.

## Dependencias clave
- Runtime: `fastify`, `zod`, `pg`, `pino`, `pino-pretty`, `dotenv`.
- Desarrollo: `typescript`, `tsx`, `vitest`, `eslint`, `@types/node`, `@types/pg`.

## Estructura de carpetas
```text
.
|-- db/
|   `-- migrations/
|-- scripts/
|-- src/
|   |-- application/
|   |-- composition/
|   |-- domain/
|   |-- infrastructure/
|   `-- shared/
|-- tests/
`-- ReadMe.md
```

## Guia rapida para iniciar
1. Verifica requisitos: `node -v`, `npm -v`, `docker --version`.
2. Instala dependencias: `npm install`.
3. Levanta PostgreSQL: `npm run db:up`.
4. Aplica migraciones: `npm run db:migrate`.
5. Arranca la API en desarrollo: `npm run dev`. La consola mostrara la URL y un mensaje por cada `POST` procesado.
6. (Opcional) Ejecuta el worker outbox: `npm run worker:outbox`.
7. Ejecuta pruebas cuando sea necesario: `npm test` o `npm run test:watch`.

## Rutas HTTP principales
| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET    | `/` | Mensaje de bienvenida con enlaces y comandos PowerShell |
| GET    | `/health` | Comprueba conexion a la base de datos usando un ID de prueba |
| GET    | `/orders` | Tutorial interactivo con ejemplos `Invoke-RestMethod` y `curl` |
| POST   | `/orders` | Crea un pedido nuevo (genera `orderId` si no se envia) |
| POST   | `/orders/:orderId/items` | Anade un articulo a un pedido existente |

## Scripts npm
- `npm run dev`: ejecuta Fastify con `tsx` y logging coloreado (si `LOG_PRETTY` lo permite).
- `npm run build`: compila TypeScript a `dist/`.
- `npm start`: ejecuta la compilacion (`node dist/main.js`).
- `npm run db:up` / `npm run db:down`: gestiona Docker Compose para PostgreSQL.
- `npm run db:migrate`: corre las migraciones pendientes.
- `npm run worker:outbox`: procesa la tabla outbox.
- `npm test` / `npm run test:watch`: lanza los tests de Vitest.

## Variables de entorno relevantes
| Variable | Descripcion | Valor por defecto |
| -------- | ----------- | ----------------- |
| `PORT` | Puerto HTTP de Fastify | `3000` (modificado a `3001` en `.env`) |
| `HOST` | Interfaz de escucha | `0.0.0.0` |
| `DATABASE_URL` | Cadena de conexion PostgreSQL | `postgresql://postgres:postgres@localhost:5432/orders` (ajustada en `.env` a 5433) |
| `USE_INMEMORY` | Activa repositorio en memoria | `true` |
| `USE_POSTGRES` | Fuerza repositorio PostgreSQL | `false` |
| `LOG_PRETTY` | Activa transporte `pino-pretty` | `true` en desarrollo |
| `LOG_COLOR` | Colorea logs en consola | `true` |
| `LOG_LEVEL` | Nivel de log por defecto | `info` |

> Revisa `.env` para conocer los valores efectivos en tu maquina.

## Documentacion adicional
- [orden.md](orden.md) &rarr; cronologia detallada de las fases del proyecto.
- [comandos.md](comandos.md) &rarr; comandos practicos para entorno, base de datos y API.
- [directrices.md](directrices.md) &rarr; decisiones tecnicas, convenciones y buenas practicas.
- [prompts.md](prompts.md) &rarr; historial de interacciones utilizadas para construir el proyecto.
- [arquitectura.md](arquitectura.md) &rarr; estructura de carpetas con un breve resumen.

## Mantenimiento y proximos pasos
- Ejecuta `npm run db:down` y limpia el volumen `practicatscleanarchitecture_pgdata` si necesitas un entorno de datos limpio.
- Considera integrar un bus real en `OutboxDispatcher` para enviar eventos a otros sistemas.
- Evalua automatizar la ejecucion de pruebas y migraciones en CI antes de desplegar.
