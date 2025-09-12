import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });
  it('renders orders table after fetching', async () => {
    vi.spyOn(ordersApi, 'getOrders').mockResolvedValue({
      rows: [
        {
          id: '1',
          orderNo: '1001',
          customer: 'Alice',
          event: 'Birthday',
          status: 'Open',
          orderDate: '2025-01-01',
          dueDate: '2025-03-01',
          deliveryMethod: 'Pickup',
          total: 100,
          priority: 'Low',
        },
        {
          id: '2',
          orderNo: '1002',
          customer: 'Bob',
          event: 'Wedding',
          status: 'Open',
          orderDate: '2025-02-01',
          dueDate: '2025-03-02',
          deliveryMethod: 'Delivery',
          total: 200,
          priority: 'High',
        },
      ],
      page: 1,
      pageSize: 25,
      total: 2,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/1001/)).toBeInTheDocument();
    });
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('1001');
    expect(rows[2]).toHaveTextContent('1002');
    expect(ordersApi.getOrders).toHaveBeenCalled();
  });

  it('opens edit dialog when row clicked', async () => {
    vi.spyOn(ordersApi, 'getOrders').mockResolvedValue({
      rows: [
        {
          id: '1',
          orderNo: '1001',
          customer: 'Alice',
          event: 'Birthday',
          status: 'Open',
          orderDate: '2025-01-01',
          dueDate: '2025-03-01',
          deliveryMethod: 'Pickup',
          total: 100,
          priority: 'Low',
        },
      ],
      page: 1,
      pageSize: 25,
      total: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/1001/)).toBeInTheDocument();
    });

    screen.getByText('1001').closest('tr')?.click();
    expect(await screen.findByText('Edit Order')).toBeInTheDocument();
  });
});

