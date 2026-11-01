import { ComponentProps } from 'react';
import { Text } from '@/components/ui/text';

const variants = {
  body: 'text-foreground',
  muted: 'text-muted-foreground',
  bold: 'font-bold text-foreground',
  error: 'text-center text-destructive',
  success: 'text-center text-emerald-600 font-medium',
} as const;

type Props = Omit<ComponentProps<typeof Text>, 'className'> & {
  variant?: keyof typeof variants;
  className?: string;
};

export function AppText({ variant = 'body', className = '', ...props }: Props) {
  return <Text className={`${variants[variant]} ${className}`} {...props} />;
}