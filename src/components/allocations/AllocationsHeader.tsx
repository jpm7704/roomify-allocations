
import { Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AllocationsHeaderProps {
  onCreateRoom: () => void;
  onCreateAllocation: () => void;
}

const AllocationsHeader = ({ onCreateRoom, onCreateAllocation }: AllocationsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Room Allocations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          SDA Women's Ministry Camp Meeting
        </p>
      </div>
      
      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        <Button variant="outline" className="rounded-md w-full sm:w-auto" onClick={onCreateRoom}>
          <Building className="mr-2 h-4 w-4" />
          Add Room
        </Button>
        <Button className="rounded-md w-full sm:w-auto" onClick={onCreateAllocation}>
          <Plus className="mr-2 h-4 w-4" />
          New Allocation
        </Button>
      </div>
    </div>
  );
};

export default AllocationsHeader;
