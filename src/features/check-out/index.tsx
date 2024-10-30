'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Event } from 'nostr-tools';
import {
  CircleCheck,
  CircleDashed,
  CircleX,
  ArrowLeftIcon,
  ChevronLeft,
} from 'lucide-react';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Navbar } from '@/components/navbar';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Generic
import { FormCustomer } from '@/features/form-customer';
import { FormPayment } from '@/features/form-payment';

// Icons
import { SleepingIcon } from '@/components/icons/SleepingIcon';
import { CreditCardValidationIcon } from '@/components/icons/CreditCardValidationIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { MinusIcon } from '@/components/icons/MinusIcon';

import { SatoshiIcon } from '@/components/icons/Satoshi';
import { useZap } from '@lawallet/react';
import { config } from '@/config/config';
import fetcher from '@/config/fetcher';
import { Badge } from '@/components/ui/badge';

const TICKET_MOCK = {
  title: 'General',
  description: 'Limit to 200',
  amount: parseInt(process.env.NEXT_TICKET_PRICE_ARS!),
  currency: 'SAT',
  quantity: 100,
};

const MAX_TICKETS = parseInt(process.env.NEXT_MAX_TICKETS || '0', 10); // Get the max tickets from env
const FEE = Number(process.env.FEE_VALUE); // Get the fee from env

