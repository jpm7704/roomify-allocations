
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
      console.error('Missing Vonage API credentials:', { apiKey: !!apiKey, apiSecret: !!apiSecret });
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing API credentials',
          details: 'Please ensure VONAGE_API_KEY and VONAGE_API_SECRET are properly set in the Edge Function secrets'
        }),
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
    
    console.log(`Attempting to send SMS to ${to}: ${text}`);

    // Send the SMS with a timeout
    const responseData = await Promise.race([
      new Promise((resolve, reject) => {
        vonage.sms.send({ to, from, text }, (err, data) => {
          if (err) {
            console.error('Vonage SMS error:', JSON.stringify(err));
            reject(err);
          } else {
            // Log the full response for debugging
            console.log('Vonage response:', JSON.stringify(data));
            
            if (data.messages && data.messages.length > 0) {
              const message = data.messages[0];
              
              if (message.status !== '0') {
                const errorMsg = `SMS delivery failed with status: ${message.status}, reason: ${message['error-text'] || 'Unknown'}`;
                console.error(errorMsg);
                reject(new Error(errorMsg));
                return;
              }
            }
            
            resolve(data);
          }
        });
      }),
      new Promise((_, reject) => {
        // 8 second timeout on the server side
        setTimeout(() => reject(new Error('SMS provider timeout')), 8000);
      })
    ]);

    console.log('SMS sent successfully');
    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-sms function:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    
    // Check if it's a timeout error
    const isTimeout = errorMessage.includes('timeout');
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        isTimeout: isTimeout,
        details: 'Please check the Edge Function logs for more information'
      }),
      { status: isTimeout ? 504 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
