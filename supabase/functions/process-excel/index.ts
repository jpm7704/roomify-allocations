
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
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

      console.log(`Processing ${rawData.length} rows from Excel file`);

      if (rawData.length <= 1) { // Account for header row
        await updateImportStatus(supabase, importRecord.id, 'failed', 'No data found in Excel file');
        return new Response(
          JSON.stringify({ error: 'No data found in Excel file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract header row to identify column positions
      const headerRow = rawData[0];
      console.log("Header row:", JSON.stringify(headerRow));

      // Find column indices
      const columnMap = {};
      Object.keys(headerRow).forEach(key => {
        const value = String(headerRow[key]).trim();
        columnMap[value] = key;
      });

      console.log("Column mapping:", JSON.stringify(columnMap));

      // Skip header row for processing
      const dataRows = rawData.slice(1);
      let successCount = 0;
      let failureCount = 0;
      
      for (const row of dataRows) {
        // Extract values using column mapping
        const number = columnMap['No.'] ? row[columnMap['No.']] : null;
        const firstName = columnMap['Name'] ? row[columnMap['Name']] : null;
        const surname = columnMap['Surname'] ? row[columnMap['Surname']] : null;
        const roomPref = columnMap['Room Pref'] ? row[columnMap['Room Pref']] : null;
        const dietary = columnMap['Dietary'] ? row[columnMap['Dietary']] : null;
        const paid = columnMap['Paid'] ? row[columnMap['Paid']] : null;

        console.log(`Row data for ${number}:`, JSON.stringify({ firstName, surname, roomPref, dietary, paid }));
        
        // Create full name - ensure we have at least one name component
        let fullName = null;
        if (firstName && surname) {
          fullName = `${firstName} ${surname}`.trim();
        } else if (firstName) {
          fullName = String(firstName).trim();
        } else if (surname) {
          fullName = String(surname).trim();
        }
        
        if (!fullName) {
          console.error("Missing required name field in row:", JSON.stringify(row));
          failureCount++;
          continue;
        }
        
        const person = {
          name: fullName,
          special_needs: dietary ? String(dietary) : '',
          department: roomPref ? String(roomPref) : '',
          home_church: paid === 'Yes' ? 'Paid' : 'Not Paid',
          import_source: file.name,
          imported_at: new Date().toISOString(),
        };
        
        console.log(`Inserting person: ${fullName}`, JSON.stringify(person));
        
        // Insert person record
        const { error: insertError } = await supabase
          .from('women_attendees')
          .insert(person);

        if (insertError) {
          console.error(`Error inserting person ${fullName}:`, insertError);
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
