import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDocument, GlobalWorkerOptions } from "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.mjs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Disable worker for serverless environment
GlobalWorkerOptions.workerSrc = '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cv_file_path } = await req.json();
    
    if (!cv_file_path) {
      return new Response(JSON.stringify({ error: 'No CV file path provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Parsing CV from path:', cv_file_path);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the PDF file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cvs')
      .download(cv_file_path);

    if (downloadError) {
      console.error('Error downloading CV:', downloadError);
      return new Response(JSON.stringify({ error: 'Failed to download CV file', details: downloadError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!fileData) {
      return new Response(JSON.stringify({ error: 'CV file not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Parse PDF using pdf.js
    let extractedText = '';
    
    try {
      const loadingTask = getDocument({ data: uint8Array });
      const pdfDoc = await loadingTask.promise;
      
      console.log(`PDF loaded. Number of pages: ${pdfDoc.numPages}`);
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        extractedText += `\n--- หน้า ${pageNum} ---\n${pageText}`;
      }
      
      // Clean up the text
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .trim();
        
    } catch (pdfError: any) {
      console.error('Error parsing PDF:', pdfError);
      
      // Fallback: try to extract basic info
      return new Response(JSON.stringify({ 
        error: 'Could not parse PDF content',
        details: pdfError.message,
        fallback: true,
        text: `[ไม่สามารถอ่านเนื้อหา PDF ได้ - ไฟล์อาจเป็นรูปภาพหรือมีการป้องกัน]`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Extracted ${extractedText.length} characters from CV`);

    return new Response(JSON.stringify({ 
      success: true,
      text: extractedText,
      length: extractedText.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Parse CV Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
