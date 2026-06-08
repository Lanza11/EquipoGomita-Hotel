import { columns, User } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

async function getData(): Promise<User[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function DemoPage() {
  const sessionUser = await getSessionUser();

  if (sessionUser?.role !== 'ADMIN') {
    redirect('/transacciones');
  }

  const data = await getData();

  return (
    <div className='container mx-auto py-10'>
      <div className='my-10 flex flex-row justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Usuarios del hotel</h2>
          <p className='text-muted-foreground'>
            Administración de usuarios con visibilidad por rol y contraseña explícita.
          </p>
        </div>
        <Link href='/users/create'>
          <Button className='ml-auto'>Crear usuario</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
