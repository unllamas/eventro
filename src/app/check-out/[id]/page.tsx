import { CheckOut } from '@/features/check-out';

import { prisma } from '@/services/prismaClient';

export default async function Page(props: { params: { id: string } }) {
  const id = props.params.id;

  const event = await prisma.event.findUnique({
    where: {
      nostrId: id as string,
    },
  });

  if (!event) return <div>Event not found</div>;

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

  return <CheckOut event={event} ticket={ticket} ticketsSales={sales} />;
}
