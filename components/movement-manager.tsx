'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

type Maestro = {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  createdBy: { id: string; name: string; email: string };
  movimientos: Movimiento[];
};

type Movimiento = {
  id: string;
  tipo: 'ENTRADA' | 'SALIDA';
  quantity: number;
  date: string;
  createdBy: { id: string; name: string; email: string };
};

type MovementManagerProps = Readonly<{
  initialMaestros: Maestro[];
}>;

function buildChartData(movimientos: Movimiento[]) {
  let balance = 0;

  return [...movimientos]
    .slice()
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .map((movimiento) => {
      balance += movimiento.tipo === 'ENTRADA' ? movimiento.quantity : -movimiento.quantity;

      return {
        fecha: new Date(movimiento.date).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
        }),
        saldo: balance,
      };
    });
}

export function MovementManager({ initialMaestros }: MovementManagerProps) {
  const [maestros, setMaestros] = React.useState(initialMaestros);
  const [selectedMaestroId, setSelectedMaestroId] = React.useState(initialMaestros[0]?.id ?? '');
  const [loading, setLoading] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [quantity, setQuantity] = React.useState('');

  const selectedMaestro = React.useMemo(
    () => maestros.find((maestro) => maestro.id === selectedMaestroId) ?? maestros[0],
    [maestros, selectedMaestroId]
  );
  const movimientos = React.useMemo(() => selectedMaestro?.movimientos ?? [], [selectedMaestro]);
  const chartData = React.useMemo(() => buildChartData(movimientos), [movimientos]);

  async function refreshData(activeMaestroId = selectedMaestroId) {
    const [maestrosResponse, movimientosResponse] = await Promise.all([
      fetch('/api/maestros'),
      activeMaestroId ? fetch(`/api/movimientos?maestroId=${activeMaestroId}`) : Promise.resolve(null),
    ]);

    if (!maestrosResponse.ok) {
      throw new Error('No se pudieron recargar los maestros');
    }

    const maestrosResult = (await maestrosResponse.json()) as { maestros: Maestro[] };
    const movimientosResult =
      activeMaestroId && movimientosResponse?.ok
        ? ((await movimientosResponse.json()) as { movimientos: Movimiento[] })
        : null;

    const updatedMaestros = maestrosResult.maestros.map((maestro) => ({
      ...maestro,
      movimientos: maestro.id === activeMaestroId ? movimientosResult?.movimientos ?? [] : maestro.movimientos ?? [],
    }));

    setMaestros(updatedMaestros);
  }

  async function handleCreateMovement(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedMaestro) {
      toast.error('Selecciona un maestro primero');
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!parsedQuantity || parsedQuantity <= 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maestroId: selectedMaestro.id,
          tipo,
          quantity: parsedQuantity,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? 'No se pudo crear el movimiento');
      }

      toast.success('Movimiento registrado correctamente');
      setSheetOpen(false);
      setQuantity('');
      await refreshData(selectedMaestro.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el movimiento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='grid gap-6 xl:grid-cols-[1.4fr_0.9fr]'>
      <Card>
        <div className='flex items-center justify-between gap-4 border-b px-6 py-4'>
          <div className='grid gap-1'>
            <label htmlFor='maestro-select' className='text-sm font-medium'>
              Maestro / área del hotel
            </label>
            <select
              id='maestro-select'
              className='h-10 rounded-md border border-input bg-background px-3'
              value={selectedMaestroId}
              onChange={(event) => setSelectedMaestroId(event.target.value)}
            >
              {maestros.map((maestro) => (
                <option key={maestro.id} value={maestro.id}>
                  {maestro.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => setSheetOpen(true)} disabled={!selectedMaestro}>
            Agregar movimiento
          </Button>
        </div>

        <CardContent className='space-y-4 p-6'>
          {selectedMaestro ? (
            <>
              <div className='rounded-xl border bg-muted/30 p-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <h2 className='text-lg font-semibold'>{selectedMaestro.name}</h2>
                    <p className='text-sm text-muted-foreground'>
                      Creado por {selectedMaestro.createdBy.name} · saldo actual {selectedMaestro.balance}
                    </p>
                  </div>
                  <div className='rounded-full border px-3 py-1 text-sm'>
                    Maestro del hotel
                  </div>
                </div>
              </div>

              <div className='overflow-hidden rounded-lg border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50 text-left text-muted-foreground'>
                    <tr>
                      <th className='px-4 py-3'>Movimiento</th>
                      <th className='px-4 py-3'>Fecha</th>
                      <th className='px-4 py-3'>Tipo</th>
                      <th className='px-4 py-3'>Cantidad</th>
                      <th className='px-4 py-3'>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length ? (
                      movimientos.map((movimiento) => (
                        <tr key={movimiento.id} className='border-t'>
                          <td className='px-4 py-3 font-mono text-xs'>{movimiento.id}</td>
                          <td className='px-4 py-3'>
                            {new Date(movimiento.date).toLocaleString('es-CO')}
                          </td>
                          <td className='px-4 py-3'>{movimiento.tipo}</td>
                          <td className='px-4 py-3'>{movimiento.quantity}</td>
                          <td className='px-4 py-3'>{movimiento.createdBy.name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className='px-4 py-8 text-center text-muted-foreground' colSpan={5}>
                          Todavía no hay movimientos para este maestro
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className='rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground'>
              Crea un maestro primero para registrar movimientos.
            </div>
          )}
        </CardContent>
      </Card>

      <div className='space-y-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold'>Evolución diaria</h3>
                <p className='text-sm text-muted-foreground'>Saldo acumulado del maestro seleccionado</p>
              </div>
            </div>
            <div className='h-72'>
              {chartData.length ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='fecha' />
                    <YAxis />
                    <Tooltip />
                    <Line type='monotone' dataKey='saldo' stroke='#0f766e' strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground'>
                  Sin datos suficientes para la gráfica
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='grid gap-3 p-6 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Saldo actual</span>
              <strong>{selectedMaestro ? selectedMaestro.balance : 0}</strong>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Responsable</span>
              <strong>{selectedMaestro?.createdBy.name ?? 'Sin asignar'}</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Registrar movimiento</SheetTitle>
            <SheetDescription>
              El movimiento quedará asociado al usuario autenticado y al maestro seleccionado.
            </SheetDescription>
          </SheetHeader>

          <form className='grid gap-4 px-6 py-4' onSubmit={handleCreateMovement}>
            <div className='grid gap-2'>
              <label htmlFor='tipo' className='text-sm font-medium'>
                Tipo de movimiento
              </label>
              <select
                id='tipo'
                className='h-10 rounded-md border border-input bg-background px-3'
                value={tipo}
                onChange={(event) => setTipo(event.target.value as 'ENTRADA' | 'SALIDA')}
              >
                <option value='ENTRADA'>Entrada</option>
                <option value='SALIDA'>Salida</option>
              </select>
            </div>

            <div className='grid gap-2'>
              <label htmlFor='quantity' className='text-sm font-medium'>
                Cantidad
              </label>
              <Input
                id='quantity'
                type='number'
                min='1'
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder='Cantidad de unidades'
              />
            </div>

            <SheetFooter className='px-0'>
              <div className='flex gap-3'>
                <Button type='button' variant='outline' onClick={() => setSheetOpen(false)}>
                  Cancelar
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading ? 'Guardando...' : 'Crear movimiento'}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
