
import { Person } from '@/components/PersonCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface PersonSelectorProps {
  people: Person[];
  selectedPerson: Person | null;
  selectedPeople: Person[];
  multiSelectMode: boolean;
  remainingCapacity: number;
  onPersonSelect: (person: Person) => void;
  onMultiPersonSelect?: (person: Person, selected: boolean) => void;
}

const PersonSelector = ({
  people,
  selectedPerson,
  selectedPeople,
  multiSelectMode,
  remainingCapacity,
  onPersonSelect,
  onMultiPersonSelect
}: PersonSelectorProps) => {
  const canAddMore = selectedPeople.length < remainingCapacity;

  return (
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
  );
};

export default PersonSelector;
