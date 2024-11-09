import { NextRequest, NextResponse } from 'next/server';
import { tx } from '@instantdb/admin';
import { randomBytes } from 'crypto';
import {
  Event,
  EventTemplate,
  finalizeEvent,
  getPublicKey,
  Relay,
  verifyEvent,
} from 'nostr-tools';

import { AppError } from '@/lib/errors/appError';
import { getLnurlpFromWalias } from '@/services/ln';
import { db } from '@/config/instantdb';

const FEE = Number(process.env.FEE_VALUE_NUMBER);
const SIGNER = process.env.SIGNER_PRIVATE_KEY! || '';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405);
  }

  const { ticketId, eventId, quantity, userId, orderId } = await req.json();

  // if (!pubkey && (!email || !name)) {
  //   return NextResponse.json(
  //     {
  //       status: false,
  //       error: 'Data is required',
  //     },
  //     { status: 400 }
  //   );
  // }

  const now = Date.now();

  try {
    // Find if ticket exist
    const queryTicket = {
      tickets: {
        $: {
          where: {
            id: ticketId,
            eventId,
          },
        },
      },
    };

    const { tickets } = await db.query(queryTicket);
    const ticket = tickets?.length > 0 && tickets[0];

    if (!ticket) {
      return NextResponse.json({
        status: false,
        error: 'Ticket not found',
        data: null,
      });
    }

    // Search event
    const queryEvent = {
      events: {
        $: {
          where: {
            id: eventId,
          },
        },
      },
    };

    const { events } = await db.query(queryEvent);
    const event = events?.length > 0 && events[0];

    if (!event) {
      return NextResponse.json({
        status: false,
        error: 'Event not found',
        data: null,
      });
    }

    const total =
      Number((quantity * ticket?.amount).toFixed(0)) +
      Number((quantity * ticket?.amount * (FEE / 100)).toFixed(0));

    const service = Number((total * (FEE / 100)).toFixed(0));

    // Generate structure for zap request
    const unsignedZapRequest: EventTemplate = {
      kind: 9734,
      tags: [
        ['p', event?.pubkey],
        ['amount', (total * 1000).toString()],
        ['relays', 'wss://relay.lawallet.ar', 'wss://nostr-pub.wellorder.net'],
        ['e', orderId],
      ] as string[][],
      content: '',
      created_at: Math.round(Date.now() / 1000),
    };

    // Firm event
    const privateKey = Uint8Array.from(Buffer.from(SIGNER, 'hex'));
    const zapRequest: Event = finalizeEvent(unsignedZapRequest, privateKey);

    let isGood = verifyEvent(zapRequest);
    if (!isGood) {
      return NextResponse.json({
        status: false,
        error: 'Zap request not found',
        data: null,
      });
    }

    console.log('zapRequest', zapRequest);
    // Publish event on Nostr
    const relay = await Relay.connect('wss://nostr-pub.wellorder.net');
    const test = await relay.publish(zapRequest);
    console.log('test', test);
    relay.close();

    // Update order with id for zap request
    await db.transact(
      tx.orders[orderId].update({
        // Relations
        zapId: zapRequest?.id,

        // Status
        updatedAt: now,
      })
    );

    // Lnurlp
    // TO-DO: get lud16 from pubkey on Event
    // if not found, return error
    const lud16 = 'dios@lawallet.ar'!;
    const lnurlp = await getLnurlpFromWalias(lud16);

    if (!lnurlp) {
      // return NextResponse.json({
      //   status: false,
      //   error: 'Failed to retrieve LNURLP data',
      //   data: null,
      // });
      throw new AppError('Failed to retrieve LNURLP data', 500);
    }

    // Invoice
    // const { pr, verify } = await generateInvoice(
    //   lnurlp.callback,
    //   total * 1000,
    //   zapRequest
    // );

    let url = `${lnurlp.callback}?amount=${total * 1000}`;

    // TO-DO: Fix this
    // if (zapRequest?.sig) {
    //   const format = JSON.stringify(zapRequest);
    //   const encodedZapEvent = encodeURI(format);

    //   url += `&nostr=${encodedZapEvent}&lnurl=lnurl`;
    // }

    const response = (await (await fetch(url)).json()) as any;
    console.log('response', response);
    const pr = response.pr as string;
    const verify = response.verify as string;

    if (!pr || !verify) {
      throw new AppError('Failed to generate Invoice', 500);
    }

    return NextResponse.json({
      status: true,
      data: { pr, verify },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error?.message || 'Internal Server Error' },
      { status: error?.statusCode || 420 }
    );
  }
}
