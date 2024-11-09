import { NextRequest, NextResponse } from 'next/server';
import { id, tx } from '@instantdb/admin';

import { AppError } from '@/lib/errors/appError';
import { db } from '@/config/instantdb';

const FEE = Number(process.env.FEE_VALUE_NUMBER);

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
    // Find if user exist
    const query = {
      tickets: {
        $: {
          where: {
            id: ticketId,
          },
        },
      },
    };

    const { tickets } = await db.query(query);
    const ticket = tickets[0];

    if (!ticket)
      return NextResponse.json(
        { status: false, error: 'Ticket not found' },
        { status: 400 }
      );

    const total =
      Number((quantity * ticket?.amount).toFixed(0)) +
      Number((quantity * ticket?.amount * (FEE / 100)).toFixed(0));

    const service = Number((total * (FEE / 100)).toFixed(0));

    // If not exist, create
    const newId = id();
    const now = Date.now();

    await db.transact(
      tx.orders[newId].update({
        // Data
        quantity,
        amount: total,
        paid: false,

        // Relations
        userId,
        ticketId,
        eventId,
        zapId: '',

        // Status
        updatedAt: now,
        createdAt: now,
      })
    );

    return NextResponse.json({
      status: true,
      data: { id: newId },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error?.message || 'Internal Server Error' },
      { status: error?.statusCode || 420 }
    );
  }
}
