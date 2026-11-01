import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const variants = {
  primary: { button: 'bg-primary', text: '', spinner: 'white' },
  secondary: { button: 'bg-secondary', text: 'text-foreground', spinner: undefined },
  danger: { button: 'bg-error', text: 'text-white', spinner: 'white' },
} as const;

type Props = {
  title: string;
  onPress?: () => void;
  variant?: keyof typeof variants;
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  className?: string; // tylko na szerokość / marginesy, np. "w-full mb-3"
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}: Props) {
  const v = variants[variant];
  return (
    <Button
      size={size === 'md' ? 'default' : size}
      onPress={onPress}
      disabled={disabled || loading}
      className={`${v.button} ${loading ? 'opacity-70' : ''} ${className}`}
    >
      {loading ? <Spinner color={v.spinner} /> : <ButtonText className={v.text}>{title}</ButtonText>}
    </Button>
  );
}