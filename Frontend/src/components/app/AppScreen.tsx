import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // omija kamerę, status bar i pasek gestów

import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';

type Props = PropsWithChildren<{ variant?: 'form' | 'page' }>;

export function AppScreen({ variant = 'page', children }: Props) {
  if (variant === 'form') {
    return (
      <Box className="flex-1 bg-background">
        <SafeAreaView style={styles.form}>{children}</SafeAreaView>
      </Box>
    );
  }
  return <Center className="flex-1 bg-background p-5">{children}</Center>;
}

export function AppLoadingScreen() {
  return (
    <Center className="flex-1 bg-background">
      <Spinner size="large" />
    </Center>
  );
}

// SafeAreaView zostaje na StyleSheet, bo className może na nim nie działać
const styles = StyleSheet.create({
  form: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, width: '100%', maxWidth: 400, alignSelf: 'center' },
});