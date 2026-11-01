import { ComponentProps } from 'react';
import { Input, InputField } from '@/components/ui/input';

export function AppInput(props: ComponentProps<typeof InputField>) {
  return (
    <Input className="h-12 rounded-lg border border-input">
      <InputField className="text-foreground" {...props} />
    </Input>
  );
}