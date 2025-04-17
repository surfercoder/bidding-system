import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const collection = await prisma.collection.findUnique({
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
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            price: 'desc',
          },
        },
      },
    });
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    
    return NextResponse.json({ collection });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { name, description, stock, price } = await request.json();
    
    const collection = await prisma.collection.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        stock: parseInt(stock),
        price: parseFloat(price),
      },
    });
    
    return NextResponse.json({ collection });
  } catch {
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // First delete all bids associated with this collection
    await prisma.bid.deleteMany({
      where: {
        collectionId: params.id,
      },
    });
    
    // Then delete the collection
    const collection = await prisma.collection.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json({ collection });
  } catch {
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}