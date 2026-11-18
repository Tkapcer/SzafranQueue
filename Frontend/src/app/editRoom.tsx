import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';
import { AppLoadingScreen } from '@/components/app';

import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';

import { Spinner } from '@/components/ui/spinner';

import {
  Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal,
  SelectBackdrop, SelectContent, SelectDragIndicatorWrapper,
  SelectDragIndicator, SelectItem,
} from '@/components/ui/select';

import {
  AppScreen, AppHeading, AppText, AppInput, AppButton, AppCard, AppSwitchRow,
} from '@/components/app';

import { api } from '@/services/api';

interface UserOption {
  id: number;
  name: string;
  surname: string;
  role_id: number;
  is_active: boolean;
}

export default function EditRoomScreen() {
  const router = useRouter();
  const { action, id } = useLocalSearchParams<{ action: string; id?: string }>();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isEditMode = action === 'edit';

  const [number, setNumber] = useState('');
  const [hasPiano, setHasPiano] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [errorMessage, setErrorMessage] = useState('');

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [roomStatus, setRoomStatus] = useState('free');
  const [assignUserId, setAssignUserId] = useState('');

  const [users, setUsers] = useState<UserOption[]>([]);

  // 1. Sprawdzenie roli użytkownika
  useEffect(() => {
    const checkRole = async () => {
      try {
        const userDataStr = await storage.getItem('userData');
        if (!userDataStr) {
          router.replace('/');
          return;
        }

        const user = JSON.parse(userDataStr);
        if (user.role_id !== 1) {
          router.replace('/home');
          return;
        }

        setIsAuthorized(true);
      } catch (e) {
        router.replace('/home');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkRole();
  }, []);

  // Pobierz dane sali i listę użytkowników, jeśli jesteśmy w trybie edycji
  useEffect(() => {
    if (isEditMode && id) {
      const fetchRoom = async () => {
        try {
          setIsFetching(true);
          const response = await api.get(`/rooms/${id}`);
          setNumber(response.data.number);
          setHasPiano(response.data.has_piano);
          setIsOpen(response.data.is_open);
          setCurrentUserId(response.data.user_id ?? null);
          setRoomStatus(response.data.status ?? 'free');
          setAssignUserId(
            response.data.pending_user_id ? String(response.data.pending_user_id) : ''
          );

          const usersRes = await api.get('/users');
          const data = usersRes.data?.data ?? usersRes.data;
          setUsers(
            (Array.isArray(data) ? data : []).filter(
              (u: UserOption) => u.is_active && u.role_id !== 1
            )
          );
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

  // Dopóki trwa weryfikacja lub brak autoryzacji, nie renderujemy formularza
  if (checkingAuth || !isAuthorized) {
    return <AppLoadingScreen />;
  }

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

  const handleKick = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setErrorMessage('');
      await api.post(`/rooms/${id}/kick`);
      setCurrentUserId(null);
      setRoomStatus('free');
      setAssignUserId('');
    } catch (error) {
      console.error('Error kicking user:', error);
      setErrorMessage('Failed to remove user from room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!id || !assignUserId) {
      setErrorMessage('Select a user.');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage('');
      await api.post(`/rooms/${id}/assign`, { user_id: Number(assignUserId) });
      setCurrentUserId(Number(assignUserId));
      setRoomStatus('occupied');
      setAssignUserId('');
    } catch (error: any) {
      console.error('Error assigning user:', error);
      setErrorMessage(error.response?.data?.message ?? 'Failed to assign user.');
    } finally {
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

  const currentUser = users.find((u) => u.id === currentUserId);
  const currentUserLabel = currentUser
    ? ` (${currentUser.surname} ${currentUser.name})`
    : currentUserId !== null
      ? ` (user #${currentUserId})`
      : '';

  return (
    <AppScreen>
      <AppHeading className="mb-6 text-center">{isEditMode ? 'Edit room' : 'Add new room'}</AppHeading>

      {errorMessage ? <AppText variant="error" className="mb-4">{errorMessage}</AppText> : null}

      <AppCard className="p-5 mb-6" space="md">
        <VStack space="xs">
          <AppText variant="muted">Room number</AppText>
          <AppInput placeholder="e.g. 101" value={number} onChangeText={setNumber} />
        </VStack>

        <AppSwitchRow label="Has piano?" value={hasPiano} onChange={setHasPiano} />
        <AppSwitchRow label="Is open?" value={isOpen} onChange={setIsOpen} />
      </AppCard>

      {isEditMode && (
        <AppCard className="p-5 mb-6" space="md">
          <AppText variant="muted">
            Status: {roomStatus}{currentUserLabel}
          </AppText>

          {currentUserId !== null && (
            <AppButton
              title="Remove current user"
              variant="danger"
              className="w-full"
              disabled={isLoading}
              onPress={handleKick}
            />
          )}

          <VStack space="xs">
            <AppText variant="muted">Assign user</AppText>
            <Select selectedValue={assignUserId} onValueChange={setAssignUserId}>
              <SelectTrigger>
                <SelectInput placeholder="Select user" />
                <SelectIcon className="mr-3" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {users.map((u) => (
                    <SelectItem
                      key={u.id}
                      label={`${u.surname} ${u.name}`}
                      value={String(u.id)}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <AppButton
            title="Assign user"
            className="w-full"
            disabled={isLoading}
            onPress={handleAssign}
          />
        </AppCard>
      )}

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