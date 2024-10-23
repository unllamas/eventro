'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Event } from 'nostr-tools';
import {
  CircleCheck,
  CircleDashed,
  CircleX,
  ArrowLeftIcon,
} from 'lucide-react';

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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

// Generic
import { FormCustomer } from '../features/form-customer';
import { FormPayment } from '../features/form-payment';
import { OrderUserData } from '@/types/orders';

// Icons
import { SleepingIcon } from '@/components/icons/SleepingIcon';
import { CreditCardValidationIcon } from '@/components/icons/CreditCardValidationIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { MinusIcon } from '@/components/icons/MinusIcon';

import useOrder from '@/hooks/useOrder';
import { convertEvent } from '../lib/utils/nostr';
import { calculateTicketPrice } from '../lib/utils/price';
import useCode from '@/hooks/useCode';
import { useRelay } from '@/hooks/useRelay';

// Mock data
const EVENT_MOCK = {
  image:
    'https://cdn.satlantis.io/npub1hz5alqscpp8yjrvgsdp2n4ygkl8slvstrgvmjca7e45w6644ew7sewtysa-1728996009903-buenos%20aires2.png',
  title: 'Titulo del evento',
  description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
  start: '1730638800',
  end: '1730664000',
  location:
    'Villanueva 1367, C1426BMI Cdad. Autónoma de Buenos Aires, Argentina',
  date: '',
};

const TICKET_MOCK = {
  title: 'Titulo del ticket',
  description: 'Subtitulo del ticket',
  amount: parseInt(process.env.NEXT_TICKET_PRICE_ARS!),
  currency: 'SAT',
  quantity: 100,
};

const MAX_TICKETS = parseInt(process.env.NEXT_MAX_TICKETS || '0', 10); // Get the max tickets from env

