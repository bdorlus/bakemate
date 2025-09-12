import { Download, Plus } from 'lucide-react';

interface Props {
  onAdd: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function OrdersToolbar({
  onAdd,
  onExportCSV,
  onExportPDF,
}: Props) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div />
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

