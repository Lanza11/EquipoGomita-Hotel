import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MaestrosPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  return (
    <div className='flex min-h-screen flex-col gap-6 p-6 lg:p-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>Maestros</h1>
        <p className='text-muted-foreground'>
          Catálogo base para administrar los grupos de inventario del hotel, su saldo inicial y responsable de creación.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de maestros</CardTitle>
          <CardDescription>El siguiente paso es conectar el CRUD real y restringir el botón de agregar por rol.</CardDescription>
        </CardHeader>
        <CardContent className='flex min-h-80 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground'>
          Tabla de maestros pendiente de implementar
        </CardContent>
      </Card>
    </div>
  );
}
