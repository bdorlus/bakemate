import apiClient from './index';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
}

export type ExpenseInput = Omit<Expense, 'id'>;

export async function listExpenses(): Promise<Expense[]> {
  const response = await apiClient.get<Expense[]>('/expenses');
  return response.data;
}

export async function createExpense(expense: ExpenseInput): Promise<Expense> {
  const response = await apiClient.post<Expense>('/expenses', expense);
  return response.data;
}

export async function updateExpense(
  id: string,
  expense: Partial<ExpenseInput>
): Promise<Expense> {
  const response = await apiClient.put<Expense>(`/expenses/${id}`, expense);
  return response.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}

