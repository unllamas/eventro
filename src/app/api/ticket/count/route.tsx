import { NextRequest, NextResponse } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { prisma } from '@/services/prismaClient';

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', 405);
  }

  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    throw new AppError('Id required', 405);
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        eventId: id as string,
      },
    });

    return NextResponse.json({
      status: true,
      data: { count: tickets?.length },
    });
  } catch (error: any) {
    console.error('Error counting tickets:', error);

    return NextResponse.json({
      status: false,
      errors: error.message || 'Failed to count tickets',
    });
  }
}
