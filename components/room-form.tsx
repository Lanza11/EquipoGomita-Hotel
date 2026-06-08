"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoomForm() {
  const router = useRouter();
  const [numero, setNumero] = useState<number | ''>('');
  const [tipo, setTipo] = useState<'SIMPLE' | 'DOBLE' | 'SUITE'>('SIMPLE');
  const [precio, setPrecio] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/habitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, tipo, precio }),
      });
      if (!res.ok) throw new Error('Failed');
      setNumero('');
      setTipo('SIMPLE');
      setPrecio(0);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('No se pudo crear la habitación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className='mb-4 flex flex-wrap gap-2'>
        <input
          className='input'
          placeholder='Número'
          type='number'
          value={numero}
          onChange={(e) => setNumero(e.target.value ? Number(e.target.value) : '')}
        />
      <select className='select' value={tipo} onChange={(e) => setTipo(e.target.value as 'SIMPLE' | 'DOBLE' | 'SUITE')}>
        <option value='SIMPLE'>SIMPLE</option>
        <option value='DOBLE'>DOBLE</option>
        <option value='SUITE'>SUITE</option>
      </select>
        <input
          className='input'
          type='number'
          placeholder='Precio'
          value={precio}
          onChange={(e) => setPrecio(e.target.value ? Number(e.target.value) : '')}
        />
      <button className='btn' type='submit' disabled={loading}>
        {loading ? 'Guardando...' : 'Crear Habitación'}
      </button>
    </form>
  );
}
