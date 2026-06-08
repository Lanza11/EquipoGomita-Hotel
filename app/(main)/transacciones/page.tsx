import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { MovementManager } from '@/components/movement-manager';

export default async function TransaccionesPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  const maestros = await prisma.maestro.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      movimientos: {
        orderBy: { date: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  const maestrosForClient = maestros.map((maestro) => ({
    ...maestro,
    createdAt: maestro.createdAt.toISOString(),
    movimientos: maestro.movimientos.map((movimiento) => ({
      ...movimiento,
      createdAt: movimiento.createdAt.toISOString(),
      updatedAt: movimiento.updatedAt.toISOString(),
      date: movimiento.date.toISOString(),
    })),
  }));

  return (
    <div className='flex min-h-screen flex-col gap-6 p-6 lg:p-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>Movimientos y control operativo</h1>
        <p className='text-muted-foreground'>
          Registra entradas y salidas de inventario del hotel con trazabilidad por usuario, maestro y fecha.
        </p>
      </div>

      <MovementManager initialMaestros={maestrosForClient} />
    </div>
  );
}
