### Konfiguracja backendu
2. Pobrać php: https://www.php.net/downloads.php (VS17 x64 Non Thread Safe)
2. Wypakować najlepiej do C:\php
3. Odkomentować:
   extension=curl
   extension=fileinfo
   extension=mbstring
   extension=openssl
   extension=pdo_mysql
   extension=zip
   extension=pdo_sqlite
   extension=sqlite3
   extension=pqsql
4. Pobrać composer: https://getcomposer.org/doc/00-intro.md#using-the-installer
5. Skopiować .env.example do .env
6. Wykonać: `php artisan key:generate`
7. Wykonać: `npm install`
8. Wykonać `composer run dev`


### Konfiguracja Frontnedu
1. npx create-expo-app@latest mobile-app