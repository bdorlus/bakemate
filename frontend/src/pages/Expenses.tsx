import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { listExpenses, createExpense } from '../api/expenses';
import type { Expense } from '../api/expenses';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: '',
    category: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [yearFilter, setYearFilter] = useState('');

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

  const years = useMemo(
    () => [...new Set(expenses.map((e) => new Date(e.date).getFullYear()))],
    [expenses]
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((e) =>
        yearFilter ? new Date(e.date).getFullYear().toString() === yearFilter : true
      ),
    [expenses, yearFilter]
  );

  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      { accessorKey: 'date', header: 'Date' },
      { accessorKey: 'description', header: 'Description' },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: (info) => `$${info.getValue<number>().toFixed(2)}`
      }
    ],
    []
  );

  const table = useReactTable({
    data: filteredExpenses,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const newExpense = await createExpense({
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        category: form.category || undefined
      });
      setExpenses((prev) => [...prev, newExpense]);
      setForm({ description: '', amount: '', date: '', category: '' });
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Expenses</h1>

      <div className="mb-4 flex items-center gap-4">
        <select
          aria-label="year"
          className="border p-2"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y.toString()}>
              {y}
            </option>
          ))}
        </select>
        <button
          className="px-4 py-2 text-white bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Add Expense
        </button>
      </div>

      <table className="min-w-full bg-white rounded shadow">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 text-left">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <form
            onSubmit={handleCreate}
            className="space-y-2 rounded bg-white p-4 shadow"
          >
            <input
              aria-label="description"
              className="w-full border p-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
              required
            />
            <input
              aria-label="amount"
              className="w-full border p-2"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount"
              required
            />
            <input
              aria-label="date"
              className="w-full border p-2"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <input
              aria-label="category"
              className="w-full border p-2"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Category"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 px-4 py-2 text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
