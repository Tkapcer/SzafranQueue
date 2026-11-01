import { useRouter, useLocalSearchParams } from 'expo-router'; // nawigacja między ekranami
import { useState } from 'react'; // hook trzyma dane i po zmianie odświeżają ekran

import { AppScreen, AppHeading, AppText, AppInput, AppButton, AppLink } from '@/components/app';

import { storage } from '@/services/storage';
import { api } from '@/services/api'; // Upewnij się, że ścieżka do Twojej konfiguracji Axios jest poprawna

export default function LoginScreen() {
  const router = useRouter(); // hook do nawigacji między ekranami
  const [email, setEmail] = useState(''); // email to aktualna wartość, setEmail do zmiany, '' wartość początkowa
  const [password, setPassword] = useState(''); // analogicznie
  const { registered } = useLocalSearchParams<{ registered?: string }>()

  // Obsluga stanu ładowania i błędów
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Enter email and password.');
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
      console.error('Login error:', error);
      // Obsługa błędów zwróconych przez backend (np. 401 Unauthorized)
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred while connecting to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppScreen variant="form">
      <AppHeading variant="title">SzafranQueue</AppHeading>

      {errorMessage ? <AppText variant="error" className="mb-2.5">{errorMessage}</AppText> : null}

      {registered ? (
        <AppText variant="success" className="mb-2.5">
          Konto zostało utworzone. Poczekaj na zatwierdzenie przez administratora przed zalogowaniem.
        </AppText>
      ) : null}

      <AppInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AppInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <AppButton title="Log in" variant="secondary" loading={isLoading} onPress={onLogin} />
      <AppLink title="Register" onPress={() => router.push('/register')} />
    </AppScreen>
  );
}