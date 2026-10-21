import { useRouter } from 'expo-router'; // nawigacja między ekranami
import { useState } from 'react'; // hook trzyma dane i po zmianie odświeżają ekran
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // omija obszary kamery, status i pasek gestów, żeby treść na to nie wchodziła

import { AuthInput } from '@/components/auth-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const router = useRouter(); // hook do nawigacji między ekranami
  const [email, setEmail] = useState(''); // email to aktualna wartość, setEmail do zmiany, '' wartość początkowa
  const [password, setPassword] = useState(''); // analogicznie

  const onLogin = () => {
    // TODO: wysłanie danych do backendu i sprawdzenie ich poprawności
    router.replace('/home'); // przejście do ekranu home
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.form}>
        <ThemedText type="title" style={styles.title}>SzafranQueue</ThemedText>
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
        <Pressable style={styles.button} onPress={onLogin}>
          <ThemedText style={styles.buttonText}>Log in</ThemedText>
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
});