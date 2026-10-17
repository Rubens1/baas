# Local BaaS

NestJS API that stores accounts, sessions, checkouts, wallet balances, fees and
withdrawals in MySQL. No external payment gateway is used.

## Structure

```text
src/
  auth/          local login, sessions and token protection
  users/         PF/PJ signup and wallet creation
  fees/          fee lookup from MySQL
  checkouts/     checkout sessions and local payment simulation
  wallet/        local balance and ledger
  withdrawals/   internal ledger transfers
  entities/      persisted database models
```

## Configuration

Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` in `.env`.
TypeORM has `synchronize: false`. Run these migrations in order:

1. [`000_wallets_and_transactions.sql`](./database/migrations/000_wallets_and_transactions.sql)
2. [`001_local_payments.sql`](./database/migrations/001_local_payments.sql)
3. [`002_local_accounts_and_fees.sql`](./database/migrations/002_local_accounts_and_fees.sql)

## Routes

All routes use the `/api` prefix.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/users` | Creates a PF/PJ account and its wallet. Send name, email, phone, document, type and password. |
| `POST` | `/auth/login` | Authenticates with email and password and returns a local session. |
| `POST` | `/auth/logout` | Revokes the authenticated local session. |
| `GET` | `/fees?method=CARD&brand=...` | Lists fee rates stored in the database. |
| `POST` | `/fees` | Creates a fee rate, or updates the existing rate with the same method, brand and installments. |
| `PATCH` | `/fees/:id` | Updates the percentage of an existing fee rate. |
| `POST` | `/checkouts` | Creates a PIX or card checkout. Card accepts installments and an optional brand. |
| `GET` | `/checkouts?status=...` | Lists the authenticated merchant's checkouts. |
| `GET` | `/checkouts/:id` | Gets a checkout and its applied rate. |
| `PATCH` | `/checkouts/:id/simulate-payment` | Locally simulates `APPROVED`, `DENIED`, `EXPIRED` or `CANCELLED`. |
| `GET` | `/wallet` | Gets the local balance. |
| `GET` | `/wallet/transactions?status=...&type=...&limit=...` | Gets the local ledger with filters. |
| `POST` | `/withdrawals` | Records a transfer from the available balance to the supplied destination. |
| `GET` | `/withdrawals/:id` | Gets a local transfer status. |

All routes except signup and login require an authenticated session in the
`Authorization` header, formatted as `Bearer <access-token>`. The session
identifies the merchant; clients cannot select another merchant by submitting
a merchant ID.

## Local-mode limitations

Without a payment provider, the system cannot accept real PIX/card payments,
settle withdrawals at banks, generate valid PIX QR codes or receive settlement
webhooks. The `simulate-payment` endpoint updates the checkout, ledger and
balance atomically in MySQL. `BAAS-LOCAL:<externalReference>` is a demonstration
reference only, not a PIX code.

The migrations seed zero-percent fees for testing. Update the `fees` table with
the product's fee schedule before handling real values.

## Development

```bash
pnpm install
pnpm start:dev
pnpm test
pnpm exec nest build
```
