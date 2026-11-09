import { ComponentProps, ComponentRef, forwardRef } from 'react';
import { Input, InputField } from '@/components/ui/input';

export const AppInput = forwardRef<
  ComponentRef<typeof InputField>,
  ComponentProps<typeof InputField>
>(function AppInput(props, ref) {
  return (
    <Input className="h-12 rounded-lg border border-input">
      <InputField ref={ref} className="text-foreground" {...props} />
    </Input>
  );
});