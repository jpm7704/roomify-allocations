
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Record import start
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

    // Read the file content as text
    const content = await file.text();
    
    // Parse CSV content - handle both newline formats (\r\n and \n)
    const rows = content
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(row => row.trim())
      .filter(row => row.length > 0);
    
    if (rows.length < 2) {
      await updateImportStatus(supabase, importRecord.id, 'failed', 'File must contain a header row and at least one data row');
      return new Response(
        JSON.stringify({ error: 'File must contain a header row and at least one data row' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract headers and normalize them (trim, lowercase)
    const headers = parseCSVRow(rows[0]).map(h => h.trim().toLowerCase());
    
    // Log identified headers for debugging
    console.log('Identified headers:', headers);
    
    // Check for required columns
    const requiredColumns = ['name'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      await updateImportStatus(supabase, importRecord.id, 'failed', `Missing required columns: ${missingColumns.join(', ')}`);
      return new Response(
        JSON.stringify({ 
          error: `Missing required column: ${missingColumns.join(', ')}. At minimum, the CSV file must have a 'name' column.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the data rows
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // Start from row 1 (skip header)
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows
      
      // Parse row data
      const values = parseCSVRow(rows[i]);
      
      // Skip if values don't match headers length
      if (values.length !== headers.length) {
        console.error(`Row ${i+1} has ${values.length} columns, expected ${headers.length}`);
        failureCount++;
        errors.push(`Row ${i+1}: Column count mismatch`);
        continue;
      }

      // Create a record object from the row
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index].trim();
      });
      
      // Validate required name field
      if (!record.name) {
        console.error(`Row ${i+1} missing required name field`);
        failureCount++;
        errors.push(`Row ${i+1}: Missing name`);
        continue;
      }

      try {
        // Insert the record
        const { error: insertError } = await supabase
          .from('women_attendees')
          .insert({
            name: record.name,
            department: record.room || record.department || '',
            special_needs: record.dietary || record.special_needs || '',
            phone: record.phone || '',
            email: record.email || '',
            home_church: record.church || record.home_church || '',
            import_source: file.name
          });

        if (insertError) {
          console.error(`Error inserting row ${i+1}:`, insertError);
          failureCount++;
          errors.push(`Row ${i+1}: Database error`);
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing row ${i+1}:`, error);
        failureCount++;
        errors.push(`Row ${i+1}: ${error.message || 'Unknown error'}`);
      }
    }

    // Update import status
    const status = failureCount > 0 ? 'completed_with_errors' : 'completed';
    const errorMessage = errors.length > 0 ? errors.slice(0, 5).join('; ') + (errors.length > 5 ? ` and ${errors.length - 5} more errors` : '') : null;
    
    await updateImportStatus(
      supabase,
      importRecord.id,
      status,
      errorMessage,
      successCount,
      failureCount
    );

    return new Response(
      JSON.stringify({ 
        message: 'File processed',
        processed: successCount,
        failed: failureCount,
        errors: errors.length > 0 ? errors.slice(0, 5) : []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process file: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Parse a CSV row handling quoted values (which may contain commas)
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      // Add character to current field
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  return result;
}

async function updateImportStatus(supabase, importId, status, errorMessage = null, processed = 0, failed = 0) {
  const updateData = {
    status,
    completed_at: new Date().toISOString(),
    records_processed: processed,
    records_failed: failed
  };
  
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  await supabase
    .from('file_imports')
    .update(updateData)
    .eq('id', importId);
}
