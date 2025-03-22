
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { RoomFormValues } from './types';

interface RoomsManagerProps {
  form: UseFormReturn<RoomFormValues>;
  addRoom: () => void;
  removeRoom: (index: number) => void;
}

export function RoomsManager({ form, addRoom, removeRoom }: RoomsManagerProps) {
  const rooms = form.watch('rooms') || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Rooms in Chalet</h3>
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={addRoom}
        >
          <Plus className="h-4 w-4" />
          <span className="ml-1">Add Room</span>
        </Button>
      </div>

      {rooms.map((room, index) => (
        <div key={index} className="border p-3 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Room {index + 1}</h4>
            {index > 0 && (
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={() => removeRoom(index)}
              >
                <Minus className="h-4 w-4" />
                <span className="ml-1">Remove</span>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`rooms.${index}.roomNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. 101" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`rooms.${index}.capacity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity*</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      required
                      placeholder="Beds" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
