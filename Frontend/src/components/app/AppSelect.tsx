import { ComponentRef, forwardRef } from 'react';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@/components/ui/select';
import { ChevronDownIcon } from '@/components/ui/icon';

type Option = { label: string; value: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
};

export const AppSelect = forwardRef<ComponentRef<typeof SelectTrigger>, Props>(
  function AppSelect({ value, onChange, options, placeholder }, ref) {
    return (
      <Select selectedValue={value} onValueChange={onChange}>
        <SelectTrigger ref={ref} variant="outline" size="md" className="h-12 rounded-lg justify-between border border-input">
          <SelectInput placeholder={placeholder} className="text-foreground" />
          <SelectIcon className="mr-3" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="bg-background">
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options.map((o) => (
              <SelectItem key={o.value} label={o.label} value={o.value} className="text-foreground" />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  }
);