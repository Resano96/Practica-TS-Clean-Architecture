import { Money } from './Money';
import { Quantity } from './Quantity';
import { SKU } from './SKU';

export interface OrderItemProps {
  sku: SKU;
  unitPrice: Money;
  quantity: Quantity;
}

export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {}

  static create(props: OrderItemProps): OrderItem {
    if (!OrderItem.isValid(props)) {
      throw new Error('Invalid order item');
    }

    return new OrderItem(props);
  }

  static isValid(props: OrderItemProps): boolean {
    return (
      props instanceof Object &&
      props.sku instanceof SKU &&
      props.unitPrice instanceof Money &&
      props.quantity instanceof Quantity
    );
  }

  get sku(): SKU {
    return this.props.sku;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  addQuantity(extra: Quantity): OrderItem {
    return new OrderItem({
      ...this.props,
      quantity: this.props.quantity.add(extra),
    });
  }

  equals(other: OrderItem): boolean {
    return this.props.sku.equals(other.props.sku);
  }

  total(): Money {
    return this.props.unitPrice.multiply(this.props.quantity.value);
  }
}
