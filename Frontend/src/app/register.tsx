import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@/components/ui/select';
import { ChevronDownIcon } from '@/components/ui/icon';

interface Role {
  id: number;
  name: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get('/roles')
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setRoles(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error('Błąd pobierania ról:', err));
  }, []);

  const onRegister = async () => {
    if (!name || !surname || !email || !password || !selectedRoleId) {
      setErrorMessage('Wszystkie pola oraz rola są wymagane.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      await api.post('/register', {
        name,
        surname,
        email,
        password,
        role_id: Number(selectedRoleId),
      });

      router.replace({
        pathname: '/',
        params: { registered: 'true' },
      });

    } catch (error: any) {
      if (error.response?.data?.errors) {
        const firstErrorKey = Object.keys(error.response.data.errors)[0];
        setErrorMessage(error.response.data.errors[firstErrorKey][0]);
      } else if (error.response?.data?.message) {
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
        <Heading size="4xl" className="text-center mb-4 text-foreground">Registration</Heading>
        {errorMessage ? (
            <Text className="text-center mb-2.5 text-destructive">{errorMessage}</Text>
        ) : null}
        <Input className="h-12 rounded-lg">
          <InputField placeholder="Name" value={name} onChangeText={setName} />
        </Input>
        <Input className="h-12 rounded-lg">
          <InputField placeholder="Surname" value={surname} onChangeText={setSurname} />
        </Input>

        <Select
            selectedValue={selectedRoleId}
            onValueChange={(val) => setSelectedRoleId(val)}
        >
          <SelectTrigger variant="outline" size="md" className="h-12 rounded-lg justify-between border border-input">
            <SelectInput placeholder="Select role" className="text-foreground" />
            <SelectIcon className="mr-3" as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {roles.map((role) => (
                  <SelectItem
                      key={role.id}
                      label={role.name}
                      value={role.id.toString()}
                  />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>

        {/*TODO: Dodać pole do przesyłania zdjęcia legitymacji*/}

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
        <Button
            className={`bg-secondary ${isLoading ? 'opacity-70' : ''}`}
            onPress={onRegister}
            disabled={isLoading}
        >
          {isLoading ? <Spinner /> : <ButtonText className="text-foreground">Register</ButtonText>}
        </Button>
        <Pressable onPress={() => router.replace('/')}>
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