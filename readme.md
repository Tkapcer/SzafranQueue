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