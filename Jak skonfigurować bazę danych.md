1. Zainstaluj PostgreSQL oraz pgadmin4
2. Uruchom pgadmin
3. Utwórz nową, pustą bazę danych `SzafranQueue`
4. Zapamiętaj nazwę bazy, użytkownika (domyślnie `postgres`) oraz hasło ustalone przy instalacji.
5. Otwórz plik `.env` i zaktualizuj sekcję bazy danych swoimi danymi logowania do PostgreSQL:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=SzafranQueue
DB_USERNAME=postgres
DB_PASSWORD=twoje_haslo
```
6. Zrób migrację i wypełnienie bazy danymi statycznymi:
```bash
php artisan migrate:fresh --seed
```
7. Migrację wykonuj gdy zmienimy coś w bazie

