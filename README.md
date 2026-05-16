# Wallet / Transaction Service (NestJS + MongoDB)

Production-ready backend service for wallet management and atomic money transfers.

## Features
- Create users with wallets (`POST /users`)
- Add balance (`POST /wallets/:userId/add-balance`)
- Transfer funds atomically (`POST /wallets/transfer`)
- Prevent negative balances
- Strict request validation
- Consistent response envelopes and error format

## Architecture
```
src/
  common/
    filters/
    interceptors/
  config/
  modules/
    users/
    wallets/
```

## Setup
1. Copy env values:
   ```bash
   cp .env.example .env
   ```
2. Install deps:
   ```bash
   npm install
   ```
3. Start in dev mode:
   ```bash
   npm run start:dev
   ```

## API

### Create user
`POST /users`
```json
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

### Add balance
`POST /wallets/{userId}/add-balance`
```json
{
  "amount": 500
}
```

### Transfer money
`POST /wallets/transfer`
```json
{
  "fromUserId": "6653f5b2ca0b7d7f4d8f1ca1",
  "toUserId": "6653f5b2ca0b7d7f4d8f1ca2",
  "amount": 100
}
```

## Concurrency & Atomicity
Transfer uses MongoDB multi-document transaction (`session.withTransaction`) so debit and credit are all-or-nothing.

## Production Notes
- Use MongoDB replica set (transactions require it)
- Add auth/rate-limit/audit logs for real production deployments
- Add observability (OpenTelemetry, metrics, structured logs)
