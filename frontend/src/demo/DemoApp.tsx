import { useMemo, useState } from 'react'

type Toast = {
  id: number
  message: string
  tone?: 'success' | 'info' | 'warning' | 'error'
}

export default function DemoApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [metricPulse, setMetricPulse] = useState(false)

  const palette = useMemo(
    () =>
      theme === 'light'
        ? {
            bg: 'bg-soft-pastel-background',
            text: 'text-slate-800',
            panel: 'bg-white',
            border: 'border-slate-200',
            subtle: 'text-slate-500',
            primary: 'bg-soft-pastel-accent text-slate-900 hover:brightness-95',
            ghost: 'bg-white hover:bg-slate-100',
          }
        : {
            bg: 'bg-slate-900',
            text: 'text-slate-100',
            panel: 'bg-slate-800',
            border: 'border-slate-700',
            subtle: 'text-slate-400',
            primary: 'bg-soft-pastel-accent text-slate-900 hover:brightness-95',
            ghost: 'bg-slate-700 hover:bg-slate-600',
          },
    [theme]
  )

  function pushToast(message: string, tone: Toast['tone'] = 'info') {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500)
  }

  function simulateSave() {
    pushToast('Saved changes', 'success')
    setMetricPulse(true)
    setTimeout(() => setMetricPulse(false), 600)
  }

  return (
    <div className={`${palette.bg} ${palette.text} min-h-screen`}>
      {/* Top bar */}
      <header className={`sticky top-0 z-10 border-b ${palette.border} ${palette.panel}`}>
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-soft-pastel-accent" />
            <span className="font-semibold">BakeMate</span>
            <span className={`text-xs ${palette.subtle}`}>demo preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1.5 rounded-md border ${palette.border} ${palette.ghost}`}
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button
              className={`px-3 py-1.5 rounded-md ${palette.primary}`}
              onClick={() => setShowNewOrder(true)}
            >
              + New Order
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Orders"
            value="128"
            delta="+8.2%"
            pulse={metricPulse}
            palette={palette}
          />
          <MetricCard
            title="Revenue"
            value="$4,320"
            delta="+3.6%"
            pulse={metricPulse}
            palette={palette}
          />
          <MetricCard
            title="Low Stock"
            value="5"
            delta="-2"
            pulse={metricPulse}
            palette={palette}
          />
        </section>

        {/* Actions */}
        <section className={`border ${palette.border} ${palette.panel} rounded-lg p-4 mb-6`}>
          <h2 className="font-medium mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button className={`px-3 py-2 rounded-md ${palette.primary}`} onClick={simulateSave}>
              Save Changes
            </button>
            <button
              className={`px-3 py-2 rounded-md border ${palette.border} ${palette.ghost}`}
              onClick={() => pushToast('Ingredient added', 'info')}
            >
              Add Ingredient
            </button>
            <button
              className={`px-3 py-2 rounded-md border ${palette.border} ${palette.ghost}`}
              onClick={() => pushToast('Inventory synced', 'success')}
            >
              Sync Inventory
            </button>
            <button
              className={`px-3 py-2 rounded-md border ${palette.border} ${palette.ghost}`}
              onClick={() => pushToast('Export queued', 'warning')}
            >
              Export Report
            </button>
          </div>
        </section>

        {/* Table mock */}
        <section className={`border ${palette.border} ${palette.panel} rounded-lg overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${palette.border} flex items-center justify-between`}>
            <h3 className="font-medium">Recent Orders</h3>
            <input
              placeholder="Search..."
              className={`px-3 py-1.5 rounded-md text-sm border ${palette.border} ${palette.ghost} outline-none`}
            />
          </div>
          <div className="divide-y divide-slate-200/50">
            {[
              { id: 'BM-1021', customer: 'A. Johnson', total: '$42.50', status: 'Paid' },
              { id: 'BM-1020', customer: 'M. Rivera', total: '$18.00', status: 'Pending' },
              { id: 'BM-1019', customer: 'S. Patel', total: '$67.20', status: 'Shipped' },
            ].map((r) => (
              <div key={r.id} className="px-4 py-3 grid grid-cols-4 items-center text-sm">
                <div className="font-mono">{r.id}</div>
                <div>{r.customer}</div>
                <div className="font-medium">{r.total}</div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs ${
                      r.status === 'Paid'
                        ? 'bg-green-500/15 text-green-600'
                        : r.status === 'Shipped'
                        ? 'bg-blue-500/15 text-blue-600'
                        : 'bg-yellow-500/15 text-yellow-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal: New Order */}
      {showNewOrder && (
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNewOrder(false)} />
          <div className={`relative w-full max-w-md rounded-xl shadow-lg border ${palette.border} ${palette.panel} p-5`}>
            <h3 className="text-lg font-semibold mb-3">Create New Order</h3>
            <div className="space-y-3">
              <LabeledInput label="Customer Name" placeholder="Jane Doe" palette={palette} />
              <LabeledInput label="Item" placeholder="Chocolate Cupcakes" palette={palette} />
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput label="Qty" placeholder="12" palette={palette} />
                <LabeledInput label="Due" placeholder="2025-09-30" palette={palette} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className={`px-3 py-2 rounded-md border ${palette.border} ${palette.ghost}`} onClick={() => setShowNewOrder(false)}>
                Cancel
              </button>
              <button
                className={`px-3 py-2 rounded-md ${palette.primary}`}
                onClick={() => {
                  setShowNewOrder(false)
                  pushToast('Order created', 'success')
                }}
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-30 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-3 py-2 rounded-md shadow border ${
              t.tone === 'success'
                ? 'bg-green-600 text-white border-green-700'
                : t.tone === 'warning'
                ? 'bg-yellow-500 text-slate-900 border-yellow-600'
                : t.tone === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  delta,
  pulse,
  palette,
}: {
  title: string
  value: string
  delta: string
  pulse: boolean
  palette: any
}) {
  return (
    <div className={`rounded-lg border ${palette.border} ${palette.panel} p-4`}>
      <div className="text-sm mb-2 opacity-80">{title}</div>
      <div className={`text-2xl font-semibold ${pulse ? 'animate-pulse' : ''}`}>{value}</div>
      <div className={`text-xs mt-1 ${palette.subtle}`}>{delta} vs last week</div>
    </div>
  )
}

function LabeledInput({
  label,
  placeholder,
  palette,
}: {
  label: string
  placeholder?: string
  palette: any
}) {
  return (
    <label className="block text-sm">
      <div className={`mb-1 ${palette.subtle}`}>{label}</div>
      <input
        className={`w-full px-3 py-2 rounded-md border ${palette.border} ${palette.ghost} outline-none`}
        placeholder={placeholder}
      />
    </label>
  )
}

