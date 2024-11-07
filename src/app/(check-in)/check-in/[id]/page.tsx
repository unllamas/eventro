import { CheckIn } from '@/features/check-in';

import { prisma } from '@/services/prismaClient';

export default async function Page(props: { params: { id: string } }) {
  const id = props.params.id;

  const { event, sales } = await prisma.$transaction(async () => {
    const event = await prisma.event.findUnique({
      where: {
        id: id as string,
      },
    });

    if (!event) return { event: null, sales: null };

    const sales = await prisma.ticketSale.findMany({
      where: {
        eventId: event?.id as string,
      },
      select: {
        reference: true,
        checkIn: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!sales) return { event: null, sales: null };

    return { event, sales };
  });

  return <CheckIn event={event} sales={sales} />;
}
