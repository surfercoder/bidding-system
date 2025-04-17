import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const bid = await prisma.bid.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        collection: true,
      },
    });
    
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }
    
    return NextResponse.json({ bid });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bid' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { price } = await request.json();
    
    const bid = await prisma.bid.update({
      where: {
        id: params.id,
      },
      data: {
        price: parseFloat(price),
      },
    });
    
    return NextResponse.json({ bid });
  } catch {
    return NextResponse.json({ error: 'Failed to update bid' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const bid = await prisma.bid.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json({ bid });
  } catch {
    return NextResponse.json({ error: 'Failed to delete bid' }, { status: 500 });
  }
}