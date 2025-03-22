
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddChalet1to3 from './AddChalet1to3';

interface RoomsHeaderProps {
  onAddRoom: () => void;
}

const RoomsHeader = ({ onAddRoom }: RoomsHeaderProps) => {
  return (
    <div className="flex items-center justify-between pb-4 pt-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accommodations</h1>
        <p className="text-sm text-muted-foreground">
          Manage accommodation rooms and tents for attendees
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <AddChalet1to3 onComplete={() => window.location.reload()} />
        <Button onClick={onAddRoom}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Accommodation
        </Button>
      </div>
    </div>
  );
};

export default RoomsHeader;
