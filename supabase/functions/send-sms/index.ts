
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Get API key from environment variables
    const apiKey = Deno.env.get('TEXTBELT_API_KEY') || 'textbelt';  // Default to 'textbelt' for testing
    
    if (!apiKey) {
      console.error('Missing TextBelt API key');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing API key',
          details: 'Please ensure TEXTBELT_API_KEY is properly set in the Edge Function secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the accommodation type for the message
    const accommodationType = roomType === 'Personal tent' ? 'tent' : 'room';
    
    // Create the message text
    const message = `Hello ${name}, you have been allocated to ${roomName} ${accommodationType} for the SDA Women's Ministry Camp Meeting. Contact the camp office if you have any questions.`;
    
    console.log(`Attempting to send SMS to ${to}: ${message}`);

    // Prepare the request body
    const formData = new FormData();
    formData.append('phone', to);
    formData.append('message', message);
    formData.append('key', apiKey);

    // Send the SMS using TextBelt API
    try {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('TextBelt response:', JSON.stringify(data));
      
      if (!data.success) {
        console.error('SMS delivery failed:', data.error || 'Unknown error');
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send SMS', 
            details: data.error || 'Unknown error' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Message sent successfully');
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('There was an error sending the messages.', err);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send SMS',
          details: err.message || 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in send-sms function:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Please check the Edge Function logs for more information'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
