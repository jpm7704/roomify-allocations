
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

      // Process Excel file
      console.log("Reading Excel file");
      const arrayBuffer = await file.arrayBuffer();
      
      // Handle different Excel formats
      let workbook;
      try {
        workbook = XLSX.read(arrayBuffer, { type: 'array' });
      } catch (xlsxError) {
        console.error("XLSX parsing error:", xlsxError);
        await updateImportStatus(supabase, importRecord.id, 'failed', `Failed to parse Excel file: ${xlsxError.message}`);
        return new Response(
          JSON.stringify({ error: `Failed to parse Excel file: ${xlsxError.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verify we have at least one sheet
      if (!workbook.SheetNames.length) {
        await updateImportStatus(supabase, importRecord.id, 'failed', 'No sheets found in Excel file');
        return new Response(
          JSON.stringify({ error: 'No sheets found in Excel file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header: 1 to get an array with the first row as headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      
      console.log(`Raw data from Excel: ${jsonData.length} rows`);
      
      if (jsonData.length <= 1) { // Account for header row
        await updateImportStatus(supabase, importRecord.id, 'failed', 'No data found in Excel file');
        return new Response(
          JSON.stringify({ error: 'No data found in Excel file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract header row and check if required columns exist
      // This is a more flexible approach that normalizes the headers
      let headerRow = jsonData[0];
      console.log("Original headers:", headerRow);
      
      // Normalize headers - convert to string and trim whitespace
      headerRow = headerRow.map(h => String(h).trim());
      console.log("Normalized headers:", headerRow);
      
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
            message: "Please ensure your Excel file has all the required columns. They can be named exactly as listed or use common variations.",
            requiredColumns: Object.keys(requiredColumns),
            possibleAliases: requiredColumns
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Process data rows (skip header)
      const dataRows = jsonData.slice(1);
      let successCount = 0;
      let failureCount = 0;
      
      for (const row of dataRows) {
        try {
          // Skip empty rows
          if (!row || row.length === 0 || row.every(cell => cell === null || cell === undefined || cell === '')) {
            console.log("Skipping empty row");
            continue;
          }
          
          // Extract values using column indices map
          const number = row[columnIndices["No."]] !== undefined ? String(row[columnIndices["No."]]).trim() : '';
          const firstName = row[columnIndices["Name"]] !== undefined ? String(row[columnIndices["Name"]]).trim() : '';
          const surname = row[columnIndices["Surname"]] !== undefined ? String(row[columnIndices["Surname"]]).trim() : '';
          const roomPref = row[columnIndices["Room Pref"]] !== undefined ? String(row[columnIndices["Room Pref"]]).trim() : '';
          const dietary = row[columnIndices["Dietary"]] !== undefined ? String(row[columnIndices["Dietary"]]).trim() : '';
          const paid = row[columnIndices["Paid"]] !== undefined ? String(row[columnIndices["Paid"]]).trim() : '';
          
          console.log(`Processing row: No=${number}, Name=${firstName}, Surname=${surname}, Room=${roomPref}, Dietary=${dietary}, Paid=${paid}`);
          
          // Validate required fields
          if (!firstName && !surname) {
            console.log("Missing both first name and surname for row:", JSON.stringify(row));
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
