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
                {loading ? 'Loading...' : 'Confirm order'}
              </Button>
            </form>
            {message && <p className="text-center text-sm mt-2">{message}</p>}
          </div>
        </Card>
      </div>
    </>
  );
}

function TwitterIcon() {
  return (
    <svg
      className="w-8 h-8"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      className="w-8 h-8"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
