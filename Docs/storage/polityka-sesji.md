| Zdarzenie | Co usuwamy? | Gdzie (magazyn)? | Co zostaje? | Jak sprawdzimy? |
|-----------|-----------|-----------|-----------|-----------|
| Wylogowanie | Access i refresh token, cache API | Keychain / Keystore, katalog cache | Ustawienia UI |Restart → ekran logowania |
| Reinstalacja | Sesja nie wraca | Flaga first-run czyści Keychain | - | Usuń i zainstaluj ponownie |
| Wygaśnięcie sesji lokalnej | zmiana flagi | pamięć podręczna | token sesji sieciowej | Test odpytania API przy zablokowanej lokalnie aplikacji |
| Zmiana hasła na serwerze | stare hasło | baza danych | dane i nowe hasło | Zmiana hasła |
