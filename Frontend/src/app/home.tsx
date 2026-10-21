import { useRouter } from 'expo-router'; //przechodzenie między ekranami
import { Pressable, StyleSheet } from 'react-native';
// Pressable - komponent do obsługi naciśnięć, StyleSheet - tworzenie stylów

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
// ThemedText - komponent tekstowy z obsługą motywu 
// ThemedView - komponent widoku z obsługą motywu
// @ - alias do katalogu src, można importować komponenty z dowolnego miejsca

export default function HomeScreen() {
  const router = useRouter(); // hook do nawigacji między ekranami
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
      <Pressable onPress={() => router.replace('/')}> 
        <ThemedText type="link">Log out</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
});