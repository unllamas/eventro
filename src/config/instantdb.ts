import { init } from '@instantdb/admin';

interface EventProps {
  // Base data
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  pubkey: string;
  nostrId: string;

  // Status
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketProps {
  // Base data
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  quantity: number;

  // Relations
  eventId: string;

  // Status
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProps {
  id: string;
  name?: string;
  email?: string;
  pubkey?: string;

  // Status
  createdAt: string;
}

interface OrderProps {
  id: string;
  quantity: number;
  amount: number;
  paid: boolean;

  userId: string;
  ticketId: string;
  eventId: string;
  zapId: string;

  // Status
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketSaleProps {
  id: string;
  reference: string;
  bolt11: string;
  checkIn: boolean;

  // Relations
  userId: string;
  orderId: string;
  eventId: string;

  // Status
  createdAt: string;
  updatedAt: string;
}

type DbSchema = {
  events: EventProps;
  tickets: TicketProps;
  users: UserProps;
  orders: OrderProps;
  ticketSales: TicketSaleProps;
};

const APP_ID = process.env.INSTANT_DB_APP_ID || '';
const ADMIN_TOKEN = process.env.INSTANT_DB_ADMIN_TOKEN || '';

export const db = init<DbSchema>({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});
