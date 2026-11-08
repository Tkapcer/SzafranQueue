import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateWithBiometrics(): Promise<boolean> {
    // Sprawdź, czy urządzenie ma czytnik
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;

    // Sprawdź, czy użytkownik ma zarejestrowaną biometrię w systemie
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) return false;

    // Wywołaj okno systemowe biometrii
    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Zaloguj się do SzafranQueue',
        fallbackLabel: 'Użyj kodu PIN telefonu',
        cancelLabel: 'Anuluj',
        disableDeviceFallback: false,
    });

    return result.success;
}