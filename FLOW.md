## Endpoints

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