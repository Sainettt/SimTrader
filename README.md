# SimTrader - Mobilny System Kantoru Walutowego

## 1. Opis Projektu
SimTrader to mobilna aplikacja umożliwiająca symulację handlu walutami i kryptowalutami w czasie rzeczywistym. System składa się z wieloplatformowej aplikacji mobilnej (Android/iOS) oraz serwera REST API, który zarządza logiką biznesową, bazą danych użytkowników i historią transakcji. Projekt integruje się z zewnętrznym API giełdowym (Binance) w celu pobierania aktualnych kursów rynkowych.

Projekt został zrealizowany jako system klient-serwer, spełniający wymogi nowoczesnej aplikacji fintech z obsługą autoryzacji, portfela i analizy danych.

## 2. Funkcjonalności
* **Rejestracja i Logowanie:** Bezpieczne uwierzytelnianie użytkowników oparte na tokenach JWT.
* **Portfel (Wallet):** Podgląd salda całkowitego w USD oraz szczegółowy stan posiadanych aktywów (kryptowalut).
* **Rynek (Market):** Lista aktualnych kursów walut odświeżana na bieżąco.
* **Wykresy:** Interaktywne wykresy historyczne (świecowe) dla interwałów: 1H, 1D, 1W, 1M, 1Y.
* **Transakcje:** Możliwość kupna i sprzedaży walut po cenie rynkowej.
* **Top-up:** Symulacja zasilania konta za pomocą karty płatniczej.
* **Historia:** Pełny rejestr operacji (wpłaty, wypłaty, kupno, sprzedaż).

## 3. Technologie

### Aplikacja Mobilna (Client)
* **Język:** TypeScript
* **Framework:** React Native
* **Nawigacja:** React Navigation (Stack)
* **Wykresy:** React Native Wagmi Charts / Chart Kit
* **Klient HTTP:** Axios
* **Pamięć lokalna:** Secure Storage (dla tokenów)

### Serwer (Backend)
* **Środowisko:** Node.js
* **Framework:** Express.js
* **Baza Danych:** PostgreSQL
* **ORM:** Prisma
* **Autoryzacja:** JWT (JSON Web Token) + bcryptjs
* **Zewnętrzne API:** Binance API (Axios)

## 4. Wymagania wstępne
Aby uruchomić projekt lokalnie, potrzebujesz:
* Node.js (wersja 20 lub nowsza)
* PostgreSQL (lokalnie lub w Dockerze)
* Android Studio (do emulatora Androida) lub Xcode (dla iOS - tylko macOS)
* Menedżer pakietów `npm` lub `yarn`

## 5. Instalacja i Uruchomienie

### Krok 1: Konfiguracja Bazy Danych i Serwera

1.  Przejdź do folderu serwera:
    ```bash
    cd server
    ```
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Stwórz plik `.env` w katalogu `server/` i skonfiguruj połączenie z bazą:
    ```env
    DATABASE_URL="postgresql://uzytkownik:haslo@localhost:5432/simtrader_db"
    JWT_SECRET_KEY="twoj_tajny_klucz_jwt"
    PORT=3000
    ```
4.  Wykonaj migrację bazy danych (utworzenie tabel):
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Uruchom serwer w trybie deweloperskim:
    ```bash
    npm run dev
    ```
    *Serwer powinien działać pod adresem `http://localhost:3000`.*

### Krok 2: Konfiguracja Aplikacji Mobilnej

1.  Otwórz nowe okno terminala i przejdź do folderu aplikacji:
    ```bash
    cd app
    ```
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Skonfiguruj adres API:
    * W pliku `app/services/api.ts` (lub `apiConfig.ts`) upewnij się, że `baseURL` wskazuje na Twój serwer.
    * Dla **Android Emulator** użyj: `http://10.0.2.2:3000`
    * Dla **iOS Simulator** użyj: `http://localhost:3000`
    * Dla fizycznego urządzenia: Użyj adresu IP komputera w sieci lokalnej (np. `http://192.168.1.XX:3000`).

4.  Uruchom aplikację:
    * **Android:**
        ```bash
        npm run android
        ```
    * **iOS (tylko macOS):**
        ```bash
        cd ios && pod install && cd ..
        npm run ios
        ```

## 6. Struktura Projektu

* `app/` - Kod źródłowy klienta mobilnego (Ekrany, Komponenty, Konteksty).
* `server/` - Kod źródłowy backendu (API, Prisma Schema, Kontrolery).
* `server/prisma/schema.prisma` - Definicja modelu bazy danych.

## 7. Autor
[Danyil Fiut]
