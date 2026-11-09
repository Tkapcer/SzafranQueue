import { useRouter } from 'expo-router';
import { useState, useEffect, ComponentRef, useRef } from 'react';
import { Alert, View, Linking, Platform } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { api } from '@/services/api';
import {
  AppScreen, AppHeading, AppText, AppInput, AppSelect, AppButton, AppLink,
} from '@/components/app';


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

  // uchwyty do kolejnych pól, aby móc ustawić fokus po wciśnięciu "next" na polu email
  const passwordInputRef = useRef<ComponentRef<typeof AppInput>>(null);
  const surnameInputRef = useRef<ComponentRef<typeof AppInput>>(null);
  const roleSelectRef = useRef<ComponentRef<typeof AppSelect>>(null);

  useEffect(() => {
    api.get('/roles')
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setRoles(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error('Error fetching roles:', err));
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

      // Inne pakowanie pliku dla Web, inne dla Mobile
      const appendFile = async (key: string, file: FileAsset) => {
        if (Platform.OS === 'web') {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          formData.append(key, blob, file.name);
        } else {
          formData.append(key, file as any);
        }
      };

      if (idCardFront) {
        await appendFile('id_card_photo_front', idCardFront);
      }
      if (idCardBack) {
        await appendFile('id_card_photo_back', idCardBack);
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
        setErrorMessage('Error during registration. Please try again.');
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
      if (Platform.OS === 'web') {
        // Natywne okienko przeglądarki
        const userConfirmed = window.confirm(
            "No ID photos selected\n\nIf you register without ID photos, you will need to visit the porter in person to verify your account. Do you want to continue?"
        );
        if (userConfirmed) {
          submitRegistration();
        }
      } else {
        // Okienko dla iOS / Android
        Alert.alert(
            'No ID photos selected',
            'If you register without ID photos, you will need to visit the porter in person to verify your account. Do you want to continue?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Continue', onPress: () => submitRegistration() }
            ]
        );
      }
    } else {
      submitRegistration();
    }
  };

  return (
    <AppScreen variant="form">
      <AppHeading variant="title">Registration</AppHeading>

      {errorMessage ? <AppText variant="error" className="mb-2.5">{errorMessage}</AppText> : null}

      <AppInput 
        placeholder="Name" 
        returnKeyType="next"
        submitBehavior="submit"
        value={name} 
        onChangeText={setName} 
        onSubmitEditing={() => (surnameInputRef.current as any)?.focus()}
        />
      <AppInput 
        ref={surnameInputRef}
        placeholder="Surname" 
        value={surname} 
        onChangeText={setSurname} 
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => (roleSelectRef.current as any)?.focus()}
        />
      <AppSelect
        ref={roleSelectRef}
        value={selectedRoleId}
        onChange={setSelectedRoleId}
        placeholder="Select role"
        options={roles.map((r) => ({ label: r.alias || r.name, value: r.id.toString() }))}
      />

      {/* Zdjęcia legitymacji */}
      <View className="mb-4 p-3 border border-input rounded-lg gap-2">
        <AppText className="text-center font-bold">ID photos</AppText>

        <AppButton title="Pick from gallery (1 or 2 photos)" variant="secondary" onPress={handleGallery} />

        <View className="flex-row justify-between gap-2">
          <View className="flex-1">
            <AppButton title="Camera - Front" variant="secondary" onPress={() => handleCamera('front')} />
          </View>
          <View className="flex-1">
            <AppButton title="Camera - Back" variant="secondary" onPress={() => handleCamera('back')} />
          </View>
        </View>

        <AppButton title="File" variant="secondary" onPress={() => handleDocument('front')} />

        <View>
          {idCardFront && <AppText className="text-xs text-emerald-600">Front: {idCardFront.name}</AppText>}
          {idCardBack && <AppText className="text-xs text-emerald-600">Back: {idCardBack.name}</AppText>}
        </View>
      </View>

      <AppInput
        placeholder="Email"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => (passwordInputRef.current as any)?.focus()}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AppInput 
        ref={passwordInputRef}
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
        returnKeyType="done"
        submitBehavior="submit"
        onSubmitEditing={onRegister}
      />

      <AppButton title="Register" variant="secondary" loading={isLoading} onPress={onRegister} />
      <AppLink title="Log in" onPress={() => router.replace('/')} />
    </AppScreen>
  );
}