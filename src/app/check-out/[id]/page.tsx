import { CheckOut } from '@/features/check-out';

import { prisma } from '@/services/prismaClient';

export default async function Page(props: { params: { id: string } }) {
  const id = props.params.id;

  const { event, ticket, sales } = await prisma.$transaction(async () => {
    const event = await prisma.event.findUnique({
      where: {
        nostrId: id as string,
      },
    });

    const ticket = await prisma.ticket.findFirst({
      where: {
        eventId: event?.id as string,
      },
    });

    const sales = await prisma.ticketSale.count({
      where: {
        eventId: event?.id as string,
      },
    });

    return { event, ticket, sales };
  });

  return <CheckOut event={event} ticket={ticket} ticketsSales={sales} />;
}
