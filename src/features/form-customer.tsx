import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const MAX_TICKETS = parseInt(process.env.NEXT_MAX_TICKETS || '0', 10); // Get the max tickets from env

interface FormCustomerProps {
  onSubmit: (data: { name: string; email: string; pubkey: string }) => void;
  loading: boolean;
  eventId: string;
  soldOut: boolean;
}

export function FormCustomer({
  onSubmit,
  loading,
  eventId,
  soldOut = false,
}: FormCustomerProps) {
  // Form
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState('');
  const [maxTicketsReached, setMaxTicketsReached] = useState<boolean>(soldOut);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // setLoading(true);

    // Insert data if not exist
    const data = {
      name,
      email,
      pubkey: '',
    };

    const status = 200;

    if (status && status === 200) {
      console.log('data', data);
      onSubmit(data);
    } else {
      setMessage('Hubo un error al registrar el cliente.');
      // setLoading(false);
    }
  };

  // Check total tickets in the database on component mount
  useEffect(() => {
    const checkTickets = async () => {
      try {
        const response = await fetch(`/api/ticket/count?id=${eventId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`${errorData.errors || response.statusText}`);
        }

        const data = await response.json();

        if (response.ok) {
          if (data.data.count >= MAX_TICKETS) {
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

  if (maxTicketsReached) {
    return (
      <div className="relative flex-1 flex flex-col justify-center gap-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-white text-3xl font-bold mb-2">Sold Out!</h2>
            <p className="text-muted-foreground text-xl">
              This batch of tickets is sold out.
            </p>
            {/* <div className="mt-4 flex justify-center space-x-4">
            <p className="text-white text-lg">Seguinos para enterarte.</p>
          </div> */}
            {/* <div className="flex justify-center space-x-4">
            <a
              href="https://twitter.com/lacryptaok"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
            >
              <TwitterIcon />
            </a>
            <a
              href="https://www.instagram.com/lacryptaok"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-pink-400 transition-colors"
            >
              <InstagramIcon />
            </a>
          </div> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex-1 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl">Information</h2>
          <p className="text-text">
            Please complete the information to receive your ticket.
          </p>
        </div>
        <Card className="p-6">
          <div className="flex flex-col flex-1 justify-start">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    minLength={3}
                    placeholder="Your alias"
                    required
                    onChange={(e) => setName(e.target.value)}
                    defaultValue={name}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your real mail"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    defaultValue={email}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading || maxTicketsReached}>
                {loading ? 'Generating payment...' : 'Confirm order'}
              </Button>
            </form>
            {message && <p className="text-center text-sm mt-2">{message}</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
