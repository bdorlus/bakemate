import { FormEvent, useEffect, useState } from 'react';
import { listExpenses, createExpense } from '../api/expenses';
import type { Expense } from '../api/expenses';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ description: '', amount: '', date: '' });

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await listExpenses();
        setExpenses(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchExpenses();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const newExpense = await createExpense({
        description: form.description,
        amount: Number(form.amount),
        date: form.date
      });
      setExpenses((prev) => [...prev, newExpense]);
      setForm({ description: '', amount: '', date: '' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Expenses</h1>

      <form onSubmit={handleCreate} className="mb-6 space-x-2">
        <input
          aria-label="description"
          className="border p-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          required
        />
        <input
          aria-label="amount"
          className="border p-2"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Amount"
          required
        />
        <input
          aria-label="date"
          className="border p-2"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <button type="submit" className="px-4 py-2 text-white bg-blue-600">
          Add Expense
        </button>
      </form>

      <ul className="space-y-4">
        {expenses.map((exp) => (
          <li key={exp.id} className="p-4 bg-white rounded shadow">
            {exp.date}: {exp.description} (${exp.amount})
          </li>
        ))}
      </ul>
    </div>
  );
}
