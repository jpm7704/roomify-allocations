
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table as TableIcon } from "lucide-react";

export type ViewMode = 'grid' | 'table';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center space-x-1 border rounded-lg p-1">
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={viewMode === 'table' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        aria-label="Table view"
      >
        <TableIcon className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Table</span>
      </Button>
    </div>
  );
};

export default ViewToggle;
