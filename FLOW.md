# Flow endpoints

- [Whitelist](#whitelist)
- Dashboard
  - [Create a new event](#create-a-new-event)
  - [Get events](#get-events)
- Manage
  - [Get event](#get-event)
- Check-out
  - [Create user](#create-a-new-user)
  - [Create order](#create-a-new-order)
  - [Create payment](#create-new-payment)

## Whitelist

### Create a new user

`/api/whitelist`

- [x] Basic validations
- [ ] Validate the request with zod
- [x] Validate if exists the pubkey
- [ ] Save user on InstantDB

#### Parameters: 
```json
{
  "pubkey": <string>,
}
```

## Dashboard

### Create a new event

`/api/event/create`

- [x] Basic validations
- [ ] Validate the request with zod
- [x] Save event on InstantDB

#### Parameters: 
```json
{
  "pubkey": <string>,
  "event": <json object>,
  "tickets": <array of objects>,
}
```

### Get events

`/api/event/getAll?pubkey=<pubkey>`

- [ ] Validate the request with zod
- [x] Return events from InstantDB

## Manage

### Get event

`/api/event/get?id=<eventId>`

- [ ] Validate the request with zod
- [x] Return event from InstantDB

## Check-out

### Create a new user

`/api/user/create`

- [x] Basic validations
- [ ] Validate the request with zod
- [x] Validate if exists the user
- [x] Save user on InstantDB

#### Parameters: 
```json
{
  "name": <string>,
  "email": <string>,
  "pubkey": <string>,
}
```

### Create a new order

`/api/order/create`

- [x] Basic validations
- [ ] Validate the request with zod
- [x] Validate if exists the ticket
- [x] Save order on InstantDB

#### Parameters: 
```json
{
  "quantity": <number>,
  "userId": <string>,
  "ticketId": <string>,
  "eventId": <string>,
}
```

### Create a new payment

`/api/payment/create`

- [x] Basic validations
- [ ] Validate the request with zod
- [x] Validate if exists the ticket
- [x] Validate if exists the event
- [ ] Generate payment and send to Nostr

#### Parameters: 
```json
{
  "quantity": <number>,
  "ticketId": <string>,
  "orderId": <string>,
  "userId": <string>,
  "eventId": <string>,
}
```