# Nazwa projektu: SzafranQueue
### Członkowie zespołu:
- Matylda Kołek,
- Paweł Gaj,
- Kacper Trólka.
### Wybrany język:
- Frontend: React Native (JavaScript),
- Backend: Laravel (PHP).
### Opis:
System monitorujący zapełnienie sal ćwiczeniowych i umożliwiający zapisanie się do kolejki oczekujących.

## Instrukcja Uruchomienia

Ten projekt wykorzystuje architekturę hybrydową: backend działa w konteneryzowanym środowisku Docker (Laravel + PostgreSQL), natomiast frontend to aplikacja mobilna napisana w React Native (Expo).

## Wymagania wstępne

Aby uruchomić projekt na systemie Windows, upewnij się, że masz zainstalowane następujące narzędzia:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** - niezbędny do uruchomienia bazy danych i backendu. Upewnij się, że aplikacja jest włączona przed startem.
2. **[Node.js](https://nodejs.org/)** - wymagany do obsługi paczek i uruchomienia serwera frontendu (Expo).
3. **[Aplikacja Expo Go](https://expo.dev/client)** - zainstaluj ją na swoim fizycznym telefonie (dostępna w App Store / Google Play), aby móc testować aplikację na żywo.

## Jak uruchomić projekt?

W środowisku Windows cały proces instalacji zależności, konfiguracji środowiska i uruchamiania serwerów został zautomatyzowany w jednym pliku.

### Zalecane
Jeśli chcesz wprowadzić swoje ustawienia dla bazy danych (np. hasło) lub sposoby funkcjonowania frameworka Laravel wykonaj następujące czynności
1. Skopiuj plik `.env.example` do pliku `.env` w głównym folderze projektu
2. Dokonaj odpowiednich modyfikacji zmiennych 

\*Uwaga: Jeśli używasz serwera PostgreSQL w środowisku hosta na domyślnym porcie zmień wartość `EXTERNAL_POSTGRES_PORT` na inną

### Uruchom plik `start.bat`

```cmd
.\start.bat
```

**Co dokładnie zrobi ten skrypt?**
- Sprawdzi, czy istnieje plik `.env` (jeśli nie, skopiuje go z `.env.example`).
- Uruchomi w tle kontenery Dockera dla bazy PostgreSQL i Laravela.
- Wejdzie do folderu `frontend` i zaktualizuje/zainstaluje potrzebne paczki (`npm install`).
- Uruchomi serwer Expo.
- Uruchomi osobne okno terminala z podglądem logów Laravela

Na końcu w terminalu pojawi się duży kod QR. Zeskanuj go aplikacją **Expo Go** na swoim telefonie, aby otworzyć aplikację!

## Adres aplikacji

- **Backend (API):** Aplikacja serwerowa działa lokalnie pod adresem `http://localhost:8000`
- **Frontend:** 
  - Dostępna na urządzeniu mobilnym po zeskanowaniu kodu QR w aplikacji Expo Go.
  - Wersja przeglądarkowa dostępna pod adresem `http://localhost:8081`

---

## Opis endpointu

Aplikacja posiada publiczny endpoint sprawdzający, czy serwer funkcjonuje poprawnie (status aplikacji). Endpoint ten jest dostępny bez logowania i nie wymaga żadnej autoryzacji.

- **Ścieżka:** `/api/health`
- **Metoda HTTP:** `GET`
- **Oczekiwany kod odpowiedzi:** `200 OK`

**Zwracany plik JSON:**
```json
{
  "status": "ok"
}
```

## Testy

Projekt zawiera zautomatyzowany zestaw testów uruchamiany w izolowanym środowisku, dzięki czemu testy nie ingerują w lokalną bazę deweloperską.

### Wykorzystane narzędzia

- **Playwright** – testy End-to-End (E2E) w przeglądarce Chromium, weryfikujące pełny przepływ aplikacji (Expo Web → Axios → Laravel API → PostgreSQL).
- **PHPUnit (Laravel Testing)** – testy jednostkowe i funkcjonalne (Feature) dla backendu w PHP/Laravel.
- **Jest** – testy jednostkowe i komponentowe po stronie frontendu (React Native / Expo).
- **Docker Compose (`docker-compose.test.yml`)** – uruchamianie odizolowanych kontenerów testowych (`backend_e2e` oraz osobnej bazy `db_test`) zasilanych dedykowanym seederem (`E2ETestSeeder`).

### Zakres testów

Testy obejmują weryfikację kluczowych warstw i ścieżek użytkownika w systemie:

1. **Testy E2E (Playwright):**
  - **Łączność frontendu z backendem:** weryfikacja komunikacji aplikacji webowej Expo z testowym API Laravela.
  - **Poprawne logowanie (`POST /api/login`):** wypełnienie formularza danymi użytkownika z seedera, sprawdzenie odpowiedzi `200 OK`, otrzymania tokena Laravel Sanctum, zapisu sesji oraz przekierowania na ekran główny (`/home`).
  - **Obsługa błędnych danych logowania:** próba logowania z nieprawidłowym hasłem, weryfikacja kodu `401 Unauthorized`, wyświetlenia komunikatu błędu (`Invalid credentials.`), braku zapisania tokena w `localStorage` oraz pozostania na ekranie logowania.
2. **Testy backendu (Pest):**
  - Weryfikacja działania endpointów API (m.in. `/api/health`, ścieżki autoryzacji), walidacji żądań oraz logiki biznesowej w Laravelu.

### Jak uruchomić testy?

Przed uruchomieniem testów upewnij się, że działa **Docker Desktop**.

**1. Uruchomienie pełnego zestawu testów:**
W katalogu głównym projektu wykonaj:
```cmd
.\test.bat
```
Skrypt automatycznie uruchomi testy, postawi izolowane kontenery testowe (`backend_e2e` i `db_test`), wykona migracje wraz z seederem `E2ETestSeeder`, uruchomi testy E2E w Playwright, a po zakończeniu posprząta kontenery testowe.

**2. Uruchomienie testów E2E z podglądem przeglądarki lub dodatkowymi flagami:**
Parametry podane po `.\test.bat` są przekazywane bezpośrednio do komendy `npx playwright test`:
```cmd
:: Uruchomienie z widocznym oknem przeglądarki
.\test.bat --headed

:: Uruchomienie pojedynczego pliku testowego z podglądem
.\test.bat tests/LoginBadCredentials.spec.ts --headed

:: Tryb debugowania krok po kroku
.\test.bat --debug
```

**3. Podgląd raportu HTML z testów E2E:**
Po zakończeniu testów możesz otworzyć interaktywny raport Playwright (ze zrzutami, krokami i zakładką Network):
```cmd
cd frontend
npx playwright show-report
```

---

## Przydatne komendy i rozwiązywanie problemów

**Twardy reset bazy danych (Migrate Fresh + Seed):**
Jeśli potrzebujesz całkowicie wyczyścić bazę danych i wgrać dane testowe (seedery) od nowa w nowej karcie terminala uruchom:
```bash
docker exec -it my_laravel php artisan migrate:fresh --seed
```

**Zatrzymywanie środowiska:**
Gdy kończysz pracę, możesz zamknąć serwer Expo skrótem `Ctrl + C` w terminalu. Aby wyłączyć kontenery działające w tle, wpisz:
```bash
docker-compose down
```