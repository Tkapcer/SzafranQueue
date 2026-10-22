import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';
import { storage } from '@/services/storage';

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
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Twój Profil</ThemedText>
      
      {/* Wyświetlanie informacji o użytkowniku */}
      {user ? (
        <View style={styles.userInfo}>
          <ThemedText style={styles.text}>Zalogowano jako:</ThemedText>
          <ThemedText type="subtitle" style={styles.highlight}>
            {user.name} {user.surname}
          </ThemedText>
          <ThemedText style={styles.text}>
            Rola: <ThemedText >{getRoleName(user.roleId)}</ThemedText>
          </ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.error}>Nie udało się załadować profilu.</ThemedText>
      )}

      <Pressable style={styles.button} onPress={onLogout}> 
        <ThemedText style={styles.buttonText}>Wyloguj się</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  userInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.05)', // delikatne tło, dostosuj do swojego motywu
    borderRadius: 10,
    marginBottom: 40,
    width: '100%',
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  highlight: {
    marginTop: 4,
    marginBottom: 16,
    color: '#0a7ea4', // Kolor akcentu, np. niebieski
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#ff4444', // Czerwony przycisk do wylogowywania
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});