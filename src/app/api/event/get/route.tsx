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
          id,
        },
      },
    },
    tickets: {
      $: {
        where: {
          eventId: id,
        },
      },
    },
  };

  try {
    const data = await db.query(query);
    const { events, tickets } = data;

    return NextResponse.json({ event: events[0], ticket: tickets[0] });
  } catch (error: any) {
    console.error('Error counting tickets:', error);

    return NextResponse.json({
      status: false,
      errors: error.message || 'Failed to count tickets',
    });
  }
}
