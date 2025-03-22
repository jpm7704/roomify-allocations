
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { RoomFormValues } from './types';

interface ChaletNumberInputProps {
  form: UseFormReturn<RoomFormValues>;
  selectedType: string;
}

export function ChaletNumberInput({ form, selectedType }: ChaletNumberInputProps) {
  return (
    <FormField
      control={form.control}
      name="chaletNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{selectedType === 'Personal tent' ? 'Tent Number*' : 'Chalet Number*'}</FormLabel>
          <FormControl>
            <Input 
              placeholder={selectedType === 'Personal tent' ? "e.g. 101" : "e.g. 23"} 
              required 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
