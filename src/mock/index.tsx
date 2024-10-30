import { Bitcoin, Paintbrush, SquareChartGantt, Waypoints } from 'lucide-react';

export const EVENT_MOCK = {
  id: 'event_1',
  image:
    'https://cdn.satlantis.io/npub1hz5alqscpp8yjrvgsdp2n4ygkl8slvstrgvmjca7e45w6644ew7sewtysa-1728996009903-buenos%20aires2.png',
  title: 'Holdween in La Crypta',
  description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
  start: '1730638800',
  end: '1730664000',
  location:
    'Villanueva 1367, C1426BMI Cdad. Autónoma de Buenos Aires, Argentina',
  date: '',
};

export const EVENTS_MOCK = [
  {
    id: 'event_1',
    image:
      'https://cdn.satlantis.io/npub1hz5alqscpp8yjrvgsdp2n4ygkl8slvstrgvmjca7e45w6644ew7sewtysa-1728996009903-buenos%20aires2.png',
    title: 'Holdween in La Crypta',
    description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    start: '1730638800',
    end: '1730664000',
    location:
      'Villanueva 1367, C1426BMI Cdad. Autónoma de Buenos Aires, Argentina',
    date: '',
  },
  {
    id: 'event_2',
    image:
      'https://cdn.satlantis.io/npub1hz5alqscpp8yjrvgsdp2n4ygkl8slvstrgvmjca7e45w6644ew7sewtysa-1728996009903-buenos%20aires2.png',
    title: 'Cumpleano1 La Crypta',
    description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    start: '1730638800',
    end: '1730664000',
    location:
      'Villanueva 1367, C1426BMI Cdad. Autónoma de Buenos Aires, Argentina',
    date: '',
  },
  {
    id: 'event_3',
    image:
      'https://cdn.satlantis.io/npub1hz5alqscpp8yjrvgsdp2n4ygkl8slvstrgvmjca7e45w6644ew7sewtysa-1728996009903-buenos%20aires2.png',
    title: 'LaBitconf Argentina',
    description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    start: '1730638800',
    end: '1730664000',
    location:
      'Villanueva 1367, C1426BMI Cdad. Autónoma de Buenos Aires, Argentina',
    date: '',
  },
];

export const TICKETS_MOCK = [
  // Evento 1
  {
    id: 'ticketA1',
    event_id: 'event1',
    title: 'General',
    description: 'General admission pass for the Festival Music',
    amount: 7000, // in Satoshis
    currency: 'SAT',
    quantity: 150,
    created_at: 1698000000,
    updated_at: 1698000000,
  },
];

export const ORDERS_MOCK = [
  {
    event_id: 'event1',
    ticket_id: 'ticketA1',
    content: 'Festival Music VIP purchase',
    pubkey: 'npub1example1',
    quantity: 2,
    bolt11: 'lnbc1u1example1',
    status: 'purchased',
    created_at: 1698010000,
    updated_at: 1698011000,
  },
  {
    event_id: 'event1',
    ticket_id: 'ticketA1',
    content: 'Festival Music General Admission purchase',
    pubkey: 'npub1example2',
    quantity: 3,
    bolt11: 'lnbc1u1example2',
    status: 'purchased',
    created_at: 1698012000,
    updated_at: 1698013000,
  },
  {
    event_id: 'event1',
    ticket_id: 'ticketA1',
    content: 'Festival Music Early Bird purchase',
    pubkey: 'npub1example3',
    quantity: 1,
    bolt11: 'lnbc1u1example3',
    status: 'purchased',
    created_at: 1698014000,
    updated_at: 1698015000,
  },
  {
    event_id: 'event2',
    ticket_id: 'ticketA1',
    content: 'Tech Conference Premium purchase',
    pubkey: 'npub1example4',
    quantity: 1,
    bolt11: 'lnbc1u1example4',
    status: 'purchased',
    created_at: 1698016000,
    updated_at: 1698017000,
  },
  {
    event_id: 'event2',
    ticket_id: 'ticketA1',
    content: 'Tech Conference Standard purchase',
    pubkey: 'npub1example5',
    quantity: 4,
    bolt11: 'lnbc1u1example5',
    status: 'purchased',
    created_at: 1698018000,
    updated_at: 1698019000,
  },
  {
    event_id: 'event2',
    ticket_id: 'ticketA1',
    content: 'Tech Conference Workshop Only transfer',
    pubkey: 'npub1example6',
    quantity: 2,
    bolt11: 'lnbc1u1example6',
    status: 'transferred',
    created_at: 1698020000,
    updated_at: 1698021000,
  },
  {
    event_id: 'event3',
    ticket_id: 'ticketA1',
    content: 'Art Exhibition VIP purchase',
    pubkey: 'npub1example7',
    quantity: 1,
    bolt11: 'lnbc1u1example7',
    status: 'purchased',
    created_at: 1698022000,
    updated_at: 1698023000,
  },
  {
    event_id: 'event3',
    ticket_id: 'ticketA1',
    content: 'Art Exhibition General Admission purchase',
    pubkey: 'npub1example8',
    quantity: 3,
    bolt11: 'lnbc1u1example8',
    status: 'purchased',
    created_at: 1698024000,
    updated_at: 1698025000,
  },
  {
    event_id: 'event3',
    ticket_id: 'ticketA1',
    content: 'Art Exhibition Student Pass purchase',
    pubkey: 'npub1example9',
    quantity: 2,
    bolt11: 'lnbc1u1example9',
    status: 'purchased',
    created_at: 1698026000,
    updated_at: 1698027000,
  },
  // Otros 11 ejemplos adicionales para completar las 20 órdenes...
];

export const FEATURES_MOCK = [
  {
    id: 1,
    icon: Paintbrush,
    title: 'Customizable',
    description: 'Tailor the experience to your brand and style.',
  },
  {
    id: 2,
    icon: Waypoints,
    title: 'Nostr Integration',
    description: 'Empower your events with decentralized.',
  },
  {
    id: 3,
    icon: Bitcoin,
    title: 'Bitcoin Payments',
    description: 'Offers innovative and international payments.',
  },
  {
    id: 4,
    icon: SquareChartGantt,
    title: 'Simplified Management',
    description: 'Easily manage different types of moderator posts.',
  },
];
