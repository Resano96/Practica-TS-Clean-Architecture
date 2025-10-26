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

## Ejemplos de comandos
- Crear un pedido:
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER-001",
    "customerId": "CUSTOMER-123",
    "items": [
      { "sku": "SKU-ABC", "quantity": 2 },
      { "sku": "SKU-XYZ", "quantity": 1 }
    ]
  }'
```

- Agregar una linea a un pedido existente:
```bash
curl -X POST http://localhost:3000/orders/ORDER-001/items \
  -H "Content-Type: application/json" \
  -d '{ "sku": "SKU-ABC", "quantity": 1 }'
```

## Estructura de carpetas
```text
src
|-- application
|   |-- dto
|   |-- ports
|   `-- use-cases
|-- composition
|-- domain
|   |-- entities
|   |-- errors
|   |-- events
|   `-- value-objects
|-- infrastructure
|   |-- http
|   |   `-- controllers
|   |-- messaging
|   `-- persistence
|       `-- in-memory
`-- shared
tests
```
