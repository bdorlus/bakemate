import { FormEvent, useEffect, useState } from 'react';
import { listMileageLogs, createMileageLog } from '../api/mileage';
import type { MileageLog } from '../api/mileage';

export default function Mileage() {
  const [logs, setLogs] = useState<MileageLog[]>([]);
  const [form, setForm] = useState({ date: '', distance: '', description: '' });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await listMileageLogs();
        setLogs(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLogs();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const newLog = await createMileageLog({
        date: form.date,
        distance: Number(form.distance),
        description: form.description
      });
      setLogs((prev) => [...prev, newLog]);
      setForm({ date: '', distance: '', description: '' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mileage Logs</h1>

      <form onSubmit={handleCreate} className="mb-6 space-x-2">
        <input
          aria-label="date"
          className="border p-2"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          aria-label="distance"
          className="border p-2"
          type="number"
          step="0.1"
          value={form.distance}
          onChange={(e) => setForm({ ...form, distance: e.target.value })}
          placeholder="Miles"
          required
        />
        <input
          aria-label="description"
          className="border p-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
        />
        <button type="submit" className="px-4 py-2 text-white bg-blue-600">
          Add Log
        </button>
      </form>

      <ul className="space-y-4">
        {logs.map((log) => (
          <li key={log.id} className="p-4 bg-white rounded shadow">
            {log.date}: {log.distance} mi - {log.description || 'N/A'} ({
              log.reimbursement
            }
            )
          </li>
        ))}
      </ul>
    </div>
  );
}
