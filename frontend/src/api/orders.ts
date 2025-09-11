import apiClient from './index';

export interface Order {
  id: string;
  order_number: string;
  status: string;
}

export async function listOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/orders');
  return response.data;
}

export async function createOrder(order: Omit<Order, 'id'>): Promise<Order> {
  const response = await apiClient.post<Order>('/orders', order);
  return response.data;
}

export async function updateOrder(
  id: string,
  order: Partial<Order>,
): Promise<Order> {
  const response = await apiClient.put<Order>(`/orders/${id}`, order);
  return response.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await apiClient.delete(`/orders/${id}`);
}

