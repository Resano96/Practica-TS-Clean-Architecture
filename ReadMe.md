# Microservicio de Pedidos

- **Dominio**: Order, Price, SKU, Quantity, eventos de dominio.
- **Application**: Casos de uso CreateOrder, AddItemToOrder, puertos y DTOs.
- **Infra**: Repositorio InMemory, pricing estatico, event bus no-op.
- **HTTP**: endpoints minimos con Fastify.
- **Composicion**: container.ts como comosition root.
- **Tests**: dominio + aceptacion de casos de uso.

## Comportamiento
- `POST /orders` crea un pedido
- `POST /orders/:orderId/items` agrega una linea (SKU + qty) con precio actual
- Devuelve el total del pedido

## Estructura de carpetas
/src
    /domain
        /entities
        /value-objects
        /events
        /errors
    /application
        /use-cases
        /ports
        /dto
        /errors.ts
    /infrastructure
        /persistence/in-memory
        /http/controllers
        /http
        /messaging
    /composition
    /shared
/tests