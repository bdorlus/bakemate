import { useEffect, useState } from 'react';
import { listOrders } from '../api/orders';
import type { Order } from '../api/orders';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    listOrders().then(setOrders).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.order_number} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
