'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type Guest = { id: string; name: string; email: string };
type Room = { id: string; numero: number; tipo: string; estado: string };
type Reservation = {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  user: Guest;
  habitacion: Room;
};

type ReservationManagerProps = Readonly<{
  guests: Guest[];
  rooms: Room[];
  reservations: Reservation[];
}>;

export function ReservationManager({ guests, rooms, reservations }: ReservationManagerProps) {
  const [availableRooms, setAvailableRooms] = React.useState<Room[]>(rooms);
  const [currentReservations, setCurrentReservations] = React.useState(reservations);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [searchFrom, setSearchFrom] = React.useState('');
  const [searchTo, setSearchTo] = React.useState('');
  const [guestId, setGuestId] = React.useState(guests[0]?.id ?? '');
  const [roomId, setRoomId] = React.useState(rooms[0]?.id ?? '');
  const [fechaInicio, setFechaInicio] = React.useState('');
  const [fechaFin, setFechaFin] = React.useState('');

  // When the new-reservation sheet is open, automatically fetch availability
  React.useEffect(() => {
    let mounted = true;
    async function fetchAvailable() {
      if (!sheetOpen || !fechaInicio || !fechaFin) return;
      try {
        const response = await fetch(`/api/reservas?available=true&from=${fechaInicio}&to=${fechaFin}`);
        if (!response.ok) return;
        const data = (await response.json()) as { habitaciones: Room[] };
        if (!mounted) return;
        setAvailableRooms(data.habitaciones);
        setRoomId(data.habitaciones[0]?.id ?? '');
      } catch (err) {
        console.error('Error fetching availability for sheet', err);
      }
    }

    fetchAvailable();
    return () => {
      mounted = false;
    };
  }, [sheetOpen, fechaInicio, fechaFin]);

  async function searchAvailability(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!searchFrom || !searchTo) {
      toast.error('Selecciona un rango de fechas');
      return;
    }

    const response = await fetch(`/api/reservas?available=true&from=${searchFrom}&to=${searchTo}`);

    if (!response.ok) {
      toast.error('No se pudo consultar la disponibilidad');
      return;
    }

    const data = (await response.json()) as { habitaciones: Room[] };
    setAvailableRooms(data.habitaciones);
    setRoomId(data.habitaciones[0]?.id ?? '');
    toast.success('Disponibilidad actualizada');
  }

  async function createReservation(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: guestId,
          habitacionId: roomId,
          fechaInicio,
          fechaFin,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? 'No se pudo crear la reserva');
      }

      const data = (await response.json()) as { reserva: Reservation };
      setCurrentReservations((current) => [data.reserva, ...current]);
      toast.success('Reserva creada correctamente');
      setSheetOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear la reserva');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(resId: string) {
    try {
      const res = await fetch('/api/reservas/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservaId: resId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? 'Check-in failed');
      }
      await res.json();
      toast.success('Check-in realizado');
      // update local state: mark habitacion as OCUPADA for that reservation
      setCurrentReservations((cur) => cur.map((r) => (r.id === resId ? { ...r, habitacion: { ...r.habitacion, estado: 'OCUPADA' } } : r)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo realizar check-in');
    }
  }

  async function handleCheckOut(resId: string) {
    try {
      const res = await fetch('/api/reservas/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservaId: resId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? 'Check-out failed');
      }
      await res.json();
      toast.success('Check-out realizado');
      setCurrentReservations((cur) => cur.map((r) => (r.id === resId ? { ...r, habitacion: { ...r.habitacion, estado: 'DISPONIBLE' } } : r)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo realizar check-out');
    }
  }

  return (
    <div className='grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'>
      <Card>
        <CardContent className='space-y-4 p-6'>
          <div className='space-y-2'>
            <h2 className='text-lg font-semibold'>Buscar disponibilidad</h2>
            <p className='text-sm text-muted-foreground'>Filtra habitaciones libres para un rango de fechas.</p>
          </div>
          <form className='grid gap-3' onSubmit={searchAvailability}>
            <Input type='date' value={searchFrom} onChange={(e) => setSearchFrom(e.target.value)} />
            <Input type='date' value={searchTo} onChange={(e) => setSearchTo(e.target.value)} />
            <Button type='submit'>Buscar</Button>
          </form>

          <div className='space-y-2'>
            <div className='text-sm font-medium'>Habitaciones disponibles</div>
            <div className='grid gap-2'>
              {availableRooms.map((room) => (
                <div key={room.id} className='rounded-md border px-3 py-2 text-sm'>
                  Habitación {room.numero} · {room.tipo} · {room.estado}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => setSheetOpen(true)} disabled={!availableRooms.length}>
            Crear reserva
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <div className='space-y-2'>
            <h2 className='text-lg font-semibold'>Reservas registradas</h2>
            <p className='text-sm text-muted-foreground'>Control de reservas del hotel.</p>
          </div>

          <div className='mt-4 overflow-hidden rounded-lg border'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50 text-left text-muted-foreground'>
                <tr>
                  <th className='px-4 py-3'>Cliente</th>
                  <th className='px-4 py-3'>Habitación</th>
                  <th className='px-4 py-3'>Fechas</th>
                </tr>
              </thead>
              <tbody>
                {currentReservations.map((reservation) => (
                  <tr key={reservation.id} className='border-t'>
                    <td className='px-4 py-3'>
                      <div className='font-medium'>{reservation.user.name}</div>
                      <div className='text-xs text-muted-foreground'>{reservation.user.email}</div>
                    </td>
                    <td className='px-4 py-3'>
                      Habitación {reservation.habitacion.numero} · {reservation.habitacion.tipo}
                    </td>
                    <td className='px-4 py-3'>
                      {reservation.habitacion.estado}
                      <div className='mt-2 flex gap-2'>
                        <Button size='sm' onClick={() => handleCheckIn(reservation.id)}>
                          Check-in
                        </Button>
                        <Button size='sm' variant='outline' onClick={() => handleCheckOut(reservation.id)}>
                          Check-out
                        </Button>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      {new Date(reservation.fechaInicio).toLocaleDateString('es-CO')} -{' '}
                      {new Date(reservation.fechaFin).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nueva reserva</SheetTitle>
            <SheetDescription>
              Selecciona el huésped, la habitación y el rango de fechas.
            </SheetDescription>
          </SheetHeader>

          <form className='grid gap-4 px-6 py-4' onSubmit={createReservation}>
            <div className='grid gap-2'>
              <label htmlFor='guest-select' className='text-sm font-medium'>
                Huésped
              </label>
              <select
                id='guest-select'
                className='h-10 rounded-md border border-input bg-background px-3'
                value={guestId}
                onChange={(e) => setGuestId(e.target.value)}
              >
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name} · {guest.email}
                  </option>
                ))}
              </select>
            </div>

            <div className='grid gap-2'>
              <label htmlFor='room-select' className='text-sm font-medium'>
                Habitación
              </label>
              <select
                id='room-select'
                className='h-10 rounded-md border border-input bg-background px-3'
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              >
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Habitación {room.numero} · {room.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className='grid gap-2'>
              <label htmlFor='start-date' className='text-sm font-medium'>
                Fecha de entrada
              </label>
              <Input id='start-date' type='date' value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>

            <div className='grid gap-2'>
              <label htmlFor='end-date' className='text-sm font-medium'>
                Fecha de salida
              </label>
              <Input id='end-date' type='date' value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>

            <SheetFooter className='px-0'>
              <div className='flex gap-3'>
                <Button type='button' variant='outline' onClick={() => setSheetOpen(false)}>
                  Cancelar
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading ? 'Guardando...' : 'Crear reserva'}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
