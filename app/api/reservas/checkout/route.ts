import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = (await request.json()) as { reservaId?: string; maestroId?: string; amount?: number };
    const reservaId = body.reservaId?.trim();
    if (!reservaId) return NextResponse.json({ error: 'reservaId required' }, { status: 400 });

    const reserva = await prisma.reserva.findUnique({ where: { id: reservaId }, include: { habitacion: true } });
    if (!reserva) return NextResponse.json({ error: 'Reserva not found' }, { status: 404 });

    const amount = body.amount ? Math.round(body.amount) : 0;

    let movimiento = null;
    let maestroId = body.maestroId;

    if (amount > 0) {
      if (!maestroId) {
        const first = await prisma.maestro.findFirst();
        if (first) maestroId = first.id;
        else {
          const created = await prisma.maestro.create({ data: { name: 'Caja', createdById: sessionUser.id } });
          maestroId = created.id;
        }
      }

      const [m] = await prisma.$transaction([
        prisma.movimiento.create({
          data: { tipo: 'SALIDA', quantity: amount, maestroId, createdById: sessionUser.id },
          include: { maestro: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } } },
        }),
        prisma.maestro.update({ where: { id: maestroId }, data: { balance: { decrement: amount } } }),
      ]);

      movimiento = m;
    }

    await prisma.habitacion.update({ where: { id: reserva.habitacionId }, data: { estado: 'DISPONIBLE' } });

    return NextResponse.json({ movimiento, reserva }, { status: 200 });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json({ error: 'Failed to check-out' }, { status: 500 });
  }
}
