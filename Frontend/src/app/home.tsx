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

// Definiujemy strukturę danych użytkownika dla TypeScriptu
interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  roleId: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect wykona się raz, od razu po załadowaniu ekranu
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await storage.getItem('userData');
        if (userDataString) {
          setUser(JSON.parse(userDataString)); // Zamiana tekstu z powrotem na obiekt
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
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
      // Usuwamy zarówno token, jak i dane użytkownika z pamięci!
      await storage.deleteItem('userToken');
      await storage.deleteItem('userData');
      
      router.replace('/');
    }
  };

  // Helper do zamiany ID roli na czytelny tekst
  const getRoleName = (roleId: number) => {
    switch(roleId) {
      case 1: return 'Porter';
      case 2: return 'Student';
      case 3: return 'Lecturer';
      default: return 'Unknown';
    }
  };

if (isLoading) {
  return (
    <Center className="flex-1 bg-background">
      <Spinner size="large" />
    </Center>
  );
}

const rooms = [
  { id: 1, name: '101', withPiano: true },
  { id: 2, name: '102', withPiano: false },
  { id: 3, name: '201', withPiano: true },
]; // TODO: pobierać z backendu

const onReserve = (roomId: number) => {
  // TODO: wywołanie API rezerwacji
  console.log('Reserve room', roomId);
};

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
          {getRoleName(user.roleId)}
        </Heading>
      </VStack>
    ) : (
      <Text className="mb-5 text-destructive">Failed to load profile.</Text>
    )}

    <VStack className="w-full rounded-xl border border-border mb-10">
    {/* Nagłówek */}
    <HStack className="p-3 border-b border-border items-center">
        <Text className="flex-1 font-bold text-foreground">Room</Text>
        <Text className="w-20 font-bold text-foreground">Piano</Text>
        {user?.roleId === 1 && <Box className="w-28" />}
    </HStack>

    {/* Wiersze */}
    {rooms.map((room) => (
        <HStack key={room.id} className="p-3 border-b border-border items-center">
        <Text className="flex-1 text-foreground">{room.name}</Text>
        <Text className="w-20 text-muted-foreground">{room.withPiano ? 'Piano' : 'No piano'}</Text>
        {user?.roleId === 1 && (
            <Button size="sm" className="w-28 bg-primary" onPress={() => onReserve(room.id)}>
            <ButtonText>Book</ButtonText>
            </Button>
        )}
        </HStack>
    ))}
    </VStack>

    <Button className="bg-secondary" onPress={onLogout}>
      <ButtonText className="text-foreground">Log out</ButtonText>
    </Button>
  </Center>
);
}