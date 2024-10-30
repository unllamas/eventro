import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/services/prismaClient';
import { AppError } from '@/lib/errors/appError';

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', 405);
  }

  const id = req.nextUrl.searchParams.get('id');

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        eventId: id as string,
      },
    });

    return NextResponse.json({
      status: true,
      data: tickets,
    });
  } catch (error: any) {
    console.error('Error counting tickets:', error);

    return NextResponse.json({
      status: false,
      errors: error.message || 'Failed to count tickets',
    });
  }
}
