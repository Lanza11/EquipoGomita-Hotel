'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [image, setImage] = React.useState('');
  const [role, setRole] = React.useState<'ADMIN' | 'USER'>('USER');
  const [enabled, setEnabled] = React.useState(true);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name,
            email,
            password,
            image: image || null,
            role,
            enabled,
          },
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? 'No se pudo crear el usuario');
      }

      toast.success('Usuario creado correctamente');
      router.push('/users');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el usuario');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='container mx-auto max-w-3xl py-10'>
      <Card>
        <CardHeader>
          <CardTitle>Nuevo usuario del hotel</CardTitle>
          <CardDescription>
            Crea cuentas para el personal con contraseña explícita, sin depender de un valor por defecto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className='grid gap-4' onSubmit={handleSubmit}>
            <div className='grid gap-2'>
              <label htmlFor='name' className='text-sm font-medium'>Nombre</label>
              <Input id='name' value={name} onChange={(e) => setName(e.target.value)} required placeholder='Nombre completo' />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='email' className='text-sm font-medium'>Correo</label>
              <Input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} required placeholder='correo@hotel.com' />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='password' className='text-sm font-medium'>Contraseña</label>
              <Input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required placeholder='Define una contraseña' />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='image' className='text-sm font-medium'>Foto de perfil</label>
              <Input id='image' value={image} onChange={(e) => setImage(e.target.value)} placeholder='https://...' />
            </div>
            <div className='grid gap-2 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <label htmlFor='role' className='text-sm font-medium'>Rol</label>
                <select id='role' className='h-10 rounded-md border border-input bg-background px-3' value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}>
                  <option value='USER'>USER</option>
                  <option value='ADMIN'>ADMIN</option>
                </select>
              </div>
              <label className='flex items-center gap-3 rounded-md border px-3 py-2 text-sm'>
                <input
                  type='checkbox'
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                {' '}
                Usuario habilitado
              </label>
            </div>
            <div className='flex gap-3 pt-2'>
              <Button type='submit' disabled={loading}>
                {loading ? 'Guardando...' : 'Crear usuario'}
              </Button>
              <Button type='button' variant='outline' asChild>
                <Link href='/users'>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
