
import { useState } from 'react';
import { ChevronDown, ChevronUp, SortAsc, ArrowDownUp } from 'lucide-react';
import { Allocation } from '@/components/AllocationCard';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type SortField = 'name' | 'room' | 'building' | 'date';
type SortDirection = 'asc' | 'desc';

interface AllocationTableProps {
  allocations: Allocation[];
  onClick: (allocation: Allocation) => void;
  onRemove: (allocationId: string) => void;
}

const AllocationTable = ({ allocations, onClick, onRemove }: AllocationTableProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowDownUp className="ml-1 h-4 w-4 text-muted-foreground/50" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4 text-primary" /> : 
      <ChevronDown className="ml-1 h-4 w-4 text-primary" />;
  };

  const sortedAllocations = [...allocations].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return a.person.name.localeCompare(b.person.name) * modifier;
      case 'room':
        return a.room.name.localeCompare(b.room.name) * modifier;
      case 'building':
        return (a.room.building || '').localeCompare(b.room.building || '') * modifier;
      case 'date':
        return (new Date(a.dateAssigned).getTime() - new Date(b.dateAssigned).getTime()) * modifier;
      default:
        return 0;
    }
  });

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer w-1/3"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Person {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('room')}
            >
              <div className="flex items-center">
                Room {getSortIcon('room')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hidden md:table-cell"
              onClick={() => handleSort('building')}
            >
              <div className="flex items-center">
                Building {getSortIcon('building')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hidden md:table-cell"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center">
                Date Assigned {getSortIcon('date')}
              </div>
            </TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAllocations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No allocations found.
              </TableCell>
            </TableRow>
          ) : (
            sortedAllocations.map((allocation) => (
              <TableRow 
                key={allocation.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onClick(allocation)}
              >
                <TableCell className="font-medium">
                  <div>
                    {allocation.person.name}
                    {allocation.person.department && (
                      <div className="text-xs text-muted-foreground">
                        {allocation.person.department}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="mr-1 bg-primary/5">
                    {allocation.room.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    ({allocation.room.occupied}/{allocation.room.capacity})
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {allocation.room.building || 'Main Building'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(allocation.dateAssigned), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(allocation.id);
                    }}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllocationTable;
