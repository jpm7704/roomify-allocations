
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
  onCreateRoom
}: AllocationFormDialogProps) => {
  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Room Allocation</DialogTitle>
          <DialogDescription>
            Assign an attendee to a room. Each room has a limited capacity.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <div className="grid gap-4 py-4">
            <FormItem>
              <FormLabel>Select Attendee</FormLabel>
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
                      className={`p-2 my-1 cursor-pointer rounded-md ${selectedPerson?.id === person.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => onPersonSelect(person)}
                    >
                      <div className="font-medium">{person.name}</div>
                      <div className="text-sm opacity-90">{person.department || person.email}</div>
                      {person.roomId && <div className="text-xs mt-1">Currently in: {person.roomName}</div>}
                    </div>
                  ))
                )}
              </div>
            </FormItem>

            <FormItem>
              <FormLabel>Select Room</FormLabel>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                {rooms.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No rooms found. Please add rooms first.
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
                        Add Room
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
                      onClick={() => room.occupied < room.capacity && onRoomSelect(room)}
                    >
                      <div className="font-medium">{room.name}</div>
                      <div className="text-sm">
                        {room.building} {room.floor && `- Floor ${room.floor}`}
                      </div>
                      <div className="text-xs mt-1">
                        Occupancy: {room.occupied}/{room.capacity}
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
            disabled={!selectedPerson || !selectedRoom}
          >
            Save Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllocationFormDialog;
