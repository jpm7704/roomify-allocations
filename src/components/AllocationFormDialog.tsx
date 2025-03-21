
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';

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
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                {people.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No women attendees found. Please add attendees first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  people.map(person => (
                    <div 
                      key={person.id}
                      className={`p-2 my-1 rounded-md ${
                        multiSelectMode 
                          ? 'hover:bg-muted cursor-pointer flex items-center' 
                          : `cursor-pointer ${selectedPerson?.id === person.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
                      }`}
                      onClick={() => !multiSelectMode && onPersonSelect(person)}
                    >
                      {multiSelectMode && onMultiPersonSelect ? (
                        <>
                          <Checkbox
                            id={`person-${person.id}`}
                            checked={selectedPeople.some(p => p.id === person.id)}
                            onCheckedChange={(checked) => {
                              if (!checked && selectedPeople.some(p => p.id === person.id)) {
                                onMultiPersonSelect(person, false);
                              } else if (checked && !selectedPeople.some(p => p.id === person.id)) {
                                if (canAddMore || selectedPeople.some(p => p.id === person.id)) {
                                  onMultiPersonSelect(person, true);
                                }
                              }
                            }}
                            disabled={!canAddMore && !selectedPeople.some(p => p.id === person.id)}
                            className="mr-2"
                          />
                          <div className="flex-1" onClick={(e) => {
                            e.stopPropagation();
                            if (canAddMore || selectedPeople.some(p => p.id === person.id)) {
                              onMultiPersonSelect(person, !selectedPeople.some(p => p.id === person.id));
                            }
                          }}>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-sm opacity-90">{person.department || person.email}</div>
                            {person.roomId && <div className="text-xs mt-1">Currently in: {person.roomName}</div>}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">{person.name}</div>
                          <div className="text-sm opacity-90">{person.department || person.email}</div>
                          {person.roomId && <div className="text-xs mt-1">Currently in: {person.roomName}</div>}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </FormItem>

            <FormItem>
              <FormLabel>Select Accommodation</FormLabel>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                {rooms.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No accommodations found. Please add accommodations first.
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => {
                          onOpenChange(false);
                          setTimeout(() => {
                            onCreateRoom();
                          }, 100);
                        }}
                      >
                        Add Accommodation
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  rooms.map(room => (
                    <div 
                      key={room.id}
                      className={`p-2 my-1 cursor-pointer rounded-md ${
                        selectedRoom?.id === room.id 
                          ? 'bg-primary text-primary-foreground' 
                          : room.occupied >= room.capacity 
                            ? 'bg-muted text-muted-foreground' 
                            : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        if (room.occupied < room.capacity) {
                          onRoomSelect(room);
                        }
                      }}
                    >
                      <div className="font-medium">{room.name}</div>
                      <div className="text-sm">
                        {room.type === 'Personal tent' ? 'Tent' : 'Chalet'}
                      </div>
                      <div className="text-xs mt-1">
                        Occupancy: {room.occupied}/{room.capacity}
                        {room.capacity > 1 && (
                          <span className="ml-2">
                            {room.capacity > 1 ? `(${room.capacity - room.occupied} ${room.capacity - room.occupied === 1 ? 'space' : 'spaces'} available)` : ''}
                          </span>
                        )}
                        {room.occupied >= room.capacity && ' (Full)'}
                      </div>
                    </div>
                  ))
                )}
              </div>
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
