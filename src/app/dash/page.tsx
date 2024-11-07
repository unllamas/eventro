import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  CircleHelpIcon,
  CirclePlus,
  ScanLine,
} from 'lucide-react';

// import fetcher from '@/lib/fetcher';

import { Button } from '@/components/ui/button';

// import { TicketsTab } from './components/tickets-tab';
// import { SettingsTab } from './components/settings-tab';
// import { SalesTab } from './components/sales-tab';

import { prisma } from '@/services/prismaClient';
import { NavbarV2 } from '@/components/navbar';

export default async function Page() {
  const pubkey = 'user_pubkey_here'; // Replace with actual user pubkey
  const currentTime = Math.floor(Date.now() / 1000);

  const events = await prisma.event.findMany({
    where: {
      pubkey: pubkey as string,
      end: {
        gte: String(currentTime),
      },
    },
  });

  const sortedEvents = events.sort((a, b) => Number(a.start) - Number(b.start));

  return (
    <div className="min-h-screen bg-background">
      <NavbarV2 label="My events" />
      <div className="flex flex-col gap-8 w-full max-w-[720px] mx-auto px-4 py-8">
        <div className="flex-1 flex justify-center items-center h-full p-8 bg-black border-2 border-dashed border-white/20 rounded-2xl text-center">
          <div className="flex flex-col items-center gap-2 w-full max-w-sm">
            <CircleHelpIcon className="w-8 h-w-8 text-primary" />
            <h3 className="text-lg font-bold">Come on, we&apos;ll help you!</h3>
            <p className="text-muted-foreground">
              Do you want us to create a new event?
            </p>
            <div className="w-full mt-2">
              <Button className="w-full md:w-auto" size="sm" asChild>
                <Link href={`/create`}>
                  <CirclePlus className="w-4 h-w-4 mr-1" />
                  Create event
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Today */}
        <div className="flex gap-4 w-full">
          {/* Separator */}
          {/* <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-8 md:min-w-[120px] md:px-2 py-4">
            <p className="text-sm text-muted-foreground">Today</p>
            <div className="w-[1px] h-full bg-gradient-to-b from-primary to-80% to-card" />
          </div> */}
          {/* Events */}
          <div className="flex flex-col gap-8 w-full">
            {sortedEvents?.map((event, index) => (
              <EventCard
                key={index}
                id={event?.id}
                label={event?.title}
                start={Number(event?.start)}
                isOnline={true}
                // image={event?.image || ''}
              />
            ))}
          </div>
        </div>
        {/* Tomorrow */}
        {/* <div className="flex gap-4 w-full">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-8 md:min-w-[120px] md:px-2 py-4">
            <p className="text-sm text-muted-foreground">Tomorrow</p>
            <div className="w-[1px] h-full bg-card" />
          </div>
          <div className="flex flex-col gap-8 w-full">
            <EventCard event={event} />
            <EventCard event={event} />
          </div>
        </div> */}
      </div>
    </div>
  );
}

function EventCard(props: {
  id: string;
  label: string;
  isOnline: boolean;
  start: number;
  // image: any;
}) {
  const { id, label, isOnline, start } = props;
  const now = new Date().toLocaleDateString('en-EN', {
    day: '2-digit',
    month: 'long',
  });

  const day = new Date(Number(start) * 1000).toLocaleDateString('en-EN', {
    day: '2-digit',
    month: 'long',
  });

  const hour = new Date(Number(start) * 1000).toLocaleTimeString('en-EN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col gap-4 w-full p-4 bg-card border-[1px] border-border rounded-xl">
      <div className="flex gap-4 w-full">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {day === now && (
              <div className="flex items-center gap-2 text-sm bg-background p-1 px-3 rounded-full border-[1px] border-border">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <p>
                  <strong>Live</strong>
                </p>
              </div>
            )}
            <p className="text-sm">
              {day}, {hour}
            </p>
          </div>
          <h2 className="text-lg font-bold">{label}</h2>
        </div>
        {/* {image &&
        <div className="relative overflow-hidden w-20 h-20 bg-background rounded-xl border-[1px] border-border">
          <Image className="object-cover" src={image} alt={label} fill />
        </div>
        } */}
      </div>
      <div className="flex gap-2">
        <Button
          className="w-full md:w-auto"
          size="sm"
          variant="outline"
          asChild
        >
          <Link href={`/manage/${id}`}>
            Manage
            <ArrowUpRight className="w-4 h-w-4 ml-1" />
          </Link>
        </Button>
        <Button
          className="w-full md:w-auto"
          variant={day === now ? 'default' : 'secondary'}
          size="sm"
          asChild
        >
          <Link href={`/check-in/${id}`}>
            <ScanLine className="w-4 h-w-4 mr-1" />
            Register
          </Link>
        </Button>
      </div>
    </div>
  );
}
