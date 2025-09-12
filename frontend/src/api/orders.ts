import apiClient from './index';

interface BackendOrder {
  id: string;
  order_number: string;
  customer_name?: string;
  event_type?: string;
  status: string;
  due_date: string;
  total_amount: number;
}

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
  const response = await apiClient.get<{ count: number }>(
    '/orders/summary',
    { params },
  );
  return { series: [], totals: { orders: response.data.count, revenue: 0 } };
}

export async function getOrders(params: OrdersQuery): Promise<OrdersResponse> {
  const { page, pageSize, status } = params;
  const response = await apiClient.get<BackendOrder[]>('/orders', {
    params: {
      skip: (page - 1) * pageSize,
      limit: pageSize,
      status,
    },
  });
  const rows: Order[] = response.data.map((o) => ({
    id: o.id,
    orderNo: o.order_number,
    customer: o.customer_name ?? '',
    event: o.event_type ?? '',
    status: o.status,
    dueDate: o.due_date,
    total: o.total_amount,
    priority: 'Normal',
  }));
  return { rows, page, pageSize, total: rows.length };
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

