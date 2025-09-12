import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrders, updateOrder } from '../api/orders';
import type { Order } from '../api/orders';
import DateRangePicker from '../components/DateRangePicker';
import StatusTabs from '../components/StatusTabs';
import OrdersToolbar from '../components/OrdersToolbar';
import OrdersTable from '../components/OrdersTable';
import OrderDialog from '../components/OrderDialog';
import { exportOrdersCSV, exportOrdersPDF } from '../utils/export';
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subYears,
} from 'date-fns';

function resolveRange(value: string) {
  const now = new Date();
  let start: Date;
  let end: Date;
  let label = '';
  if (value === 'current-month') {
    start = startOfMonth(now);
    end = endOfMonth(now);
    label = format(now, 'MMMM yyyy');
  } else if (value === 'ytd') {
    start = startOfYear(now);
    end = now;
    label = 'Year to Date';
  } else if (value === '2-years') {
    start = startOfYear(subYears(now, 1));
    end = endOfYear(now);
    label = `${now.getFullYear() - 1}-${now.getFullYear()}`;
  } else if (value === 'all') {
    start = new Date(0);
    end = now;
    label = 'All Time';
  } else {
    const year = parseInt(value, 10);
    start = startOfYear(new Date(year, 0, 1));
    end = endOfYear(new Date(year, 0, 1));
    label = String(year);
  }
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    label,
  };
}

export default function Orders() {
  const [status, setStatus] = useState('Open');
  const [range, setRange] = useState('ytd');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const { start, end, label } = resolveRange(range);
  const qc = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', start, end, status],
    queryFn: () =>
      getOrders({
        start,
        end,
        status,
        page: 1,
        pageSize: 9999, // ignored by API; we fetch all in batches client-side
      }),
  });

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

  function handleSubmit(data: Omit<Order, 'id' | 'orderNo'>) {
    if (editing) {
      editOrder.mutate({ ...editing, ...data });
    } else {
      addOrder.mutate({ ...data, orderNo: '' });
    }
  }

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders</h2>
        <DateRangePicker value={range} onChange={setRange} />
      </div>
      <StatusTabs value={status} onChange={setStatus} />
      <OrdersToolbar
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        onExportCSV={() => exportOrdersCSV(ordersQuery.data?.rows ?? [])}
        onExportPDF={() => {
          const el = document.getElementById('orders-table');
          if (el) {
            exportOrdersPDF(el, label);
          } else {
            console.error('Orders table element not found for PDF export.');
            window.alert('Unable to export PDF: Orders table not found.');
          }
        }}
      />
      <OrdersTable
        data={ordersQuery.data?.rows ?? []}
        onRowClick={(o) => {
          setEditing({ ...o });
          setDialogOpen(true);
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
