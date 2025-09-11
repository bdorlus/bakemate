import { Download, Plus } from 'lucide-react';

interface Props {
  groupBy: string;
  onGroupChange: (value: string) => void;
  onAdd: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function OrdersToolbar({
  groupBy,
  onGroupChange,
  onAdd,
  onExportCSV,
  onExportPDF,
}: Props) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <label className="text-sm">Group by:</label>
        <select
          value={groupBy}
          onChange={(e) => onGroupChange(e.target.value)}
          className="border rounded-md p-1 text-sm"
        >
          <option value="none">None</option>
          <option value="event">Event type</option>
          <option value="customer">Customer</option>
          <option value="status">Status</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          <Plus size={16} /> Add Order
        </button>
        <div className="relative">
          <button
            className="flex items-center gap-1 border px-3 py-1 rounded-md text-sm"
            onClick={onExportCSV}
            aria-label="Export CSV"
          >
            <Download size={16} /> CSV
          </button>
        </div>
        <button
          onClick={onExportPDF}
          className="border px-3 py-1 rounded-md text-sm"
        >
          PDF
        </button>
      </div>
    </div>
  );
}

