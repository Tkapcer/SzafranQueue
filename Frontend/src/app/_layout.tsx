import "../global.css";
import React, { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus, Platform, View, Text, Pressable, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from "@/services/storage";

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [isChecking, setIsChecking] = useState(!isWeb);
    const [isUnlocked, setIsUnlocked] = useState(isWeb);
    const [hasToken, setHasToken] = useState(false);

    const appState = useRef(AppState.currentState);
    const isUnlockedRef = useRef(isWeb);

    const updateUnlocked = (value: boolean) => {
        isUnlockedRef.current = value;
        setIsUnlocked(value);
    };

    const triggerBiometrics = async () => {
        if (isWeb) {
            updateUnlocked(true);
            return;
        }

        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                updateUnlocked(true);
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Zaloguj się do SzafranQueue',
                fallbackLabel: 'Użyj kodu PIN telefonu',
                cancelLabel: 'Anuluj',
                disableDeviceFallback: false,
            });

            if (result.success) {
                updateUnlocked(true);
            }
        } catch (e) {
            console.warn('Błąd uwierzytelniania biometrycznego:', e);
        }
    };

    useEffect(() => {
        if (isWeb) {
            return;
        }

        const checkAuthAndLock = async () => {
            const token = await storage.getItem('userToken');
            if (token) {
                setHasToken(true);
                updateUnlocked(false);
                await triggerBiometrics();
            } else {
                setHasToken(false);
                updateUnlocked(true);
            }
            setIsChecking(false);
        };

        checkAuthAndLock();

        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            const prevAppState = appState.current;
            appState.current = nextAppState;

            if (nextAppState === 'background') {
                updateUnlocked(false);
                storage.getItem('userToken').then((token) => {
                    setHasToken(Boolean(token));
                    if (!token) {
                        updateUnlocked(true);
                    }
                });
                return;
            }

            if (prevAppState === 'background' && nextAppState === 'active') {
                storage.getItem('userToken').then((token) => {
                    setHasToken(Boolean(token));
                    if (token && !isUnlockedRef.current) {
                        triggerBiometrics();
                    } else if (!token) {
                        updateUnlocked(true);
                    }
                });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    if (isChecking) {
        return <View className="flex-1 bg-background" />;
    }

    return (
        <GluestackUIProvider mode={colorScheme === 'dark' ? 'dark' : 'light'}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }} />

                {!isWeb && hasToken && !isUnlocked && (
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