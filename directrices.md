## Directrices del proyecto

### Entorno y configuracion
- Trabajamos con Node.js 18+ y npm 9+; todo comando se lanza desde la raiz `Practica TS Clean Architecture`.
- Docker Desktop debe estar activo para usar PostgreSQL; el contenedor se expone en `localhost:5433`.
- `.env` controla `PORT`, `HOST`, `DATABASE_URL`, `USE_INMEMORY`, `USE_POSTGRES`, `LOG_PRETTY`, `LOG_COLOR` y `LOG_LEVEL`.
- Cuando `USE_INMEMORY=true` el contenedor inyecta `InMemoryOrderRepository`; con `USE_POSTGRES=true` se usa `PostgresOrderRepository`.

### Arquitectura y codigo
- Mantenemos la separacion por capas: `domain` (reglas puras), `application` (casos de uso), `infrastructure` (adaptadores), `composition` (wiring) y `shared`.
- Los imports usan aliases de TypeScript (`@domain/*`, `@application/*`, etc.), definidos en `tsconfig.json` y replicados en `vitest.config.ts`.
- No mezclar logica de infraestructura dentro del dominio; la comunicacion se realiza mediante puertos y DTOs.
- La clase `Result` se utiliza para retornar exito/fracaso desde los casos de uso evitando excepciones en el flujo normal.

### Dominio y reglas de negocio
- `Order` agrega items con `SKU`, `Quantity` y `Money`; valida que las cantidades sean positivas y que el precio exista.
- `CreateOrder` permite enviar un `orderId` propio o genera un UUID cuando se omite.
- `StaticPricingService` almacena tarifas en memoria y normaliza `SKU` a mayusculas; ante ausencia de precio lanza error para que la capa de aplicacion responda con `validation`.
- Los eventos de dominio y errores se mantienen en `src/domain/events` y `src/application/errors` respectivamente para garantizar trazabilidad.

### HTTP y experiencia de desarrollo
- Fastify registra `/`, `/health`, `/orders` y `/orders/:orderId/items`; el controlador `OrdersController` centraliza validacion y respuestas.
- Se usa `app.addHook('onResponse', ...)` para loguear cada peticion `POST` cuando el servidor corre con `npm run dev`.
- `main.ts` implementa fallback de puertos y captura `SIGINT`/`SIGTERM` para cerrar Fastify y liberar el pool de Postgres.
- El endpoint `/orders` actua como tutorial: muestra comandos PowerShell listos para ejecutar.

### Persistencia y migraciones
- Las migraciones SQL viven en `db/migrations`; se ejecutan en orden alfabetico mediante `scripts/migrate.ts`.
- `scripts/migrate.ts` lee `DATABASE_URL` de variables de entorno o del archivo `.env` y usa la tabla `schema_migrations` para evitar duplicados.
- La migracion `002_relax_id_types.sql` cambia IDs a `VARCHAR(255)` para permitir identificadores legibles.
- Para forzar un reseteo limpio se debe bajar el stack (`npm run db:down`) y borrar el volumen `practicatscleanarchitecture_pgdata`.

### Mensajeria y outbox
- El caso de uso publica eventos a traves de `EventBus`; la implementacion por defecto es `OutboxEventBus`, que persiste en la tabla outbox.
- `npm run worker:outbox` ejecuta `src/infrastructure/messaging/outbox-dispatcher.ts`, que lee la cola, emite logs y marca eventos como enviados.
- Las credenciales se anonimizan en logs del worker para evitar exponer contrasenas.

### Logging y observabilidad
- `PinoLogger` es el logger unificado; por defecto utiliza `pino-pretty` en desarrollo (`NODE_ENV` no definido o `development`).
- `LOG_PRETTY=false` desactiva el transporte formateado y `LOG_COLOR=false` deshabilita colores cuando se usa `pino-pretty`.
- El health check intenta leer un pedido con ID `00000000-0000-0000-0000-000000000000` y loguea exito o fallo con contexto.

### Pruebas y calidad
- Usamos Vitest (`npm test`) para suites de dominio, aplicacion, infraestructura y aceptacion dentro de `tests/`.
- Las pruebas unitarias deben cubrir invariantes del dominio; las de aceptacion validan escenarios completos de `CreateOrder` y `AddItemToOrder`.
- Antes de enviar cambios se recomienda ejecutar `npm run build` y `npm test` para asegurar tipado y reglas de negocio.

### Operaciones y soporte
- Si `npm run dev` muestra `EADDRINUSE`, ajustar `PORT` en `.env` o cerrar el proceso que ocupa el puerto.
- Para enviar JSON desde Windows, preferir `Invoke-RestMethod`; si se usa `curl.exe`, anteponer `--%` para evitar reescapes.
- Documentacion complementaria: `orden.md` (cronologia), `comandos.md` (instrucciones), `prompts.md` (conversaciones) y `ReadMe.md` (vision general).
