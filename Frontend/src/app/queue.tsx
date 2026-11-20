import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';

import {
  AppScreen,
  AppHeading,
  AppText,
  AppCard,
  AppButton,
  AppLoadingScreen,
} from '@/components/app';

import { api } from '@/services/api';

interface OfferedRoom {
  id: number;
  number: string;
  has_piano: boolean;
  status: string;
}

interface QueueEntry {
  id: number;
  user_id: number;
  requires_piano: boolean;
  priority_level: number;
  status: 'waiting' | 'offered';
  offered_room_id: number | null;
}

export default function QueueScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [offeredRoom, setOfferedRoom] = useState<OfferedRoom | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const checkQueueStatus = useCallback(async () => {
    try {
      setErrorMessage('');
      const response = await api.get('/queue/status');
      const data = response.data;

      if (!data.in_queue) {
        router.replace('/home');
        return;
      }

      setEntry(data.entry);
      setOfferedRoom(data.offered_room);
    } catch (error) {
      console.error('Error checking queue status:', error);
      setErrorMessage('Failed to check queue status.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkQueueStatus();
  }, [checkQueueStatus]);

  const handleAccept = async () => {
    if (!offeredRoom || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.post('/queue/accept');

      router.replace({
        pathname: '/currentRoom',
        params: {
          roomId: String(offeredRoom.id),
          roomNumber: offeredRoom.number,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not accept room.');
      await checkQueueStatus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.post('/queue/reject');
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not reject room.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <AppScreen>
      <AppHeading className="mb-6 text-center">Queue</AppHeading>

      {errorMessage ? (
        <AppText variant="error" className="mb-4 text-center">
          {errorMessage}
        </AppText>
      ) : null}

      {offeredRoom ? (
        <AppCard className="items-center p-6 mb-6" space="md">
          <AppText variant="muted">Room offer available:</AppText>
          <AppHeading className="text-center">Room {offeredRoom.number}</AppHeading>
          <AppText variant="muted">
            {offeredRoom.has_piano ? 'Has piano' : 'No piano'}
          </AppText>

          <AppButton
            title="Accept"
            className="w-full mt-2"
            loading={isSubmitting}
            onPress={handleAccept}
          />
          <AppButton
            title="Reject"
            variant="secondary"
            className="w-full"
            disabled={isSubmitting}
            onPress={handleReject}
          />
        </AppCard>
      ) : (
        <AppCard className="items-center p-6 mb-6" space="sm">
          <AppText variant="bold">Waiting in queue...</AppText>
          <AppText variant="muted" className="text-center">
            {entry?.requires_piano
              ? 'Waiting for a free room with a piano.'
              : 'Waiting for any free room.'}
          </AppText>
        </AppCard>
      )}

      <AppButton
        title="Refresh"
        variant="secondary"
        className="w-full"
        disabled={isSubmitting}
        onPress={checkQueueStatus}
      />
    </AppScreen>
  );
}