export function CheckOut(props: any) {
  const { event, ticket, ticketsSales } = props;

  // Flow
  const [screen, setScreen] = useState<string>('information');
  const [isLoading, setIsloading] = useState<boolean>(false);
  // Dialog for reset invoice
  const [isOpen, setOpenAlert] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('Try again.');
  // Invoice
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [paymentRequest, setPaymentRequest] = useState<string | undefined>(
    undefined
  );
  // const [nostrId, setNostrId] = useState<string | undefined>(undefined);
  const [verifyUrl, setVerifyUrl] = useState<string | undefined>(undefined);
  const [maxTicketsReached, setMaxTicketsReached] = useState<boolean>(false);
  const [codeStatus, setCodeStatus] = useState<string | null>(null); // 'valid', 'invalid', or 'loading'

  // Flow
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { toast } = useToast();
  const { invoice, createZapInvoice, resetInvoice } = useZap({
    receiverPubkey:
      'cee287bb0990a8ecbd1dee7ee7f938200908a5c8aa804b3bdeaed88effb55547',
    config,
  });

  const urlKey = useCallback(() => {
    return `/api/ticket/count?id=${event?.id}`;
  }, [event]);

  const { data: ticketsCount, mutate } = useSWR(urlKey, fetcher);

  const handleCreateOrder = useCallback(
    async (id: string) => {
      try {
        const data = {
          quantity: ticketQuantity,
          userId: id,
          ticketId: ticket?.id,
          eventId: event?.id,
        };

        const response = await fetch('/api/order/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then((res) => res.json());

        if (!response.status) {
          throw new Error(response.error);
        }

        setOrderId(response?.data?.id);
      } catch (error) {
        console.log('error', error);
      }
    },
    [ticketQuantity]
  );

  const handleCreateInvoice = () => {
    const value = ticketQuantity * ticket?.amount;
    createZapInvoice(value)
      .then((bolt11: string | undefined) => {
        if (!bolt11) {
          console.log('upds, algo paso mal');
          return;
        }

        window.scrollTo({
          top: 0,
          behavior: 'auto',
        });

        setScreen('payment');
        setIsloading(false);
      })
      .catch((error: any) => {
        console.log('handleCreateInvoice error', error);
      });
  };

  const handleCreateUser = async (data: {
    name: string;
    email: string;
    pubkey: string;
  }) => {
    if ((!data?.email || !data?.name) && !data?.pubkey) return null;

    if (ticket?.quantity - ticketsSales === 0) {
      toast({
        variant: 'destructive',
        title: 'Oops... ',
        description: 'The tickets have just sold out.',
        duration: 1400,
      });
      return null;
    }

    setIsloading(true);
    setUserData({ ...data });

    try {
      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (!response.status) {
        throw new Error(response.error);
      }

      handleCreateInvoice();

      const { id } = response?.data;
      setUserId(id);

      handleCreateOrder(id);
    } catch (error) {
      console.log('error', error);
      setIsloading(false);
    }
  };

  async function handleCreateTicket() {
    try {
      const data = {
        bolt11: invoice?.bolt11,
        userId,
        orderId,
        eventId: event?.id,
      };

      const response = await fetch('/api/ticket/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      mutate();
      setScreen('summary');
    } catch (error) {
      console.log('error', error);
    }
  }

  useEffect(() => {
    if (invoice.payed) {
      handleCreateTicket();
    }
  }, [invoice.payed, orderId]);

  return (
    <>
      <div className="flex flex-col md:flex-row w-full min-h-[100dvh]">
        {/* Aside info */}
        <aside className="relative flex flex-col justify-start items-center w-full min-h-full md:pt-0 bg-card">
          <Navbar />
          <div
            className={cn('flex flex-col gap-4 w-full max-w-[520px] my-4 px-4')}
          >
            <div>
              <Button className="px-0" size="sm" variant="link" asChild>
                <Link href={`/manage/${event?.id}`}>
                  <ChevronLeft className="w-4 h-4" />
                  {/* <h2 className="font-bold">{EVENT_MOCK?.title}</h2> */}
                  <h2 className="font-bold">Back to event</h2>
                </Link>
              </Button>
            </div>
            {screen === 'information' ? (
              <>
                {!maxTicketsReached && (
                  <>
                    {/* <div className="overflow-hidden w-20 h-20 bg-background rounded-xl border-[1px] border-border">
                      <img src="https://placehold.co/120x120" />
                    </div> */}
                    <div className="flex flex-col">
                      <p>
                        {new Date(
                          Number(event?.start) * 1000
                        ).toLocaleDateString('en-EN', {
                          day: '2-digit',
                          month: 'long',
                        })}
                        ,{' '}
                        {new Date(
                          Number(event?.start) * 1000
                        ).toLocaleTimeString('en-EN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <h1 className="text-xl font-bold">{event?.title}</h1>
                      {event?.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {event?.description}
                        </p>
                      )}
                    </div>
                    {ticketsSales !== ticket?.quantity && (
                      <>
                        <Card className="p-4 bg-background">
                          <div className="flex justify-between items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-md">{ticket?.title}</h2>
                                {ticket?.quantity - ticketsSales < 4 && (
                                  <Badge variant="destructive">
                                    {ticket?.quantity - ticketsSales} left
                                  </Badge>
                                )}
                              </div>
                              {ticket?.amount === 0 ? (
                                <p className="flex items-center gap-1 font-semibold text-lg">
                                  Free
                                </p>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <div className="w-6 h-6 text-muted-foreground">
                                    <SatoshiIcon />
                                  </div>
                                  <p className="flex items-center gap-1 font-semibold text-lg">
                                    {ticket?.amount}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <Button
                                variant={
                                  screen !== 'information' ||
                                  ticketQuantity === 1
                                    ? 'ghost'
                                    : 'secondary'
                                }
                                size="icon"
                                onClick={() =>
                                  setTicketQuantity(ticketQuantity - 1)
                                }
                                disabled={
                                  screen !== 'information' ||
                                  ticketQuantity === 1
                                }
                              >
                                <MinusIcon />
                              </Button>
                              <p className="flex items-center justify-center gap-1 w-[40px] font-semibold">
                                {screen !== 'information' && (
                                  <span className="font-normal text-xs text-text">
                                    x
                                  </span>
                                )}
                                {ticketQuantity}
                              </p>
                              <Button
                                variant={
                                  screen !== 'information' ||
                                  (ticket?.amount === 0 && ticketQuantity === 1)
                                    ? 'ghost'
                                    : 'secondary'
                                }
                                size="icon"
                                onClick={() =>
                                  setTicketQuantity(ticketQuantity + 1)
                                }
                                disabled={
                                  ticket?.quantity === ticketsSales ||
                                  screen !== 'information' ||
                                  (ticket?.amount === 0 && ticketQuantity === 1)
                                }
                              >
                                <PlusIcon />
                              </Button>
                            </div>
                          </div>
                        </Card>
                        <div className="flex flex-col gap-4 p-4">
                          {/* Code */}
                          {/* <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="code">Code</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            id="code"
                            name="code"
                            placeholder="Code"
                            onChange={(e) => setCode(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {code && !!codeStatus && (
                              <>
                                {codeStatus === 'valid' && (
                                  <span className="text-green-500">
                                    <CircleCheck />
                                  </span>
                                )}
                                {codeStatus === 'invalid' && (
                                  <span className="text-red-500">
                                    <CircleX />
                                  </span>
                                )}
                                {codeStatus === 'loading' && (
                                  <span className="text-gray-500">
                                    <CircleDashed />
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div> */}
                          {/* Comision */}
                          {ticket?.amount !== 0 && (
                            <div className="flex gap-4 justify-between items-center">
                              <div className="flex flex-col">
                                <p className="text-text">
                                  Service{' '}
                                  <span className="text-sm">({FEE}%)</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-right">
                                <div className="w-6 h-6 text-muted-foreground">
                                  <SatoshiIcon />
                                </div>
                                <p className="font-bold text-md">
                                  {(
                                    ticketQuantity *
                                    ticket?.amount *
                                    0.042
                                  ).toFixed(0)}
                                </p>
                              </div>
                            </div>
                          )}
                          {/* Total */}
                          {ticket?.amount !== 0 && (
                            <div className="flex gap-4 justify-between items-center">
                              <div className="flex flex-col">
                                {/* {discountMultiple !== 1 && (
                            <p className="text-sm text-primary">
                              {((1 - discountMultiple) * 100).toFixed(0)}
                              {'% OFF'}
                            </p>
                          )} */}
                                <p className="text-text">Total</p>
                              </div>
                              <div className="flex items-center gap-1 text-right">
                                {/* {discountMultiple !== 1 && (
                            <p className="flex items-center gap-1 line-through text-text">
                              {Math.round(totalSats / discountMultiple)}
                              <span className="text-sm text-muted-foreground font-normal">
                                {TICKET_MOCK?.currency}
                              </span>
                            </p>
                          )} */}
                                <div className="w-6 h-6 text-muted-foreground">
                                  <SatoshiIcon />
                                </div>
                                <p className="flex items-center gap-1 font-bold text-md">
                                  {(
                                    ticketQuantity * ticket?.amount +
                                    ticketQuantity * ticket?.amount * 0.042
                                  ).toFixed(0)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full md:hidden"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="flex gap-2 no-underline">
                      <div className="flex items-center justify-between gap-2 w-full">
                        Show order summary
                        <p className="flex items-center gap-1 font-bold text-lg no-underline">
                          <div className="w-6 h-6 text-muted-foreground">
                            <SatoshiIcon />
                          </div>
                          {ticketQuantity * ticket?.amount}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 py-4">
                      <Card className="p-4 bg-background">
                        <div className="flex justify-between items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-md">{ticket?.title}</h2>
                              {ticket?.quantity - ticketsSales < 4 && (
                                <Badge variant="destructive">
                                  {ticket?.quantity - ticketsSales} left
                                </Badge>
                              )}
                            </div>
                            {ticket?.amount === 0 ? (
                              <p className="flex items-center gap-1 font-semibold text-lg">
                                Free
                              </p>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="w-6 h-6 text-muted-foreground">
                                  <SatoshiIcon />
                                </div>
                                <p className="flex items-center gap-1 font-semibold text-lg">
                                  {ticket?.amount}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 items-center">
                            <p className="flex items-center justify-center gap-1 w-[40px] font-semibold">
                              {screen !== 'information' && (
                                <span className="font-normal text-text">x</span>
                              )}
                              {ticketQuantity}
                            </p>
                          </div>
                        </div>
                      </Card>
                      <div className="flex flex-col gap-2 p-4">
                        {/* Comision */}
                        {ticket?.amount !== 0 && (
                          <div className="flex gap-4 justify-between items-center">
                            <div className="flex flex-col">
                              <p className="text-text">
                                Service{' '}
                                <span className="text-sm">({FEE}%)</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-right">
                              <div className="w-6 h-6 text-muted-foreground">
                                <SatoshiIcon />
                              </div>
                              <p className="flex items-center gap-1 font-bold text-md">
                                {(
                                  ticketQuantity *
                                  ticket?.amount *
                                  0.042
                                ).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Total */}
                        {ticket?.amount !== 0 && (
                          <div className="flex gap-4 justify-between items-center">
                            <div className="flex flex-col">
                              {/* {discountMultiple !== 1 && (
                              <p className="text-sm text-primary">
                                {((1 - discountMultiple) * 100).toFixed(0)}
                                {'% OFF'}
                              </p>
                            )} */}
                              <p className="text-text text-md">Total</p>
                            </div>
                            <div className="flex items-center gap-1 text-right">
                              {/* {discountMultiple !== 1 && (
                              <p className="line-through text-text">
                                {Math.round(totalSats / discountMultiple)}
                              </p>
                            )} */}
                              <div className="w-6 h-6 text-muted-foreground">
                                <SatoshiIcon />
                              </div>
                              <p className="flex items-center gap-1 font-bold text-md">
                                {(
                                  ticketQuantity * ticket?.amount +
                                  ticketQuantity * ticket?.amount * 0.042
                                ).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="hidden md:block">
                  <div className="flex flex-col mb-4">
                    <p>
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
                    <h1 className="text-xl font-bold">{event?.title}</h1>
                  </div>
                  <Card className="p-4 bg-background">
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-md">{ticket?.title}</h2>
                          {ticket?.quantity - ticketsSales < 4 && (
                            <Badge variant="destructive">
                              {ticket?.quantity - ticketsSales} left
                            </Badge>
                          )}
                        </div>
                        {ticket?.amount === 0 ? (
                          <p className="font-semibold text-lg">Free</p>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 text-muted-foreground">
                              <SatoshiIcon />
                            </div>
                            <p className="font-semibold text-lg">
                              {ticket?.amount}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        <p className="flex items-center justify-center gap-1 w-[40px] font-semibold">
                          <span className="font-normal text-text">x</span>
                          {ticketQuantity}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <div className="flex flex-col gap-2 p-4">
                    {/* Comision */}
                    {ticket?.amount !== 0 && (
                      <div className="flex gap-4 justify-between items-center">
                        <div className="flex flex-col">
                          <p className="text-text">
                            Service <span className="text-sm">({FEE}%)</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-right">
                          <div className="w-6 h-6 text-muted-foreground">
                            <SatoshiIcon />
                          </div>
                          <p className="flex items-center gap-1 font-bold text-md">
                            {(ticketQuantity * ticket?.amount * 0.042).toFixed(
                              0
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Total */}
                    {ticket?.amount !== 0 && (
                      <div className="flex gap-4 justify-between items-center">
                        <div className="flex flex-col">
                          {/* {discountMultiple !== 1 && (
                              <p className="text-sm text-primary">
                                {((1 - discountMultiple) * 100).toFixed(0)}
                                {'% OFF'}
                              </p>
                            )} */}
                          <p className="text-text text-md">Total</p>
                        </div>
                        <div className="flex items-center gap-1 text-right">
                          {/* {discountMultiple !== 1 && (
                              <p className="line-through text-text">
                                {Math.round(totalSats / discountMultiple)}
                              </p>
                            )} */}
                          <div className="w-6 h-6 text-muted-foreground">
                            <SatoshiIcon />
                          </div>
                          <p className="flex items-center gap-1 font-bold text-md">
                            {(
                              ticketQuantity * ticket?.amount +
                              ticketQuantity * ticket?.amount * 0.042
                            ).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
        {/* Section data */}
        <section className="relative flex flex-1 md:flex-auto w-full justify-center md:pr-4">
          <div className="flex flex-col gap-4 px-4 w-full py-4 max-w-[520px] pt-[80px]">
            {ticketsSales !== ticket?.quantity && (
              <div className="absolute top-0 left-0 w-full h-[60px] flex justify-center items-center mx-auto  px-4 border-b-[1px] border-border">
                <div className="w-full max-w-[520px]">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbPage
                          className={cn(
                            '',
                            screen === 'information'
                              ? 'text-white'
                              : 'text-text'
                          )}
                        >
                          Information
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      {ticket?.amount !== 0 && (
                        <>
                          <BreadcrumbItem>
                            <BreadcrumbPage
                              className={cn(
                                '',
                                screen === 'payment'
                                  ? 'text-white'
                                  : 'text-text'
                              )}
                            >
                              Payment
                            </BreadcrumbPage>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator />
                        </>
                      )}
                      <BreadcrumbItem>
                        <BreadcrumbPage
                          className={cn(
                            '',
                            screen === 'summary' ? 'text-white' : 'text-text'
                          )}
                        >
                          Summary
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>
            )}

            {screen === 'information' && (
              <FormCustomer
                onSubmit={handleCreateUser}
                loading={isLoading}
                eventId={event?.id}
                soldOut={ticketsSales === ticket?.quantity}
                // discountMultiple={discountMultiple}
                // isCodeLoading={isCodeLoading}
                // setCode={setCode}
              />
            )}

            {screen === 'payment' && (
              <FormPayment invoice={invoice?.bolt11.toUpperCase()} />
            )}

            {screen === 'summary' && (
              <>
                <Card>
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full mx-auto py-12 px-8">
                    <CreditCardValidationIcon className="w-8 h-8" />
                    <div className="flex flex-col gap-2 text-center">
                      <h2 className="font-bold text-2xl">Congratulation!</h2>
                      <p className="text-text">
                        Your payment has been confirmed. We have sent the event
                        details to your email.
                      </p>
                    </div>
                  </div>
                </Card>
                <Link href="/">
                  <Button
                    className="w-full"
                    variant="link"
                    onClick={() => null}
                  >
                    Back to page
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>
      </div>

      <AlertDialog open={isOpen} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <SleepingIcon className="w-8 h-8 color-primary" />
            <AlertDialogTitle className="text-center">
              Oops! Try again
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {alertText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 p-0" onClick={() => null}>
              Reload
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
