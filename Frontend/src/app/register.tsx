import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, Pressable, StyleSheet, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

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

type FileAsset = {
  uri: string;
  name: string;
  type: string
};

interface Role {
  id: number;
  name: string;
  alias: string;
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

  const [idCardFront, setIdCardFront] = useState<FileAsset | null>(null);
  const [idCardBack, setIdCardBack] = useState<FileAsset | null>(null);

  useEffect(() => {
    api.get('/roles')
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setRoles(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error('Błąd pobierania ról:', err));
  }, []);

  // Zrobienie zdjęcia aparatem
  const handleCamera = async (side: 'front' | 'back') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
          'Permission Denied',
          'Camera access has been blocked. Please go to device settings to enable it.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) {
      const asset = result.assets[0];

      let fileName = asset.fileName;
      if (!fileName) {
        const extension = asset.uri.split('.').pop() || 'jpg';
        fileName = `photo_${side}_${Date.now()}.${extension}`;
      }

      const file = {
        uri: asset.uri,
        name: fileName,
        type: asset.mimeType || 'image/jpeg'
      };

      side === 'front' ? setIdCardFront(file) : setIdCardBack(file);
    }
  }

  // Wybór z galerii
  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 2,
    });

    if (!result.canceled && result.assets) {
      if (result.assets.length === 2) {
        setIdCardFront({ uri: result.assets[0].uri, name: result.assets[0].fileName || 'front.jpg', type: result.assets[0].mimeType || 'image/jpeg' });
        setIdCardBack({ uri: result.assets[1].uri, name: result.assets[1].fileName || 'back.jpg', type: result.assets[1].mimeType || 'image/jpeg' });
      } else if (result.assets.length === 1) {
        const file = { uri: result.assets[0].uri, name: result.assets[0].fileName || 'front.jpg', type: result.assets[0].mimeType || 'image/jpeg' };
        if (!idCardFront) setIdCardFront(file);
        else setIdCardBack(file);
      }
    }
  };

  // Wybór pliku z menedżera plików
  const handleDocument = async (side: 'front' | 'back') => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'] // Pozwala wybrać tylko PDF i zdjęcia
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      const file = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/pdf' // Domyślnie PDF, jeśli system nie poda
      };

      side === 'front' ? setIdCardFront(file) : setIdCardBack(file);
    }
  };

  // Wydzielona logika samej wysyłki na serwer
  const submitRegistration = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('surname', surname);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role_id', selectedRoleId);

      if (idCardFront) {
        formData.append('id_card_photo_front', idCardFront as any);
      }
      if (idCardBack) {
        formData.append('id_card_photo_back', idCardBack as any);
      }

      await api.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.replace({ pathname: '/', params: { registered: 'true' } });

    } catch (error: any) {
      if (error.response?.data?.errors) {
        const firstKey = Object.keys(error.response.data.errors)[0];
        setErrorMessage(error.response.data.errors[firstKey][0]);
      } else {
        setErrorMessage(error.response?.data?.message || 'Wystąpił błąd serwera.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja wywoływana po kliknięciu przycisku Register
  const onRegister = () => {
    if (!name || !surname || !email || !password || !selectedRoleId) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (!(idCardFront || idCardBack)) {
      Alert.alert(
          'No ID photos selected',
          'If you register without ID photos, you will need to visit the porter in person to verify your account. Do you want to continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => submitRegistration() }
          ]
      );
    } else {
      submitRegistration();
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
                      label={role.alias}
                      value={role.id.toString()}
                  />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>

        {/* SEKCJA ZDJĘĆ */}
        <View className="mb-4 p-3 border border-input rounded-lg">
          <Text className="text-foreground text-center font-bold mb-2">ID photo's</Text>

          <Button size="sm" variant="outline" className="mb-2" onPress={handleGallery}>
            <ButtonText>Pick from gallery (1 or 2 photos)</ButtonText>
          </Button>

          <View className="flex-row justify-between gap-2 mt-2">
            <Button size="sm" variant="outline" className="flex-1" onPress={() => handleCamera('front')}>
              <ButtonText>Camera - Front of ID</ButtonText>
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onPress={() => handleCamera('back')}>
              <ButtonText>Camera - Back ofs ID</ButtonText>
            </Button>
          </View>

          {/* SEKCJA WYBORU Z PLIKÓW*/}
          <View className="flex-row justify-between gap-2 mt-2">
            <Button size="sm" variant="outline" className="flex-1" onPress={() => handleDocument('front')}>
              <ButtonText>File</ButtonText>
            </Button>
          </View>

          {/* Podgląd dodanych plików */}
          <View className="mt-3">
            {idCardFront && <Text className="text-xs text-emerald-600">Front: {idCardFront.name}</Text>}
            {idCardBack && <Text className="text-xs text-emerald-600">Back: {idCardBack.name}</Text>}
          </View>
        </View>

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