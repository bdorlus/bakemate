import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Orders from './Orders';
import * as ordersApi from '../api/orders';

describe('Orders page', () => {
  it('renders orders from API', async () => {
    vi.spyOn(ordersApi, 'listOrders').mockResolvedValue([
      { id: '1', order_number: '1001', status: 'new' },
    ]);

    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText(/1001/)).toBeInTheDocument();
    });
  });
});

