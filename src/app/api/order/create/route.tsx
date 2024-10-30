import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/services/prismaClient';
import { AppError } from '@/lib/errors/appError';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405);
  }

  const { quantity, userId, ticketId, eventId } = await req.json();

  if (!quantity) {
    return NextResponse.json(
      {
        status: false,
        error: 'Quantity is required',
      },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      {
        status: false,
        error: 'User is required',
      },
      { status: 400 }
    );
  }

  if (!ticketId) {
    return NextResponse.json(
      {
        status: false,
        error: 'Ticket is required',
      },
      { status: 400 }
    );
  }

  if (!eventId) {
    return NextResponse.json(
      {
        status: false,
        error: 'Event is required',
      },
      { status: 400 }
    );
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId as string,
      },
    });

    if (!ticket)
      return NextResponse.json(
        { status: false, error: 'Ticket not found' },
        { status: 400 }
      );

    const ticketAmount = ticket?.amount || 0;

    const order = await prisma.order.create({
      data: {
        quantity: quantity as number,
        amount: (ticketAmount * quantity) as number,
        paid: false,

        userId,
        eventId,
      },
    });

    return NextResponse.json({
      status: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error?.message || 'Internal Server Error' },
      { status: error?.statusCode || 420 }
    );
  }
}
