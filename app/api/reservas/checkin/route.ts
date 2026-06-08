import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserFromRequest } from '@/lib/auth';

function daysBetween(a: Date, b: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / msPerDay));
}

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = (await request.json()) as { reservaId?: string; maestroId?: string };
    const reservaId = body.reservaId?.trim();
    if (!reservaId) return NextResponse.json({ error: 'reservaId required' }, { status: 400 });

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { habitacion: true },
    });

    if (!reserva) return NextResponse.json({ error: 'Reserva not found' }, { status: 404 });

    const nights = daysBetween(new Date(reserva.fechaInicio), new Date(reserva.fechaFin));
    const amount = Math.round((reserva.habitacion.precio ?? 0) * nights);

    // choose maestro: provided or first existing, or create default
    let maestroId = body.maestroId;
    if (!maestroId) {
      const first = await prisma.maestro.findFirst();
      if (first) maestroId = first.id;
      else {
        const created = await prisma.maestro.create({ data: { name: 'Caja', createdById: sessionUser.id } });
        maestroId = created.id;
      }
    }

    const [movimiento] = await prisma.$transaction([
      prisma.movimiento.create({
        data: {
          tipo: 'ENTRADA',
          quantity: amount,
          maestroId,
          createdById: sessionUser.id,
        },
        include: { createdBy: { select: { id: true, name: true } }, maestro: { select: { id: true, name: true } } },
      }),
      prisma.maestro.update({ where: { id: maestroId }, data: { balance: { increment: amount } } }),
      prisma.habitacion.update({ where: { id: reserva.habitacionId }, data: { estado: 'OCUPADA' } }),
    ]);

    return NextResponse.json({ movimiento, reserva }, { status: 200 });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Failed to check-in' }, { status: 500 });
  }
}
