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
  // Backend expects multipart/form-data with field aliases: date, description, amount
  const fd = new FormData();
  fd.append('date', expense.date);
  fd.append('description', expense.description);
  fd.append('amount', String(expense.amount));
  if (expense.category) fd.append('category', expense.category);
  const response = await apiClient.post<Expense>('/expenses/', fd);
  return response.data;
}

export async function updateExpense(
  id: string,
  expense: Partial<ExpenseInput>
): Promise<Expense> {
  // Use multipart for updates; field aliases match server: date, description, amount, category
  const fd = new FormData();
  if (expense.date !== undefined) fd.append('date', expense.date);
  if (expense.description !== undefined) fd.append('description', expense.description);
  if (expense.amount !== undefined) fd.append('amount', String(expense.amount));
  if (expense.category !== undefined) fd.append('category', expense.category);
  const response = await apiClient.put<Expense>(`/expenses/${id}/`, fd);
  return response.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}
