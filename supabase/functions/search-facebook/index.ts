// Deno edge function for Facebook search

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

    // Facebook Graph API has very limited search capabilities
    // Public post search requires:
    // 1. Approved app with advanced permissions
    // 2. Page access tokens (not user tokens)
    // 3. Can only search within pages you manage
    // 
    // For news/general searches, Facebook doesn't provide a public search API
    // This function returns a note about the limitation
    
    console.log(`Note: Facebook Graph API doesn't support general public post search for keyword: ${keyword}`);

    // Return an informative empty result with explanation
    const results = [{
      title: "Facebook Search Limited",
      snippet: `Facebook's API doesn't support general public post searches. To search Facebook, you would need page-specific access or use their official website. Searched for: "${keyword}"`,
      link: `https://www.facebook.com/search/posts/?q=${encodeURIComponent(keyword)}`,
      source: 'Facebook',
      date: new Date().toISOString(),
    }];

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-facebook function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
