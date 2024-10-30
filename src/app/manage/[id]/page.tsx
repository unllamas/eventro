import Link from 'next/link';
import {
  ArrowUpRight,
  ChevronLeft,
  PencilIcon,
  PlusIcon,
  ScanLine,
  TicketPlus,
  Trash2,
  UserPlus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SatoshiIcon } from '@/components/icons/Satoshi';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { EVENT_MOCK, ORDERS_MOCK, TICKETS_MOCK } from '@/mock';
import { Separator } from '@/components/ui/separator';

import { prisma } from '@/services/prismaClient';
import { Manage } from '@/features/manage';

export default async function Page(props: { params: { id: string } }) {
  const id = props.params.id;

  const { event, ticket, orders, sales } = await prisma.$transaction(
    async () => {
      const event = await prisma.event.findUnique({
        where: {
          id: id as string,
        },
      });

      if (!event)
        return { event: null, ticket: null, orders: null, sales: null };

      const ticket = await prisma.ticket.findFirst({
        where: {
          eventId: event?.id as string,
        },
      });

      if (!ticket)
        return { event: null, ticket: null, orders: null, sales: null };

      const orders = await prisma.order.findMany({
        where: {
          eventId: event?.id as string,
        },
      });

      if (!orders)
        return { event: null, ticket: null, orders: null, sales: null };

      const sales = await prisma.ticketSale.findMany({
        where: {
          eventId: event?.id as string,
        },
      });

      if (!sales)
        return { event: null, ticket: null, orders: null, sales: null };

      return { event, ticket, orders, sales };
    }
  );

  return <Manage event={event} ticket={ticket} orders={orders} sales={sales} />;
}
