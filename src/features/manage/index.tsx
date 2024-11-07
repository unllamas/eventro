'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { NavbarV2 } from '@/components/navbar';
import { useActiveUser, useProfile } from 'nostr-hooks';
import { useMemo } from 'react';

export function Manage(props: {
  event: any;
  ticket: any;
  orders: any;
  sales: any;
}) {
  const { event, ticket, orders, sales } = props;

  const { activeUser } = useActiveUser();

  // TO-DO: Optimize this
  const filters = useMemo(() => activeUser?.pubkey, [activeUser?.pubkey]);
  const { profile } = useProfile({ pubkey: filters });

  const paid =
    (Number(orders?.filter((order: any) => order?.paid)?.length) * 100) /
    Number(orders?.length);

  const attandance = (
    (Number(sales?.filter((sale: any) => sale.checkIn).length) * 100) /
    Number(sales?.length)
  ).toFixed(0);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Navbar */}
      <NavbarV2 label="Manage event" backTo="/dash" />
      <div className="flex flex-col items-start gap-8 w-full max-w-[720px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-2 w-full">
            <div className="flex flex-col">
              <p className="text-sm">
                {new Date(Number(event?.start) * 1000).toLocaleDateString(
                  'en-EN',
                  {
                    day: '2-digit',
                    month: 'long',
                  }
                )}
                ,{' '}
                {new Date(Number(event?.start) * 1000).toLocaleTimeString(
                  'en-EN',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </p>
              <h1 className="text-xl font-bold text-white">{event?.title}</h1>
            </div>
          </div>
          <div className="flex-1 flex gap-2 w-full">
            <Button className="w-full md:w-auto" asChild variant="secondary">
              <Link href={`/check-out/${event?.nostrId}`}>
                Check-out
                <ArrowUpRight className="w-5 h-w-5 ml-1" />
              </Link>
            </Button>
            <Button className="w-full md:w-auto" asChild>
              <Link href={`/check-in/${event?.id}`}>
                <ScanLine className="w-5 h-w-5 mr-1" />
                Register
              </Link>
            </Button>
          </div>
        </div>

        {/* Tickets */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold">Tickets</h3>
              {/* <p className="text-md">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi,
                sed.
              </p> */}
            </div>
          </div>
          <div className="overflow-hidden flex flex-col rounded-xl border">
            <Card className="rounded-none border-none">
              <CardContent className="flex gap-2 justify-between items-center">
                <div className="flex gap-2 items-center">
                  <p className="text-lg">
                    <strong>{ticket?.title}</strong>
                  </p>
                  {ticket?.amount === 0 ? (
                    <p className="text-muted-foreground">Free</p>
                  ) : (
                    <div className="flex gap-1 items-center text-muted-foreground">
                      <div className="w-6 h-6">
                        <SatoshiIcon />
                      </div>
                      <p>{ticket?.amount}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!!ticket?.quantity && ticket?.quantity > 0 && (
                    <p className="flex items-center gap-1 text-sm">
                      <span className="text-lg font-semibold">
                        {sales?.length}
                      </span>
                      {ticket?.quantity && ' / '}
                      <span className="font-semibold text-sm text-muted-foreground">
                        {ticket?.quantity}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        max.
                      </span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Stats */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <Card className="flex-1 bg-black border-[1px] border-dashed border-white/20">
              <CardContent>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-xl font-bold">{orders?.length}</p>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-black border-[1px] border-dashed border-white/20">
              <CardContent>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-xl font-bold">{!!paid ? paid : 0}%</p>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-black border-[1px] border-dashed border-white/20">
              <CardContent>
                <p className="text-sm text-muted-foreground">Sold</p>
                <p className="text-xl font-bold">{sales?.length || 0}</p>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-black border-[1px] border-dashed border-white/20">
              <CardContent>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-xl font-bold">
                  {!!!attandance ? attandance : 0}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Moderadores */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold">Organizers</h3>
              {/* <p className="text-md">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi,
                sed.
              </p> */}
            </div>
            {/* Add moderator */}
            {/* <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <PlusIcon className="w-4 h-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm h-auto">
                <DialogHeader className="flex flex-col">
                  <div className="flex justify-center items-center w-12 h-12 mb-2 bg-card rounded-full">
                    <UserPlus />
                  </div>
                  <DialogTitle className={'text-lg font-bold'}>
                    Add host
                  </DialogTitle>
                  <DialogDescription>
                    Add a host to get help managing your event.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="title">Nostr</Label>
                    <Input
                      placeholder="NIP-05 or npub..."
                      type="text"
                      value={''}
                      onChange={(e) => null}
                    />
                  </div>

                  <Button
                    className="justify-start bg-card border-[1px] border-border cursor-pointer"
                    variant="ghost"
                    asChild
                  >
                    <div className="flex gap-4 h-auto p-2 rounded-xl">
                      <div className="relative w-10 h-10 rounded-full bg-background border-[1px] border-border"></div>
                      <div className="flex flex-col">
                        <p className="text-md font-bold">Jona</p>
                        <p className="text-sm font-normal text-muted-foreground">
                          Invitar como anfitrion
                        </p>
                      </div>
                    </div>
                  </Button>
                </div>
              </DialogContent>
            </Dialog> */}
          </div>
          <div className="overflow-hidden flex flex-col rounded-xl border">
            <Card className="rounded-none border-none">
              <CardContent className="flex items-center justify-between gap-8">
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-4">
                    {profile && (
                      <div className="relative w-10 h-10 rounded-full bg-background border-[1px] border-border">
                        <Image
                          className="rounded-full"
                          src={profile?.image as string}
                          alt="Profile image"
                          fill
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <p className="text-md">
                        <strong>{profile?.name}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.nip05}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <Badge variant="outline">Owner</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* <Card className="rounded-none border-none">
              <CardContent className="flex items-center justify-between gap-8">
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-full bg-background border-[1px] border-border"></div>
                    <div className="flex flex-col">
                      <p className="text-md">
                        <strong>Jona</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        npub123123....
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <Badge variant="outline">Host</Badge>
                    </div>
                    <Button size="icon" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}
