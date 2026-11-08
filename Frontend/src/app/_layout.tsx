import "../global.css";
import React, { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus, View, Text, Pressable, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import * as LocalAuthentication from 'expo-local-authentication';
import {storage} from "@/services/storage";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    
    const [isChecking, setIsChecking] = useState(true);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [hasToken, setHasToken] = useState(false);

    const appState = useRef(AppState.currentState);

    const triggerBiometrics = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                setIsUnlocked(true); // Wpuszczamy, bo urządzenie w ogóle nie ma biometrii/PINu
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Zaloguj się do SzafranQueue',
                fallbackLabel: 'Użyj kodu PIN telefonu',
                cancelLabel: 'Anuluj',
                disableDeviceFallback: false,
            });

            if (result.success) {
                setIsUnlocked(true);
            }
        } catch (e) {
            console.warn('Błąd uwierzytelniania biometrycznego:', e);
        }
    };

    useEffect(() => {
        const checkAuthAndLock = async () => {
            const token = await storage.getItem('userToken');
            if (token) {
                setHasToken(true);
                setIsUnlocked(false); // Blokada
                await triggerBiometrics(); // Próba autoryzacji
            } else {
                setHasToken(false);
                setIsUnlocked(true);
            }
            setIsChecking(false); // Koniec sprawdzania, możemy bezpiecznie renderować UI
        };

        checkAuthAndLock();

        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            // 1. Zablokuj NATYCHMIAST, gdy aplikacja chowa się do tła
            if (nextAppState === 'background') {
                setIsUnlocked(false);
            }

            // 2. Wymagaj biometrii TYLKO gdy aplikacja wraca prosto z tła ('background').
            // Ignorujemy przejścia z 'inactive', żeby anulowanie systemowego okna biometrii nie psuło stanu.
            if (appState.current === 'background' && nextAppState === 'active') {
                storage.getItem('userToken').then((token) => {
                    if (token && !isUnlocked) {
                        triggerBiometrics();
                    }
                });
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Ekran ładowania - zapobiega mignięciu niezabezpieczonej aplikacji
    if (isChecking) {
        return <View className="flex-1 bg-background" />;
    }

    return (
        <GluestackUIProvider mode={colorScheme === 'dark' ? 'dark' : 'light'}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

                {/* Aplikacja zawsze działa pod spodem, dzięki czemu index.tsx zdąży przekierować nas na /home w tle */}
                <Stack screenOptions={{ headerShown: false }} />

                {/* Ekran blokady jako absolutna nakładka chroniąca przed podglądem */}
                {hasToken && !isUnlocked && (
                    <View className="absolute top-0 bottom-0 left-0 right-0 z-50 justify-center items-center bg-background p-6">
                        <Text className="text-2xl font-bold mb-3 text-foreground">
                            SzafranQueue
                        </Text>
                        <Text className="text-base text-muted-foreground text-center mb-8">
                            Aplikacja jest zablokowana ze względów bezpieczeństwa.
                        </Text>
                        <Pressable
                            className="bg-primary px-6 py-3.5 rounded-xl active:opacity-80"
                            onPress={triggerBiometrics}
                        >
                            <Text className="text-primary-foreground font-semibold text-base">
                                Odblokuj biometrią
                            </Text>
                        </Pressable>
                    </View>
                )}

            </ThemeProvider>
        </GluestackUIProvider>
    );
}