import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';

import { prisma } from '@/services/prismaClient';
import { AppError } from '@/lib/errors/appError';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405);
  }

  const { pubkey, event, tickets } = await req.json();

  if (!pubkey) {
    return NextResponse.json(
      {
        status: false,
        error: 'Pubkey is required',
      },
      { status: 400 }
    );
  }

  if (!event?.title) {
    return NextResponse.json(
      {
        status: false,
        error: 'Title is required',
      },
      { status: 400 }
    );
  }

  if (!tickets.length) {
    return NextResponse.json(
      {
        status: false,
        error: 'Tickets is required',
      },
      { status: 400 }
    );
  }

  const ticket = tickets[0];

  try {
    const nostrId: string = randomBytes(32).toString('hex');

    const createdEvent = await prisma.event.create({
      data: {
        title: event?.title as string,
        description: event?.description as string,
        start: String(event?.start),
        pubkey: pubkey as string,
        nostrId: nostrId as string,
        status: 'active',
      },
    });

    await prisma.ticket.create({
      data: {
        title: ticket?.title as string,
        description: ticket?.description as string,
        amount: ticket?.amount ?? 0,
        currency: 'sat',
        quantity: ticket?.quantity ?? 0,
        eventId: createdEvent?.id as string,
        status: 'active',
      },
    });

    return NextResponse.json({
      status: true,
      data: { id: createdEvent?.id },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error?.message || 'Internal Server Error' },
      { status: error?.statusCode || 420 }
    );
  }
}
