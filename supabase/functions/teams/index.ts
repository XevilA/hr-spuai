import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse query parameters
    const url = new URL(req.url);
    const department = url.searchParams.get('department');
    const activeOnly = url.searchParams.get('active') !== 'false'; // default true

    console.log(`Fetching team members - department: ${department}, activeOnly: ${activeOnly}`);

    // Build query
    let query = supabase
      .from('team_members')
      .select(`
        id,
        full_name,
        nickname,
        email,
        phone,
        photo_url,
        position,
        department,
        division,
        description,
        start_date,
        end_date,
        is_active,
        created_at
      `)
      .order('department', { ascending: true })
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    if (department) {
      query = query.eq('department', department);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Format response
    const response = {
      success: true,
      count: data?.length || 0,
      data: data?.map((member) => ({
        id: member.id,
        fullName: member.full_name,
        nickname: member.nickname,
        email: member.email,
        phone: member.phone,
        photoUrl: member.photo_url,
        position: member.position,
        department: member.department,
        division: member.division,
        description: member.description,
        duration: {
          startDate: member.start_date,
          endDate: member.end_date,
          isActive: member.is_active,
        },
        createdAt: member.created_at,
      })) || [],
      meta: {
        timestamp: new Date().toISOString(),
        filters: {
          department: department || 'all',
          activeOnly,
        },
      },
    };

    console.log(`Successfully fetched ${response.count} team members`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Error in teams API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        data: [],
        count: 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});