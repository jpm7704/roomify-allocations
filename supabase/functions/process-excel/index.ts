
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

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

      // Process CSV file
      console.log("Reading CSV file");
      const csvText = new TextDecoder().decode(await file.arrayBuffer());
      
      // Split CSV into lines and parse
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
      
      if (lines.length <= 1) { // Account for header row
        await updateImportStatus(supabase, importRecord.id, 'failed', 'No data found in CSV file');
        return new Response(
          JSON.stringify({ error: 'No data found in CSV file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Parse header row
      let headerRow = lines[0].split(',').map(header => header.trim());
      console.log("CSV headers:", headerRow);
      
      // Define expected column headers and their variations/aliases
      const requiredColumns = {
        "No.": ["No.", "No", "#", "Number", "ID"],
        "Name": ["Name", "First Name", "FirstName", "Given Name"],
        "Surname": ["Surname", "Last Name", "LastName", "Family Name"],
        "Room Pref": ["Room Pref", "Room", "Room Preference", "Accommodation", "Room Type"],
        "Dietary": ["Dietary", "Diet", "Dietary Requirements", "Food Requirements", "Special Needs"],
        "Paid": ["Paid", "Payment", "Payment Status", "Fee Paid", "Has Paid"]
      };
      
      // Check for each required column and find its index
      const columnIndices = {};
      const missingColumns = [];
      
      Object.keys(requiredColumns).forEach(requiredCol => {
        const aliases = requiredColumns[requiredCol];
        const foundIndex = headerRow.findIndex(header => 
          aliases.some(alias => header.toUpperCase() === alias.toUpperCase())
        );
        
        if (foundIndex >= 0) {
          columnIndices[requiredCol] = foundIndex;
        } else {
          missingColumns.push(requiredCol);
        }
      });
      
      console.log("Column indices:", columnIndices);
      
      if (missingColumns.length > 0) {
        const errorMessage = `Missing required columns: ${missingColumns.join(", ")}`;
        console.error(errorMessage);
        await updateImportStatus(supabase, importRecord.id, 'failed', errorMessage);
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            message: "Please ensure your CSV file has all the required columns. They can be named exactly as listed or use common variations.",
            requiredColumns: Object.keys(requiredColumns),
            possibleAliases: requiredColumns
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Process data rows (skip header)
      const dataRows = lines.slice(1);
      let successCount = 0;
      let failureCount = 0;
      
      for (const line of dataRows) {
        try {
          // Skip empty lines
          if (!line || line.trim() === '') {
            console.log("Skipping empty row");
            continue;
          }
          
          // Simple CSV parsing (doesn't handle quoted values with commas)
          const row = line.split(',').map(cell => cell.trim());
          
          // Extract values using column indices map
          const number = row[columnIndices["No."]] || '';
          const firstName = row[columnIndices["Name"]] || '';
          const surname = row[columnIndices["Surname"]] || '';
          const roomPref = row[columnIndices["Room Pref"]] || '';
          const dietary = row[columnIndices["Dietary"]] || '';
          const paid = row[columnIndices["Paid"]] || '';
          
          console.log(`Processing row: No=${number}, Name=${firstName}, Surname=${surname}, Room=${roomPref}, Dietary=${dietary}, Paid=${paid}`);
          
          // Validate required fields
          if (!firstName && !surname) {
            console.log("Missing both first name and surname for row:", line);
            failureCount++;
            continue;
          }
          
          // Create full name
          const fullName = [firstName, surname].filter(Boolean).join(' ').trim();
          
          // Prepare person data for insertion
          const person = {
            name: fullName,
            special_needs: dietary || '',
            department: roomPref || '',
            home_church: paid === 'Yes' || paid === 'yes' || paid === 'TRUE' || paid === 'true' || paid === '1' ? 'Paid' : 'Not Paid',
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
        } catch (rowError) {
          console.error("Error processing row:", rowError);
          failureCount++;
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
