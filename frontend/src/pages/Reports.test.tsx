import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import * as reportsApi from '../api/reports';
import Reports from './Reports';

vi.mock('../api/reports');

describe('Reports page', () => {
  it('fetches profit and loss report', async () => {
    vi.mocked(reportsApi.getProfitAndLoss).mockResolvedValue({
      total_revenue: 100,
      cost_of_goods_sold: 40,
      gross_profit: 60,
      operating_expenses: { total: 10, by_category: { rent: 10 } },
      net_profit: 50
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <Reports />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText('start'), {
      target: { value: '2024-01-01' }
    });
    fireEvent.change(screen.getByLabelText('end'), {
      target: { value: '2024-01-31' }
    });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    expect(reportsApi.getProfitAndLoss).toHaveBeenCalledWith(
      '2024-01-01',
      '2024-01-31'
    );
  });
});

