'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type UserData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'ADMIN' | 'USER';
  enabled: boolean;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(false);
  const [hydrating, setHydrating] = React.useState(true);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [image, setImage] = React.useState('');
  const [role, setRole] = React.useState<'ADMIN' | 'USER'>('USER');
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`/api/user?id=${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = (await response.json()) as { user: UserData };
        setUserData(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setImage(data.user.image ?? '');
        setRole(data.user.role);
        setEnabled(data.user.enabled);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('No se pudo cargar el usuario');
      } finally {
        setHydrating(false);
      }
    }

    if (params.id) {
      void fetchUserData();
    }
  }, [params.id]);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            id: params.id,
            name,
            email,
            password: password || undefined,
            image: image || null,
            role,
            enabled,
          },
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? 'No se pudo actualizar el usuario');
      }

      toast.success('Usuario actualizado correctamente');
      router.push('/users');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el usuario');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='container mx-auto max-w-3xl py-10'>
      <Card>
        <CardHeader>
          <CardTitle>Editar usuario del hotel</CardTitle>
          <CardDescription>
            {userData ? `Editando ${userData.email}` : 'Cargando datos del usuario...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className='grid gap-4' onSubmit={handleSubmit}>
            <div className='grid gap-2'>
              <label htmlFor='name' className='text-sm font-medium'>Nombre</label>
              <Input id='name' value={name} onChange={(e) => setName(e.target.value)} required disabled={hydrating} />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='email' className='text-sm font-medium'>Correo</label>
              <Input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} required disabled={hydrating} />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='password' className='text-sm font-medium'>Nueva contraseña</label>
              <Input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Dejar vacío para conservar la actual' disabled={hydrating} />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='image' className='text-sm font-medium'>Foto de perfil</label>
              <Input id='image' value={image} onChange={(e) => setImage(e.target.value)} disabled={hydrating} />
            </div>
            <div className='grid gap-2 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <label htmlFor='role' className='text-sm font-medium'>Rol</label>
                <select id='role' className='h-10 rounded-md border border-input bg-background px-3' value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')} disabled={hydrating}>
                  <option value='USER'>USER</option>
                  <option value='ADMIN'>ADMIN</option>
                </select>
              </div>
              <label className='flex items-center gap-3 rounded-md border px-3 py-2 text-sm'>
                <input
                  type='checkbox'
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  disabled={hydrating}
                />
                {' '}
                Usuario habilitado
              </label>
            </div>
            <div className='flex gap-3 pt-2'>
              <Button type='submit' disabled={loading || hydrating}>
                {loading ? 'Guardando...' : 'Actualizar usuario'}
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
