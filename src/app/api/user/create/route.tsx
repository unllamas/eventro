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

  if (!pubkey) {
    return NextResponse.json(
      {
        status: false,
        error: 'Pubkey is required',
      },
      { status: 400 }
    );
  }

  if (!email || !name) {
    return NextResponse.json(
      {
        status: false,
        error: 'Email or name is required',
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: name as string,
        email: email as string,
        pubkey: pubkey as string,
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
