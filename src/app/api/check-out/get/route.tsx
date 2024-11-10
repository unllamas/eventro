import { NextRequest, NextResponse } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { db } from '@/config/instantdb';

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', 405);
  }

  const id = req.nextUrl.searchParams.get('id');

  const query = {
    events: {
      $: {
        where: {
          nostrId: id,
        },
      },
    },
  };

  try {
    const { events } = await db.query(query);

    const event = events[0];

    const subQuery = {
      tickets: {
        $: {
          where: {
            eventId: event?.id,
          },
        },
      },
    };

    const { tickets } = await db.query(subQuery);

    return NextResponse.json({ event: events[0], ticket: tickets[0] });
  } catch (error: any) {
    console.error('Error counting tickets:', error);

    return NextResponse.json({
      status: false,
      errors: error.message || 'Failed to count tickets',
    });
  }
}
