## Cronologia completa del proyecto

1. **Planificacion y requisitos iniciales**
   - Definimos el objetivo: un microservicio de pedidos con arquitectura limpia, casos de uso claros y soporte para persistencia en memoria y PostgreSQL.
   - Comprobamos versiones de Node.js (>=18) y npm (>=9) y creamos el espacio de trabajo en `Practica TS Clean Architecture`.

2. **Arranque del repositorio**
   - Ejecutamos `npm init -y` y configuramos `package.json` con scripts base (`dev`, `build`, `start`, `test`).
   - Instalamos dependencias runtime (`fastify`, `zod`, `pg`, `pino`, `pino-pretty`, `dotenv`) y de desarrollo (`typescript`, `tsx`, `vitest`, `eslint`, `@types/*`).
   - Creamos `tsconfig.json` con `moduleResolution` NodeNext, generacion de declaraciones y aliases (`@domain/*`, `@application/*`, etc.).

3. **Estructura de carpetas y tooling**
   - Organizamos la arquitectura en capas (`src/domain`, `src/application`, `src/infrastructure`, `src/composition`, `src/shared`).
   - Aniadimos `vitest.config.ts` para compartir aliases con Vitest y apuntar las suites de `tests/`.
   - Configuramos `.gitignore` y preparamos `tsconfig` y `vitest` para trabajar con modulos ES.

4. **Modelado del dominio**
   - Implementamos entidades (`Order`) y objetos de valor (`Money`, `Quantity`, `SKU`, `OrderItem`) con validaciones rigurosas.
   - Definimos eventos de dominio y errores especificos para capturar invariantes de negocio.
   - Creamos la clase utilitaria `Result` en `src/shared` para estandarizar respuestas de los casos de uso.

5. **Capa de aplicacion**
   - Diseniamos puertos (`OrderRepository`, `PricingService`, `EventBus`, `UnitOfWork`, `Logger`, `Clock`) y DTOs (`CreateOrderDTO`, `AddItemToOrderDTO`).
   - Implementamos los casos de uso `CreateOrder` y `AddItemToOrder`, incorporando generacion opcional de `orderId` y calculo de totales.
   - Centralizamos errores de aplicacion en `src/application/errors.ts`.

6. **Infraestructura basica**
   - Aniadimos `InMemoryOrderRepository`, `StaticPricingService` y `NoopEventBus` como adaptadores iniciales.
   - Construimos `PinoLogger` con transporte opcional `pino-pretty`, banderas `LOG_PRETTY` y `LOG_COLOR`, y soporte para `child`.
   - Creamos el servidor HTTP con Fastify (`src/infrastructure/http/server.ts`) y el `OrdersController` para exponer `/orders`, `/orders/:orderId/items` y `/health`.

7. **Composicion y arranque**
   - Implementamos `buildContainer` para orquestar dependencias, elegir entre repositorio en memoria o PostgreSQL y ofrecer un `shutdown` centralizado.
   - Creamos `src/application/main.ts` para levantar Fastify con fallback de puertos, handlers de senales y mensajes de arranque.
   - Aseguramos que `npm run dev` utilice `tsx` y recargue cambios en tiempo real.

8. **Persistencia con PostgreSQL**
   - Definimos `docker-compose.yml` con un servicio `postgres` (imagen oficial 16) y volumen `pgdata`.
   - Creamos `db/migrations/001_init.sql` para las tablas `orders`, `order_items` y soporte inicial del outbox.
   - Escribimos `scripts/migrate.ts` para leer `.env`, ejecutar migraciones pendientes y registrar el historico en `schema_migrations`.

9. **Pruebas automatizadas**
   - Configuramos suites en `tests/domain`, `tests/application`, `tests/acceptance` e `infrastructure` para validar reglas, casos de uso y adaptadores.
   - Aniadimos el script `npm test` y `npm run test:watch` en `package.json`.

10. **Ajuste del entorno Docker**
    - Verificamos `docker --version`, instalamos Docker Desktop con `winget` y levantamos los contenedores mediante `npm run db:up`.
    - Resolvimos incidencias de credenciales limpiando el volumen (`docker volume rm practicatscleanarchitecture_pgdata`) y reasignamos el puerto externo a `5433` para evitar conflictos con instalaciones locales.
    - Confirmamos el correcto arranque ejecutando `npm run db:migrate`.

11. **Evolucion de la base de datos**
    - Creamos `db/migrations/002_relax_id_types.sql` para permitir identificadores legibles (`VARCHAR(255)`).
    - Actualizamos el repositorio PostgreSQL y el caso de uso para aceptar `orderId` custom o generar UUIDs.

12. **Servicio HTTP y DX**
    - Aniadimos una portada en `/` con enlaces rapidos y ejemplos PowerShell en `/orders`.
    - Ajustamos el health check para usar el UUID `00000000-0000-0000-0000-000000000000`, registrando logs claros de exito o fallo.
    - Incorporamos un hook `onResponse` para dejar registro de todas las peticiones `POST` cuando el servidor se ejecuta con `npm run dev`.

13. **Mensajeria y outbox**
    - Implementamos `OutboxEventBus`, `OutboxDispatcher` y el script `src/infrastructure/messaging/outbox-dispatcher.ts`.
    - Aniadimos el comando `npm run worker:outbox`, saneando credenciales en logs y documentando como operar el worker.

14. **Diagnostico y compatibilidad con Windows**
    - Documentamos el uso de `curl.exe --%` y `Invoke-RestMethod` para enviar JSON sin problemas de escape.
    - Explicamos como manejar conflictos de puertos (`EADDRINUSE`) editando `.env` y validamos la reconexion automatica de Fastify.

15. **Documentacion y material de soporte**
    - Elaboramos `comandos.md`, `directrices.md`, `prompts.md` y esta cronologia para dejar constancia de decisiones clave.
    - Actualizamos el README con la descripcion del servicio, estructura, dependencias y referencias a la documentacion auxiliar.

16. **Estado actual**
    - El microservicio arranca con `npm run dev`, registra cada peticion `POST`, expone tutoriales para crear pedidos y delega la persistencia en PostgreSQL (o memoria mediante `USE_INMEMORY=true`).
    - Las migraciones estan al dia y el worker de outbox puede ejecutarse en paralelo desde la raiz del proyecto.
