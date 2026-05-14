import { products, getProductBySlug } from "@/data/products";
import type { OrderRecord } from "@/store/order-store";

const orderStore: OrderRecord[] = [];

export function getAllProducts() {
  return products;
}

export function getSingleProduct(slug: string) {
  return getProductBySlug(slug);
}

export function getAllOrders() {
  return orderStore;
}

export function createOrder(order: OrderRecord) {
  orderStore.unshift(order);
  return order;
}
