import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import * as expenseApi from '../api/expenses';
import Expenses from './Expenses';

vi.mock('../api/expenses');

describe('Expenses page', () => {
  it('creates expense via form', async () => {
    vi.mocked(expenseApi.listExpenses).mockResolvedValue([]);
    vi.mocked(expenseApi.createExpense).mockResolvedValue({
      id: '1',
      description: 'Gas',
      amount: 5,
      date: '2024-01-01'
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <Expenses />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText('description'), {
      target: { value: 'Gas' }
    });
    fireEvent.change(screen.getByLabelText('amount'), {
      target: { value: '5' }
    });
    fireEvent.change(screen.getByLabelText('date'), {
      target: { value: '2024-01-01' }
    });
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    expect(expenseApi.createExpense).toHaveBeenCalledWith({
      description: 'Gas',
      amount: 5,
      date: '2024-01-01'
    });
  });
});

