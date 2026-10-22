import { useRouter } from 'expo-router'; // nawigacja między ekranami
import { useState } from 'react'; // hook trzyma dane i po zmianie odświeżają ekran
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // omija obszary kamery, status i pasek gestów, żeby treść na to nie wchodziła

import { storage } from '@/services/storage';

import { AuthInput } from '@/components/auth-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';


import { api } from '@/services/api'; // Upewnij się, że ścieżka do Twojej konfiguracji Axios jest poprawna

export default function LoginScreen() {
  const router = useRouter(); // hook do nawigacji między ekranami
  const [email, setEmail] = useState(''); // email to aktualna wartość, setEmail do zmiany, '' wartość początkowa
  const [password, setPassword] = useState(''); // analogicznie

  // Obsluga stanu ładowania i błędów
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Wprowadź email i hasło.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      // Wysłanie danych do backendu
      const response = await api.post('/login', {
        email,
        password,
      });

      const token = response.data.token;
      const user = response.data.user; // Złapanie obiektu użytkownika z odpowiedzi

      await storage.setItem('userToken', token);
      await storage.setItem('userData', JSON.stringify(user));

      router.replace('/home');
    } catch (error: any) {
      console.error('Błąd logowania:', error);
      // Obsługa błędów zwróconych przez backend (np. 401 Unauthorized)
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Wystąpił błąd połączenia z serwerem.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.form}>
        <ThemedText type="title" style={styles.title}>SzafranQueue</ThemedText>

        {/* Wyświetlanie błędu */}
        {errorMessage ? (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        ) : null}

        <AuthInput
          placeholder="Email" // podpowiadający tekst
          autoCapitalize="none" // nie zmieni pierwszej litery na wielką
          keyboardType="email-address"
          value={email} // aktualna wprowadzona wartość
          onChangeText={setEmail} // każda zmiana od razu widoczna
        />
        <AuthInput
          placeholder="Password"
          secureTextEntry // ukrywa wprowadzany tekst
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={onLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Log in</ThemedText>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/register')}>
          <ThemedText type="link" style={styles.center}>Register</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, width: '100%', maxWidth: 400, alignSelf: 'center' },
  title: { textAlign: 'center', marginBottom: 16 },
  button: { backgroundColor: '#333333', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#F1EBDC', fontWeight: '600' },
  center: { textAlign: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  buttonDisabled: { opacity: 0.7 },
});