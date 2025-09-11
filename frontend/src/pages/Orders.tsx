import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  getOrders,
  getOrdersSummary,
  Order,
} from '../api/orders';
import DateRangePicker from '../components/DateRangePicker';
import StatusTabs from '../components/StatusTabs';
import OrdersChart from '../components/OrdersChart';
import OrdersToolbar from '../components/OrdersToolbar';
import OrdersTable from '../components/OrdersTable';
import OrderDialog from '../components/OrderDialog';
import OrderDetailDrawer from '../components/OrderDetailDrawer';
import { exportOrdersCSV, exportOrdersPDF } from '../utils/export';
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
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
  const [range, setRange] = useState('current-month');
  const [groupBy, setGroupBy] = useState('none');
  const [metric, setMetric] = useState<'orders' | 'revenue'>('orders');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);
  const { start, end, label } = resolveRange(range);
  const qc = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ['ordersSummary', start, end, status],
    queryFn: () => getOrdersSummary({ start, end, status }),
  });

  const ordersQuery = useQuery({
    queryKey: ['orders', start, end, status, groupBy],
    queryFn: () =>
      getOrders({
        start,
        end,
        status,
        groupBy,
        page: 1,
        pageSize: 25,
      }),
  });

  const addOrder = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  function handleAdd(data: Omit<Order, 'id'>) {
    addOrder.mutate(data);
  }

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders</h2>
        <DateRangePicker value={range} onChange={setRange} />
      </div>
      <StatusTabs value={status} onChange={setStatus} />
      <OrdersChart
        data={summaryQuery.data?.series ?? []}
        metric={metric}
        onMetricToggle={() => setMetric((m) => (m === 'orders' ? 'revenue' : 'orders'))}
      />
      <OrdersToolbar
      groupBy={groupBy}
      onGroupChange={setGroupBy}
      onAdd={() => setDialogOpen(true)}
      onExportCSV={() => exportOrdersCSV(ordersQuery.data?.rows ?? [])}
      onExportPDF={() => {
          const el = document.getElementById('orders-table');
          if (el) exportOrdersPDF(el, label);
        }}
      />
      <OrdersTable
        data={ordersQuery.data?.rows ?? []}
        onRowClick={(o) => setDetail(o)}
      />
      <OrderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAdd}
      />
      <OrderDetailDrawer order={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

