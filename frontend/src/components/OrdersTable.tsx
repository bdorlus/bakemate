import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import type { Order } from '../api/orders';

interface Props {
  data: Order[];
  onRowClick: (order: Order) => void;
}

export default function OrdersTable({ data, onRowClick }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    { header: 'Order #', accessorKey: 'orderNo' },
    { header: 'Customer', accessorKey: 'customer' },
    { header: 'Event', accessorKey: 'event' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Due date', accessorKey: 'dueDate' },
    { header: 'Total', accessorKey: 'total' },
    { header: 'Priority', accessorKey: 'priority' },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl shadow">
      <table className="w-full text-sm" role="grid" id="orders-table">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick(row.original)}
              className="hover:bg-pink-50 cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between p-2 text-sm">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-2 py-1 border rounded-md disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-2 py-1 border rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

