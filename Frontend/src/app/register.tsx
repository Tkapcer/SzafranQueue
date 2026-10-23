import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = () => {
    // TODO: przekazanie danych do backendu
    router.replace('/home');
  };

  return (
    <Box className="flex-1 bg-background">
      <SafeAreaView style={styles.form}>
        <Heading size="4xl" className="text-center mb-4 text-foreground">Registration</Heading>
        <Input className="h-12 rounded-lg">
          <InputField placeholder="Name" value={name} onChangeText={setName} />
        </Input>
        <Input className="h-12 rounded-lg">
          <InputField placeholder="Surname" value={surname} onChangeText={setSurname} />
        </Input>
        <Input className="h-12 rounded-lg">
          <InputField
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </Input>
        <Input className="h-12 rounded-lg">
          <InputField
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </Input>
        <Button className="bg-secondary" onPress={onRegister}>
          <ButtonText className="text-foreground">Register</ButtonText>
        </Button>
        <Pressable onPress={() => router.back()}>
          <Text size="sm" className="text-center text-foreground">Log in</Text>
        </Pressable>
      </SafeAreaView>
    </Box>
  );
}

// SafeAreaView zostaje na StyleSheet, bo className może na nim nie działać
const styles = StyleSheet.create({
  form: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, width: '100%', maxWidth: 400, alignSelf: 'center' },
});