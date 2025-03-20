
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/components/PersonCard';

interface AttendeeFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (person: Person) => void;
  initialData?: Partial<{
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    homeChurch: string;
    specialNeeds: string;
  }>;
  mode: 'add' | 'edit';
}

const AttendeeForm = ({ isOpen, onOpenChange, onSuccess, initialData, mode }: AttendeeFormProps) => {
  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      department: initialData?.department || '',
      homeChurch: initialData?.homeChurch || 'Harare City Centre Church',
      specialNeeds: initialData?.specialNeeds || ''
    }
  });

  const handleSubmit = async () => {
    try {
      const values = form.getValues();
      
      if (mode === 'add') {
        const { data, error } = await supabase
          .from('women_attendees')
          .insert({
            name: values.name,
            email: values.email,
            phone: values.phone,
            department: values.department,
            home_church: values.homeChurch,
            special_needs: values.specialNeeds
          })
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const newPerson: Person = {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email || '',
            department: data[0].department || data[0].home_church || '',
          };
          
          onSuccess(newPerson);
          toast.success("Attendee added successfully");
          onOpenChange(false);
          form.reset();
        }
      } else if (mode === 'edit' && initialData?.id) {
        // Implementation for edit mode would go here
        // This functionality wasn't implemented in the original code
        toast.info("Edit functionality to be implemented");
      }
    } catch (error) {
      console.error("Error adding/editing person:", error);
      toast.error(`Failed to ${mode === 'add' ? 'add' : 'edit'} attendee`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Attendee' : 'Edit Attendee'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <div className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department/Ministry (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Women's Ministry, Dorcas, etc." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="homeChurch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Church</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Needs (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any special requirements" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{mode === 'add' ? 'Save Attendee' : 'Update Attendee'}</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendeeForm;
