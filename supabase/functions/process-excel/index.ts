
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Check for the API key under multiple possible names
const DEFAULT_MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY') || 
                               Deno.env.get('abRrGujIo1C3N08bJCA4F8Du9pQn5tOM');

// Log for debugging - will be visible in the function logs
console.log("API key availability check:", DEFAULT_MISTRAL_API_KEY ? "Key is set" : "Key is NOT set");
if (DEFAULT_MISTRAL_API_KEY) {
  console.log("API key prefix (for security):", DEFAULT_MISTRAL_API_KEY.substring(0, 4) + "...");
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://tvmgnpiqerbxegroqczt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is a test connection request
    const contentType = req.headers.get('content-type') || '';
    let userProvidedApiKey = null;
    
    if (contentType.includes('application/json')) {
      const jsonData = await req.json();
      
      if (jsonData.action === 'test_connection') {
        // Use user-provided API key if available
        userProvidedApiKey = jsonData.apiKey || null;
        return await handleTestConnection(userProvidedApiKey);
      }
    } else if (contentType.includes('multipart/form-data')) {
      // Extract form data for file upload
      const formData = await req.formData();
      userProvidedApiKey = formData.get('apiKey')?.toString() || null;
      const file = formData.get('file');
      const useAI = formData.get('useAI')?.toString().toLowerCase() === 'true';
      
      console.log(`Processing file with AI: ${useAI}`);
      
      if (!file || !(file instanceof File)) {
        return new Response(
          JSON.stringify({ error: 'No file provided or invalid file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Save import record
      const { data: importRecord, error: importError } = await supabase
        .from('file_imports')
        .insert({
          filename: file.name,
          status: 'processing',
        })
        .select()
        .single();

      if (importError) {
        console.error('Error creating import record:', importError);
        return new Response(
          JSON.stringify({ error: 'Failed to create import record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Process Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Processing ${rawData.length} rows from Excel file`);

      if (rawData.length === 0) {
        await updateImportStatus(supabase, importRecord.id, 'failed', 'No data found in Excel file');
        return new Response(
          JSON.stringify({ error: 'No data found in Excel file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Process data - with or without AI based on the flag
      let processedData;
      if (useAI) {
        processedData = await processWithMistralAI(rawData, userProvidedApiKey);
      } else {
        // Process without AI - use the basic extraction logic
        processedData = rawData.map(row => ({
          name: extractFieldValue(row, ['name', 'Name', 'full name', 'Full Name']),
          email: extractFieldValue(row, ['email', 'Email', 'email address', 'Email Address'])?.toLowerCase(),
          phone: extractFieldValue(row, ['phone', 'Phone', 'phone number', 'Phone Number', 'contact', 'Contact']),
          department: extractFieldValue(row, ['department', 'Department', 'dept', 'Dept']),
          home_church: extractFieldValue(row, ['church', 'Church', 'home church', 'Home Church']),
          special_needs: extractFieldValue(row, ['special needs', 'Special Needs', 'requirements', 'Requirements'])
        }));
      }
      
      let successCount = 0;
      let failureCount = 0;

      // Insert processed data into database
      for (const person of processedData) {
        const { error: insertError } = await supabase
          .from('women_attendees')
          .insert({
            name: person.name,
            email: person.email,
            phone: person.phone,
            department: person.department,
            home_church: person.home_church,
            special_needs: person.special_needs,
            import_source: file.name,
            imported_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error inserting person:', insertError);
          failureCount++;
        } else {
          successCount++;
        }
      }

      // Update import status
      await updateImportStatus(
        supabase, 
        importRecord.id, 
        failureCount > 0 ? 'completed_with_errors' : 'completed',
        null,
        successCount,
        failureCount
      );

      return new Response(
        JSON.stringify({ 
          message: 'File processed successfully', 
          processed: successCount,
          failed: failureCount,
          importId: importRecord.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid request format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleTestConnection(userProvidedApiKey = null) {
  console.log('Testing Mistral AI API connection');
  
  // Use user-provided API key if available, otherwise use the default
  const apiKey = userProvidedApiKey || DEFAULT_MISTRAL_API_KEY;
  
  if (!apiKey) {
    console.error('No Mistral API key available (neither default nor user-provided)');
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'API key not configured - please add MISTRAL_API_KEY to your Supabase secrets or provide a key manually'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Log a portion of the key for debugging (keeping most of it hidden)
    console.log('Using API key with prefix:', apiKey.substring(0, 4) + "...");
    
    // Make a simple request to Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-tiny',  // Using a smaller model for testing
        messages: [
          { role: 'user', content: 'Hello, is this connection working?' }
        ],
        temperature: 0.2,
        max_tokens: 5  // Minimal response for testing
      })
    });
    
    console.log('Mistral API test response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mistral API test error:', errorData);
      
      // Try to parse the error response
      let errorMessage = `API returned error ${response.status}`;
      try {
        const parsedError = JSON.parse(errorData);
        errorMessage += `: ${JSON.stringify(parsedError)}`;
      } catch {
        errorMessage += `: ${errorData}`;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: errorMessage
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    await response.json(); // Just to verify we can parse the response
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully connected to Mistral AI API'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error testing Mistral API connection:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: `Connection error: ${error.message}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function updateImportStatus(supabase, importId, status, errorMessage = null, processed = 0, failed = 0) {
  const updateData = {
    status,
    completed_at: new Date().toISOString(),
  };
  
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }
  
  if (processed > 0) {
    updateData.records_processed = processed;
  }
  
  if (failed > 0) {
    updateData.records_failed = failed;
  }

  const { error } = await supabase
    .from('file_imports')
    .update(updateData)
    .eq('id', importId);

  if (error) {
    console.error('Error updating import status:', error);
  }
}

async function processWithMistralAI(rawData, userProvidedApiKey = null) {
  console.log('Processing data with Mistral AI');
  
  // Use user-provided API key if available, otherwise use the default
  const apiKey = userProvidedApiKey || DEFAULT_MISTRAL_API_KEY;
  
  if (!apiKey) {
    console.error('No Mistral API key available (neither default nor user-provided)');
    // Fallback to basic processing
    return rawData.map(row => ({
      name: extractFieldValue(row, ['name', 'Name', 'full name', 'Full Name']),
      email: extractFieldValue(row, ['email', 'Email', 'email address', 'Email Address'])?.toLowerCase(),
      phone: extractFieldValue(row, ['phone', 'Phone', 'phone number', 'Phone Number', 'contact', 'Contact']),
      department: extractFieldValue(row, ['department', 'Department', 'dept', 'Dept']),
      home_church: extractFieldValue(row, ['church', 'Church', 'home church', 'Home Church']),
      special_needs: extractFieldValue(row, ['special needs', 'Special Needs', 'requirements', 'Requirements'])
    }));
  }
  
  // Prepare the prompt for Mistral
  const sampleData = JSON.stringify(rawData.slice(0, 5), null, 2);
  const prompt = `
I have an Excel file with attendee data for a women's ministry event. Please help me normalize and clean this data.
The raw data looks like this:
${sampleData}

I need you to transform this into a standardized format with the following fields:
- name: Full name, properly capitalized
- email: Email address (lowercase)
- phone: Phone number in standard format
- department: Department name if available
- home_church: Church name if available
- special_needs: Any special needs or requirements

Please process all ${rawData.length} records and return the normalized data as a JSON array.
`;

  try {
    console.log('Sending request to Mistral API with key prefix:', apiKey.substring(0, 4) + "...");
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-tiny',  // Use a smaller model to save cost for data processing
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      })
    });

    console.log('Mistral API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', errorText);
      throw new Error(`Mistral API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Mistral API response received');
    
    const aiResponse = result.choices[0].message.content;
    
    // Extract JSON from AI response
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      aiResponse.match(/\[\n?\s*{[\s\S]*}\n?\]/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const processedData = JSON.parse(jsonStr);
        console.log(`Successfully processed ${processedData.length} records with Mistral AI`);
        return processedData;
      } catch (parseError) {
        console.error('Error parsing JSON from AI response:', parseError);
        throw new Error('Failed to parse structured data from AI response');
      }
    } else {
      // Fallback to basic processing if AI doesn't return proper JSON
      console.warn('AI did not return properly formatted JSON, using basic processing');
      return rawData.map(row => ({
        name: extractFieldValue(row, ['name', 'Name', 'full name', 'Full Name']),
        email: extractFieldValue(row, ['email', 'Email', 'email address', 'Email Address'])?.toLowerCase(),
        phone: extractFieldValue(row, ['phone', 'Phone', 'phone number', 'Phone Number', 'contact', 'Contact']),
        department: extractFieldValue(row, ['department', 'Department', 'dept', 'Dept']),
        home_church: extractFieldValue(row, ['church', 'Church', 'home church', 'Home Church']),
        special_needs: extractFieldValue(row, ['special needs', 'Special Needs', 'requirements', 'Requirements'])
      }));
    }
  } catch (error) {
    console.error('Error processing with Mistral AI:', error);
    // Fallback to basic processing
    return rawData.map(row => ({
      name: extractFieldValue(row, ['name', 'Name', 'full name', 'Full Name']),
      email: extractFieldValue(row, ['email', 'Email', 'email address', 'Email Address'])?.toLowerCase(),
      phone: extractFieldValue(row, ['phone', 'Phone', 'phone number', 'Phone Number', 'contact', 'Contact']),
      department: extractFieldValue(row, ['department', 'Department', 'dept', 'Dept']),
      home_church: extractFieldValue(row, ['church', 'Church', 'home church', 'Home Church']),
      special_needs: extractFieldValue(row, ['special needs', 'Special Needs', 'requirements', 'Requirements'])
    }));
  }
}

function extractFieldValue(row, possibleFields) {
  for (const field of possibleFields) {
    if (row[field] !== undefined) {
      return row[field];
    }
  }
  return null;
}
