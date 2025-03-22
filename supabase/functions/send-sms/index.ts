
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY');
const username = Deno.env.get('AFRICAS_TALKING_USERNAME');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  to: string | string[];
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!apiKey || !username) {
      throw new Error("Africa's Talking credentials not configured");
    }

    const { to, message }: SMSRequest = await req.json();
    console.log(`Sending SMS to ${Array.isArray(to) ? to.join(', ') : to}`);

    const recipients = Array.isArray(to) ? to.join(',') : to;

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey,
      },
      body: new URLSearchParams({
        'username': username,
        'to': recipients,
        'message': message,
      }),
    });

    const data = await response.json();
    console.log("Africa's Talking API response:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
