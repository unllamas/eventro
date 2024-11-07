import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/services/prismaClient';
import { AppError } from '@/lib/errors/appError';

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', 405);
  }

  const pubkey = req.nextUrl.searchParams.get('pubkey');

  try {
    const events = await prisma.event.findMany({
      where: {
        pubkey: pubkey as string,
      },
    });

    return NextResponse.json({
      status: true,
      data: events,
    });
  } catch (error: any) {
    console.error('Error counting events:', error);

    return NextResponse.json({
      status: false,
      errors: error.message || 'Failed to count events',
    });
  }
}
