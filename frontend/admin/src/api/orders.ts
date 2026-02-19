import { queryOptions } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Order } from './types';

export function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders');
}

export function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}

export const ordersQueryOptions = queryOptions({
  queryKey: ['orders'],
  queryFn: getOrders,
});

export const orderQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['orders', id],
    queryFn: () => getOrder(id),
  });
