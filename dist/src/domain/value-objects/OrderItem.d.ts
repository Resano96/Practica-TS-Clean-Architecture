import { Money } from './Money';
import { Quantity } from './Quantity';
import { SKU } from './SKU';
export interface OrderItemProps {
    sku: SKU;
    unitPrice: Money;
    quantity: Quantity;
}
export declare class OrderItem {
    private readonly props;
    private constructor();
    static create(props: OrderItemProps): OrderItem;
    static isValid(props: OrderItemProps): boolean;
    get sku(): SKU;
    get unitPrice(): Money;
    get quantity(): Quantity;
    addQuantity(extra: Quantity): OrderItem;
    equals(other: OrderItem): boolean;
    total(): Money;
}
