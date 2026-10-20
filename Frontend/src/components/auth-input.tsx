import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export function AuthInput(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[
        styles.input,
        { color: theme.text, borderColor: theme.textSecondary },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
});