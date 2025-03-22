
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/components/PersonCard';
import { AttendeeFormData } from '@/types/attendee';
import { useAuth } from '@/contexts/AuthContext';

export const useAttendeeForm = (
  initialData: Partial<AttendeeFormData & { id?: string }> = {},
  mode: 'add' | 'edit' = 'add',
  onSuccess: (person: Person) => void,
  onComplete: () => void
) => {
  const { user } = useAuth();
  
  const form = useForm<AttendeeFormData>({
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
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
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
            special_needs: values.specialNeeds,
            user_id: user.id
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
          onComplete();
          form.reset();
        }
      } else if (mode === 'edit' && initialData?.id) {
        const { data, error } = await supabase
          .from('women_attendees')
          .update({
            name: values.name,
            email: values.email,
            phone: values.phone,
            department: values.department,
            home_church: values.homeChurch,
            special_needs: values.specialNeeds
          })
          .eq('id', initialData.id)
          .eq('user_id', user.id)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const updatedPerson: Person = {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email || '',
            department: data[0].department || data[0].home_church || '',
            roomId: undefined,
            roomName: undefined,
          };
          
          onSuccess(updatedPerson);
          toast.success("Attendee updated successfully");
          onComplete();
        }
      }
    } catch (error) {
      console.error("Error adding/editing person:", error);
      toast.error(`Failed to ${mode === 'add' ? 'add' : 'edit'} attendee`);
    }
  };

  return {
    form,
    handleSubmit
  };
};
