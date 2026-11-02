import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';

type Props = PropsWithChildren<{ variant?: 'form' | 'page' | 'list' }>;

export function AppScreen({ variant = 'page', children }: Props) {
  // Stała wysokość, przewijanie robi element w środku (np. lista)
  if (variant === 'list') {
    return (
      <Box className="flex-1 bg-background">
        <SafeAreaView style={styles.list}>{children}</SafeAreaView>
      </Box>
    );
  }

  // Wyśrodkowane, a gdy się nie mieści, przewija się cały ekran
  return (
    <Box className="flex-1 bg-background">
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={variant === 'form' ? styles.form : styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}

export function AppLoadingScreen() {
  return (
    <Center className="flex-1 bg-background">
      <Spinner size="large" />
    </Center>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12, width: '100%', maxWidth: 400, alignSelf: 'center' },
  page: { flexGrow: 1, justifyContent: 'center', padding: 20, width: '100%', maxWidth: 500, alignSelf: 'center' },
  list: { flex: 1, padding: 20, width: '100%', maxWidth: 600, alignSelf: 'center' },
});