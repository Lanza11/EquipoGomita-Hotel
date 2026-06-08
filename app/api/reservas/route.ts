import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserFromRequest } from '@/lib/auth';

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA <= endB && startB <= endA;
}

export async function GET(request: NextRequest) {
  const availableOnly = request.nextUrl.searchParams.get('available') === 'true';
  const from = request.nextUrl.searchParams.get('from');
  const to = request.nextUrl.searchParams.get('to');

  try {
    if (availableOnly && from && to) {
      const startDate = new Date(from);
      const endDate = new Date(to);

      const habitaciones = await prisma.habitacion.findMany({
        orderBy: { numero: 'asc' },
        include: {
          reservas: {
            where: {
              AND: [
                { fechaInicio: { lte: endDate } },
                { fechaFin: { gte: startDate } },
              ],
            },
          },
        },
      });

      const availableRooms = habitaciones.filter((habitacion) => habitacion.reservas.length === 0);

      return NextResponse.json({ habitaciones: availableRooms }, { status: 200 });
    }

    const reservas = await prisma.reserva.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        habitacion: { select: { id: true, numero: true, tipo: true, estado: true } },
      },
    });

    return NextResponse.json({ reservas }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reservas:', error);
    return NextResponse.json({ error: 'Failed to fetch reservas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      userId?: string;
      habitacionId?: string;
      fechaInicio?: string;
      fechaFin?: string;
    };

    const userId = body.userId?.trim();
    const habitacionId = body.habitacionId?.trim();
    const fechaInicio = body.fechaInicio ? new Date(body.fechaInicio) : null;
    const fechaFin = body.fechaFin ? new Date(body.fechaFin) : null;

    if (!userId || !habitacionId || !fechaInicio || !fechaFin) {
      return NextResponse.json({ error: 'Faltan datos para crear la reserva' }, { status: 400 });
    }

    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
      return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 });
    }

    if (fechaInicio > fechaFin) {
      return NextResponse.json({ error: 'La fecha de inicio no puede ser mayor a la fecha fin' }, { status: 400 });
    }

    const room = await prisma.habitacion.findUnique({
      where: { id: habitacionId },
      include: {
        reservas: {
          where: {
            AND: [
              { fechaInicio: { lte: fechaFin } },
              { fechaFin: { gte: fechaInicio } },
            ],
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Habitación no encontrada' }, { status: 404 });
    }

    if (room.reservas.some((reserva) => overlaps(reserva.fechaInicio, reserva.fechaFin, fechaInicio, fechaFin))) {
      return NextResponse.json({ error: 'La habitación ya está reservada para esas fechas' }, { status: 409 });
    }

    const reserva = await prisma.reserva.create({
      data: {
        userId,
        habitacionId,
        fechaInicio,
        fechaFin,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        habitacion: { select: { id: true, numero: true, tipo: true, estado: true } },
      },
    });

    await prisma.habitacion.update({
      where: { id: habitacionId },
      data: { estado: 'OCUPADA' },
    });

    return NextResponse.json({ reserva }, { status: 201 });
  } catch (error) {
    console.error('Error creating reserva:', error);
    return NextResponse.json({ error: 'Failed to create reserva' }, { status: 500 });
  }
}
