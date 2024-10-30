import { NextRequest, NextResponse } from 'next/server';
import { Event, EventTemplate, finalizeEvent } from 'nostr-tools';
import { Order, User } from '@prisma/client';

import { AppError } from '@/lib/errors/appError';

import { getLnurlpFromWalias } from '@/services/ln';
import { prisma } from '@/services/prismaClient';

interface RequestTicketResponse {
  pr: string;
  verify: string;
  orderId: string;
}

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const body = await req.json();

    // Zod
    // const result = requestOrderSchema.safeParse(body);

    // if (!result.success) {
    //   throw new AppError(result.error.errors[0].message, 400);
    // }

    const { fullname, email, ticketQuantity, eventId } = body;

    if (!eventId) {
      throw new AppError('Evento obligatorio', 400);
    }

    const { event, ticket } = await prisma.$transaction(async () => {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId as string,
        },
        select: {
          nostrId: true,
        },
      });

      if (!event) return { event: null };

      const ticket = await prisma.ticket.findFirst({
        where: {
          eventId: eventId as string,
        },
      });

      if (!ticket) return { ticket: null };

      return { event, ticket };
    });

    if (!event) {
      throw new AppError('No se encontro Evento', 400);
    }

    if (!ticket) {
      throw new AppError('No existe ticket', 400);
    }

    // Create or update user
    const user: User | null = await prisma.user.upsert({
      where: {
        email,
      },
      update: {},
      create: { name: fullname, email },
    });

    if (!user) {
      throw new AppError('No existe user', 400);
    }

    // Create order
    const order: Order | null = await prisma.order.create({
      data: {
        quantity: ticketQuantity,
        amount: ticket?.amount * ticketQuantity,

        // Reference
        userId: user?.id,
        eventId,
      },
    });

    const milisat = ticket.amount * ticketQuantity * 1000;

    // Lnurlp
    let lnurlp;
    try {
      const posWalias = process.env.POS_WALIAS!;
      lnurlp = await getLnurlpFromWalias(posWalias);
    } catch (error) {
      throw new AppError('Failed to retrieve LNURLP data', 500);
    }

    // Zap Request
    const unsignedZapRequest: EventTemplate = {
      kind: 9734,
      tags: [
        ['p', lnurlp.nostrPubkey],
        ['amount', milisat],
        ['relays', 'wss://relay.lawallet.ar', 'wss://nostr-pub.wellorder.net'],
        ['e', order?.id],
      ] as string[][],
      content: '',
      created_at: Math.round(Date.now() / 1000),
    };

    const privateKey = Uint8Array.from(
      Buffer.from(process.env.SIGNER_PRIVATE_KEY!, 'hex')
    );

    const zapRequest: Event = finalizeEvent(unsignedZapRequest, privateKey);

    console.log('zapRequest', zapRequest);

    // Invoice
    let url = `${lnurlp.callback}?amount=${milisat}`;
    // if (zapRequest) {
    //   const encodedZapEvent = encodeURI(JSON.stringify(zapRequest));
    //   url += `&nostr=${encodedZapEvent}&lnurl=lnurl`;
    // }

    const res = (await (await fetch(url)).json()) as any;
    const pr = res.pr as string;
    const verify = res.verify as string;

    // Response
    const response: RequestTicketResponse = {
      pr: pr,
      verify,
      orderId: order?.id,
    };

    return NextResponse.json({
      status: true,
      data: response,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
