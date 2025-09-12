import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import type { Order } from '../api/orders';

const schema = z.object({
  customer: z.string().min(1),
  event: z.string().min(1),
  orderDate: z.string().min(1),
  dueDate: z.string().min(1),
  deliveryMethod: z.string().optional().default(''),
  status: z.enum(['Open', 'Quoted', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High']).default('Low'),
  total: z.number().nonnegative().default(0),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  order?: Order;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export default function OrderDialog({ open, order, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: order });
  const [submitting, setSubmitting] = useState(false);

  const submit = handleSubmit(async (data) => {
    setSubmitting(true);
    await onSubmit(data);
    setSubmitting(false);
    onClose();
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center" role="dialog">
      <form
        onSubmit={submit}
        className="bg-white p-4 rounded-md w-80 space-y-2"
      >
        <h3 className="text-lg font-medium mb-2">
          {order ? 'Edit Order' : 'Add Order'}
        </h3>
        <input
          {...register('customer')}
          placeholder="Customer"
          className="w-full border p-2 rounded"
        />
        {errors.customer && (
          <span className="text-red-600 text-sm">Customer required</span>
        )}
        <input
          {...register('event')}
          placeholder="Event"
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          {...register('orderDate')}
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          {...register('dueDate')}
          className="w-full border p-2 rounded"
        />
        <input
          {...register('deliveryMethod')}
          placeholder="Delivery Method"
          className="w-full border p-2 rounded"
        />
        <select {...register('status')} className="w-full border p-2 rounded">
          <option value="Quoted">Quoted</option>
          <option value="Open">Open</option>
          <option value="Completed">Completed</option>
        </select>
        <select {...register('priority')} className="w-full border p-2 rounded">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="number"
          step="0.01"
          {...register('total', { valueAsNumber: true })}
          placeholder="Total"
          className="w-full border p-2 rounded"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded-md">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-1 bg-blue-600 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

