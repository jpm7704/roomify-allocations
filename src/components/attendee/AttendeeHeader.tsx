
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, FileUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AttendeeHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddDialog: () => void;
  onOpenImportDialog: () => void;
}

const AttendeeHeader = ({
  searchQuery,
  setSearchQuery,
  onOpenAddDialog,
  onOpenImportDialog
}: AttendeeHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Women Attendees</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            SDA Women's Ministry Camp Meeting
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <Button 
            variant="outline" 
            className="rounded-md flex-1 sm:flex-auto" 
            onClick={onOpenImportDialog}
            size={isMobile ? "sm" : "default"}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button 
            className="rounded-md flex-1 sm:flex-auto" 
            onClick={onOpenAddDialog}
            size={isMobile ? "sm" : "default"}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Attendee
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            className="pl-9 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default AttendeeHeader;
