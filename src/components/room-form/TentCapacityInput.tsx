
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { RoomFormValues } from './types';

interface TentCapacityInputProps {
  form: UseFormReturn<RoomFormValues>;
}

export function TentCapacityInput({ form }: TentCapacityInputProps) {
  return (
    <FormField
      control={form.control}
      name="rooms.0.capacity"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Capacity*</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              min="1" 
              required
              placeholder="Number of beds" 
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
