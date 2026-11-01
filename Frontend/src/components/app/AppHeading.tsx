import { ComponentProps } from 'react';
import { Heading } from '@/components/ui/heading';

const variants = {
  title: { size: '4xl', className: 'text-center mb-4 text-foreground' },
  page: { size: '2xl', className: 'text-foreground' },
  value: { size: 'lg', className: 'text-foreground mb-3' },
} as const;

type Props = Omit<ComponentProps<typeof Heading>, 'size' | 'className'> & {
  variant?: keyof typeof variants;
  className?: string;
};

export function AppHeading({ variant = 'page', className = '', ...props }: Props) {
  const v = variants[variant];
  return <Heading size={v.size} className={`${v.className} ${className}`} {...props} />;
}