
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Allocation } from './AllocationCard';
import { Building, Calendar, FileText, Mail, MapPin, Phone, Trash2, UserRound, Users } from 'lucide-react';
import { format } from 'date-fns';

interface AllocationDetailsDialogProps {
  allocation: Allocation | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (allocationId: string) => void;
  onEdit: (allocation: Allocation) => void;
}

const AllocationDetailsDialog = ({
  allocation,
  isOpen,
  onOpenChange,
  onDelete,
  onEdit
}: AllocationDetailsDialogProps) => {
  if (!allocation) return null;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };
  
  const handleDelete = () => {
    onDelete(allocation.id);
    onOpenChange(false);
  };
  
  const handleEdit = () => {
    onEdit(allocation);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Allocation Details</DialogTitle>
          <DialogDescription>
            View details about this room allocation
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-6 transition-all duration-500 ease-in-out">
            {/* Date information */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Calendar className="h-4 w-4" />
              <span>Assigned on {formatDate(allocation.dateAssigned)}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Person information */}
              <div className="space-y-4 transition-all duration-500 ease-in-out">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-primary" />
                  Person Information
                </h3>
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg transition-all duration-500 ease-in-out hover:bg-muted/70">
                  <Avatar className="h-16 w-16 border-2 border-primary/20 transition-all duration-500 ease-in-out">
                    <AvatarImage src={allocation.person.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(allocation.person.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-semibold text-lg">{allocation.person.name}</h4>
                    {allocation.person.department && (
                      <p className="text-muted-foreground">{allocation.person.department}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {allocation.person.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{allocation.person.email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Room information */}
              <div className="space-y-4 transition-all duration-500 ease-in-out">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Room Information
                </h3>
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg transition-all duration-500 ease-in-out hover:bg-muted/70">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 transition-all duration-500 ease-in-out">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg">{allocation.room.name}</h4>
                    {allocation.room.building && (
                      <p className="text-muted-foreground">
                        {allocation.room.building}
                        {allocation.room.floor && `, Floor ${allocation.room.floor}`}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{allocation.room.occupied}</span>/{allocation.room.capacity} Occupied
                    </span>
                  </div>
                  
                  {allocation.room.description && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                      <span>{allocation.room.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="mt-4 transition-all duration-500 ease-in-out">
            <div className="border rounded-lg p-4 min-h-[200px] transition-all duration-500 ease-in-out hover:border-primary/20">
              {allocation.notes ? (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground whitespace-pre-wrap">{allocation.notes}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No notes for this allocation</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="gap-2 sm:gap-0 mt-6">
          <Button 
            variant="secondary" 
            onClick={handleEdit}
            className="transition-all duration-500 ease-in-out hover:bg-secondary/80"
          >
            Edit Allocation
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="transition-all duration-500 ease-in-out hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllocationDetailsDialog;
