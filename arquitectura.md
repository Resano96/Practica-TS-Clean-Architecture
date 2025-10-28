# Arquitectura del proyecto

```text
.
|-- ReadMe.md                      # Resumen general, dependencias y enlaces utiles
|-- arquitectura.md                # Este esquema de arquitectura y estructura
|-- comandos.md                    # Instrucciones operativas y llamadas HTTP
|-- directrices.md                 # Decisiones tecnicas y buenas practicas
|-- orden.md                       # Cronologia detallada de la construccion
|-- .env                           # Variables de entorno usadas en desarrollo
|-- docker-compose.yml             # Servicio PostgreSQL 16 con volumen persistente
|-- db/
|   `-- migrations/
|       |-- 001_init.sql           # Crea tablas orders, order_items y outbox
|       `-- 002_relax_id_types.sql # Convierte IDs a VARCHAR(255) y rehace claves
|-- scripts/
|   `-- migrate.ts                 # Runner TypeScript que aplica migraciones
|-- src/
|   |-- main.ts                    # Punto de entrada que reexporta application/main
|   |-- application/
|   |   |-- main.ts                # Arranque de Fastify con fallback de puertos
|   |   |-- errors.ts              # Errores de aplicacion con tipado uniforme
|   |   |-- dto/
|   |   |   |-- CreateOrderDTO.ts      # Contrato para crear pedidos
|   |   |   `-- AddItemToOrderDTO.ts   # Contrato para agregar articulos
|   |   |-- ports/
|   |   |   |-- Clock.ts               # Abstraccion del reloj del sistema
|   |   |   |-- EventBus.ts            # Puerto para publicar eventos de dominio
|   |   |   |-- Logger.ts              # Interface de logging agnostica
|   |   |   |-- OrderRepository.ts     # Operaciones de persistencia de pedidos
|   |   |   |-- PricingService.ts      # Cotas para calcular precios unitarios
|   |   |   |-- ServerDependencies.ts  # Dependencias que suministra el contenedor
|   |   |   `-- UnitOfWork.ts          # Contrato de transaccion para persistencia
|   |   `-- use-cases/
|   |       |-- CreateOrder.ts         # Caso de uso para crear pedidos completos
|   |       `-- AddItemToOrder.ts      # Caso de uso para anadir lineas a pedidos
|   |-- composition/
|   |   |-- config.ts                  # Carga de configuracion y helpers para env
|   |   `-- container.ts               # Composicion de dependencias e inicializacion
|   |-- domain/
|   |   |-- entities/
|   |   |   `-- Order.ts               # Agregado principal con reglas de negocio
|   |   |-- errors/
|   |   |   `-- DomainError.ts         # Jerarquia base de errores de dominio
|   |   |-- events/
|   |   |   `-- OrderCreatedEvent.ts   # Ejemplo de evento emitido desde el dominio
|   |   `-- value-objects/
|   |       |-- Currency.ts            # Valor objeto para monedas soportadas
|   |       |-- Money.ts               # Valor monetario con validaciones
|   |       |-- OrderItem.ts           # Item del pedido con precio calculado
|   |       |-- Quantity.ts            # Cantidad positiva de articulos
|   |       `-- SKU.ts                 # Identificador de producto normalizado
|   |-- infrastructure/
|   |   |-- database/
|   |   |   `-- DatabaseFactory.ts     # Helpers para crear y cerrar pools de PG
|   |   |-- http/
|   |   |   |-- StaticPricingService.ts    # Servicio de precios in-memory basado en tabla fija
|   |   |   |-- server.ts                  # Configuracion de Fastify y rutas publicas
|   |   |   `-- controllers/
|   |   |       `-- OrdersController.ts    # Controlador HTTP que orquesta casos de uso
|   |   |-- logging/
|   |   |   `-- PinoLogger.ts          # Adaptador al puerto Logger usando pino
|   |   |-- messaging/
|   |   |   |-- DatabaseFactory.ts     # Construye conexiones para el worker outbox
|   |   |   |-- MessagingFactory.ts    # Factorias para bus de eventos y dispatcher
|   |   |   |-- OutboxDispatcher.ts    # Clase que procesa la tabla outbox
|   |   |   |-- OutboxEventBus.ts      # Implementacion de EventBus basada en outbox
|   |   |   `-- outbox-dispatcher.ts   # Entrada ejecutable para npm run worker:outbox
|   |   |-- observability/
|   |   |   `-- PinoLogger.ts          # Reexport para canalizar logs en otros contextos
|   |   `-- persistence/
|   |       |-- in-memory/
|   |       |   `-- InMemoryOrderRepository.ts # Repositorio simple para pruebas y demos
|   |       `-- postgres/
|   |           |-- PgUnitOfWork.ts           # Implementacion de UnitOfWork sobre PG
|   |           `-- PostgresOrderRepository.ts # Repositorio de pedidos en PostgreSQL
|   `-- shared/
|       `-- Result.ts                  # Tipo utilitario para operaciones exitosa/fracaso
|-- tests/
|   |-- domain/                        # Pruebas unitarias de reglas de dominio
|   |-- application/                   # Pruebas sobre casos de uso
|   |-- acceptance/                    # Escenarios end-to-end con flujos completos
|   `-- infrastructure/                # Tests de adaptadores (repositorios, logging, etc.)
`-- vitest.config.ts                   # Configuracion de Vitest con aliases y entorno
```

> El arbol incluye los componentes mas relevantes; algunos ficheros auxiliares (p.ej. configuraciones adicionales o subtests) se omiten para mantener el enfoque en la arquitectura principal.
