
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SendSMSParams {
  to: string | string[];
  message: string;
}

export const useSendSMS = () => {
  const [sending, setSending] = useState(false);

  const sendSMS = async ({ to, message }: SendSMSParams) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { to, message },
      });

      if (error) {
        throw error;
      }

      if (data.SMSMessageData?.Recipients?.[0]?.statusCode === '101') {
        toast.success('SMS sent successfully');
        return { success: true, data };
      } else {
        throw new Error(data.SMSMessageData?.Message || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error(
        error instanceof Error 
          ? `Failed to send SMS: ${error.message}` 
          : 'Failed to send SMS'
      );
      return { success: false, error };
    } finally {
      setSending(false);
    }
  };

  return { sendSMS, sending };
};
