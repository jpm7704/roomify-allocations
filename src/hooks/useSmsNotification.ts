
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

export const useSmsNotification = () => {
  const [sendingStatus, setSendingStatus] = useState<Record<string, boolean>>({});

  const formatPhoneNumber = (phoneNumber: string): string => {
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
        toast.error(`No phone number available for ${personName}`);
        return false;
      }

      // Format the phone number
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      console.log(`Formatted phone number: ${formattedPhoneNumber} (original: ${phoneNumber})`);
      
      const toastId = `sms-${personId}`;
      toast.loading(`Sending SMS to ${personName}...`, { id: toastId });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('SMS request timed out after 10 seconds'));
        }, 10000); // 10 second timeout
      });
      
      // Create the actual SMS send promise
      const sendPromise = supabase.functions.invoke('send-sms', {
        body: {
          to: formattedPhoneNumber,
          name: personName,
          roomName: roomName,
          roomType: roomType
        }
      });
      
      // Race the promises
      const { data, error } = await Promise.race([
        sendPromise,
        timeoutPromise.then(() => {
          throw new Error('SMS request timed out after 10 seconds');
        })
      ]) as any;

      // Reset sending status regardless of outcome
      setSendingStatus(prev => ({ ...prev, [personId]: false }));

      if (error) {
        console.error('Error sending SMS notification:', error);
        toast.dismiss(toastId);
        if (error.message?.includes('timed out')) {
          toast.error(`SMS timed out. The server might be busy or there's a network issue.`);
        } else {
          toast.error(`Failed to send SMS to ${personName}`);
        }
        return false;
      }

      console.log('SMS notification response:', data);
      
      if (data?.error) {
        console.error('SMS service error:', data.error);
        toast.dismiss(toastId);
        toast.error(`SMS failed: ${data.error}`);
        return false;
      }
      
      toast.dismiss(toastId);
      toast.success(`SMS sent to ${personName}`);
      return true;
    } catch (error: any) {
      console.error('Exception sending SMS notification:', error);
      const toastId = `sms-${personId}`;
      toast.dismiss(toastId);
      
      if (error.message?.includes('timed out')) {
        toast.error(`SMS request timed out. The network might be slow or the server is busy.`);
      } else {
        toast.error(`Failed to send SMS to ${personName}`);
      }
      
      setSendingStatus(prev => ({ ...prev, [personId]: false }));
      return false;
    }
  };

  return { sendAllocationSms, sendingStatus };
};
