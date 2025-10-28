import { randomUUID } from 'node:crypto';
import { OrderRepository } from '@application/ports/OrderRepository';
import { Order } from '@domain/entities/Order';
import { OrderItem } from '@domain/value-objects/OrderItem';
import { Quantity } from '@domain/value-objects/Quantity';
import { Money } from '@domain/value-objects/Money';
import { SKU } from '@domain/value-objects/SKU';

type QueryResult<T> = { rows: T[] };

export interface PgClient {
  query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
  release(): void;
}

export interface PgPool {
  connect(): Promise<PgClient>;
  query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

type OrderRow = {
  id: string;
  customer_id: string;
  status: string;
  total_amount: string | number;
  created_at: Date | string;
  updated_at: Date | string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: string | number;
  created_at: Date | string;
};

const DEFAULT_STATUS = 'CREATED';
const DEFAULT_CURRENCY = 'USD';

export class PostgresOrderRepository implements OrderRepository {
  constructor(
    private readonly pool: PgPool,
    private readonly transactionalClient?: PgClient,
  ) {}

  private async withClient<T>(
    handler: (client: PgClient, managed: boolean) => Promise<T>,
  ): Promise<T> {
    if (this.transactionalClient) {
      return handler(this.transactionalClient, false);
    }

    const client = await this.pool.connect();
    try {
      return await handler(client, true);
    } finally {
      client.release();
    }
  }

  async save(order: Order): Promise<void> {
    await this.withClient(async (client, managed) => {
      let transactionStarted = false;

      try {
        if (managed) {
          await client.query('BEGIN');
          transactionStarted = true;
        }

        const items = order.itemsList();

        const totalAmount = items.reduce(
          (sum, item) => sum + item.total().amount,
          0,
        );

        const now = new Date();

        await client.query(
          `
            INSERT INTO orders (id, customer_id, status, total_amount, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              customer_id = EXCLUDED.customer_id,
              status = EXCLUDED.status,
              total_amount = EXCLUDED.total_amount,
              updated_at = EXCLUDED.updated_at
          `,
          [order.id, order.customerId, DEFAULT_STATUS, totalAmount, order.createdAt, now],
        );

        await client.query('DELETE FROM order_items WHERE order_id = $1', [order.id]);

        if (items.length > 0) {
          const values: string[] = [];
          const params: unknown[] = [];

          items.forEach((item, index) => {
            const base = index * 6;
            values.push(
              `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`,
            );
            params.push(
              randomUUID(),
              order.id,
              item.sku.value,
              item.quantity.value,
              item.unitPrice.amount,
              now,
            );
          });

          await client.query(
            `
              INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, created_at)
              VALUES ${values.join(', ')}
            `,
            params,
          );
        }

        if (transactionStarted) {
          await client.query('COMMIT');
        }
      } catch (error) {
        if (transactionStarted) {
          try {
            await client.query('ROLLBACK');
          } catch {
            // ignore rollback errors to avoid masking the original failure
          }
        }
        throw error;
      }
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.withClient(async (client) => {
      const orderResult = await client.query<OrderRow>(
        `
          SELECT id, customer_id, status, total_amount, created_at, updated_at
          FROM orders
          WHERE id = $1
        `,
        [id],
      );

      if (orderResult.rows.length === 0) {
        return null;
      }

      const orderRow = orderResult.rows[0];

      const itemsResult = await client.query<OrderItemRow>(
        `
          SELECT id, order_id, product_id, quantity, unit_price, created_at
          FROM order_items
          WHERE order_id = $1
          ORDER BY created_at ASC
        `,
        [id],
      );

      const items = itemsResult.rows.map((itemRow) =>
        OrderItem.create({
          sku: SKU.create(itemRow.product_id),
          quantity: Quantity.create(Number(itemRow.quantity)),
          unitPrice: Money.create(Number(itemRow.unit_price), DEFAULT_CURRENCY),
        }),
      );

      const order = Order.create({
        id: orderRow.id,
        customerId: orderRow.customer_id,
        createdAt: new Date(orderRow.created_at),
        items,
      });

      order.pullDomainEvents();

      return order;
    });
  }
}
