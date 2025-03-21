
import { UserRound, Loader2 } from 'lucide-react';
import PersonCard, { Person } from '@/components/PersonCard';

interface AttendeeListProps {
  loading: boolean;
  people: Person[];
  searchQuery: string;
  onEdit: (person: Person) => void;
  onDelete: (personId: string) => void;
  onAssign: (person: Person) => void;
  onClick: (person: Person) => void;
}

const AttendeeList = ({ 
  loading, 
  people, 
  searchQuery, 
  onEdit, 
  onDelete, 
  onAssign, 
  onClick 
}: AttendeeListProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-medium">Loading attendees...</h3>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-1">No attendees found</h3>
        <p className="text-muted-foreground max-w-sm">
          {searchQuery ? 'Try adjusting your search query' : 'There are no attendees added yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {people.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssign={onAssign}
          onClick={onClick}
        />
      ))}
    </div>
  );
};

export default AttendeeList;
