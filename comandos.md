## Comandos del proyecto

> Ejecuta los comandos desde la raiz `Practica TS Clean Architecture`. En Windows usa PowerShell; en macOS/Linux puedes usar Bash (sustituye `curl.exe` por `curl` y elimina los acentos circunflejos `^`).

### 1. Preparacion del entorno (PowerShell)
- `node -v` y `npm -v` &rarr; comprueba que tienes Node.js >= 18 y npm >= 9.
- `npm install` &rarr; instala las dependencias declaradas en `package.json`.
- `winget install -e --id Docker.DockerDesktop --accept-source-agreements --accept-package-agreements` &rarr; instala Docker Desktop si aun no esta disponible.
- `docker --version` &rarr; confirma que la CLI de Docker funciona antes de levantar la base de datos.

### 2. Base de datos PostgreSQL (PowerShell)
- `npm run db:up` &rarr; levanta el servicio `postgres` de `docker-compose.yml` (expone `localhost:5433`).
- `npm run db:migrate` &rarr; ejecuta las migraciones de `db/migrations` mediante `scripts/migrate.ts`.
- `npm run db:down` &rarr; detiene el stack de Docker Compose.
- `docker volume rm practicatscleanarchitecture_pgdata` &rarr; elimina el volumen persistente para empezar desde cero.
- `docker logs practicatscleanarchitecture-postgres-1 --tail 50` &rarr; inspecciona los logs del contenedor.
- `docker exec -it practicatscleanarchitecture-postgres-1 psql -U postgres -d orders` &rarr; abre una sesion `psql` dentro del contenedor.

### 3. Servidor de la API y procesos auxiliares (PowerShell)
- `npm run dev` &rarr; arranca Fastify en desarrollo (usa el `PORT` de `.env`, 3001 por defecto, y registra cada peticion `POST`).
- `npm run worker:outbox` &rarr; inicia el despachador de eventos outbox.
- `npm run build` &rarr; compila la aplicacion a `dist/`.
- `npm start` &rarr; ejecuta la version compilada (`node dist/main.js`).
- `npm test` &rarr; lanza la suite de Vitest en modo batch.
- `npm run test:watch` &rarr; ejecuta Vitest en modo observacion continua.

### 4. Comandos HTTP para pedidos (PowerShell)
> Sustituye `http://localhost:3001` por la URL que muestre `npm run dev` si cambiaste `HOST` o `PORT`.

**Crear un pedido (PowerShell idiomatico)**
```powershell
$body = @{
  orderId    = "ORDER-001"      # Opcional: se genera UUID si se omite
  customerId = "CUSTOMER-123"
  items      = @(
    @{ sku = "SKU-ABC"; quantity = 2 }
    @{ sku = "SKU-XYZ"; quantity = 1 }
  )
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3001/orders" `
  -ContentType "application/json" -Body $body
```

**Crear un pedido (CMD/WSL)**
```bash
curl.exe --% -X POST http://localhost:3001/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"customerId\":\"CUSTOMER-123\",\"items\":[{\"sku\":\"SKU-ABC\",\"quantity\":2},{\"sku\":\"SKU-XYZ\",\"quantity\":1}]}"
```

**Anadir un articulo a un pedido existente**
```powershell
$body = @{
  sku      = "SKU-ABC"
  quantity = 1
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3001/orders/ORDER-001/items" `
  -ContentType "application/json" -Body $body
```

### 5. Comprobaciones rapidas
- `curl.exe --% -X GET http://localhost:3001/health` &rarr; valida el estado del servicio.
- `Invoke-RestMethod -Uri "http://localhost:3001/orders"` &rarr; muestra el tutorial embebido en la API.

### 6. Limpieza y soporte
- `npm run db:down` seguido de `docker volume rm practicatscleanarchitecture_pgdata` &rarr; deja la base de datos en blanco.
- `npm run db:up && npm run db:migrate` &rarr; reconstruye el entorno despues de limpiar.
- `Get-Content .env` &rarr; revisa las variables de entorno activas cuando sospeches de puertos o credenciales.
