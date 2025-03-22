
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { RoomFormValues } from './types';

interface NotesInputProps {
  form: UseFormReturn<RoomFormValues>;
}

export function NotesInput({ form }: NotesInputProps) {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Additional Notes</FormLabel>
          <FormControl>
            <Input 
              placeholder="Any additional details about the accommodation" 
              {...field} 
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
