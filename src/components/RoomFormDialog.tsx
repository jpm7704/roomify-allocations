
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Bed, Tent, Home, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/sheet';

interface Room {
  roomNumber: string;
  capacity: number;
}

interface RoomFormValues {
  type: string;
  chaletNumber: string;
  rooms: Room[];
  notes: string;
}

interface RoomFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: RoomFormValues) => void;
  onCancel: () => void;
}

const RoomFormDialog = ({
  isOpen,
  onOpenChange,
  onSave,
  onCancel
}: RoomFormDialogProps) => {
  const [selectedType, setSelectedType] = useState('Chalet');
  
  const roomForm = useForm<RoomFormValues>({
    defaultValues: {
      type: 'Chalet',
      chaletNumber: '',
      rooms: [{ roomNumber: '', capacity: 2 }],
      notes: '',
    },
  });

  const handleSave = () => {
    const values = roomForm.getValues();
    onSave(values);
    
    // Reset form after save
    roomForm.reset({
      type: 'Chalet',
      chaletNumber: '',
      rooms: [{ roomNumber: '', capacity: 2 }],
      notes: '',
    });
  };

  const addRoom = () => {
    const currentRooms = roomForm.getValues().rooms || [];
    // Remove the maximum limit for rooms
    const updatedRooms = [...currentRooms, { roomNumber: '', capacity: 2 }];
    roomForm.setValue('rooms', updatedRooms);
    // Force re-render to show the new room field
    roomForm.trigger('rooms');
  };

  const removeRoom = (index: number) => {
    const currentRooms = roomForm.getValues().rooms || [];
    if (currentRooms.length > 1) {
      const updatedRooms = [...currentRooms];
      updatedRooms.splice(index, 1);
      roomForm.setValue('rooms', updatedRooms);
      // Force re-render to update the room fields
      roomForm.trigger('rooms');
    }
  };

  // Close handler to reset form
  const handleClose = (open: boolean) => {
    if (!open) {
      roomForm.reset({
        type: 'Chalet',
        chaletNumber: '',
        rooms: [{ roomNumber: '', capacity: 2 }],
        notes: '',
      });
      setSelectedType('Chalet');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Accommodation</DialogTitle>
          <DialogDescription>
            Create a new accommodation room or tent for attendees.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <Form {...roomForm}>
            <div className="grid gap-4 py-4">
              <FormField
                control={roomForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type*</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedType(value);
                          // Reset rooms when changing type
                          if (value === 'Personal tent') {
                            roomForm.setValue('rooms', [{ roomNumber: '', capacity: 2 }]);
                          }
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

              <FormField
                control={roomForm.control}
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

              {selectedType === 'Chalet' && (
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

                  {roomForm.watch('rooms').map((room, index) => (
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
                          control={roomForm.control}
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
                          control={roomForm.control}
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
              )}

              {selectedType === 'Personal tent' && (
                <FormField
                  control={roomForm.control}
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
              )}

              <FormField
                control={roomForm.control}
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
            </div>
          </Form>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomFormDialog;
