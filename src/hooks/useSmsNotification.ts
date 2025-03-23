
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

export const useSmsNotification = () => {
  const [sendingStatus, setSendingStatus] = useState<Record<string, boolean>>({});

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
    roomType: string = 'Chalet',
    personId: string = 'unknown' // Adding personId to track sending status
  ) => {
    try {
      // Prevent multiple sends for the same person
      if (sendingStatus[personId]) {
        console.log('Already sending SMS to this person, skipping');
        return false;
      }

      // Set sending status for this person
      setSendingStatus(prev => ({ ...prev, [personId]: true }));
      
      if (!phoneNumber) {
        console.log('No phone number provided, skipping SMS notification');
        setSendingStatus(prev => ({ ...prev, [personId]: false }));
        return false;
      }

      // Format the phone number with Zimbabwe country code
      const formattedPhoneNumber = formatZimbabweanNumber(phoneNumber);
      console.log(`Formatted phone number: ${formattedPhoneNumber} (original: ${phoneNumber})`);
      
      toast.loading(`Sending SMS to ${personName}...`);
      
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: formattedPhoneNumber,
          name: personName,
          roomName: roomName,
          roomType: roomType
        }
      });

      // Reset sending status regardless of outcome
      setSendingStatus(prev => ({ ...prev, [personId]: false }));

      if (error) {
        console.error('Error sending SMS notification:', error);
        toast.dismiss();
        toast.error(`Failed to send SMS to ${personName}`);
        return false;
      }

      console.log('SMS notification response:', data);
      toast.dismiss();
      toast.success(`SMS sent to ${personName}`);
      return true;
    } catch (error) {
      console.error('Exception sending SMS notification:', error);
      toast.dismiss();
      toast.error(`Failed to send SMS to ${personName}`);
      setSendingStatus(prev => ({ ...prev, [personId]: false }));
      return false;
    }
  };

  return { sendAllocationSms, sendingStatus };
};
