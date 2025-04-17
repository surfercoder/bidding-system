import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}