import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { storage } from '@/services/storage';
import { api } from '@/services/api';
import {
  AppScreen, AppHeading, AppText, AppCard, AppButton, AppLoadingScreen,
} from '@/components/app';

export default function CurrentRoomScreen() {
  const router = useRouter();
  const { roomId, roomNumber } = useLocalSearchParams<{ roomId: string; roomNumber: string }>();

  const [isValidating, setIsValidating] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const isLeavingRef = useRef(false);

  // Funkcja faktycznie zwalniająca salę
  const releaseRoom = async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    setIsLeaving(true);

    try {
      await api.post(`/rooms/${roomId}/leave`);
    } catch (error) {
      console.error('Error while leaving the room:', error);
    } finally {
      setIsLeaving(false);
      router.replace('/home');
    }
  };

  // 1. Weryfikacja sesji w sali
  useEffect(() => {
    const verifyRoomOccupancy = async () => {
      try {
        const userDataStr = await storage.getItem('userData');
        if (!userDataStr) {
          router.replace('/');
          return;
        }
        const currentUser = JSON.parse(userDataStr);

        const response = await api.get(`/rooms/${roomId}`);
        const room = response.data;

        if (room.status !== 'occupied' || room.user_id !== currentUser.id) {
          Alert.alert('No access', 'You are not assigned to this room.');
          router.replace('/home');
          return;
        }

        setIsValidating(false);
      } catch (error) {
        console.error('Error verifying room:', error);
        router.replace('/home');
      }
    };

    if (roomId) {
      verifyRoomOccupancy();
    } else {
      router.replace('/home');
    }
  }, [roomId]);

  // 2. Cykliczny sygnał życia (Heartbeat co 30 sekund)
  useEffect(() => {
    if (isValidating || !roomId) return;

    // Wyślij pierwszy od razu
    api.post(`/rooms/${roomId}/heartbeat`).catch(() => {});

    const interval = setInterval(() => {
      api.post(`/rooms/${roomId}/heartbeat`).catch((err) => {
        console.warn('Error while sending heartbeat:', err);
      });
    }, 30000); // 30 sekund

    return () => clearInterval(interval);
  }, [isValidating, roomId]);

  // 3. Blokada cofania (Hardware Back w Androidzie i przycisk w przeglądarce)
  useEffect(() => {
    if (isValidating) return;

    // Android: kliknięcie wstecz pyta o zwolnienie sali
    const onBackPress = () => {
      Alert.alert(
        'Leaving Room',
        'Do you want to release the room and return to the list?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Release and Exit', style: 'destructive', onPress: releaseRoom },
        ]
      );
      return true; // blokuje domyślne cofnięcie
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    // Przeglądarka (Web): blokada przycisku wstecz w historii
    if (Platform.OS === 'web') {
      window.history.pushState(null, '', window.location.href);
      const onPopState = () => {
        // Pytanie o zwolnienie sali przed wyjściem
        const leave = window.confirm('Do you want to release the room and exit?');
        if (leave) {
          releaseRoom();
        } else {
          window.history.pushState(null, '', window.location.href);
        }
      };

      window.addEventListener('popstate', onPopState);

      // Web: Zdarzenie zamknięcia karty / odświeżenia strony
      const handleBeforeUnload = () => {
        // navigator.sendBeacon wysyła zapytanie POST w tle nawet w trakcie zamykania okna
        const token = localStorage.getItem('userToken');
        const baseUrl = process.env.EXPO_PUBLIC_DEV_IP
          ? `http://${process.env.EXPO_PUBLIC_DEV_IP}:8000/api`
          : 'http://127.0.0.1:8000/api';

        // Wysyłamy żądanie bez czekania na odpowiedź
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            `${baseUrl}/rooms/${roomId}/leave?token=${token}`
          );
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        backHandlerSubscription.remove();
        window.removeEventListener('popstate', onPopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }

    return () => backHandlerSubscription.remove();
  }, [isValidating, roomId]);

  if (isValidating) {
    return <AppLoadingScreen />;
  }

  return (
    <AppScreen>
      <AppHeading className="mb-6 text-center">Active Session</AppHeading>

      <AppCard className="items-center p-6 mb-8" space="sm">
        <AppText variant="muted">Currently you are in the room:</AppText>
        <AppHeading className="text-primary my-2">
          {roomNumber}
        </AppHeading>
        <AppText variant="muted">Exercises in progress</AppText>
      </AppCard>

      <AppButton
        title="Release and Exit"
        loading={isLeaving}
        onPress={releaseRoom}
        className="w-full"
      />
    </AppScreen>
  );
}