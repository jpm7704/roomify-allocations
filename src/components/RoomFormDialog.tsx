import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Bed, Tent, Home } from 'lucide-react';
import { useState } from 'react';

interface RoomFormValues {
  name: string;
  capacity: string;
  building: string;
  floor: string;
  description: string;
  type: string;
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
      name: '',
      capacity: '2',
      building: 'Main Building',
      floor: '1',
      description: '',
      type: 'Chalet',
    },
  });

  const handleSave = () => {
    const values = roomForm.getValues();
    onSave(values);
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'Chalet':
        return <Home className="h-4 w-4 mr-2" />;
      case 'Personal tent':
        return <Tent className="h-4 w-4 mr-2" />;
      default:
        return <Home className="h-4 w-4 mr-2" />;
    }
  };

  const getNameLabel = () => {
    return selectedType === 'Personal tent' ? 'Tent Name*' : 'Room Name*';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            Create a new accommodation room for attendees.
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
                      <SelectContent>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getNameLabel()}</FormLabel>
                  <FormControl>
                    <Input placeholder={selectedType === 'Personal tent' ? "e.g. Tent 101" : "e.g. Room 101"} required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={roomForm.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select building" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Building">Main Building</SelectItem>
                          <SelectItem value="East Wing">East Wing</SelectItem>
                          <SelectItem value="West Wing">West Wing</SelectItem>
                          <SelectItem value="South Block">South Block</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={roomForm.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select floor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="G">Ground</SelectItem>
                          <SelectItem value="1">First</SelectItem>
                          <SelectItem value="2">Second</SelectItem>
                          <SelectItem value="3">Third</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={roomForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any additional details about the room" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomFormDialog;
