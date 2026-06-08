'use client';

import { ColumnDef } from '@tanstack/react-table';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  deleted: boolean;
  enabled: boolean;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'createdAt',
    header: 'Creado',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('es-CO'),
  },
  {
    accessorKey: 'role',
    header: 'Rol',
  },
  { accessorKey: 'email', header: 'Correo' },
  {
    accessorKey: 'actions',
    header: 'Acciones',
  },
];
