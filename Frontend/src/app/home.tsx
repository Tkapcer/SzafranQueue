import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';

import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { ScrollView, Alert } from 'react-native';

import {
  AppScreen, AppLoadingScreen, AppHeading, AppText, AppButton, AppCard, AppRow,
} from '@/components/app';

import { api } from '@/services/api';

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role_id: number;
}

interface Room {
  id: number;
  number: string;
  has_piano: boolean;
  is_open: boolean;
  status: string;
  user_id?: number | null;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [reservingRoomId, setReservingRoomId] = useState<number | null>(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const userDataString = await storage.getItem('userData');
      if (userDataString) {
        setUser(JSON.parse(userDataString));
      }

      const response = await api.get<Room[]>('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setIsRoomsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      const token = await storage.getItem('userToken');

      if (token) {
        await api.post('/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.log('Error logging out:', error);
    } finally {
      await storage.deleteItem('userToken');
      await storage.deleteItem('userData');

      setIsLoggingOut(false);
      router.replace('/');
    }
  };

  const getRoleName = (roleId: number) => {
    switch(roleId) {
      case 1: return 'Manager';
      case 2: return 'Student';
      case 3: return 'Lecturer';
      default: return 'Unknown';
    }
  };

  const onReserve = async (room: Room) => {
    try {
      setReservingRoomId(room.id);
      await api.post(`/rooms/${room.id}/occupy`);

      router.push({
        pathname: '/currentRoom',
        params: { roomId: room.id, roomNumber: room.number },
      });
    } catch (error: any) {
      console.error('Reserve room error:', error);
      Alert.alert('Błąd', error.response?.data?.message || 'Nie udało się zająć sali.');
      loadData(); // Odśwież dane na wypadek, gdyby ktoś zajął ją chwilę wcześniej
    } finally {
      setReservingRoomId(null);
    }
  };

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  const isManager = user?.role_id === 1;

  const filteredRooms = rooms.filter((room) => room.is_open || isManager);
  const isAnyFree = filteredRooms.some((room) => room.status === "free");
  const isAnyOpen = filteredRooms.some((room) => room.is_open);

  return (
    <AppScreen variant="list">
      <AppHeading className="mb-8 text-center">Profile</AppHeading>

      {user ? (
        <AppCard className="items-center p-5 mb-10" space="xs">
          <AppText variant="muted">Logged in as:</AppText>
          <AppHeading variant="value">{user.name} {user.surname}</AppHeading>
          <AppText variant="muted">Role:</AppText>
          <AppHeading variant="value">{getRoleName(user.role_id)}</AppHeading>
        </AppCard>
      ) : (
        <AppText variant="error" className="mb-5">Failed to load profile.</AppText>
      )}

      {isManager && (
        <AppButton
          title="Users"
          variant="secondary"
          className="w-full mb-4"
          onPress={() => router.push('/users')}
        />
      )}

      {isManager && (
        <AppButton
          title="Pending Users"
          variant="secondary"
          className="w-full mb-4"
          onPress={() => router.push('/pendingUsers')}
        />
      )}

      {!isManager && !isAnyFree && isAnyOpen && (
        <AppButton
          title="Join the queue"
          variant="secondary"
          className="w-full mb-4"
          onPress={() => console.log('Join the queue')}
        />
      )}

      <AppCard className="flex-1 min-h-0 mb-6 overflow-hidden">
        <AppRow divider="bottom">
          <AppText variant="bold" className="flex-1">Room</AppText>
          <AppText variant="bold" className="w-20">Piano</AppText>
          {isManager && <AppText variant="bold" className="w-20">Status</AppText>}
          {isManager ? <Box className="w-20" /> : <Box className="w-28" />}
        </AppRow>

        {isRoomsLoading ? (
          <Center className="p-5">
            <Spinner size="small" />
          </Center>
        ) : filteredRooms.length === 0 ? (
          <AppText variant="muted" className="p-4 text-center">No rooms available.</AppText>
        ) : (
          <ScrollView className="flex-1">
            {filteredRooms.map((room, index) => (
              <AppRow key={room.id} divider={index > 0 ? 'top' : 'none'}>
                <AppText className="flex-1">{room.number}</AppText>
                <AppText variant="muted" className="w-20">{room.has_piano ? 'Piano' : 'No piano'}</AppText>

                {isManager && (
                  <AppText variant="muted" className="w-20">{room.is_open ? 'Open' : 'Closed'}</AppText>
                )}

                {isManager ? (
                  <AppButton
                    title="Edit"
                    variant="secondary"
                    size="sm"
                    className="w-20"
                    onPress={() => router.push({ pathname: '/editRoom', params: { action: 'edit', id: room.id } })}
                  />
                ) : (
                  room.status === "free" ? (
                    <AppButton
                      title="Book"
                      size="sm"
                      className="w-28"
                      loading={reservingRoomId === room.id}
                      onPress={() => onReserve(room)}
                    />
                  ) : (
                    <Box className="w-28" />
                  )
                )}
              </AppRow>
            ))}
          </ScrollView>
        )}
      </AppCard>

      {isManager && (
        <AppButton
          title="Add new room"
          className="w-full mb-3"
          onPress={() => router.push({ pathname: '/editRoom', params: { action: 'new' } })}
        />
      )}

      <AppButton
        title="Log out"
        variant="secondary"
        loading={isLoggingOut}
        onPress={onLogout}
      />
    </AppScreen>
  );
}