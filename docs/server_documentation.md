# Server Documentation (Backend)

The backend is built with Node.js and Express, using Prisma as an ORM for PostgreSQL.

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: JWT (JSON Web Tokens) & Google Auth
- **Utilities**: `node-cron` for scheduled tasks, `axios` for external API calls, `bcryptjs` for password hashing.

## API Routes

### Authentication (`/api/auth`)
- `POST /registration`: Register a new user.
- `POST /login`: Log in with email and password.
- `GET /check`: Verify JWT token and get user info.
- `POST /google`: Google OAuth login/registration.

### Currency (`/api/currency`)
- `GET /list`: Get a list of top cryptocurrencies.
- `GET /history`: Get historical price data for a specific currency.
- `GET /rate`: Get current exchange rate.

### Wallet (`/api/wallet`)
- `POST /top-up`: Add funds (USD) to the user's wallet.
- `GET/:userId`: Get the user's portfolio and balance.
- `GET/:userId/transactions`: Get a history of transactions.
- `POST /withdraw`: Withdraw funds from the wallet.

### Trade (`/api/trade`)
- `POST /buy`: Purchase a cryptocurrency.
- `POST /sell`: Sell a cryptocurrency.

## Database Schema (Prisma)

- **User**: Stores user account details (username, email, password).
- **Wallet**: Manages USD balance and links to a specific user.
- **Asset**: Tracks individual cryptocurrency holdings within a wallet.
- **Transaction**: Records all trade and wallet operations (BUY, SELL, DEPOSIT, WITHDRAWAL).
- **BankCard**: Stores simulated bank card information for top-ups.

## Key Services

- **Price Cache (`services/priceCache.ts`)**: Manages real-time price updates to minimize external API calls and provide fast access to market data.
- **Auth Middleware (`middleware/authMiddleware.ts`)**: Protects routes by verifying the JWT token in the `Authorization` header.
