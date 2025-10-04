// Deno edge function for Google News search

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

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!apiKey || !searchEngineId) {
      console.error('Google API credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Google API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching Google News for keyword: ${keyword}`);

    // Google Custom Search API for news
    const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(keyword + ' news')}&num=10`;
    
    const googleResponse = await fetch(googleUrl);

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error('Google API error:', googleResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Google API error', 
          details: errorText,
          status: googleResponse.status 
        }),
        { status: googleResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await googleResponse.json();
    console.log('Google API response:', JSON.stringify(data, null, 2));

    // Transform the response to a simpler format
    const results = data.items?.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      source: 'Google News',
      date: new Date().toISOString(),
    })) || [];

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-google-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
