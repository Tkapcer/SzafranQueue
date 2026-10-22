// "opakowanie" dla wszystkich ekranów w aplikacji

import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router'; 
// import motywów, 
// ThemeProvider - udostępnianie motywów w całej aplikacji 
// Stack - nawigowanie między ekranami

import { useColorScheme } from 'react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

// useColorScheme - wykrywanie motywu systemowego (ciemny/jasny)

export default function RootLayout() {
  const colorScheme = useColorScheme(); // wykrywanie motywu systemowego (ciemny/jasny)
  return (
    
    <GluestackUIProvider mode="dark">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} /> {/*ukrywa nagłówek*/}
    </ThemeProvider>
    </GluestackUIProvider>
  
  );
}
// funkcja zwracająca interfejs