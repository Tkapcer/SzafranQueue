| Kanał | Dotyczy nas? | Co tam trafia teraz? | Jak zamkniemy? | Jak sprawdzimy? |
|-----------|-----------|-----------|-----------|-----------|
|Logi|Tak|Token w logu HTTP|Interceptor maskuje nagłówki, brak logów w release |logcat / Console|
|Kopia zapasowa|Tak|Cały katalog danych|allowBackup=false / wykluczenie z kopii |adb backup|
|Zrzuty ekranu/przełącznik|Tak|zdjęcie legitymacji, ekrany portiera z danymi użytkownika|flag_secure|doświadczalnie|
|Schowek|Nie||||
|Klawiatura|Tak|Dane logowania|secureTextEntry={true}|Tekst podpowiedzi, słownik klawiatury|
|Cache HTTP i WebView|Tak|Odpowiedzi z API|konfiguracja nagłówków po stronie backendu|Inspekcja katalogu|
|Pliki tymczasowe|Nie||||
|Powiadomienia|Tak|Powiadomienie o zatwierdzeniu konta, powiadomienie o przydzieleniu sali|Ograniczenie treści|Inspekcja powiadomień|


