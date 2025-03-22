
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

    const text = new TextDecoder().decode(await file.arrayBuffer());
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ error: 'File must contain headers and at least one data row' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredColumns = ['name', 'room', 'dietary'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      await updateImportStatus(supabase, importRecord.id, 'failed', 
        `Missing required columns: ${missingColumns.join(', ')}`);
      return new Response(
        JSON.stringify({ 
          error: `Missing columns: ${missingColumns.join(', ')}`,
          requiredColumns
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]));
      
      if (!row.name) {
        failureCount++;
        continue;
      }

      try {
        const { error: insertError } = await supabase
          .from('women_attendees')
          .insert({
            name: row.name,
            department: row.room || '',
            special_needs: row.dietary || '',
            import_source: file.name
          });

        if (insertError) {
          console.error(`Error inserting row ${i}:`, insertError);
          failureCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        failureCount++;
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
        message: 'File processed',
        processed: successCount,
        failed: failureCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process file' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
