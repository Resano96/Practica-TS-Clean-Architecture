-- Allow human-friendly identifiers by converting UUID columns to VARCHAR.

-- Drop dependent foreign key to adjust column types.
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_order;

ALTER TABLE orders
  ALTER COLUMN id TYPE VARCHAR(255) USING id::text,
  ALTER COLUMN customer_id TYPE VARCHAR(255) USING customer_id::text;

ALTER TABLE order_items
  ALTER COLUMN id TYPE VARCHAR(255) USING id::text,
  ALTER COLUMN order_id TYPE VARCHAR(255) USING order_id::text,
  ALTER COLUMN product_id TYPE VARCHAR(255) USING product_id::text;

ALTER TABLE outbox
  ALTER COLUMN id TYPE VARCHAR(255) USING id::text,
  ALTER COLUMN aggregate_id TYPE VARCHAR(255) USING aggregate_id::text;

-- Recreate foreign key with the new type.
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id);
