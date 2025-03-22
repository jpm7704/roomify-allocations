
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Tent } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { RoomFormValues } from './types';

interface RoomTypeSelectProps {
  form: UseFormReturn<RoomFormValues>;
  onTypeChange: (value: string) => void;
}

export function RoomTypeSelect({ form, onTypeChange }: RoomTypeSelectProps) {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Room Type*</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onTypeChange(value);
              }}
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md">
                <SelectItem value="Chalet">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    <span>Chalet</span>
                  </div>
                </SelectItem>
                <SelectItem value="Personal tent">
                  <div className="flex items-center">
                    <Tent className="h-4 w-4 mr-2" />
                    <span>Personal tent</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
