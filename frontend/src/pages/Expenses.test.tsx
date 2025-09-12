import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import * as expenseApi from '../api/expenses';
import Expenses from './Expenses';

vi.mock('../api/expenses');

describe('Expenses page', () => {
  it('creates expense via modal form', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));
    fireEvent.change(screen.getByLabelText('description'), {
      target: { value: 'Gas' }
    });
    fireEvent.change(screen.getByLabelText('amount'), {
      target: { value: '5' }
    });
    fireEvent.change(screen.getByLabelText('date'), {
      target: { value: '2024-01-01' }
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(expenseApi.createExpense).toHaveBeenCalledWith({
      description: 'Gas',
      amount: 5,
      date: '2024-01-01',
      category: undefined
    });
  });

  it('filters expenses by year', async () => {
    vi.mocked(expenseApi.listExpenses).mockResolvedValue([
      { id: '1', description: 'Gas', amount: 5, date: '2023-01-01' },
      { id: '2', description: 'Oil', amount: 7, date: '2024-02-01' }
    ]);

    render(
      <AuthProvider>
        <MemoryRouter>
          <Expenses />
        </MemoryRouter>
      </AuthProvider>
    );

    // Both entries visible
    await screen.findByText('2023-01-01');
    expect(screen.getByText('2024-02-01')).toBeInTheDocument();

    fireEvent.change(screen.getAllByLabelText('year')[1], {
      target: { value: '2024' }
    });

    await screen.findByText('2024-02-01');
    expect(screen.queryByText('2023-01-01')).not.toBeInTheDocument();
  });
});

