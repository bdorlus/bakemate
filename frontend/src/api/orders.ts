import apiClient from './index';

export interface Order {
  id: string;
  orderNo: string;
  customer: string;
  event: string;
  status: string;
  dueDate: string;
  total: number;
  priority: string;
}

export interface OrdersSummaryPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface OrdersSummaryResponse {
  series: OrdersSummaryPoint[];
  totals: { orders: number; revenue: number };
}

export interface OrdersResponse {
  rows: Order[];
  page: number;
  pageSize: number;
  total: number;
}

export interface OrdersQuery {
  start: string;
  end: string;
  status: string;
  groupBy: string;
  page: number;
  pageSize: number;
  sort?: string;
  filters?: Record<string, string>;
}

export async function getOrdersSummary(params: {
  start: string;
  end: string;
  status: string;
}): Promise<OrdersSummaryResponse> {
  const response = await apiClient.get<OrdersSummaryResponse>(
    '/orders/summary',
    { params },
  );
  return response.data;
}

export async function getOrders(params: OrdersQuery): Promise<OrdersResponse> {
  const response = await apiClient.get<OrdersResponse>('/orders', {
    params,
  });
  return response.data;
}

export async function createOrder(
  order: Omit<Order, 'id'>,
): Promise<Order> {
  const response = await apiClient.post<Order>('/orders', order);
  return response.data;
}

export async function updateOrder(
  id: string,
  order: Partial<Order>,
): Promise<Order> {
  const response = await apiClient.patch<Order>(`/orders/${id}`, order);
  return response.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await apiClient.delete(`/orders/${id}`);
}

