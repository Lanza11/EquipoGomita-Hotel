import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const habitaciones = await prisma.habitacion.findMany({ orderBy: { numero: 'asc' } });
    return NextResponse.json({ habitaciones }, { status: 200 });
  } catch (error) {
    console.error('Error fetching habitaciones:', error);
    return NextResponse.json({ error: 'Failed to fetch habitaciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (sessionUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = (await request.json()) as {
      numero: string | number;
      tipo: 'SIMPLE' | 'DOBLE' | 'SUITE';
      precio: number | string;
      descripcion?: string | null;
    };

    const numero = Number(body.numero);
    const precio = Number(body.precio);

    if (!Number.isFinite(numero) || !body.tipo || !Number.isFinite(precio)) {
      return NextResponse.json({ error: 'Missing or invalid room data' }, { status: 400 });
    }

    const exists = await prisma.habitacion.findUnique({ where: { numero } });
    if (exists) {
      return NextResponse.json({ error: 'Número de habitación ya existe' }, { status: 409 });
    }

    const habitacion = await prisma.habitacion.create({
      data: {
        numero,
        tipo: body.tipo,
        precio,
        descripcion: body.descripcion ?? '',
        estado: 'DISPONIBLE',
      },
    });

    return NextResponse.json({ habitacion }, { status: 201 });
  } catch (error) {
    console.error('Error creating habitacion:', error);
    return NextResponse.json({ error: 'Failed to create habitacion' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (sessionUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = (await request.json()) as {
      id: string;
      numero?: string | number;
      tipo?: 'SIMPLE' | 'DOBLE' | 'SUITE';
      precio?: number | string;
      descripcion?: string | null;
      estado?: 'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO';
    };

    if (!body.id) return NextResponse.json({ error: 'Room id required' }, { status: 400 });

    const numero = body.numero !== undefined ? Number(body.numero) : undefined;
    const precio = body.precio !== undefined ? Number(body.precio) : undefined;

    if (numero !== undefined && !Number.isFinite(numero)) {
      return NextResponse.json({ error: 'Número inválido' }, { status: 400 });
    }

    if (precio !== undefined && !Number.isFinite(precio)) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }

    const updated = await prisma.habitacion.update({
      where: { id: body.id },
      data: {
        ...(numero !== undefined ? { numero } : {}),
        ...(body.tipo ? { tipo: body.tipo } : {}),
        ...(precio !== undefined ? { precio } : {}),
        descripcion: body.descripcion ?? undefined,
        ...(body.estado ? { estado: body.estado } : {}),
      },
    });

    return NextResponse.json({ habitacion: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating habitacion:', error);
    return NextResponse.json({ error: 'Failed to update habitacion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (sessionUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Room id required' }, { status: 400 });

    await prisma.habitacion.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting habitacion:', error);
    return NextResponse.json({ error: 'Failed to delete habitacion' }, { status: 500 });
  }
}
