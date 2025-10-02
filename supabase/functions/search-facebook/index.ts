import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const keyword = url.searchParams.get('keyword');
    
    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('FACEBOOK_API_KEY');
    if (!accessToken) {
      console.error('Facebook API Key not configured');
      return new Response(
        JSON.stringify({ error: 'Facebook API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching Facebook for keyword: ${keyword}`);

    // Facebook Graph API - Search for public posts
    // Note: Facebook Graph API has limited search capabilities for public posts
    // This searches for pages that match the keyword
    const facebookUrl = `https://graph.facebook.com/v18.0/search?q=${encodeURIComponent(keyword)}&type=page&fields=id,name,about,link&limit=10&access_token=${accessToken}`;
    
    const facebookResponse = await fetch(facebookUrl);

    if (!facebookResponse.ok) {
      const errorText = await facebookResponse.text();
      console.error('Facebook API error:', facebookResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Facebook API error', 
          details: errorText,
          status: facebookResponse.status 
        }),
        { status: facebookResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await facebookResponse.json();
    console.log('Facebook API response:', JSON.stringify(data, null, 2));

    // Transform the response to a simpler format
    const results = data.data?.map((page: any) => ({
      title: page.name,
      snippet: page.about || 'No description available',
      link: page.link || `https://facebook.com/${page.id}`,
      source: 'Facebook',
      date: new Date().toISOString(),
    })) || [];

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-facebook function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
