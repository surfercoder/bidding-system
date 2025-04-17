import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    
    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }
    
    const bids = await prisma.bid.findMany({
      where: {
        collectionId,
      },
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
    });
    
    return NextResponse.json({ bids });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { price, userId, collectionId } = await request.json();
    
    // Check if user already has a bid on this collection
    const existingBid = await prisma.bid.findFirst({
      where: {
        userId,
        collectionId,
      },
    });
    
    if (existingBid) {
      return NextResponse.json(
        { error: 'You already have a bid on this collection. Please update your existing bid.' },
        { status: 400 }
      );
    }
    
    const bid = await prisma.bid.create({
      data: {
        price: parseFloat(price),
        userId,
        collectionId,
        status: 'PENDING',
      },
    });
    
    return NextResponse.json({ bid }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create bid' }, { status: 500 });
  }
}