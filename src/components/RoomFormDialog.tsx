
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Bed, Tent, Home } from 'lucide-react';
import { useState } from 'react';

interface RoomFormValues {
  type: string;
  chaletNumber: string;
  roomNumber: string;
  capacity: string;
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
      roomNumber: '',
      capacity: '2',
      notes: '',
    },
  });

  const handleSave = () => {
    const values = roomForm.getValues();
    
    // Format room name based on type, chalet number and room number
    const formattedValues = {
      ...values,
      // Create a name from the chalet and room number
      name: selectedType === 'Chalet' 
        ? `Chalet ${values.chaletNumber}${values.roomNumber ? ` - Room ${values.roomNumber}` : ''}`
        : `Tent ${values.chaletNumber}`,
      // Use notes as description
      description: values.notes
    };
    
    onSave(formattedValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Accommodation</DialogTitle>
          <DialogDescription>
            Create a new accommodation room or tent for attendees.
          </DialogDescription>
        </DialogHeader>
        
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
                      }}
                      defaultValue={field.value}
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
              <FormField
                control={roomForm.control}
                name="roomNumber"
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
            )}

            <FormField
              control={roomForm.control}
              name="capacity"
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomFormDialog;
