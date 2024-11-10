import { NextRequest, NextResponse } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { db } from '@/config/instantdb';

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', 405);
  }

  const pubkey = req.nextUrl.searchParams.get('pubkey');
  const query = {
    events: {
      $: {
        where: {
          pubkey,
        },
      },
    },
  };

  try {
    const data = await db.query(query);
    const { events } = data;

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error counting events:', error);

    return NextResponse.json({
      status: false,
      errors: error.message || 'Failed to count events',
    });
  }
}
