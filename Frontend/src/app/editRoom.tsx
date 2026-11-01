import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Switch, Alert } from 'react-native';

import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { HStack } from '@/components/ui/hstack';

import {
  AppScreen, AppLoadingScreen, AppHeading, AppText, AppInput, AppButton, AppCard, AppSwitchRow,
} from '@/components/app';

import { api } from '@/services/api';

export default function EditRoomScreen() {
  const router = useRouter();
  const { action, id } = useLocalSearchParams<{ action: string; id?: string }>();

  const isEditMode = action === 'edit';

  const [number, setNumber] = useState('');
  const [hasPiano, setHasPiano] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [errorMessage, setErrorMessage] = useState('');

  // Pobierz dane sali, jeśli jesteśmy w trybie edycji
  useEffect(() => {
    if (isEditMode && id) {
      const fetchRoom = async () => {
        try {
          setIsFetching(true);
          const response = await api.get(`/rooms/${id}`);
          setNumber(response.data.number);
          setHasPiano(response.data.has_piano);
          setIsOpen(response.data.is_open);
        } catch (error) {
          console.error('Error fetching room:', error);
          setErrorMessage('Error loading room data.');
        } finally {
          setIsFetching(false);
        }
      };

      fetchRoom();
    }
  }, [isEditMode, id]);

  const handleSave = async () => {
    if (!number.trim()) {
      setErrorMessage('Room number is required.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const payload = {
        number,
        has_piano: hasPiano,
        is_open: isOpen,
      };

      if (isEditMode && id) {
        await api.put(`/rooms/${id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }

      router.replace('/home');
    } catch (error: any) {
      console.error('Error saving room:', error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error saving room.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      await api.delete(`/rooms/${id}`);
      router.replace('/home');
    } catch (error) {
      console.error('Error deleting room:', error);
      setErrorMessage('Failed to delete room.');
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Center className="flex-1 bg-background">
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <AppScreen>
      <AppHeading className="mb-6">{isEditMode ? 'Edit room' : 'Add new room'}</AppHeading>

      {errorMessage ? <AppText variant="error" className="mb-4">{errorMessage}</AppText> : null}

      <AppCard className="p-5 mb-6" space="md">
        <VStack space="xs">
          <AppText variant="muted">Room number</AppText>
          <AppInput placeholder="e.g. 101" value={number} onChangeText={setNumber} />
        </VStack>

        <AppSwitchRow label="Has piano?" value={hasPiano} onChange={setHasPiano} />
        <AppSwitchRow label="Is open?" value={isOpen} onChange={setIsOpen} />
      </AppCard>

      <AppButton title="Save" className="w-full mb-3" loading={isLoading} onPress={handleSave} />

      {isEditMode && (
        <AppButton
          title="Delete room"
          variant="danger"
          className="w-full mb-3"
          disabled={isLoading}
          onPress={handleDelete}
        />
      )}

      <AppButton
        title="Back"
        variant="secondary"
        className="w-full"
        disabled={isLoading}
        onPress={() => router.back()}
      />
    </AppScreen>
  );
}