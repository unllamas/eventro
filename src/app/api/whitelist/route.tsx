import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/appError';
import { prisma } from '@/services/prismaClient';

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const body = await req.json();

    const { pubkey } = body;

    if (!pubkey) {
      throw new AppError('Need pubkey', 400);
    }

    const account = await prisma.whitelist.create({
      data: {
        pubkey,
      },
    });

    if (!account) {
      throw new AppError('Failed to create user', 500);
    }

    return NextResponse.json({
      status: true,
      data: account,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;

    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
function createWhiteList(pubkey: any) {
  throw new Error('Function not implemented.');
}
