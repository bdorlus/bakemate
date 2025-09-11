import { describe, expect, it, vi } from 'vitest';
import { AxiosResponse } from 'axios';
import apiClient from './index';
import { getOrders, getOrdersSummary, OrdersQuery, OrdersSummaryResponse, OrdersResponse } from './orders';

describe('orders API', () => {
  it('fetches orders list with params', async () => {
    const params: OrdersQuery = {
      start: '2025-01-01',
      end: '2025-01-31',
      status: 'Open',
      groupBy: 'none',
      page: 1,
      pageSize: 25,
    };
    const data: OrdersResponse = { rows: [], page: 1, pageSize: 25, total: 0 };
    const spy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data } as AxiosResponse<OrdersResponse>);

    const result = await getOrders(params);
    expect(spy).toHaveBeenCalledWith('/orders', { params });
    expect(result).toEqual(data);
    spy.mockRestore();
  });

  it('fetches orders summary', async () => {
    const summary: OrdersSummaryResponse = {
      series: [],
      totals: { orders: 0, revenue: 0 },
    };
    const spy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: summary } as AxiosResponse<OrdersSummaryResponse>);

    const result = await getOrdersSummary({ start: '2025-01-01', end: '2025-01-31', status: 'Open' });
    expect(spy).toHaveBeenCalledWith('/orders/summary', { params: { start: '2025-01-01', end: '2025-01-31', status: 'Open' } });
    expect(result).toEqual(summary);
    spy.mockRestore();
  });
});

