# Raport bezpieczeństwa — <sekcja>
## 1. Kryptografia w aplikacji
### 1.1

| Miejsce w aplikacji | Zadanie | Co jest teraz | Klucz: skąd i gdzie | Problem | Dezycja i źródło |
|-----------|-----------|-----------|-----------|-----------|-----------|
|Hasło użytkownika|Ochrona haseł|bcrypt|Nie dotyczy|Mnijesza odporność na atak brute-force|Zamiana na argon2|
|Przechowywanie tokenu|Autentyczność|expo-secure-storage|System operacyjny urządzenia klienta (Android Keystore)|Nie ma problemu|Brak zmian|

### 1.2

| Kategoria | Wynik | Jak szukaliśmy |
| :--- | :--- | :--- |
| Klucz w kodzie |klucz zapisany w pliku .env|Przegląd dokumetacji frameworka|
| Przestarzały algorytm lub tryb |znaleziono, wiersz pierwszy tabela 1.1|Przegląd funkcji logowania i rejestracji|
| Przewidywalna losowość | sprawdzone, brak|Przegląd funkcji hashujących|
| Powtarzane wartości jednorazowe |sprawdzone, brak |Sprawdzenie właśnych implemetacji kryptograficznych|
| Hasło jako zwykły skrót |sprawdzone, brak|Przegląd funkcji logowania i rejestacji|
| Szyfrowanie bez integralności |sprawdzone, brak|Przegląd dokumentacji frameworka |

## 2. Stan aplikacji i plan


|Obszar|Status|Największe ryzyko|
|:---|:---|:---|
|Funkcje (MVP)|Prawie gotowe|Mechanizm obsługi kolejki|
|Build z repozytorium|Tak|Brak|
|Model zagrożeni|Tak|Brak|
|Uprawnienia|Tak|Brak|
|Przechowywanie danych|Tak|Brak|
|Kryptografia|Tak|Brak|

### Plan do zajęć 6

|Zadanie|Kto|Termin|
|:---|:---|:---|
|Obsługa kolejki|Paweł|30.11.2026|
|Dynamiczna aktualizacjia listy sal|Kacper|30.11.2026|
|Wypraszanie studenta z sali|Matylda|29.11.2026|
|Wygaszanie zajęcia sali|Matylda|29.11.2026|