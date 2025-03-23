
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSmsNotification = () => {
  const sendAllocationSms = async (
    phoneNumber: string, 
    personName: string, 
    roomName: string,
    roomType: string = 'Chalet'
  ) => {
    try {
      if (!phoneNumber) {
        console.log('No phone number provided, skipping SMS notification');
        return;
      }

      // Format the phone number to E.164 format if needed
      let formattedPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhoneNumber = `+${phoneNumber}`;
      }
      
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: formattedPhoneNumber,
          name: personName,
          roomName: roomName,
          roomType: roomType
        }
      });

      if (error) {
        console.error('Error sending SMS notification:', error);
        toast.error('Failed to send SMS notification');
        return false;
      }

      console.log('SMS notification sent successfully:', data);
      toast.success('Room allocation SMS notification sent');
      return true;
    } catch (error) {
      console.error('Exception sending SMS notification:', error);
      toast.error('Failed to send SMS notification');
      return false;
    }
  };

  return { sendAllocationSms };
};