export default function Page() {
  // Flow
  const [screen, setScreen] = useState<string>('information');
  const [isLoading, setIsloading] = useState<boolean>(false);
  // Dialog for reset invoice
  const [isOpen, setOpenAlert] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('Try again.');
  // Invoice
  const [userData, setUserData] = useState<OrderUserData | undefined>(
    undefined
  );
  const [totalSats, setTotalSats] = useState<number>(0);
  const [ticketPriceARS, setTicketPriceARS] = useState<number>(
    TICKET_MOCK?.amount
  );
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [paymentRequest, setPaymentRequest] = useState<string | undefined>(
    undefined
  );
  const [eventReferenceId, setEventReferenceId] = useState<string | undefined>(
    undefined
  );
  const [verifyUrl, setVerifyUrl] = useState<string | undefined>(undefined);
  const [maxTicketsReached, setMaxTicketsReached] = useState<boolean>(false);
  const [codeStatus, setCodeStatus] = useState<string | null>(null); // 'valid', 'invalid', or 'loading'

  // Hooks
  const { isPaid, requestNewOrder, claimOrderPayment, clear } = useOrder();
  const {
    discountMultiple,
    code,
    isLoading: isCodeLoading,
    setCode,
  } = useCode();

  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo(
    () => [{ kinds: [9735], '#e': [eventReferenceId!] }],
    [eventReferenceId]
  );

  // Nostr
  const { events, relay, clearEvents } = useRelay({
    relayUrl: 'wss://relay.lawallet.ar',
    filters,
    closeOnEose: false,
  });

  // Reques order (UI button "Confir Order")
  const handleCreateOrder = useCallback(
    async (data: OrderUserData) => {
      if (isLoading) return;

      setIsloading(true);
      clear();

      setScreen('payment');

      // Create new order
      try {
        const { pr, eventReferenceId, verify } = await requestNewOrder({
          ...data,
          ticketQuantity,
          code,
        });

        setPaymentRequest(pr);
        setEventReferenceId(eventReferenceId);
        setVerifyUrl(verify);

        window.scrollTo({
          top: 0,
          behavior: 'auto',
        });

        setUserData({ ...data, code });
      } catch (error: any) {
        setOpenAlert(true);
        setAlertText(error.message);
      } finally {
        setIsloading(false);
      }
    },
    [
      isLoading,
      code,
      ticketQuantity,
      clear,
      requestNewOrder,
      setPaymentRequest,
      setEventReferenceId,
    ]
  );

  // Process payment via nostr event
  const processPayment = useCallback(
    async (_event: any, _userData: OrderUserData) => {
      try {
        const event: Event = convertEvent(_event);

        if (!event) {
          console.warn('Event not defined ');
          return;
        }

        if (!_userData) {
          console.warn('User data not defined ');
          return;
        }

        await claimOrderPayment(_userData, event);

        setUserData(undefined);
      } catch (error: any) {
        setOpenAlert(true);
        setAlertText(error.message);
      }
    },
    [claimOrderPayment]
  );

  useEffect(() => {
    events && events.length && userData && processPayment(events[0], userData);
  }, [events, userData]);

  // Process payment via LUD-21 (using with useSubscription hook form lawallet/rect)
  // const verifyPayment = useCallback(async () => {
  //   try {
  //     if (!verifyUrl) {
  //       console.warn('Verify URL not defined');
  //       return false;
  //     }

  //     const response = await fetch(verifyUrl);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch verify payment');
  //     }

  //     const verificationData = await response.json();
  //     if (!verificationData.settled) {
  //       console.warn('Payment not verified');
  //       return false;
  //     }

  //     console.log('====> Payment verified, starting subscription');
  //     subscription?.start();

  //     return true;
  //   } catch (error: any) {
  //     setOpenAlert(true);
  //     setAlertText(error.message);
  //     return false;
  //   }
  // }, [verifyUrl, subscription]);

  // Interval to verify payment via LUD-21 (using with useSubscription hook form lawallet/rect)
  // useEffect(() => {
  //   let intervalId: NodeJS.Timeout | null = null;

  //   const startVerificationInterval = () => {
  //     if (verifyUrl && !isPaid) {
  //       console.log('Setting up verification interval');
  //       intervalId = setInterval(async () => {
  //         const isVerified = await verifyPayment();
  //         if (isVerified) {
  //           console.log('====> Payment verified, clearing interval');
  //           if (intervalId) {
  //             clearInterval(intervalId);
  //             intervalId = null;
  //           }
  //         }
  //       }, 2000);
  //     }
  //   };

  //   startVerificationInterval();

  //   return () => {
  //     if (intervalId) {
  //       console.log('Clearing interval on cleanup');
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [verifyUrl, isPaid, verifyPayment]);

  // UI Button "Back to page"
  const backToPage = useCallback(() => {
    setScreen('information');
    setEventReferenceId(undefined);
    setTicketQuantity(1);
    setPaymentRequest(undefined);
    setVerifyUrl(undefined);
    setCode('');
    setUserData(undefined);
    clear();
    clearEvents();
  }, [
    setEventReferenceId,
    setTicketQuantity,
    setPaymentRequest,
    setCode,
    clear,
    clearEvents,
  ]);

  // Update ticket price calculations
  useEffect(() => {
    const calculatePrices = async () => {
      try {
        // Calculate discounted price in ARS
        const discountedPriceARS = Math.round(
          TICKET_MOCK?.amount * discountMultiple
        );
        setTicketPriceARS(discountedPriceARS);

        // Calculate total in SATs
        const totalSATs = Math.round(
          await calculateTicketPrice(ticketQuantity, discountedPriceARS)
        );

        setTotalSats(totalSATs);
      } catch (error: any) {
        console.error('Error calculating ticket prices:', error);
      }
    };

    calculatePrices();
  }, [ticketQuantity, discountMultiple]);

  // Change screen when payment is confirmed
  useEffect(() => {
    if (isPaid) {
      setScreen('summary');
    }
  }, [isPaid]);

  // Check total tickets in the database on component mount
  useEffect(() => {
    const checkTickets = async () => {
      try {
        const response = await fetch('/api/ticket/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`${errorData.errors || response.statusText}`);
        }

        const data = await response.json();

        if (response.ok) {
          if (data.data.totalTickets >= MAX_TICKETS) {
            setMaxTicketsReached(true);
          }
        } else {
          console.error('Failed to fetch total tickets:', data.error);
        }
      } catch (error) {
        console.error('Error fetching total tickets:', error);
      }
    };

    checkTickets();
  }, []);

  useEffect(() => {
    if (isCodeLoading) {
      setCodeStatus('loading');
    } else {
      setCodeStatus(discountMultiple != 1 ? 'valid' : 'invalid');
    }
  }, [isCodeLoading, discountMultiple]);

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
                <Link href={`/event/{id}`}>
                  <ArrowLeftIcon className="w-4 h-4" />
                  {/* <h2 className="font-bold">{EVENT_MOCK?.title}</h2> */}
                  <h2 className="font-bold">Back to event</h2>
                </Link>
              </Button>
            </div>
            {screen === 'information' ? (
              <>
                {!maxTicketsReached && (
                  <>
                    <Card className="p-4 bg-background">
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <h2 className="text-md">{TICKET_MOCK?.title}</h2>
                          <p className="font-semibold text-lg">
                            {ticketPriceARS} ARS
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant={
                              screen !== 'information' || ticketQuantity === 1
                                ? 'ghost'
                                : 'secondary'
                            }
                            size="icon"
                            onClick={() =>
                              setTicketQuantity(ticketQuantity - 1)
                            }
                            disabled={
                              screen !== 'information' || ticketQuantity === 1
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
                              screen !== 'information' ? 'ghost' : 'secondary'
                            }
                            size="icon"
                            onClick={() =>
                              setTicketQuantity(ticketQuantity + 1)
                            }
                            disabled={screen !== 'information'}
                          >
                            <PlusIcon />
                          </Button>
                        </div>
                      </div>
                    </Card>
                    <div className="flex flex-col gap-4 p-4">
                      {/* Code */}
                      <div className="flex items-center justify-between gap-2">
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
                      </div>
                      {/* Total */}
                      <div className="flex gap-4 justify-between items-center">
                        <div className="flex flex-col">
                          {discountMultiple !== 1 && (
                            <p className="text-sm text-primary">
                              {((1 - discountMultiple) * 100).toFixed(0)}
                              {'% OFF'}
                            </p>
                          )}
                          <p className="text-text">Total</p>
                        </div>
                        <div className="text-right">
                          {discountMultiple !== 1 && (
                            <p className="line-through text-text">
                              {Math.round(totalSats / discountMultiple)}{' '}
                              {TICKET_MOCK?.currency}
                            </p>
                          )}
                          <p className="font-bold text-md">
                            {totalSats ? (
                              <>
                                {totalSats} {TICKET_MOCK?.currency}
                              </>
                            ) : (
                              'Calculating...'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
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
                        <p className="font-bold text-lg no-underline">
                          {totalSats
                            ? totalSats + ' ' + TICKET_MOCK?.currency
                            : 'Calculating...'}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 py-4">
                      <Card className="p-4 bg-background">
                        <div className="flex justify-between items-center gap-4">
                          <div>
                            <h2 className="text-md">{TICKET_MOCK?.title}</h2>
                            <p className="font-semibold text-lg">
                              {ticketPriceARS} ARS
                            </p>
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
                      <div className="p-4">
                        <div className="flex gap-4 justify-between items-center">
                          <div className="flex flex-col">
                            {discountMultiple !== 1 && (
                              <p className="text-sm text-primary">
                                {((1 - discountMultiple) * 100).toFixed(0)}
                                {'% OFF'}
                              </p>
                            )}
                            <p className="text-text text-md">Total</p>
                          </div>
                          <div className="text-right">
                            {discountMultiple !== 1 && (
                              <p className="line-through text-text">
                                {Math.round(totalSats / discountMultiple)} $
                                {TICKET_MOCK?.currency}
                              </p>
                            )}
                            <p className="font-bold text-md">
                              {totalSats
                                ? `${totalSats} ${TICKET_MOCK?.currency}`
                                : 'Calculating...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="hidden md:block ">
                  <Card className="p-4 bg-background">
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <h2 className="text-md">{TICKET_MOCK?.title}</h2>
                        <p className="font-semibold text-lg">
                          {ticketPriceARS} ARS
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <p className="flex items-center justify-center gap-1 w-[40px] font-semibold">
                          <span className="font-normal text-text">x</span>
                          {ticketQuantity}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <div className="p-4">
                    <div className="flex gap-4 justify-between items-center">
                      <div className="flex flex-col">
                        {discountMultiple !== 1 && (
                          <p className="text-sm text-primary">
                            {((1 - discountMultiple) * 100).toFixed(0)}
                            {'% OFF'}
                          </p>
                        )}
                        <p className="text-text">Total</p>
                      </div>
                      <div className="text-right">
                        {discountMultiple !== 1 && (
                          <p className="line-through text-text">
                            {Math.round(totalSats / discountMultiple)}{' '}
                            {TICKET_MOCK?.currency}
                          </p>
                        )}
                        <p className="font-bold text-md">
                          {totalSats} {TICKET_MOCK?.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
        {/* Section data */}
        <section className="relative flex flex-1 md:flex-auto w-full justify-center md:pr-4">
          <div className="flex flex-col gap-4 px-4 w-full py-4 max-w-[520px] pt-[80px]">
            <div className="absolute top-0 left-0 w-full h-[60px] flex justify-center items-center mx-auto  px-4 border-b-[1px] border-border">
              <div className="w-full max-w-[520px]">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage
                        className={cn(
                          '',
                          screen === 'information' ? 'text-white' : 'text-text'
                        )}
                      >
                        Information
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage
                        className={cn(
                          '',
                          screen === 'payment' ? 'text-white' : 'text-text'
                        )}
                      >
                        Payment
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
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

            {screen === 'information' && (
              <FormCustomer
                onSubmit={handleCreateOrder}
                // discountMultiple={discountMultiple}
                // isCodeLoading={isCodeLoading}
                // setCode={setCode}
              />
            )}

            {screen === 'payment' && <FormPayment invoice={paymentRequest} />}

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
                    onClick={backToPage}
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
            <AlertDialogCancel className="flex-1 p-0" onClick={backToPage}>
              Reload
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
