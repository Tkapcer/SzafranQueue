import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/auth-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    // TODO: wywołanie API backendu
    router.replace('/home');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.form}>
        <ThemedText type="title" style={styles.title}>SzafranQueue</ThemedText>
        <AuthInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AuthInput
          placeholder="Password"
          secureTextEntry
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