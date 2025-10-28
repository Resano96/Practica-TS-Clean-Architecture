export interface CreateOrderItemDTO {
  sku: string;
  quantity: number;
}

export interface CreateOrderDTO {
  orderId?: string;
  customerId: string;
  items: CreateOrderItemDTO[];
}
