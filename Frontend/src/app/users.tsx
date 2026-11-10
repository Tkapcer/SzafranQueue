import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';

import { useFocusEffect } from 'expo-router';

import {
  AppScreen,
  AppHeading,
  AppText,
  AppButton,
  AppCard,
  AppRow,
  AppLoadingScreen,
} from '@/components/app';

import { api } from '@/services/api';
import { storage } from '@/services/storage';

interface UserRow {
  id: number;
  name: string;
  surname: string;
  role_id: number;
  is_active: boolean;
  role?: {
    id: number;
    name: string;
    alias: string;
  };
}

const getRoleName = (roleId: number) => {
  switch (roleId) {
    case 1: return 'Manager';
    case 2: return 'Student';
    case 3: return 'Lecturer';
    default: return 'Unknown';
  }
};

export default function UsersScreen() {
  const router = useRouter();

  // 1. Stany autoryzacji
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 2. Stany danych
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 3. Sprawdzenie roli managera (role_id === 1)
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

  // 4. Pobieranie użytkowników przy wejściu na ekran
  useFocusEffect(
    useCallback(() => {
      // Pobieraj tylko jeśli portier jest zautoryzowany
      if (!isAuthorized) return;

      const loadUsers = async () => {
        try {
          setIsLoading(true);
          setErrorMessage('');

          const res = await api.get('/users');
          const data = res.data?.data ?? res.data;

          setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error loading users:', error);
          setErrorMessage('Failed to load users.');
        } finally {
          setIsLoading(false);
        }
      };

      loadUsers();
    }, [isAuthorized])
  );

  const handleEdit = (userId: number) => {
    router.push({
      pathname: '/editUser',
      params: {
        action: 'edit',
        id: String(userId),
      },
    });
  };

  const handleAdd = () => {
    router.push({
      pathname: '/editUser',
      params: {
        action: 'new',
      },
    });
  };

  // 5. Wczesne wyjście dopiero PO wszystkich hookach
  if (isCheckingAuth || !isAuthorized) {
    return <AppLoadingScreen />;
  }

  return (
    <AppScreen variant="list">
      <AppHeading className="mb-4 text-center">
        Users
      </AppHeading>

      {errorMessage ? (
        <AppText variant="error" className="mb-4">
          {errorMessage}
        </AppText>
      ) : null}

      <AppCard className="flex-1 min-h-0 mb-6 overflow-hidden">
        {/* Nagłówki tabeli */}
        <AppRow divider="bottom">
          <AppText variant="bold" className="flex-1">Name</AppText>
          <AppText variant="bold" className="flex-1">Surname</AppText>
          <AppText variant="bold" className="flex-1">Role</AppText>
          <AppText variant="bold" className="w-20">Active</AppText>
          <Box className="w-16" />
        </AppRow>

        {/* Ładowanie danych z backendu */}
        {isLoading ? (
          <Center className="p-5">
            <Spinner size="small" />
          </Center>
        ) : users.length === 0 ? (
          <AppText variant="muted" className="p-4 text-center">
            No users.
          </AppText>
        ) : (
          /* Lista użytkowników */
          <ScrollView className="flex-1">
            {users.map((user, index) => (
              <AppRow key={user.id} divider={index > 0 ? 'top' : 'none'}>
                <AppText className="flex-1">{user.name}</AppText>
                <AppText className="flex-1">{user.surname}</AppText>
                <AppText variant="muted" className="flex-1">
                  {getRoleName(user.role_id)}
                </AppText>
                <AppText
                  className="w-20"
                  variant={user.is_active ? 'success' : 'error'}
                >
                  {user.is_active ? 'Yes' : 'No'}
                </AppText>
                <AppButton
                  title="Edit"
                  variant="secondary"
                  size="sm"
                  className="w-16"
                  onPress={() => handleEdit(user.id)}
                />
              </AppRow>
            ))}
          </ScrollView>
        )}
      </AppCard>

      <AppButton
        title="Add new user"
        className="w-full mb-3"
        onPress={handleAdd}
      />

      <AppButton
        title="Back"
        variant="secondary"
        onPress={() => router.back()}
      />
    </AppScreen>
  );
}