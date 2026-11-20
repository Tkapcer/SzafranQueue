# Raport: logowanie i sesje — sekcja 2

## 1.1 Elementy sesji

diagram sekwencji - osobny plik "Diagram sekwencji logowanie.puml"

| Element | Gdzie powstaje | Gdzie leży | Ważny przez | Jak unieważnić | Problem |
|---|---|---|---|---|---|
| Hasło | Wpisane przez użytkownika| Zaszyfrowane w bazie| Do zmiany| Przez zmianę| Brak| Zostawiamy|
| Token dostępu | Wydawany przez serwer| expo-secure-store| 120 minut| Przez wylogowanie| Brak| Zostawiamy|
| Klucz lub dane biometrii | Wprowadzone przez użytkownika| Urządzenie| Do przeładowania aplikacji| Zmiana biometrii w ustawieniach systemowych| Brak| Zostawiamy|

## 1.2 Scenariusze

| Scenariusz | Co powinno się stać | Co dzieje się u nas | 
|---|---|---|
| Wylogowanie | Token powinien przestać działać| Token jest usuwany|
| Zgubiony telefon | Inna osoba nie powinna mieć możliwości dostania się do aplikacji| Aplikacja wymaga odblokowania biometrią|
| Zmiana hasła |  Inne sesje powinny się skończyć| Sesje dalej trwają|
| Token wygasa w trakcie pracy | Wylogowanie| Wylogowanie|
| Reinstalacja aplikacji | Sesja znika | Sesja dalej trwa|
| Przechwycony token | Powinien działać krótko| Trwa 120 minut|
| Odblokowanie biometrią | Odblokowanie aplikacji| Odblokowanie aplikacji|

## 1.3 Polityka sesji

| Parametr | U nas teraz | Docelowo | Uzasadnienie i źródło |
|---|---|---|---|
| Ważność tokenu dostępu | 120 minut| 120 minut|to jest jakby okej |
| Wylogowanie po bezczynności | nie ma | 120 minut |to jest jakby okej |
| Operacje wymagające ponownego potwierdzenia | Nie ma| Będzie|to jest jakby okej |

