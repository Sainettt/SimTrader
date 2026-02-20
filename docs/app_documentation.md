# App Documentation (Frontend)

The frontend is a React Native mobile application designed for ease of use and real-time interaction with the trading backend.

## Tech Stack

- **Framework**: React Native
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack)
- **Networking**: Axios
- **State Management**: React Context API (`AuthContext`)
- **Storage**: `react-native-keychain` for secure token storage.
- **UI Components**: `react-native-svg`, `react-native-vector-icons`, `react-native-chart-kit` for data visualization.

## Application Structure

- **Screens (`screens/`)**:
    - `authScreens`: Login and Registration.
    - `appScreens`: Home, Portfolio, Trade, Settings, etc.
- **Context (`context/`)**:
    - `AuthContext`: Manages user authentication state, tokens, and global user data.
- **Services (`services/`)**:
    - `api.ts`: Centralized Axios instance with request/response interceptors for token management and retries.
- **Components (`components/`)**: Reusable UI elements like buttons, inputs, and chart wrappers.

## Authentication Flow

1.  User logs in via email/password or Google.
2.  Backend returns a JWT.
3.  The app saves the token securely using `react-native-keychain`.
4.  `AuthContext` updates the `isLoggedIn` state and `userInfo`.
5.  Subsequent requests automatically include the `Authorization: Bearer <token>` header via Axios interceptors.

## Integration with Backend

The app communicates with the backend through a set of API services defined in `services/api.ts`. It includes:
- `authAPI`: Registration, login, and token check.
- `currencyAPI`: Fetching market data and history.
- `walletAPI`: Managing USD balance and transactions.
- `tradeAPI`: Executing buy and sell orders.
