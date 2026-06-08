"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function RoomCreator() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [numero, setNumero] = React.useState<number | ''>('');
  const [tipo, setTipo] = React.useState<'SIMPLE' | 'DOBLE' | 'SUITE'>('SIMPLE');
  const [precio, setPrecio] = React.useState<number | ''>('');
  const [descripcion, setDescripcion] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const valid = Number.isFinite(Number(numero)) && Number(numero) > 0 && Number.isFinite(Number(precio)) && Number(precio) >= 0 && !!tipo;

  async function createRoom() {
    if (!valid) return;
    if (!confirm(`Crear habitación ${numero} (${tipo}) por ${precio} COP/noche?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/habitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, tipo, precio, descripcion }),
      });
      if (res.status === 409) {
        const j = await res.json().catch(() => null);
        toast.error(j?.error ?? 'Número ya existe');
        return;
      }
      if (!res.ok) throw new Error('Error');
      toast.success('Habitación creada');
      setOpen(false);
      setNumero('');
      setTipo('SIMPLE');
      setPrecio('');
      setDescripcion('');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo crear la habitación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Crear habitación</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nueva Habitación</SheetTitle>
            <SheetDescription>Rellena los datos para registrar una nueva habitación.</SheetDescription>
          </SheetHeader>

          <div className='grid gap-3 px-6 py-4'>
            <label className='text-sm font-medium'>Número</label>
            <Input type='number' value={numero} onChange={(e) => setNumero(e.target.value ? Number(e.target.value) : '')} />

            <label className='text-sm font-medium'>Tipo</label>
            <select className='h-10 rounded-md border px-3' value={tipo} onChange={(e) => setTipo(e.target.value as 'SIMPLE' | 'DOBLE' | 'SUITE')}>
              <option value='SIMPLE'>SIMPLE</option>
              <option value='DOBLE'>DOBLE</option>
              <option value='SUITE'>SUITE</option>
            </select>

            <label className='text-sm font-medium'>Precio por noche</label>
            <Input type='number' value={precio} onChange={(e) => setPrecio(e.target.value ? Number(e.target.value) : '')} />

            <label className='text-sm font-medium'>Descripción (opcional)</label>
            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>

          <SheetFooter>
            <div className='flex gap-3 p-6'>
              <Button variant='outline' onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={createRoom} disabled={!valid || loading}>
                {loading ? 'Guardando...' : 'Crear Habitación'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
