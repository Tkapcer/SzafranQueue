@echo off
echo ==========================================
echo     TESTY BACKENDU (Laravel + Postgres)
echo ==========================================

docker-compose -f docker-compose.yml -f docker-compose.test.yml run --rm backend_test sh -c "if [ ! -f vendor/autoload.php ]; then composer install; fi && php artisan test"
set BACKEND_EXIT_CODE=%ERRORLEVEL%

:: Sprzątamy TYLKO kontener db_test
docker-compose -f docker-compose.yml -f docker-compose.test.yml stop db_test
docker-compose -f docker-compose.yml -f docker-compose.test.yml rm -f db_test

if %BACKEND_EXIT_CODE% NEQ 0 (
    echo.
    echo [BLAD] Testy backendu nie przeszly!
    exit /b %BACKEND_EXIT_CODE%
)

echo.
echo ==========================================
echo     TESTY E2E (Playwright + Test API)
echo ==========================================

:: Startujemy db_test i backend_e2e i czekamy, aż /api/health zwróci 200 OK
docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d --wait backend_e2e
if %ERRORLEVEL% NEQ 0 (
    echo [BLAD] Nie udalo sie uruchomic backendu E2E!
    docker-compose -f docker-compose.yml -f docker-compose.test.yml rm -sf backend_e2e db_test
    exit /b 1
)

cd frontend
echo Aktualizacja zaleznosci frontendu (npm install)...
call npm install
call npx playwright test %*
set E2E_EXIT_CODE=%ERRORLEVEL%
cd ..

:: Zawsze sprzątamy kontenery testowe (niezależnie od wyniku testu)
docker-compose -f docker-compose.yml -f docker-compose.test.yml rm -sf backend_e2e db_test

if %E2E_EXIT_CODE% NEQ 0 (
    echo.
    echo [BLAD] Testy E2E nie przeszly!
    exit /b %E2E_EXIT_CODE%
)

echo.
echo [OK] Wszystkie testy (Backend, Frontend, E2E) zakonczone sukcesem!