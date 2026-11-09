import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';

import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { ScrollView } from 'react-native';

import {
  AppScreen, AppLoadingScreen, AppHeading, AppText, AppButton, AppCard, AppRow,
} from '@/components/app';

import { api } from '@/services/api';

// Definiujemy strukturę danych użytkownika dla TypeScriptu[cite: 3]
interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role_id: number;
}

// Definiujemy strukturę sali[cite: 3]
interface Room {
  id: number;
  number: string;
  has_piano: boolean;
  is_open: boolean;
  status: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stany do obsługi pobierania sal[cite: 3]
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // useEffect wykona się raz, od razu po załadowaniu ekranu[cite: 3]
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // 1. Pobranie danych użytkownika z pamięci lokalnej[cite: 3]
        const userDataString = await storage.getItem('userData');
        if (userDataString) {
          setUser(JSON.parse(userDataString));
        }

        // 2. Pobranie listy sal z backendu (/api/rooms)[cite: 3]
        const response = await api.get<Room[]>('/rooms');
        setRooms(response.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
        setIsRoomsLoading(false);
      }
    };

    loadData();
  }, []);

  const onLogout = async () => {
    // Blokujemy kolejne kliknięcia, jeśli wylogowywanie już trwa
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

  // Helper do zamiany ID roli na czytelny tekst[cite: 3]
  const getRoleName = (roleId: number) => {
    switch(roleId) {
      case 1: return 'Manager';
      case 2: return 'Student';
      case 3: return 'Lecturer';
      default: return 'Unknown';
    }
  };

  const onReserve = (roomId: number) => {
    // TODO: wywołanie API rezerwacji[cite: 3]
    console.log('Reserve room', roomId);
  };

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  // Filtrowanie sal: zamknięte widzi tylko portier (role_id === 1)
  const isManager = user?.role_id === 1; // portier

  // Zamknięte sale widzi tylko portier
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
        <>
          <AppButton
            title="Users"
            variant="secondary"
            className="w-full mb-4"
            onPress={() => router.push('/users')}
          />
        </>
      )}

      {!isManager && !isAnyFree && isAnyOpen && (
        <>
          <AppButton
            title="Join the queue"
            variant="secondary"
            className="w-full mb-4"
            onPress={/*TODO*/ () => console.log('Join the queue')}
          />
        </>
      )}

      <AppCard className="flex-1 min-h-0 mb-6 overflow-hidden">
        {/* Nagłówek tabeli (stały) */}
        <AppRow divider="bottom">
          <AppText variant="bold" className="flex-1">Room</AppText>
          <AppText variant="bold" className="w-20">Piano</AppText>
          {isManager && <AppText variant="bold" className="w-20">Status</AppText>}
          {isManager ? <Box className="w-20" /> : <Box className="w-28" />}
        </AppRow>

        {/* Wiersze / ładowanie / brak sal */}
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
                  (room.status==="free" ? <AppButton title="Book" size="sm" className="w-28" onPress={() => onReserve(room.id)} /> : "")
                )}
              </AppRow>
            ))}
          </ScrollView>
        )}
      </AppCard>

      {isManager && (
        <>
          <AppButton
            title="Add new room"
            className="w-full mb-3"
            onPress={() => router.push({ pathname: '/editRoom', params: { action: 'new' } })}
          />
        </>
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