
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Allocation } from './AllocationCard';
import { Building, Calendar, FileText, Mail, MapPin, Phone, Trash2, UserRound, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

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
      <DialogContent className="max-w-md animate-scale-in bg-card/80 backdrop-blur-xl border-border/30 rounded-2xl p-0 overflow-hidden">
        <div className="bg-primary/10 p-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Room Allocation</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {allocation.person.name} • {allocation.room.name}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <Tabs defaultValue="details" className="w-full">
          <div className="px-5 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted/40 p-1 rounded-xl">
              <TabsTrigger value="details" className="rounded-lg text-sm">Details</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-lg text-sm">Notes</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="p-5 space-y-5 transition-all duration-300 ease-in-out">
            {/* Date information */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Assigned on {formatDate(allocation.dateAssigned)}</span>
            </div>
            
            {/* Person information */}
            <div className="space-y-4 transition-all duration-300 ease-in-out">
              <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-xl">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={allocation.person.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(allocation.person.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h4 className="font-semibold">{allocation.person.name}</h4>
                  {allocation.person.department && (
                    <p className="text-sm text-muted-foreground">{allocation.person.department}</p>
                  )}
                </div>
              </div>
              
              {allocation.person.email && (
                <div className="flex items-center gap-2 text-sm p-3 bg-muted/20 rounded-xl">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{allocation.person.email}</span>
                </div>
              )}
            </div>
            
            {/* Room information */}
            <div className="space-y-4 transition-all duration-300 ease-in-out pt-2">
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">{allocation.room.name}</h4>
                    {allocation.room.building && (
                      <p className="text-sm text-muted-foreground">
                        {allocation.room.building}
                        {allocation.room.floor && `, Floor ${allocation.room.floor}`}
                      </p>
                    )}
                  </div>
                </div>
                
                <Badge variant="peach" className="ml-auto">
                  {allocation.room.occupied}/{allocation.room.capacity}
                </Badge>
              </div>
              
              {allocation.room.description && (
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/20 rounded-xl">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{allocation.room.description}</span>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="px-5 pt-3 pb-5 transition-all duration-300 ease-in-out">
            <div className="border rounded-xl p-4 min-h-[150px] transition-all duration-300 ease-in-out hover:border-primary/20 bg-muted/10">
              {allocation.notes ? (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-foreground whitespace-pre-wrap">{allocation.notes}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[150px] text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No notes for this allocation</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="px-5 pb-5 pt-2 flex-row space-x-3">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            className="flex-1 rounded-xl h-10"
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="flex-1 rounded-xl h-10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllocationDetailsDialog;
