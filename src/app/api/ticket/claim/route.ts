import { NextRequest, NextResponse } from 'next/server';
import { id, tx } from '@instantdb/admin';
import { randomBytes } from 'crypto';

import { AppError } from '@/lib/errors/appError';
import { db } from '@/config/instantdb';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405);
  }

  const { bolt11, userId, orderId, eventId } = await req.json();

  if (!userId) {
    return NextResponse.json(
      {
        status: false,
        error: 'User is required',
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

  const now = Date.now();

  try {
    // Find if order exist
    const queryOrder = {
      orders: {
        $: {
          where: {
            id: orderId,
            eventId,
          },
        },
      },
    };

    const { orders } = await db.query(queryOrder);

    const order = orders[0];
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    await db.transact(
      tx.orders[order?.id].update({
        paid: true,

        // Status
        updatedAt: now,
      })
    );

    // Create tickets
    let sales = [];

    for (let i = 0; i < order?.quantity; i++) {
      const reference: string = randomBytes(16).toString('hex');

      const data = {
        reference,
        bolt11,
        checkIn: false,

        userId,
        orderId,
        eventId,
      };

      const newId = id();
      await db.transact(
        tx.ticketSales[newId].update({
          ...data,

          createdAt: now,
          updatedAt: now,
        })
      );

      // const sale: TicketSale | null = await prisma.ticketSale.create({
      //   data: {
      //     reference,
      //     bolt11,
      //     userId: userId,
      //     orderId: order?.id,
      //     eventId: order?.eventId,
      //   },
      // });

      sales.push(data);
    }

    return NextResponse.json({
      status: true,
      data: sales,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error?.message || 'Internal Server Error' },
      { status: error?.statusCode || 420 }
    );
  }
}
