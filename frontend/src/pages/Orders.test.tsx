import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import Orders from './Orders';
import * as ordersApi from '../api/orders';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-ignore
global.ResizeObserver = ResizeObserverMock;

const queryClient = new QueryClient();

describe('Orders page', () => {
  it('renders orders table after fetching', async () => {
    vi.spyOn(ordersApi, 'getOrders').mockResolvedValue({
      rows: [
        {
          id: '1',
          orderNo: '1001',
          customer: 'Alice',
          event: 'Birthday',
          status: 'Open',
          dueDate: '2025-03-01',
          total: 100,
          priority: 'Low',
        },
      ],
      page: 1,
      pageSize: 25,
      total: 1,
    });
    vi.spyOn(ordersApi, 'getOrdersSummary').mockResolvedValue({
      series: [],
      totals: { orders: 1, revenue: 100 },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/1001/)).toBeInTheDocument();
    });
  });
});

