'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  CircleHelpIcon,
  CirclePlus,
  TicketPlus,
  TicketIcon,
  Plus,
  Lock,
  Trash2,
} from 'lucide-react';
// import { v4 as uuidv4 } from 'uuid';
import { nip19 } from 'nostr-tools';
// import { useNewEvent, useActiveUser } from 'nostr-hooks';

// import { RELAYS } from '@/lib/nostr';
// import { uploadFile } from '@/lib/file-upload';
// import { addEvent } from '@/lib/db';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from './components/image-uploader';
import { EventDateTimePicker } from './components/event-date-time-picker';
import { EventDescription } from './components/event-description';

import { EventDetails, Ticket, FileNostr } from '@/types/event';
import { SatoshiIcon } from '@/components/icons/Satoshi';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { createUnixTimestamp } from '@/lib/utils';
import { NavbarV2 } from '@/components/navbar';

export default function Page() {
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    title: '',
    startDate: new Date(),
    startTime: '',
    endDate: new Date(),
    endTime: '',
    description: '',
    tickets: [],
  });

  const [newTicket, setNewTicket] = useState<Ticket>({
    title: '',
    description: '',
    amount: null,
    quantity: null,
  });

  // Dialog create ticket
  const [loading, setLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showQuota, setShowQuota] = useState(false);

  // Libs and hooks
  const router = useRouter();

  const handleEventChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined, type: 'start' | 'end') => {
    if (date) {
      setEventDetails((prev) => ({ ...prev, [`${type}Date`]: date }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // const res = await uploadFile(file);
      // if (res.status === 'success') {
      //   setImageUrl(res.data);
      // } else {
      //   console.error('Image upload failed:', res.message);
      // }
    }
  };

  const handleNewTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({
      ...prev,
      [name]:
        name === 'amount' || name === 'quantity' ? parseInt(value) : value,
    }));
  };

  const addTicket = () => {
    setEventDetails((prev) => ({
      ...prev,
      tickets: [...prev.tickets, newTicket],
    }));
    setNewTicket({
      title: '',
      description: '',
      amount: 0,
      quantity: 0,
    });
    setShowDescription(false);
    setShowQuota(false);
  };

  const removeTicket = (index: number) => {
    setEventDetails((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const pubkey = 'user_pubkey_here'; // Replace with actual user pubkey

    const eventData = {
      pubkey,
      event: {
        title: eventDetails.title,
        description: eventDetails.description,
        start: createUnixTimestamp(
          eventDetails.startDate,
          eventDetails.startTime
        ),
        end: createUnixTimestamp(eventDetails.endDate, eventDetails.endTime),
      },
      tickets: eventDetails.tickets,
    };

    try {
      const response = await fetch('/api/event/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response?.ok) {
        setLoading(false);

        console.error('Failed to create event');
        return null;
      }

      const { id } = await response.json();
      router.push(`/manage/${id}`);

      return null;
    } catch (error) {
      setLoading(false);

      console.error('Error creating event:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <NavbarV2 label="Create event" backTo="/dash" />
      <main className="flex flex-col gap-8 w-full max-w-[720px] mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-8 w-full"
        >
          <div className="flex-1">
            <div className="flex flex-col gap-4">
              <Input
                name="title"
                value={eventDetails.title}
                onChange={handleEventChange}
                placeholder="Event Title"
              />

              <EventDateTimePicker
                startDate={eventDetails.startDate}
                startTime={eventDetails.startTime}
                endDate={eventDetails.endDate}
                endTime={eventDetails.endTime}
                onDateChange={handleDateChange}
                onTimeChange={handleEventChange}
              />

              <EventDescription
                description={eventDetails.description}
                onChange={handleEventChange}
              />

              {eventDetails?.tickets?.length === 0 ? (
                <div className="flex justify-center items-center p-8 bg-black border-2 border-dashed border-white/20 rounded-2xl text-center">
                  <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                    <TicketIcon className="w-8 h-w-8 text-primary" />
                    <h3 className="text-lg font-bold">
                      Let&apos;s add a ticket
                    </h3>
                    <p className="text-muted-foreground">
                      In order to register attendance, we need users to purchase
                      a ticket.
                    </p>
                    <div className="mt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Add ticket</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm h-auto">
                          <DialogHeader className="flex flex-col">
                            <div className="flex justify-center items-center w-12 h-12 mb-2 bg-card rounded-full">
                              <TicketPlus />
                            </div>
                            <DialogTitle className={'text-lg font-bold'}>
                              Create a new ticket
                            </DialogTitle>
                            {/* <DialogDescription className="text-white">
                            Please share with us a Nostr account you would like
                            to access.
                          </DialogDescription> */}
                          </DialogHeader>
                          <Input
                            name="title"
                            value={newTicket.title}
                            onChange={handleNewTicketChange}
                            placeholder="Title (*)"
                            required
                          />
                          {/* {showDescription ? (
                            <Input
                              name="description"
                              value={newTicket.description}
                              onChange={handleNewTicketChange}
                              placeholder="Description"
                            />
                          ) : (
                            <div>
                              <Button
                                className="px-0"
                                size="sm"
                                variant="link"
                                onClick={() => setShowDescription(true)}
                              >
                                <Plus className="w-4 h-w-4 mr-1" />
                                Add description
                              </Button>
                            </div>
                          )} */}
                          {/* <Separator /> */}
                          <div className="flex gap-4 items-center">
                            <div className="flex flex-col w-full px-2">
                              <p className="text-md">Price</p>
                              <p className="text-sm text-muted-foreground">
                                In SATs
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 text-muted-foreground">
                                <SatoshiIcon />
                              </div>
                              <Input
                                className="text-end"
                                type="number"
                                name="amount"
                                value={newTicket?.amount as number}
                                onChange={handleNewTicketChange}
                                placeholder="Value (*)"
                                required
                              />
                            </div>
                          </div>
                          <Separator />
                          {showQuota ? (
                            <div className="flex gap-4 items-center">
                              <div className="flex flex-col w-full px-2">
                                <p className="text-md">Quantity</p>
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  name="quantity"
                                  value={newTicket.quantity as number}
                                  onChange={handleNewTicketChange}
                                  placeholder={'Unlimited'}
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Button
                                className="px-0"
                                size="sm"
                                variant="link"
                                onClick={() => setShowQuota(true)}
                              >
                                <Lock className="w-4 h-w-4 mr-1" />
                                Restrict quota
                              </Button>
                            </div>
                          )}
                          <Button
                            size="lg"
                            className="w-full"
                            onClick={addTicket}
                            variant={
                              newTicket.title === '' ||
                              Number(newTicket?.amount) === 0
                                ? 'ghost'
                                : 'default'
                            }
                            disabled={
                              newTicket.title === '' ||
                              Number(newTicket?.amount) === 0
                            }
                          >
                            Add Ticket
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <h2 className="text-muted-foreground text-sm font-bold">
                    Ticket
                  </h2>
                  <Card className="p-4">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex gap-2">
                        <p className="font-bold">
                          {eventDetails?.tickets[0]?.title}
                        </p>
                        {eventDetails?.tickets[0]?.amount === 0 ||
                        eventDetails?.tickets[0]?.amount === null ? (
                          <p className="flex items-center text-muted-foreground">
                            Free
                          </p>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-6 h-6 text-muted-foreground">
                              <SatoshiIcon />
                            </div>
                            <p className="flex items-center text-muted-foreground">
                              {eventDetails?.tickets[0]?.amount}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* With quota */}
                        {Number(eventDetails?.tickets[0]?.quantity) > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {eventDetails?.tickets[0]?.quantity} max.
                          </span>
                        )}
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeTicket(0)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                  {/* Option with price */}
                  {/* <Card className="p-4">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex gap-2">
                        <p className="font-bold">Ticket title</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          50 max.
                        </span>
                        <Button size="icon" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card> */}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                variant={
                  !eventDetails.title || eventDetails?.tickets.length === 0
                    ? 'ghost'
                    : 'default'
                }
                disabled={
                  loading ||
                  !eventDetails.title ||
                  eventDetails?.tickets.length === 0
                }
              >
                {loading ? 'Loading...' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
