"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Room = { id: string; numero: string | number; estado: string };

export default function RoomActions({ room, isAdmin }: { room: Room; isAdmin?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  if (!isAdmin) return null;

  async function updateEstado(nuevoEstado: string) {
    if (!confirm(`Cambiar estado a ${nuevoEstado} para habitación ${room.numero}?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/habitaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: room.id, estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Estado actualizado');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar el estado');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Eliminar habitación ${room.numero}? Esta acción es irreversible.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/habitaciones?id=${room.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Habitación eliminada');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar la habitación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex gap-2'>
      {room.estado !== 'DISPONIBLE' ? (
        <Button size='sm' onClick={() => updateEstado('DISPONIBLE')} disabled={loading}>
          Habilitar
        </Button>
      ) : (
        <Button size='sm' variant='outline' onClick={() => updateEstado('MANTENIMIENTO')} disabled={loading}>
          Mantenimiento
        </Button>
      )}
      <Button size='sm' variant='destructive' onClick={handleDelete} disabled={loading}>
        Eliminar
      </Button>
    </div>
  );
}
