import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/services/prismaClient';
import { AppError } from '@/lib/errors/appError';

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', 405);
  }

  const reference = req.nextUrl.searchParams.get('ref');

  if (!reference) {
    return NextResponse.json({ status: false, errors: 'Missing id' });
  }

  try {
    const sale = await prisma.ticketSale.findUnique({
      where: {
        reference: reference as string,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: true,
      data: sale,
    });
  } catch (error: any) {
    // console.error('Error counting tickets:', error);

    return NextResponse.json({
      status: false,
      errors: error.message || 'Failed',
    });
  }
}
