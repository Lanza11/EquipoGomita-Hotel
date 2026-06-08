import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const maestroId = request.nextUrl.searchParams.get('maestroId');

  if (!maestroId) {
    return NextResponse.json({ error: 'maestroId is required' }, { status: 400 });
  }

  try {
    const movimientos = await prisma.movimiento.findMany({
      where: { maestroId },
      orderBy: { date: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        maestro: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ movimientos }, { status: 200 });
  } catch (error) {
    console.error('Error fetching movimientos:', error);
    return NextResponse.json({ error: 'Failed to fetch movimientos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      maestroId?: string;
      tipo?: 'ENTRADA' | 'SALIDA';
      quantity?: number;
    };

    const maestroId = body.maestroId?.trim();
    const tipo = body.tipo;
    const quantity = Number(body.quantity ?? 0);

    if (!maestroId || !tipo || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Maestro, tipo y cantidad válidos son obligatorios' }, { status: 400 });
    }

    const maestro = await prisma.maestro.findUnique({ where: { id: maestroId } });

    if (!maestro) {
      return NextResponse.json({ error: 'Maestro not found' }, { status: 404 });
    }

    const signedQuantity = tipo === 'ENTRADA' ? quantity : -quantity;

    const [movimiento] = await prisma.$transaction([
      prisma.movimiento.create({
        data: {
          tipo,
          quantity,
          maestroId,
          createdById: sessionUser.id,
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          maestro: { select: { id: true, name: true } },
        },
      }),
      prisma.maestro.update({
        where: { id: maestroId },
        data: {
          balance: {
            increment: signedQuantity,
          },
        },
      }),
    ]);

    return NextResponse.json({ movimiento }, { status: 201 });
  } catch (error) {
    console.error('Error creating movimiento:', error);
    return NextResponse.json({ error: 'Failed to create movimiento' }, { status: 500 });
  }
}
