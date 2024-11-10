# Eventro

Nostr-based events and ticketing with Lightning payments.

## Getting Started

1. Copy the `.env.example` file to `.env` and fill in the required values.

```bash
cp .env.example .env
```

2. Install dependencies

```bash
pnmp install
```

3. Use the correct node version

```bash
nvm use
```

5. Start the server

```bash
pnpm dev
```

## Roadmap

### Q4 2024

- [x] Login with Nostr
- [x] Create Event
- [x] Create Ticket
- [x] Create User
- [x] Create Order
- [ ] Generate and listen Payment
  - [ ] Send SATs to our wallet (service)
  - [ ] Send SATs to lud16 of user (ticket)
- [ ] Create TicketSale
  - [ ] Send to email
- [ ] Check-in for TicketSale

### Q1 2025

- [ ] Add Coupon for Tickets
- [ ] App mobile for Check-n
  - [ ] Generate waitlist for users
- [ ] Add Moderators for Check-n with pubkey
  - [ ] Login with pubkey
  - [ ] Add pubkey to moderators
- [ ] Integrate location on create Event
- [ ] Create internal Dashboard

### Q2 2025

- [ ] Events page
- [ ] Save Event how (NIP-52)[https://github.com/nostr-protocol/nips/blob/master/52.md] for Nostr
  - [ ] Added upload image
- [ ] Enable tickets for Nostr created events
  - [ ] Possibility for generate more that 1 ticket
- [ ] Customize Check-out page
