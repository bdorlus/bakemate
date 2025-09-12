import apiClient from './index';
import type { OrdersOverTime, RevenueOverTime } from './dashboard';

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

export async function getOrdersSummary(range: string): Promise<OrdersSummaryResponse> {
  const [ordersRes, revenueRes] = await Promise.all([
    apiClient.get<OrdersOverTime[]>('/dashboard/orders', { params: { range } }),
    apiClient.get<RevenueOverTime[]>('/dashboard/revenue', { params: { range } }),
  ]);

  const revenueMap = new Map(revenueRes.data.map((r) => [r.date, r.revenue]));
  const series: OrdersSummaryPoint[] = ordersRes.data.map((o) => ({
    date: o.date,
    orders: o.count,
    revenue: revenueMap.get(o.date) ?? 0,
  }));
  const totals = series.reduce(
    (acc, cur) => ({
      orders: acc.orders + cur.orders,
      revenue: acc.revenue + cur.revenue,
    }),
    { orders: 0, revenue: 0 },
  );
  return { series, totals };
}

export async function getOrders(params: OrdersQuery): Promise<OrdersResponse> {
  const { status, start, end } = params;
  // Fetch all orders in batches (API max limit 200) and then filter by date range client-side
  const batchSize = 200;
  let skip = 0;
  const all: BackendOrder[] = [];
  while (true) {
    const resp = await apiClient.get<BackendOrder[]>('/orders', {
      params: { skip, limit: batchSize, status },
    });
    const batch = resp.data;
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < batchSize) break;
    skip += batchSize;
  }

  let filtered = all;
  if (start || end) {
    const startTs = start ? Date.parse(start) : Number.NEGATIVE_INFINITY;
    const endTs = end ? Date.parse(end) : Number.POSITIVE_INFINITY;
    filtered = all.filter((o) => {
      const ts = Date.parse(o.due_date);
      return ts >= startTs && ts <= endTs;
    });
  }

  const rows: Order[] = filtered.map((o) => ({
    id: o.id,
    orderNo: o.order_number,
    customer: o.customer_name ?? '',
    event: o.event_type ?? '',
    status: o.status,
    dueDate: o.due_date,
    total: o.total_amount,
    priority: 'Normal',
  }));

  return { rows, page: 1, pageSize: rows.length, total: rows.length };
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
