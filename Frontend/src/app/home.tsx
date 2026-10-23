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

import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';



import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
        console.error('Błąd ładowania danych użytkownika', error);
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
      console.log('Błąd wylogowywania:', error);
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
      case 1: return 'Zarządca';
      case 2: return 'Student';
      case 3: return 'Wykładowca';
      default: return 'Nieznana rola';
    }
  };

if (isLoading) {
  return (
    <Center className="flex-1 bg-background">
      <Spinner size="large" />
    </Center>
  );
}

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

    <Button className="bg-secondary" onPress={onLogout}>
      <ButtonText className="text-foreground">Log out</ButtonText>
    </Button>
  </Center>
);
}