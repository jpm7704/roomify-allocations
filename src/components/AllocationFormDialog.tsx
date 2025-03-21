
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import PersonSelectionList from './allocation/PersonSelectionList';
import RoomSelectionList from './allocation/RoomSelectionList';
import NotesField from './allocation/NotesField';

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
  const canAddMore = selectedPeople.length < remainingCapacity;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Room Allocation</DialogTitle>
          <DialogDescription>
            {multiSelectMode 
              ? `Assign multiple attendees to room. This room can accommodate ${remainingCapacity} more people.`
              : 'Assign an attendee to a room. Each room has a limited capacity.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <div className="grid gap-4 py-4">
            <div>
              <div className="flex justify-between">
                <span className="text-sm font-medium mb-2">Select Attendee{multiSelectMode ? '(s)' : ''}</span>
                {selectedRoom && multiSelectMode && (
                  <span className="text-sm text-muted-foreground">
                    Selected: {selectedPeople.length}/{remainingCapacity + selectedPeople.length}
                  </span>
                )}
              </div>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                <PersonSelectionList
                  people={people}
                  selectedPerson={selectedPerson}
                  selectedPeople={selectedPeople}
                  onPersonSelect={onPersonSelect}
                  onMultiPersonSelect={onMultiPersonSelect}
                  multiSelectMode={multiSelectMode}
                  canAddMore={canAddMore}
                />
              </div>
            </div>

            <div>
              <span className="text-sm font-medium mb-2">Select Room</span>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                <RoomSelectionList
                  rooms={rooms}
                  selectedRoom={selectedRoom}
                  onRoomSelect={onRoomSelect}
                  onCreateRoom={onCreateRoom}
                  onOpenChange={onOpenChange}
                />
              </div>
            </div>

            <NotesField form={form} />
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
