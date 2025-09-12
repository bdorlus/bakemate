import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrders, updateOrder, deleteOrder } from '../api/orders';
import type { Order } from '../api/orders';
// Removed StatusTabs; using a Filter button instead
// Inline toolbar; no external component
import OrdersTable from '../components/OrdersTable';
import OrderDialog from '../components/OrderDialog';
import { exportOrdersCSV } from '../utils/export';
import { Filter as FilterIcon, Download as DownloadIcon, Plus as PlusIcon } from 'lucide-react';
import { endOfYear, format, startOfYear } from 'date-fns';

function resolveYearRange(yearOrAll: string) {
  if (yearOrAll === 'all') {
    const now = new Date();
    return { start: '1970-01-01', end: format(now, 'yyyy-MM-dd'), label: 'All Time' };
  }
  const year = parseInt(yearOrAll, 10);
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd'), label: String(year) };
}

export default function Orders() {
  const currentYear = new Date().getFullYear();
  // Status filter now supports multiple statuses; empty array means "all"
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [year, setYear] = useState<string>(String(currentYear));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const { start, end, label } = resolveYearRange(year === 'all' ? 'all' : year);
  const qc = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', start, end, status],
    queryFn: () =>
      getOrders({
        start,
        end,
        // Fetch all; we'll filter statuses client-side
        status: undefined as any,
        page: 1,
        pageSize: 9999, // ignored by API; we fetch all in batches client-side
      }),
  });

  // Fixed list from backend enum OrderStatus
  const availableStatuses = [
    'inquiry',
    'quote_sent',
    'confirmed',
    'in_progress',
    'ready_for_pickup',
    'completed',
    'cancelled',
  ] as const;

  const filteredRows = (ordersQuery.data?.rows ?? []).filter((r) =>
    selectedStatuses.length ? selectedStatuses.includes(r.status) : true,
  );

  const addOrder = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const editOrder = useMutation({
    mutationFn: ({ id, ...data }: Order) => updateOrder(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const cancelOrder = useMutation({
    mutationFn: (id: string) => updateOrder(id, { status: 'cancelled' } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const removeOrder = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  function handleSubmit(data: Omit<Order, 'id' | 'orderNo'>) {
    if (editing) {
      editOrder.mutate({ ...editing, ...data });
    } else {
      addOrder.mutate({ ...data, orderNo: '' });
    }
  }

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Orders</h2>
        <div className="flex items-center gap-2 relative">
          <label className="sr-only" htmlFor="orders-year">Year</label>
          <select
            id="orders-year"
            className="border rounded-md p-2 text-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="Year"
          >
            {[0,1,2,3,4].map((n) => {
              const y = String(currentYear - n);
              return (
                <option key={y} value={y}>{y}</option>
              );
            })}
            <option value="all">All</option>
          </select>
          <button
            className="ml-1 p-2 border rounded-md text-sm"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-label="Filter"
            aria-expanded={filtersOpen}
            aria-controls="orders-filters"
            title="Filter"
          >
            <FilterIcon size={16} />
          </button>
          <button
            className="p-2 border rounded-md text-sm"
            onClick={() => exportOrdersCSV(filteredRows)}
            aria-label="Download CSV"
            title="Download CSV"
          >
            <DownloadIcon size={16} />
          </button>
          <button
            onClick={() => { setEditing(null); setDialogOpen(true); }}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
          >
            <PlusIcon size={16} /> Add Order
          </button>
          {filtersOpen && (
            <div
              id="orders-filters"
              className="absolute right-0 top-full mt-2 bg-white border rounded-md shadow p-3 z-10 w-48"
            >
              <p className="block text-xs mb-1">Statuses</p>
              <div className="max-h-52 overflow-auto pr-1">
                {availableStatuses.map((s) => {
                  const checked = selectedStatuses.includes(s);
                  return (
                    <label key={s} className="flex items-center gap-2 py-1 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedStatuses((prev) => {
                            if (e.target.checked) return [...prev, s];
                            return prev.filter((v) => v !== s);
                          });
                        }}
                      />
                      <span>{s.replace(/_/g, ' ')}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <button
                  className="text-xs underline"
                  onClick={() => setSelectedStatuses([])}
                >
                  Clear
                </button>
                <button
                  className="text-xs underline"
                  onClick={() => setFiltersOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <OrdersTable
        data={filteredRows}
        onEdit={(o) => {
          setEditing({ ...o });
          setDialogOpen(true);
        }}
        onView={(o) => {
          // For now, reuse edit dialog as a viewer; could route to a detail page later
          setEditing({ ...o });
          setDialogOpen(true);
        }}
        onCancel={(o) => {
          if (window.confirm('Cancel this order?')) {
            cancelOrder.mutate(o.id);
          }
        }}
        onDelete={(o) => {
          if (window.confirm('Delete this order? This cannot be undone.')) {
            removeOrder.mutate(o.id);
          }
        }}
      />
      <OrderDialog
        open={dialogOpen}
        order={
          editing
            ? {
                ...editing,
                orderDate: editing.orderDate.slice(0, 10),
                dueDate: editing.dueDate.slice(0, 10),
              }
            : undefined
        }
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
