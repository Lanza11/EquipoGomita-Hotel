import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const maestros = await prisma.maestro.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ maestros }, { status: 200 });
  } catch (error) {
    console.error('Error fetching maestros:', error);
    return NextResponse.json({ error: 'Failed to fetch maestros' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { name?: string; balance?: number };
    const name = body.name?.trim();
    const balance = Number(body.balance ?? 0);

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const maestro = await prisma.maestro.create({
      data: {
        name,
        balance,
        createdById: sessionUser.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ maestro }, { status: 201 });
  } catch (error) {
    console.error('Error creating maestro:', error);
    return NextResponse.json({ error: 'Failed to create maestro' }, { status: 500 });
  }
}
