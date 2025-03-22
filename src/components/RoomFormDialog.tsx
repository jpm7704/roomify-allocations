
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoomTypeSelect } from './room-form/RoomTypeSelect';
import { ChaletNumberInput } from './room-form/ChaletNumberInput';
import { RoomsManager } from './room-form/RoomsManager';
import { TentCapacityInput } from './room-form/TentCapacityInput';
import { NotesInput } from './room-form/NotesInput';
import { RoomFormValues } from './room-form/types';

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
    const updatedRooms = [...currentRooms, { roomNumber: '', capacity: 2 }];
    roomForm.setValue('rooms', updatedRooms);
    roomForm.trigger('rooms');
  };

  const removeRoom = (index: number) => {
    const currentRooms = roomForm.getValues().rooms || [];
    if (currentRooms.length > 1) {
      const updatedRooms = [...currentRooms];
      updatedRooms.splice(index, 1);
      roomForm.setValue('rooms', updatedRooms);
      roomForm.trigger('rooms');
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    // Reset rooms when changing type
    if (value === 'Personal tent') {
      roomForm.setValue('rooms', [{ roomNumber: '', capacity: 2 }]);
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
              <RoomTypeSelect form={roomForm} onTypeChange={handleTypeChange} />
              <ChaletNumberInput form={roomForm} selectedType={selectedType} />

              {selectedType === 'Chalet' ? (
                <RoomsManager 
                  form={roomForm}
                  addRoom={addRoom}
                  removeRoom={removeRoom}
                />
              ) : (
                <TentCapacityInput form={roomForm} />
              )}

              <NotesInput form={roomForm} />
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
