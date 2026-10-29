import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';

import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { HStack } from '@/components/ui/hstack';

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
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stany do obsługi pobierania sal[cite: 3]
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);

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
    try {
      const token = await storage.getItem('userToken');
      if (token) {
        await api.post('/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.log('Error logging out:', error);
    } finally {
      // Usuwamy zarówno token, jak i dane użytkownika z pamięci![cite: 3]
      await storage.deleteItem('userToken');
      await storage.deleteItem('userData');
      
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
    return (
      <Center className="flex-1 bg-background">
        <Spinner size="large" />
      </Center>
    );
  }

  // Filtrowanie sal: zamknięte widzi tylko portier (role_id === 1)
  const filteredRooms = rooms.filter((room) => {
    if (room.is_open) return true;
    return user?.role_id === 1;
  });

  return (
    <Center className="flex-1 bg-background p-5">
      <Heading size="2xl" className="mb-8 text-foreground">
        Profile
      </Heading>

      {user ? (
        <VStack className="w-full items-center rounded-xl border border-border p-5 mb-10" space="xs">
          <Text className="text-muted-foreground">Logged in as:</Text>
          <Heading size="lg" className="text-foreground mb-3">
            {user.name} {user.surname}
          </Heading>
          <Text className="text-muted-foreground">Role:</Text>
          <Heading size="lg" className="text-foreground mb-3">
            {getRoleName(user.role_id)}
          </Heading>
        </VStack>
      ) : (
        <Text className="mb-5 text-destructive">Failed to load profile.</Text>
      )}

      {/* Przycisk dodawania nowej sali (widoczny tylko dla portiera/managera role_id === 1) */}
      {user?.role_id === 1 && (
        <Button 
          className="w-full mb-4 bg-primary" 
          onPress={() => router.push({ pathname: '/editRoom', params: { action: 'new' } })}
        >
          <ButtonText>Add new room</ButtonText>
        </Button>
      )}

      <VStack className="w-full rounded-xl border border-border mb-10">
        {/* Nagłówek tabeli */}
        <HStack className="p-3 border-b border-border items-center">
          <Text className="flex-1 font-bold text-foreground">Room</Text>
          <Text className="w-20 font-bold text-foreground">Piano</Text>
          {user?.role_id === 1 && <Text className="w-20 font-bold text-foreground">Status</Text>}
          {user?.role_id === 1 && <Box className="w-20" />}
        </HStack>

        {/* Wiersze / Stan ładowania / Brak sal */}
        {isRoomsLoading ? (
          <Center className="p-5">
            <Spinner size="small" />
          </Center>
        ) : filteredRooms.length === 0 ? (
          <Text className="p-4 text-center text-muted-foreground">No rooms available.</Text>
        ) : (
          filteredRooms.map((room) => (
            <HStack key={room.id} className="p-3 border-b border-border items-center">
              <Text className="flex-1 text-foreground">{room.number}</Text>
              <Text className="w-20 text-muted-foreground">{room.has_piano ? 'Piano' : 'No piano'}</Text>
              
              {/* Kolumna ze statusem otwarcia widoczna tylko dla portiera */}
              {user?.role_id === 1 && (
                <Text className="w-20 text-muted-foreground">
                  {room.is_open ? 'Open' : 'Closed'}
                </Text>
              )}

              {/* Przyciski akcji dla portiera (Edycja) */}
              {user?.role_id === 1 ? (
                <Button 
                  size="sm" 
                  className="w-20 bg-secondary" 
                  onPress={() => router.push({ pathname: '/editRoom', params: { action: 'edit', id: room.id } })}
                >
                  <ButtonText>Edit</ButtonText>
                </Button>
              ) : (
                /* Przycisk rezerwacji dla zwykłego użytkownika */
                <Button size="sm" className="w-28 bg-primary" onPress={() => onReserve(room.id)}>
                  <ButtonText>Book</ButtonText>
                </Button>
              )}
            </HStack>
          ))
        )}
      </VStack>

      <Button className="bg-secondary" onPress={onLogout}>
        <ButtonText className="text-foreground">Log out</ButtonText>
      </Button>
    </Center>
  );
}