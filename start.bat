@echo off
echo Sprawdzanie konfiguracji projektu...

:: --- 1. BACKEND (DOCKER) ---
if not exist .env (
    echo  Brak pliku .env. Kopiowanie z .env.example...
    copy .env.example .env
)

echo Uruchamianie backendu w tle (Docker)...
docker-compose up -d --build

:: Otwiera logi backendu w całkowicie nowym, osobnym oknie Windowsa
echo Otwieranie logow w nowym oknie...
start "Logi Backend" cmd /k "docker-compose logs -f backend"

:: --- 2. FRONTEND (EXPO) ---
cd frontend

echo Aktualizacja zaleznosci frontendu (npm install)...
call npm install

echo Uruchamianie aplikacji mobilnej Expo...
call npm start