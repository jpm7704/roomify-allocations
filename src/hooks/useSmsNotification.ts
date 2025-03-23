
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSmsNotification = () => {
  const formatZimbabweanNumber = (phoneNumber: string): string => {
    // Remove any spaces, dashes, or other non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If the number starts with '0', replace it with the Zimbabwe country code '+263'
    if (cleaned.startsWith('0')) {
      cleaned = `+263${cleaned.substring(1)}`;
    } 
    // If the number doesn't have any international prefix, assume it's a Zimbabwe number
    else if (!cleaned.startsWith('+')) {
      cleaned = `+263${cleaned}`;
    }
    
    return cleaned;
  };

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

      // Format the phone number with Zimbabwe country code
      const formattedPhoneNumber = formatZimbabweanNumber(phoneNumber);
      console.log(`Formatted phone number: ${formattedPhoneNumber} (original: ${phoneNumber})`);
      
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
