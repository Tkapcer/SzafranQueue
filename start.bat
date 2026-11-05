@echo off
echo 🚀 Sprawdzanie konfiguracji...

:: Sprawdzenie czy istnieje główny plik .env
if not exist .env (
    echo ⚙️ Brak pliku .env. Kopiowanie z .env.example...
    copy .env.example .env
)

echo 🐳 Uruchamianie Dockera...
docker-compose up -d --build

echo 📜 Podglad logow z backendu (wcisnij Ctrl+C, aby wyjsc z podgladu)...
docker-compose logs -f backend