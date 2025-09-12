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

(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;

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
        {
          id: '2',
          orderNo: '1002',
          customer: 'Bob',
          event: 'Wedding',
          status: 'Open',
          dueDate: '2025-03-02',
          total: 200,
          priority: 'High',
        },
      ],
      page: 1,
      pageSize: 25,
      total: 2,
    });
    vi.spyOn(ordersApi, 'getOrdersSummary').mockResolvedValue({
      series: [{ date: 'Jan', orders: 2, revenue: 300 }],
      totals: { orders: 2, revenue: 300 },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/1002/)).toBeInTheDocument();
    });
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('1002');
    expect(rows[2]).toHaveTextContent('1001');
    expect(ordersApi.getOrders).toHaveBeenCalled();
    expect(ordersApi.getOrdersSummary).toHaveBeenCalled();
  });
});

