import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Spinner } from '@/components/ui/spinner';

import {
  AppScreen,
  AppHeading,
  AppText,
  AppInput,
  AppSelect,
  AppButton,
  AppCard,
  AppSwitchRow,
  AppLoadingScreen,
} from '@/components/app';

import { api } from '@/services/api';
import { storage } from '@/services/storage';

interface Role {
  id: number;
  name: string;
  alias: string;
}

export default function EditUserScreen() {
  const router = useRouter();

  const { action, id } = useLocalSearchParams<{
    action: string;
    id?: string;
  }>();

  const isEditMode = action === 'edit';

  // 1. Autoryzacja
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 2. Pola formularza
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Role
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Status konta
  const [isApproved, setIsApproved] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [errorMessage, setErrorMessage] = useState('');

  // 3. Sprawdzenie uprawnień managera (role_id === 1)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userDataStr = await storage.getItem('userData');
        if (!userDataStr) {
          router.replace('/');
          return;
        }

        const user = JSON.parse(userDataStr);
        if (user.role_id !== 1) {
          router.replace('/home');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.replace('/home');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // 4. Pobieranie ról (tylko jeśli zautoryzowany)
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        const data = response.data?.data ?? response.data;
        setRoles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setErrorMessage('Error loading roles.');
      }
    };

    fetchRoles();
  }, [isAuthorized]);

  // 5. Pobieranie danych edytowanego użytkownika
  useEffect(() => {
    if (!isAuthorized || !isEditMode || !id) return;

    const fetchUser = async () => {
      try {
        setIsFetching(true);

        const response = await api.get(`/users/${id}`);
        const user = response.data?.data ?? response.data;

        setName(user.name ?? '');
        setSurname(user.surname ?? '');
        setEmail(user.email ?? '');

        setSelectedRoleId(
          user.role_id !== null && user.role_id !== undefined
            ? String(user.role_id)
            : ''
        );

        setIsApproved(Boolean(user.is_approved));
        setIsActive(Boolean(user.is_active));
        setPassword('');
      } catch (error) {
        console.error('Error fetching user:', error);
        setErrorMessage('Error loading user data.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUser();
  }, [isAuthorized, isEditMode, id]);

  const handleSave = async () => {
    if (!name.trim() || !surname.trim() || !email.trim()) {
      setErrorMessage('Name, surname and email are required.');
      return;
    }

    if (!selectedRoleId) {
      setErrorMessage('Please select a role.');
      return;
    }

    if (!isEditMode && !password.trim()) {
      setErrorMessage('Password is required.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const payload: {
        name: string;
        surname: string;
        email: string;
        role_id: number;
        is_approved: boolean;
        is_active: boolean;
        password?: string;
      } = {
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        role_id: Number(selectedRoleId),
        is_approved: isApproved,
        is_active: isActive,
      };

      if (password.trim()) {
        payload.password = password;
      }

      if (isEditMode && id) {
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post('/users', payload);
      }

      router.back();
    } catch (error: any) {
      console.error('Error saving user:', error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors).flat()[0];
        setErrorMessage(String(firstError));
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error saving user.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setErrorMessage('');

      await api.delete(`/users/${id}`);
      router.back();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setErrorMessage(
        error.response?.data?.message ?? 'Failed to delete user.'
      );
      setIsLoading(false);
    }
  };

  // 6. Wczesne wyjście dopiero po zadeklarowaniu wszystkich hooków
  if (isCheckingAuth || !isAuthorized || isFetching) {
    return <AppLoadingScreen />;
  }

  return (
    <AppScreen>
      <AppHeading className="mb-6">
        {isEditMode ? 'Edit user' : 'Add new user'}
      </AppHeading>

      {errorMessage ? (
        <AppText variant="error" className="mb-4">
          {errorMessage}
        </AppText>
      ) : null}

      <AppCard className="p-5 mb-6" space="md">
        <VStack space="xs">
          <AppText variant="muted">Name</AppText>
          <AppInput
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
          />
        </VStack>

        <VStack space="xs">
          <AppText variant="muted">Surname</AppText>
          <AppInput
            placeholder="Enter surname"
            value={surname}
            onChangeText={setSurname}
          />
        </VStack>

        <VStack space="xs">
          <AppText variant="muted">Role</AppText>
          <AppSelect
            value={selectedRoleId}
            onChange={setSelectedRoleId}
            placeholder="Select role"
            options={roles.map((role) => ({
              label: role.alias || role.name,
              value: role.id.toString(),
            }))}
          />
        </VStack>

        <VStack space="xs">
          <AppText variant="muted">Email</AppText>
          <AppInput
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </VStack>

        <VStack space="xs">
          <AppText variant="muted">
            Password {isEditMode ? '(optional)' : ''}
          </AppText>
          <AppInput
            placeholder={
              isEditMode
                ? 'Leave empty to keep current password'
                : 'Enter password'
            }
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </VStack>

        <AppSwitchRow
          label="Approved?"
          value={isApproved}
          onChange={setIsApproved}
        />

        <AppSwitchRow
          label="Active?"
          value={isActive}
          onChange={setIsActive}
        />
      </AppCard>

      <AppButton
        title="Save"
        className="w-full mb-3"
        loading={isLoading}
        onPress={handleSave}
      />

      {isEditMode && Number(selectedRoleId) !== 1 && (
        <AppButton
          title="Delete user"
          variant="danger"
          className="w-full mb-3"
          disabled={isLoading}
          onPress={handleDelete}
        />
      )}

      <AppButton
        title="Back"
        variant="secondary"
        className="w-full"
        disabled={isLoading}
        onPress={() => router.back()}
      />
    </AppScreen>
  );
}