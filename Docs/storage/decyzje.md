| Co | Po co na urządzeniu | Klasyfikacja | Magazyn | Dostępność | Uzasadnienie | Zasady |
|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
|Refresh token|odnawianie sesji w tle|poufne|expo-secure-store|AfterFirstUnlockThisDeviceOnly|potrzebny w tle; nie trafia do kopii ani na inne urządzenie|2,3,5|
|Preferencje wyszukiwania|Podpowiedź wyboru sali|Poufne|react-native-async-storage|AfterFirstUnlockThisDeviceOnly|wymagane wyłącznie przy aktywnie działającej aplikacji|1,3|
|Historia transakcji|Możliwość odtworzenia historii|poufne|brak|setUnlockedDeviceRequired|Brak konieczności ciągłego dostępu|1,3,5|
