import { useRouter } from 'expo-router'; // nawigacja między ekranami
import { useState } from 'react'; // hook trzyma dane i po zmianie odświeżają ekran
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // omija obszary kamery, status i pasek gestów, żeby treść na to nie wchodziła

import { storage } from '@/services/storage';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
    <Box className="flex-1 bg-background">
      <SafeAreaView style={styles.form}>
        <Heading size="4xl" className="text-center mb-4 text-foreground">SzafranQueue</Heading>

        {/* Wyświetlanie błędu */}
        {errorMessage ? (
          <Text className="text-center mb-2.5 text-destructive">{errorMessage}</Text>
        ) : null}

        <Input className="h-12 rounded-lg border border-input">
          <InputField
            className="text-foreground"
            placeholder="Email" // podpowiadający tekst
            autoCapitalize="none" // nie zmieni pierwszej litery na wielką
            keyboardType="email-address"
            value={email} // aktualna wprowadzona wartość
            onChangeText={setEmail} // każda zmiana od razu widoczna
          />
        </Input>
        <Input className="h-12 rounded-lg border border-input">
          <InputField
            className="text-foreground bg-transparent"
            placeholder="Password"
            secureTextEntry // ukrywa wprowadzany tekst
            value={password}
            onChangeText={setPassword}
          />
        </Input>
        <Button onPress={onLogin} disabled={isLoading} className={`bg-secondary ${isLoading ? 'opacity-70' : ''}`}>
          {isLoading ? <Spinner /> : <ButtonText className="text-foreground">Log in</ButtonText>}
        </Button>
        <Pressable onPress={() => router.push('/register')}>
          <Text size="sm" className="text-center text-foreground">Register</Text>
        </Pressable>
      </SafeAreaView>
    </Box>
  );
}

// SafeAreaView zostawiony na StyleSheet, bo className może na nim nie działać
const styles = StyleSheet.create({
  form: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, width: '100%', maxWidth: 400, alignSelf: 'center' },
});