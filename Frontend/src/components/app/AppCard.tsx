import { ComponentProps } from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

export function AppCard({ className = '', ...props }: ComponentProps<typeof VStack>) {
  return <VStack className={`w-full rounded-xl border border-border ${className}`} {...props} />;
}

type RowProps = ComponentProps<typeof HStack> & {
  divider?: 'none' | 'bottom' | 'top';
};

export function AppRow({ divider = 'none', className = '', ...props }: RowProps) {
  const border =
    divider === 'bottom' ? 'border-b border-border' :
    divider === 'top' ? 'border-t border-border' : '';
  return <HStack className={`p-3 items-center ${border} ${className}`} {...props} />;
}