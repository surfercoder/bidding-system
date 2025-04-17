import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
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
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    });
    return NextResponse.json({ collections });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, stock, price, userId } = await request.json();
    
    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        stock: parseInt(stock),
        price: parseFloat(price),
        userId,
      },
    });
    
    return NextResponse.json({ collection }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}