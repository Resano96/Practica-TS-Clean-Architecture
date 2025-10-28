import { Money } from './Money';
import { Quantity } from './Quantity';
import { SKU } from './SKU';
export class OrderItem {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        if (!OrderItem.isValid(props)) {
            throw new Error('Invalid order item');
        }
        return new OrderItem(props);
    }
    static isValid(props) {
        return (props instanceof Object &&
            props.sku instanceof SKU &&
            props.unitPrice instanceof Money &&
            props.quantity instanceof Quantity);
    }
    get sku() {
        return this.props.sku;
    }
    get unitPrice() {
        return this.props.unitPrice;
    }
    get quantity() {
        return this.props.quantity;
    }
    addQuantity(extra) {
        return new OrderItem({
            ...this.props,
            quantity: this.props.quantity.add(extra),
        });
    }
    equals(other) {
        return this.props.sku.equals(other.props.sku);
    }
    total() {
        return this.props.unitPrice.multiply(this.props.quantity.value);
    }
}
//# sourceMappingURL=OrderItem.js.map