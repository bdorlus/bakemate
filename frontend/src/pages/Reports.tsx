import { FormEvent, useState } from 'react';
import { getProfitAndLoss } from '../api/reports';
import type { ProfitAndLoss } from '../api/reports';

export default function Reports() {
  const [form, setForm] = useState({ start: '', end: '' });
  const [report, setReport] = useState<ProfitAndLoss | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await getProfitAndLoss(form.start, form.end);
      setReport(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Reports</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-x-2">
        <input
          aria-label="start"
          type="date"
          className="border p-2"
          value={form.start}
          onChange={(e) => setForm({ ...form, start: e.target.value })}
          required
        />
        <input
          aria-label="end"
          type="date"
          className="border p-2"
          value={form.end}
          onChange={(e) => setForm({ ...form, end: e.target.value })}
          required
        />
        <button type="submit" className="px-4 py-2 text-white bg-blue-600">
          Generate
        </button>
      </form>

      {report && (
        <div className="p-4 bg-white rounded shadow">
          <p>Total Revenue: {report.total_revenue}</p>
          <p>Cost of Goods Sold: {report.cost_of_goods_sold}</p>
          <p>Gross Profit: {report.gross_profit}</p>
          <p>Operating Expenses: {report.operating_expenses.total}</p>
          <p>Net Profit: {report.net_profit}</p>
        </div>
      )}
    </div>
  );
}
