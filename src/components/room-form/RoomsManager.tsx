
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { RoomFormValues } from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
              name={`rooms.${index}.bedType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bed Type*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || 'single'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bed type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single Bed</SelectItem>
                      <SelectItem value="double">Double Bed</SelectItem>
                      <SelectItem value="twin">Twin Beds</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`rooms.${index}.bedCount`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Beds</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="Number of beds" 
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        field.onChange(value);
                        
                        // Auto-calculate capacity based on bed type and count
                        const bedType = form.getValues(`rooms.${index}.bedType`) || 'single';
                        let capacity = value;
                        if (bedType === 'double') {
                          capacity = value * 2;
                        }
                        form.setValue(`rooms.${index}.capacity`, capacity);
                      }}
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
                      placeholder="Total capacity" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      className="bg-muted/20"
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
