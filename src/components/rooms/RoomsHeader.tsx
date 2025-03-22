
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RoomsHeaderProps {
  onAddRoom: () => void;
}

const RoomsHeader = ({ onAddRoom }: RoomsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accommodations</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view all rooms and tents and their current occupancy
        </p>
      </div>
      
      <Button className="rounded-md" onClick={onAddRoom}>
        <Plus className="mr-2 h-4 w-4" />
        Add Accommodation
      </Button>
    </div>
  );
};

export default RoomsHeader;
