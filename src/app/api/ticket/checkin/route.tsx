import { prisma } from '@/services/prismaClient';
import { NextRequest, NextResponse } from 'next/server';

import { AppError } from '@/lib/errors/appError';

interface CheckInResponse {
  checkIn: boolean;
  alreadyCheckedIn: boolean;
  reference: string;
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405);
  }
  try {
    // Auth event
    const { eventId, reference } = await req.json();

    if (!eventId) {
      throw new AppError('Missing eventId', 400);
    }

    if (!reference) {
      throw new AppError('Missing reference', 400);
    }

    // Event validation
    // const adminPublicKey = process.env.NEXT_ADMIN_PUBLIC_KEY!;

    // const isValidOrderEvent = validateTicketEvent(result.data, adminPublicKey);

    // if (!isValidOrderEvent) {
    //   throw new AppError('Invalid ticket event', 403);
    // }

    // Check ticket
    // const { ticket_id: ticketId } = JSON.parse(result.data.content);

    // const { alreadyCheckedIn, checkIn } = await checkInTicket(ticketId);

    const { alreadyCheckedIn, checkIn } = await prisma.$transaction(
      // To Do: optimize this query with conditional update
      async () => {
        // Find ticket
        const sale = await prisma.ticketSale.findUnique({
          where: {
            reference: reference,
            eventId: eventId,
          },
        });

        if (!sale) {
          throw new Error('Ticket not found');
        }

        // Check if ticket is already checked in
        let alreadyCheckedIn = false;

        if (sale?.checkIn) {
          alreadyCheckedIn = true;

          return { alreadyCheckedIn, checkIn: true };
        }

        // Update ticket to checked in
        const saleChecked = await prisma.ticketSale.update({
          where: {
            id: sale?.id,
            reference: reference,
            eventId: eventId,
          },
          data: {
            checkIn: true,
          },
        });

        if (!saleChecked) {
          throw new Error('Error checking in ticket');
        }

        return { alreadyCheckedIn: false, checkIn: true };
      }
    );

    const data: CheckInResponse = {
      alreadyCheckedIn,
      checkIn,
      reference,
    };

    return NextResponse.json({
      status: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
