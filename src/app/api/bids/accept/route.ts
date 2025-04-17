import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { bidId, collectionId } = await request.json();
    
    // Start a transaction
    return await prisma.$transaction(async (tx) => {
      // Mark the selected bid as accepted
      await tx.bid.update({
        where: {
          id: bidId,
        },
        data: {
          status: 'ACCEPTED',
        },
      });
      
      // Mark all other bids for this collection as rejected
      await tx.bid.updateMany({
        where: {
          collectionId,
          id: {
            not: bidId,
          },
        },
        data: {
          status: 'REJECTED',
        },
      });
      
      // Get the updated bid
      const acceptedBid = await tx.bid.findUnique({
        where: {
          id: bidId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      return NextResponse.json({ bid: acceptedBid });
    });
  } catch {
    return NextResponse.json({ error: 'Failed to accept bid' }, { status: 500 });
  }
}