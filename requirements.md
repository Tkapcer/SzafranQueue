### Cel aplikacji
Celem aplikacji jest wspomaganie zarządzania salami ćwiczeniowymi w budynku uczelni muzycznej. Studenci korzystają z sal, by ćwiczyć grę na instrumentach (pianiści potrzebują sali z fortepianem), 
wykładowca korzysta z sal, by prowadzić w nich zajęcia, portier zarządza wydawaniem kluczy. System ma zapobiegać problemowi fizycznego czekania studentów w kolejce po sale i uporządkować sposób rezerwacji.
### Użytkownicy

- **Student**  

  **Może:**
  * zarejestrować się,
  * obserwować dostępność sal,
  * poprosić o zajęcie wolnej sali na max 2h,
  * dołączyć do kolejki po salę,
  * w razie wyproszenia z sali przez wykładowcę w ciągu pierwszych 15 minut od jej zajęcia, student może zająć pierwsze miejsce w kolejce,
  * oddać salę,
  * wyjść z kolejki.

  **Nie może:**
  - zająć sali, w której ktoś już jest,
  - dodawać i modyfikować sal,
  - modyfikować kolejki,
  - modyfikować roli własnego konta,
  * zająć sali na więcej niż 2h.
    
- **Portier/Zarządca**  

  **Może:**
  * zatwierdzić i usunąć użytkowników,
  * ustalić liczbę i dostępność sal,
  * dodać, usunąć lub edytować typ sali z systemu,
  * nadawać role użytkownikom.

  **Nie może:**
  * nadać roli portiera innemu użytkownikowi.
    
- **Wykładowca**  

  **Może:**
  * zarejestrować się,
  * zająć salę, nawet zajętą przez studenta (na dowolny czas),
  * oddać salę,
  * dołączyć do kolejki dla wykładowców.

  **Nie może:**
  * zająć sali zaznaczonej jako zajęta przez portiera,
  * zająć sali zajętej przez wykładowcę.

### Wymagania funkcjonalne:
- rejestracja użytkownika jako student lub wykładowca,
- logowanie na konto,
- przeglądanie stanu zapełnienia sal ćwiczeniowych,
- zajęcie sali ćwiczeniowej,
- zwolnienie sali ćwiczeniowej,
- ustawienie się w kolejce po salę,
- wyjście z kolejki.

### Wymagania bezpieczeństwa
- użytkownik ma dostęp do ograniczonego zestawu funkcji w systemie przypisanego do swojej roli,
- szyfrowanie wrażliwych danych,
- unikanie przechowywania danych wrażliwych gdy nie są już potrzebne w systemie,
- ograniczony czas trwania sesji
- zabezpieczenie przed Cross Site Request Forgery
- wymaganie co do minimalnej złożoności hasła użytkownika
  
### Model zagrożeń
| Zagrożenie | Czego dotyczy | Możliwe konsekwencje | Planowana kontrola / działanie |
| :--- | :--- | :--- | :--- |
| **1. Przejęcie konta** | Moduł uwierzytelniania i sesji użytkowników (studentów, wykładowców, portierów). | • Nieautoryzowany dostęp do konta ofiary.<br>• Wykonywanie niedozwolonych operacji w imieniu użytkownika (np. fałszywe rezerwacje, usuwanie z kolejek).<br>• W przypadku konta portiera – pełna kontrola nad zatwierdzaniem użytkowników i salami. | • Wdrożenie silnej polityki haseł (minimalna złożoność).<br>• Ograniczony czas trwania sesji.<br>• Użycie bezpiecznych ciasteczek sesyjnych.<br>• Wymuszenie protokołu HTTPS dla całej komunikacji. |
| **2. Obejście reguł działania aplikacji** | Logika biznesowa rezerwacji sal, kolejek oraz limitów czasowych (np. zasada 2h dla studentów, pierwszeństwo po 15 min). | • Naruszenie zasad uczelni (np. zajęcie sali na czas dłuższy niż 2h).<br>• Niesłuszne uzyskiwanie priorytetów w kolejkach. | • Walidacja wszystkich reguł biznesowych po stronie serwera (backend), a nie tylko w interfejsie użytkownika.<br>• Dokładna weryfikacja uprawnień i ról przy każdym zapytaniu API.<br>• Zabezpieczenie przed atakami CSRF przy operacjach modyfikujących stan systemu. |
| **3. Wyciek danych** | Baza danych oraz przepływ danych wrażliwych (dane osobowe użytkowników, poświadczenia, harmonogramy). | • Naruszenie prywatności użytkowników i przepisów RODO.<br>• Pozyskanie przez osoby niepowołane informacji o obciążeniu sal (ryzyko kradzieży mienia/instrumentów).<br>• Wykorzystanie danych logowania do ataków na inne systemy uczelni. | • Szyfrowanie wrażliwych danych w bazie oraz w transmisji.<br>• Stosowanie zasady minimalizacji danych (unikanie przechowywania danych, gdy nie są już potrzebne). |
