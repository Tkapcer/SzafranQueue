import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

import { api } from '@/services/api';
import {
  AppScreen, AppHeading, AppText, AppInput, AppSelect, AppButton, AppLink,
} from '@/components/app';


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
        .catch((err) => console.error('Error fetching roles:', err));
  }, []);

  const onRegister = async () => {
    if (!name || !surname || !email || !password || !selectedRoleId) {
      setErrorMessage('All fields are required.');
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
        setErrorMessage('Error during registration. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppScreen variant="form">
      <AppHeading variant="title">Registration</AppHeading>

      {errorMessage ? <AppText variant="error" className="mb-2.5">{errorMessage}</AppText> : null}

      <AppInput placeholder="Name" value={name} onChangeText={setName} />
      <AppInput placeholder="Surname" value={surname} onChangeText={setSurname} />

      <AppSelect
        value={selectedRoleId}
        onChange={setSelectedRoleId}
        placeholder="Select role"
        options={roles.map((r) => ({ label: r.name, value: r.id.toString() }))}
      />

      {/* TODO: Dodać pole do przesyłania zdjęcia legitymacji */}

      <AppInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AppInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <AppButton title="Register" variant="secondary" loading={isLoading} onPress={onRegister} />
      <AppLink title="Log in" onPress={() => router.replace('/')} />
    </AppScreen>
  );
}