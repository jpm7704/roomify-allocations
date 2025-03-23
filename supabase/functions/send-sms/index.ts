
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Vonage } from "npm:@vonage/server-sdk@^3.20.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, roomName, roomType } = await req.json();
    
    if (!to || !name || !roomName) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Received request to send SMS to: ${to} for ${name} allocated to ${roomName}`);

    // Get API credentials from environment variables
    const apiKey = Deno.env.get('VONAGE_API_KEY');
    const apiSecret = Deno.env.get('VONAGE_API_SECRET');
    
    if (!apiKey || !apiSecret) {
      console.error('Missing Vonage API credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vonage = new Vonage({
      apiKey,
      apiSecret
    });

    // Format the accommodation type for the message
    const accommodationType = roomType === 'Personal tent' ? 'tent' : 'room';
    
    // Create the message text
    const from = "SDA Camp";
    const text = `Hello ${name}, you have been allocated to ${roomName} ${accommodationType} for the SDA Women's Ministry Camp Meeting. Contact the camp office if you have any questions.`;
    
    console.log(`Sending SMS to ${to}: ${text}`);

    // Send the SMS
    const result = await new Promise((resolve, reject) => {
      vonage.sms.send({ to, from, text }, (err: any, responseData: any) => {
        if (err) {
          console.error('Error sending SMS:', err);
          reject(err);
        } else {
          console.log('SMS sent successfully:', responseData);
          
          // Check the messages array for delivery status
          if (responseData && responseData.messages && responseData.messages.length > 0) {
            const message = responseData.messages[0];
            console.log(`Message status: ${message.status}, error code: ${message['error-text'] || 'None'}`);
            
            if (message.status !== '0') {
              reject(new Error(`SMS delivery failed with status: ${message.status}, reason: ${message['error-text'] || 'Unknown'}`));
              return;
            }
          }
          
          resolve(responseData);
        }
      });
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-sms function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
