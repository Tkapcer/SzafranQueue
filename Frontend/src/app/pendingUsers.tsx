import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Linking, ScrollView } from 'react-native';

import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import {
  AppScreen, AppHeading, AppText, AppButton, AppCard,
} from '@/components/app';

import { api } from '@/services/api';

interface Doc { id: number; is_pdf: boolean; url: string }
interface Pending {
  id: number; name: string; surname: string; email: string; documents: Doc[];
}

export default function PendingUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<Pending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setIsLoading(true);
          setErrorMessage('');
          const res = await api.get('/users/pending');
          setUsers(res.data);
        } catch (e) {
          console.error(e);
          setErrorMessage('Failed to load users.');
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }, [])
  );

  const act = async (id: number, type: 'approve' | 'reject') => {
    try {
      setBusyId(id);
      await api.post(`/users/${id}/${type}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
      setErrorMessage('Action failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppScreen variant="list">
      <AppHeading className="mb-4 text-center">Pending Users</AppHeading>

      {errorMessage ? (
        <AppText variant="error" className="mb-4">{errorMessage}</AppText>
      ) : null}

      {isLoading ? (
        <Center className="p-5"><Spinner size="small" /></Center>
      ) : (
        <ScrollView className="flex-1">
          {users.length === 0 && (
            <AppText variant="muted" className="text-center">No pending users.</AppText>
          )}

          {users.map((u) => (
            <AppCard key={u.id} className="p-4 mb-4" space="sm">
              <AppText variant="bold">{u.name} {u.surname}</AppText>
              <AppText variant="muted">{u.email}</AppText>

              {u.documents.length === 0 ? (
                <AppText variant="muted">
                  No documents provided - approve only after presenting the student ID in person.
                </AppText>
              ) : (
                u.documents.map((d) =>
                  d.is_pdf ? (
                    <AppButton
                      key={d.id}
                      title="Open PDF"
                      variant="secondary"
                      onPress={() => Linking.openURL(d.url)}
                    />
                  ) : (
                    <Image
                      key={d.id}
                      source={{ uri: d.url }}
                      style={{ width: '100%', height: 220 }}
                      resizeMode="contain"
                    />
                  )
                )
              )}

              <AppButton
                title="Approve"
                loading={busyId === u.id}
                onPress={() => act(u.id, 'approve')}
              />
              <AppButton
                title="Reject"
                variant="danger"
                disabled={busyId === u.id}
                onPress={() => act(u.id, 'reject')}
              />
            </AppCard>
          ))}
        </ScrollView>
      )}

      <AppButton title="Back" variant="secondary" onPress={() => router.back()} />
    </AppScreen>
  );
}