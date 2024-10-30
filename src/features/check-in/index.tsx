'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { QrCode, ChevronLeft, Minus, Plus, Search, X } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { QrScanner } from './components/scanner';

export function CheckIn(props: { event: any; sales: any }) {
  const { event, sales } = props;

  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [filterSales, setFilterSales] = useState<any>(sales);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const handleSaleClick = (sale: any) => {
    setSelectedSale(sale);
  };

  const handleCloseModal = () => {
    // setSelectedAmount(1);
    setSelectedSale(null);
    setLoading(false);
  };

  const handleRegister = async ({ eventId, reference }: any) => {
    setLoading(true);
    // Implement registration logic here
    console.log('Registering:', selectedSale);
    // handleCloseModal();

    try {
      const data = {
        eventId: eventId ?? event?.id,
        reference: reference ?? selectedSale?.reference,
      };

      const response = await fetch('/api/ticket/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      console.log('response', response);

      if (!response.status) {
        throw new Error(response.error);
      }

      const referenceId = response?.data?.reference;

      setFilterSales((prevFilterSales: any) =>
        prevFilterSales.map((sale: any) =>
          sale.reference === referenceId ? { ...sale, checkIn: true } : sale
        )
      );

      toast({
        title: 'Registration successful',
        description: 'Ticket checked in',
        duration: 1400,
      });

      handleCloseModal();
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleScan = async (result: any) => {
    setLoading(true);
    if (!result || !result.data) {
      setLoading(false);
    }

    if (result?.data) {
      const [eventId, reference] = result?.data.split('#');
      setIsModalOpen(false);

      const response = await fetch(`/api/ticketsale/get?ref=${reference}`, {
        method: 'GET',
      }).then((res) => res.json());

      console.log('response', response);
      setSelectedSale(response?.data);
      setLoading(false);

      // handleRegister({ eventId, reference });
      return;
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Close modal when clicking outside of the QR reader
  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  return (
    <>
      <div className="w-full min-h-screen">
        <div className="flex flex-col gap-4 w-full max-w-[720px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="link" size="icon" asChild>
                <Link href={`/manage/${event?.id}`}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">{event?.title}</h1>
                {/* <p className="text-white/70 text-sm">
                  Comenzó hace hace 3 días
                </p> */}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <Button
                className="w-full md:w-auto"
                disabled={loading}
                onClick={openModal}
              >
                <QrCode className="w-4 h-4 mr-1" />
                Scan QR Code
                {/* {loading ? 'Escaneando' : 'Scan QR Code'} */}
              </Button>

              {isModalOpen && (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50 bg-background"
                  onClick={handleModalClick}
                >
                  <div
                    ref={modalRef}
                    className="p-4 rounded-lg w-full max-w-lg"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold">Scan QR Code</h2>
                      <Button variant="ghost" size="icon" onClick={closeModal}>
                        <X className="h-6 w-6" />
                      </Button>
                    </div>

                    <QrScanner
                      onDecode={handleScan}
                      startOnLaunch={true}
                      highlightScanRegion={true}
                      highlightCodeOutline={true}
                      constraints={{ facingMode: 'environment' }}
                      preferredCamera={'environment'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10"
              value={''}
              onChange={(e) => null}
            />
          </div>

          <Tabs defaultValue="all">
            {/* <TabsList>
              <TabsTrigger value="all">All the guests</TabsTrigger>
            </TabsList> */}

            <TabsContent className="mt-0" value="all">
              <AttendeeList
                tickets={filterSales}
                onOrderClick={handleSaleClick}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedSale && (
        <Dialog open={!!selectedSale} onOpenChange={handleCloseModal}>
          <DialogContent>
            <DialogHeader>
              <div>
                {selectedSale?.pubkey ? (
                  <p>
                    <strong>
                      {selectedSale?.pubkey.slice(0, 6)}...
                      {selectedSale?.pubkey.slice(58, 64)}
                    </strong>
                  </p>
                ) : (
                  <>
                    <p>
                      <strong>{selectedSale?.User.name}</strong>
                    </p>
                    <p className="text-white/70">{selectedSale?.User.email}</p>
                  </>
                )}
              </div>
            </DialogHeader>
            <DialogFooter className="flex flex-col md:flex-row gap-2">
              <Button
                className="w-full"
                size="lg"
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button
                className="w-full"
                size="lg"
                disabled={loading || selectedSale?.checkIn}
                onClick={handleRegister}
              >
                {loading ? 'Loading...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function AttendeeList({
  tickets,
  onOrderClick,
}: {
  tickets: [];
  onOrderClick: (order: any) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl">
      {tickets?.map((ticket: any, index: number) => {
        // const parse = JSON.parse(order?.content);
        // const ticket = tickets?.filter(
        //   (ticket: any) => ticket?.id === order?.ticket_id
        // )[0];
        return (
          <Card
            key={index}
            className="rounded-none border-none hover:bg-border cursor-pointer"
            onClick={() => onOrderClick(ticket)}
          >
            <CardContent className="flex items-center justify-between gap-8 p-4 md:p-6">
              <div className="flex items-center gap-2">
                {ticket?.pubkey ? (
                  <p>
                    <strong>
                      {ticket?.pubkey.slice(0, 6)}...
                      {ticket?.pubkey.slice(58, 64)}
                    </strong>
                  </p>
                ) : (
                  <>
                    <p>
                      <strong>{ticket?.User?.name}</strong>
                    </p>
                    <p className="text-white/70">{ticket?.User?.email}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {ticket?.checkIn && <Badge variant="outline">Checked</Badge>}
                {/* <span className="text-sm">x{ticket?.quantity}</span> */}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
