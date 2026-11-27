# Raport: komunikacja sieciowa — sekcja 2

## 1.1 Mapa połączeń

| Połączenie | Domena | Co wysyłamy | Protokół | Uwierzytelnienie | Problem | 
|---|---|---|---|---|---|
| API aplikacji | localhost:8000 | dane logowania, rejestracji, żądania JSON, token sesji | http | brak szyfrowania, ryzyko odczytu tokenu | wdrożenie https przy produkcji| 

## 1.2 Scenariusze

| Scenariusz | Co powinno się stać | Co dzieje się u nas | Jak sprawdziliśmy |
|---|---|---|---|
| Publiczne Wi-Fi z podsłuchem | Dane nie powinny być możliwe do odczytania| Dane są możliwe do odczytania| Analiza konstrukcji zapytania|
| Proxy z własnym certyfikatem CA | Przy HTTPS aplikacja powinna odrzucić niezaufany certyfikat| Obecny adres API jest HTTP, więc nie ma certyfikatu TLS, który aplikacja mogłaby weryfikować| Sprawdzono adres bazowy i konfigurację klienta i obserwowano zakładki Network w przeglądarce|
| Certyfikat dodany przez użytkownika | Aplikacja nie powinna niejawnie ufać dodatkowym certyfikatom| Dla obecnego HTTP ten scenariusz nie ma zastosowania| Do sprawdzenia na buildzie release z HTTPS|
| Zapytanie przez `http://` | W buildzie produkcyjnym API powinno używać HTTPS; żądanie HTTP powinno być zablokowane albo przekierowane bez ujawnienia danych| Aplikacja domyślnie wysyła zapytania przez http| Przegląd api.ts i obserwacja zakładki Network w przeglądarce|
| Serwer wymienia certyfikat | Aplikacja powinna przerwać połączenie przy certyfikacie nieważnym, wygasłym lub dla innej domeny — bez przejścia na HTTP| Obecny adres API nie używa TLS, więc wymiany certyfikatu nie da się ocenić na tej konfiguracji| Nie testowano|
| Token lub dane w adresie URL | Hasła i tokeny nie powinny trafiać do URL; powinny być przekazywane w bezpiecznym nagłówku lub treści żądania| Dane wrażliwe przesyłane wyłącznie metodą POST| Analiza API|

## 1.3 Konfiguracja sieci

| Ustawienie | U nas teraz (plik:linia) | Docelowo | Uzasadnienie i źródło |
|---|---|---|---|
| Ruch bez szyfrowania (HTTP) | API wskazuje na http://127.0.0.1:8000/api| HTTPS dla wszystkich żądań w release| Obecnie HTTP może ujawnić lub pozwolić modyfikować hasła, tokeny i dane|
| Certyfikaty dodane przez użytkownika | Brak jawnej polityki w kodzie (Android domyślnie odrzuca)| Całkowite odrzucenie| Zapobiega przechwytywaniu ruchu sieciowego|
| Logowanie ruchu sieciowego | Logowanie błędów | Bez logowania haseł i tokenów| Zmniejszenie ryzyka wycieku danych|
