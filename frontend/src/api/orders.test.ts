import { describe, expect, it, vi } from 'vitest';
import { AxiosResponse } from 'axios';
import apiClient from './index';
import { listOrders, Order } from './orders';

describe('listOrders', () => {
  it('fetches orders from API', async () => {
    const data: Order[] = [
      { id: '1', order_number: '1001', status: 'new' },
    ];
    const getSpy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data } as AxiosResponse<Order[]>);

    const result = await listOrders();
    expect(getSpy).toHaveBeenCalledWith('/orders');
    expect(result).toEqual(data);
    getSpy.mockRestore();
  });
});

