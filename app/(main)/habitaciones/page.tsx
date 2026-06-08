import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RoomCreator from '@/components/room-creator';
import RoomActions from '@/components/room-actions';

export default async function HabitacionesPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/login');
    return null;
  }
  if (sessionUser.role !== 'ADMIN') {
    // Only admins can manage rooms
    redirect('/');
    return null;
  }

  const isAdmin = sessionUser.role === 'ADMIN';

  const habitaciones = await prisma.habitacion.findMany({
    orderBy: { numero: 'asc' },
    include: {
      reservas: {
        orderBy: { fechaInicio: 'desc' },
        take: 1,
      },
    },
  });

  return (
    <div className='flex min-h-screen flex-col gap-6 p-6 lg:p-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>Habitaciones</h1>
        <p className='text-muted-foreground'>
          Estado operativo de las habitaciones del hotel, útil para control de disponibilidad y mantenimiento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de habitaciones</CardTitle>
          <CardDescription>Estado, tipo y tarifa base de cada habitación registrada.</CardDescription>
        </CardHeader>
        <CardContent className='overflow-hidden p-0'>
          <div className='p-4'>
            <RoomCreator />
          </div>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50 text-left text-muted-foreground'>
              <tr>
                <th className='px-4 py-3'>Número</th>
                <th className='px-4 py-3'>Tipo</th>
                <th className='px-4 py-3'>Precio</th>
                <th className='px-4 py-3'>Estado</th>
                <th className='px-4 py-3'>Última reserva</th>
                <th className='px-4 py-3'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {habitaciones.map((habitacion) => {
                const last = habitacion.reservas[0];
                const hasValidDates =
                  last && !isNaN(new Date(last.fechaInicio).getTime()) && !isNaN(new Date(last.fechaFin).getTime());
                const lastReservaText = hasValidDates
                  ? `${new Date(last.fechaInicio).toLocaleDateString('es-CO')} - ${new Date(last.fechaFin).toLocaleDateString('es-CO')}`
                  : 'Sin reservas';

                return (
                  <tr key={habitacion.id} className='border-t'>
                    <td className='px-4 py-3 font-medium'>{habitacion.numero}</td>
                    <td className='px-4 py-3'>{habitacion.tipo}</td>
                    <td className='px-4 py-3'>{habitacion.precio}</td>
                    <td className='px-4 py-3'>{habitacion.estado}</td>
                    <td className='px-4 py-3'>{lastReservaText}</td>
                    <td className='px-4 py-3'>
                      {/* RoomActions is a client component */}
                      <div>
                        <RoomActions isAdmin={isAdmin} room={{ id: habitacion.id, numero: habitacion.numero, estado: habitacion.estado }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
