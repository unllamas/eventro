import { NextRequest, NextResponse } from 'next/server';
import { id, tx } from '@instantdb/admin';

import { AppError } from '@/lib/errors/appError';
import { db } from '@/config/instantdb';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405);
  }

  const { name, email, pubkey } = await req.json();

  if (!pubkey && (!email || !name)) {
    return NextResponse.json(
      {
        status: false,
        error: 'Data is required',
      },
      { status: 400 }
    );
  }

  const now = Date.now();

  try {
    // Find if user exist
    const query = {
      users: {
        $: {
          where: {
            email,
          },
        },
      },
    };

    const { users } = await db.query(query);

    // If exist, return user
    if (users && users?.length > 0) {
      const user = users[0];

      return NextResponse.json({
        status: true,
        data: { id: user?.id },
      });
    }

    // If not exist, create
    const newId = id();
    await db.transact(
      tx.users[newId].update({
        name: name || null,
        email: email || null,
        pubkey: pubkey || null,
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
