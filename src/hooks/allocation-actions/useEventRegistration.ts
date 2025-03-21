
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RegistrationFormData {
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  homeChurch: string;
  specialNeeds?: string;
  eventName: string;
}

export const useEventRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerAttendee = async (formData: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('women_attendees')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          home_church: formData.homeChurch,
          special_needs: formData.specialNeeds
        })
        .select();

      if (error) throw error;

      setIsSubmitting(false);
      return { success: true, data };
    } catch (error) {
      console.error("Error registering attendee:", error);
      setIsSubmitting(false);
      return { success: false, error };
    }
  };

  return {
    registerAttendee,
    isSubmitting
  };
};
