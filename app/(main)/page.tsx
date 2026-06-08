import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSessionUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Home() {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    redirect('/transacciones');
  }

  return (
    <div className='relative min-h-svh overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 text-white'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.35),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.20),transparent_25%)]' />
      <div className='relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 py-16 lg:px-8'>
        <div className='grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='space-y-8'>
            <div className='inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur'>
              Sistema de administración hotelera
            </div>
            <div className='space-y-4'>
              <h1 className='max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl'>
                Controla reservas, habitaciones y movimientos desde un solo panel.
              </h1>
              <p className='max-w-xl text-base text-white/75 sm:text-lg'>
                Una base preparada para gestionar disponibilidad, transacciones, maestros y usuarios con acceso por roles.
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link href='/login'>
                <Button size='lg' className='rounded-full bg-emerald-400 px-7 text-slate-950 hover:bg-emerald-300'>
                  Iniciar sesión
                </Button>
              </Link>
              <Button size='lg' variant='outline' className='rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10'>
                Ver demo
              </Button>
            </div>
          </div>
          <Card className='border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-2xl'>Hotel Admin</CardTitle>
              <CardDescription className='text-white/70'>
                Acceso pensado para recepción, inventario y administración.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='overflow-hidden rounded-2xl border border-white/10 bg-black/20'>
                <Image src='/Login.png' alt='Hotel interface preview' width={900} height={620} className='h-full w-full object-cover' />
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-sm text-white/60'>Roles</p>
                  <p className='mt-1 font-medium'>ADMIN y USER</p>
                </div>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-sm text-white/60'>Flujos</p>
                  <p className='mt-1 font-medium'>Login, transacciones y maestros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
