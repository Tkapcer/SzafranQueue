import { Pressable } from 'react-native';
import { AppText } from './AppText';

type Props = { title: string; onPress: () => void };

export function AppLink({ title, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <AppText size="sm" className="text-center">{title}</AppText>
    </Pressable>
  );
}