import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ReservationManager } from '@/components/reservation-manager';

export default async function ReservasPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  const reservas = await prisma.reserva.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      habitacion: { select: { id: true, numero: true, tipo: true, estado: true } },
    },
  });

  const reservasForClient = reservas.map((reserva) => ({
    ...reserva,
    fechaInicio: reserva.fechaInicio.toISOString(),
    fechaFin: reserva.fechaFin.toISOString(),
  }));

  const guests = await prisma.user.findMany({
    where: { enabled: true, deleted: false },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  });

  const rooms = await prisma.habitacion.findMany({
    orderBy: { numero: 'asc' },
    select: { id: true, numero: true, tipo: true, estado: true },
  });

  return (
    <div className='flex min-h-screen flex-col gap-6 p-6 lg:p-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>Reservas</h1>
        <p className='text-muted-foreground'>
          Consulta las reservas registradas y usa este espacio como base para la búsqueda de disponibilidad.
        </p>
      </div>

      <ReservationManager guests={guests} rooms={rooms} reservations={reservasForClient} />
    </div>
  );
}
