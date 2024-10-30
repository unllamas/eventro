// import { NextRequest, NextResponse } from 'next/server';
// import { getPublicKey, validateEvent } from 'nostr-tools';
// import { randomBytes } from 'crypto';
// import { Order, TicketSale, User } from '@prisma/client';

// import {
//   validateZapReceiptEmitter,
//   validateZapRequest,
// } from '@/lib/validation/claimSchema';
// import { AppError } from '@/lib/errors/appError';

// import { prisma } from '@/services/prismaClient';

// interface OrderClaimResponse {
//   claim: boolean;
// }

// export async function POST(req: NextRequest) {
//   try {
//     if (req.method !== 'POST') {
//       throw new AppError('Method not allowed', 405);
//     }

//     const body = await req.json();

//     // Zod
//     // const result = orderClaimSchema.safeParse(body);

//     // if (!result.success) {
//     //   throw new AppError(result.error.errors[0].message, 400);
//     // }

//     const { fullname, email, zapReceipt, code, orderId } = body;

//     // Validate zapReceipt
//     const isValidEvent = validateEvent(zapReceipt);
//     if (!isValidEvent) {
//       throw new AppError('Invalid zap receipt', 403);
//     }

//     const isValidEmitter = validateZapReceiptEmitter(zapReceipt);
//     if (!isValidEmitter) {
//       throw new AppError('Invalid zap receipt emitter', 403);
//     }

//     // Validate zapRequest
//     const publicKey = getPublicKey(
//       Uint8Array.from(Buffer.from(process.env.NEXT_SIGNER_PRIVATE_KEY!, 'hex'))
//     );
//     const isValidZapRequest = validateZapRequest(zapReceipt, publicKey);
//     if (!isValidZapRequest) {
//       throw new AppError('Invalid zapRequest', 403);
//     }

//     const existingOrder = await prisma.order.findUnique({
//       where: { id: orderId },
//       select: { paid: true },
//     });

//     if (existingOrder?.paid) {
//       return { order: null, user: null, tickets: [], alreadyPaid: true };
//     }

//     // Update order to paid
//     const order: Order | null = await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         paid: true,
//         zapReceiptId: zapReceipt.id,
//       },
//     });

//     // Update the user in case their name changes
//     const user: User | null = await prisma.user.update({
//       where: { email },
//       data: { name: fullname },
//     });

//     // if (code) {
//     //   await prisma.code.update({
//     //     where: { code },
//     //     data: {
//     //       used: {
//     //         increment: 1,
//     //       },
//     //     },
//     //   });
//     // }

//     if (!order || !user) {
//       throw new Error('Order or user not found, cannot create ticket');
//     }

//     // Create tickets
//     let sales: TicketSale[] = [];

//     for (let i = 0; i < order?.quantity; i++) {
//       const ticketId: string = randomBytes(16).toString('hex');

//       const sale: TicketSale | null = await prisma.ticketSale.create({
//         data: {
//           ticketId,
//           userId: user.id,
//           orderId: order.id,
//           eventId: order.eventId,
//         },
//       });

//       sales.push(sale);
//     }

//     // Prisma
//     // let updateOrderResponse: UpdatePaidOrderResponse;
//     // try {
//     //   updateOrderResponse = await updatePaidOrder(
//     //     fullname,
//     //     email,
//     //     zapReceipt,
//     //     orderId
//     //   );
//     // } catch (error: any) {
//     //   throw new AppError('Failed to update order', 500);
//     // }

//     // AWS SES
//     // if (!updateOrderResponse.alreadyPaid) {
//     //   try {
//     //     for (const ticket of updateOrderResponse.tickets) {
//     //       await ses.sendEmailOrder(email, ticket.ticketId!); // TODO: send one email with all tickets
//     //     }
//     //   } catch (error: any) {
//     //     throw new AppError('Failed to send order email', 500);
//     //   }
//     // }

//     // Response
//     const response: OrderClaimResponse = {
//       claim: true,
//     };

//     return NextResponse.json({
//       status: true,
//       data: response,
//     });
//   } catch (error: any) {
//     return NextResponse.json(
//       { status: false, errors: error.message || 'Internal Server Error' },
//       { status: error.statusCode || 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

import { prisma } from '@/services/prismaClient';
import { AppError } from '@/lib/errors/appError';
import { TicketSale } from '@prisma/client';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', 405);
  }

  const { bolt11, userId, orderId, eventId } = await req.json();

  if (!userId) {
    return NextResponse.json(
      {
        status: false,
        error: 'User is required',
      },
      { status: 400 }
    );
  }

  if (!eventId) {
    return NextResponse.json(
      {
        status: false,
        error: 'Event is required',
      },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId as string,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const orderUpdated = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        paid: true,
      },
    });

    // Create tickets
    let sales: TicketSale[] = [];

    for (let i = 0; i < orderUpdated?.quantity; i++) {
      const reference: string = randomBytes(16).toString('hex');

      const sale: TicketSale | null = await prisma.ticketSale.create({
        data: {
          reference,
          bolt11,
          userId: userId,
          orderId: orderUpdated?.id,
          eventId: orderUpdated?.eventId,
        },
      });

      sales.push(sale);
    }

    return NextResponse.json({
      status: true,
      data: sales,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error?.message || 'Internal Server Error' },
      { status: error?.statusCode || 420 }
    );
  }
}
