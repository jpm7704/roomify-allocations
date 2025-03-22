
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://tvmgnpiqerbxegroqczt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract form data for file upload
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      
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

      // Log the first row to understand its structure
      console.log("Sample row from Excel:", JSON.stringify(rawData[0]));
      
      // Process data specifically for the known columns: No., Name, Surname, Room Pref, Dietary, and Paid
      let successCount = 0;
      let failureCount = 0;
      
      for (const row of rawData) {
        // Extract fields from the specific columns
        const number = row['No.'] || '';
        const firstName = row['Name'] || '';
        const surname = row['Surname'] || '';
        const roomPref = row['Room Pref'] || '';
        const dietary = row['Dietary'] || '';
        const paid = row['Paid'] || '';
        
        // Create full name from first name and surname
        const fullName = `${firstName} ${surname}`.trim();
        
        if (!fullName) {
          console.error("Missing required name field in row:", JSON.stringify(row));
          failureCount++;
          continue; // Skip this row if name is missing
        }
        
        const person = {
          name: fullName,
          // Using special_needs for dietary requirements
          special_needs: dietary,
          // Store room preference in department field temporarily
          department: roomPref,
          // Store payment status in home_church field temporarily 
          home_church: paid === 'Yes' ? 'Paid' : 'Not Paid',
          import_source: file.name,
          imported_at: new Date().toISOString(),
        };
        
        // Insert person record
        const { error: insertError } = await supabase
          .from('women_attendees')
          .insert(person);

        if (insertError) {
          console.error('Error inserting person:', insertError, "Person data:", JSON.stringify(person));
          failureCount++;
        } else {
          successCount++;
        }
      }

      // Update import status
      await updateImportStatus(
        supabase, 
        importRecord.id, 
        failureCount > 0 
          ? (successCount > 0 ? 'completed_with_errors' : 'failed') 
          : 'completed',
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
