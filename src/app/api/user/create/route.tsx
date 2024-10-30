import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/services/prismaClient';
import { AppError } from '@/lib/errors/appError';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405);
  }

  const { name, email, pubkey } = await req.json();

  // if (!pubkey) {
  //   return NextResponse.json(
  //     {
  //       status: false,
  //       error: 'Pubkey is required',
  //     },
  //     { status: 400 }
  //   );
  // }

  if (!pubkey && (!email || !name)) {
    return NextResponse.json(
      {
        status: false,
        error: 'Data is required',
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: name ?? null,
        email: email ?? null,
        pubkey: pubkey ?? null,
      },
    });

    return NextResponse.json({
      status: true,
      data: { id: user?.id },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error?.message || 'Internal Server Error' },
      { status: error?.statusCode || 420 }
    );
  }
}
