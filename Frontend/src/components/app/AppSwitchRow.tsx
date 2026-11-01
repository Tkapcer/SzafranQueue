import { Switch } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { AppText } from './AppText';

type Props = { label: string; value: boolean; onChange: (value: boolean) => void };

export function AppSwitchRow({ label, value, onChange }: Props) {
  return (
    <HStack className="justify-between items-center py-2">
      <AppText>{label}</AppText>
      <Switch value={value} onValueChange={onChange} />
    </HStack>
  );
}