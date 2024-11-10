import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { id, tx } from '@instantdb/admin';

import { AppError } from '@/lib/errors/appError';

import { db } from '@/config/instantdb';

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
  const now = Date.now();
  const nostrId: string = randomBytes(32).toString('hex');

  try {
    const newIdEvent = id();
    await db.transact(
      tx.events[newIdEvent].update({
        ...event,
        pubkey,
        nostrId,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })
    );

    const newIdTicket = id();
    await db.transact(
      tx.tickets[newIdTicket].update({
        ...ticket,
        eventId: newIdEvent,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })
    );

    return NextResponse.json({
      status: true,
      data: { id: newIdEvent },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error?.message || 'Internal Server Error' },
      { status: error?.statusCode || 420 }
    );
  }
}
