
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import PersonSelector from './PersonSelector';
import RoomSelector from './RoomSelector';

interface AllocationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  people: Person[];
  rooms: Room[];
  selectedPerson: Person | null;
  selectedRoom: Room | null;
  onPersonSelect: (person: Person) => void;
  onRoomSelect: (room: Room) => void;
  onSave: () => void;
  onCancel: () => void;
  onCreateRoom: () => void;
  selectedPeople?: Person[];
  onMultiPersonSelect?: (person: Person, selected: boolean) => void;
  multiSelectMode?: boolean;
}

const AllocationFormDialog = ({
  isOpen,
  onOpenChange,
  people,
  rooms,
  selectedPerson,
  selectedRoom,
  onPersonSelect,
  onRoomSelect,
  onSave,
  onCancel,
  onCreateRoom,
  selectedPeople = [],
  onMultiPersonSelect,
  multiSelectMode = false
}: AllocationFormDialogProps) => {
  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

  // Calculate remaining capacity for the selected room
  const remainingCapacity = selectedRoom ? selectedRoom.capacity - selectedRoom.occupied : 0;

  // Helper to get accommodation type display name
  const getAccommodationTypeName = (room: Room) => {
    return room.type === 'Personal tent' ? 'tent' : 'room';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Room Allocation</DialogTitle>
          <DialogDescription>
            {multiSelectMode 
              ? `Assign multiple attendees to accommodation. This ${selectedRoom ? getAccommodationTypeName(selectedRoom) : 'accommodation'} can accommodate ${remainingCapacity} more people.`
              : 'Assign an attendee to accommodation. Each accommodation has a limited capacity.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <div className="grid gap-4 py-4">
            <FormItem>
              <FormLabel className="flex justify-between">
                <span>Select Attendee{multiSelectMode ? '(s)' : ''}</span>
                {selectedRoom && multiSelectMode && (
                  <span className="text-sm text-muted-foreground">
                    Selected: {selectedPeople.length}/{remainingCapacity + selectedPeople.length}
                  </span>
                )}
              </FormLabel>
              
              <PersonSelector 
                people={people}
                selectedPerson={selectedPerson}
                selectedPeople={selectedPeople}
                multiSelectMode={multiSelectMode}
                remainingCapacity={remainingCapacity}
                onPersonSelect={onPersonSelect}
                onMultiPersonSelect={onMultiPersonSelect}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Select Accommodation</FormLabel>
              
              <RoomSelector 
                rooms={rooms}
                selectedRoom={selectedRoom}
                onRoomSelect={onRoomSelect}
                onCreateRoom={onCreateRoom}
                onOpenChange={onOpenChange}
              />
            </FormItem>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any special requirements or notes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            onClick={onSave} 
            disabled={
              multiSelectMode 
                ? selectedPeople.length === 0 || !selectedRoom 
                : !selectedPerson || !selectedRoom
            }
          >
            Save Allocation{multiSelectMode && selectedPeople.length > 0 ? `s (${selectedPeople.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllocationFormDialog;
