// Deno edge function for Twitter search

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

    const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
    if (!bearerToken) {
      console.error('Twitter Bearer Token not configured');
      return new Response(
        JSON.stringify({ error: 'Twitter API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching Twitter for keyword: ${keyword}`);

    // Twitter API v2 recent search endpoint
    const twitterUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(keyword)}&max_results=10&tweet.fields=created_at,author_id,public_metrics&expansions=author_id&user.fields=username,name`;
    
    const twitterResponse = await fetch(twitterUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!twitterResponse.ok) {
      const errorText = await twitterResponse.text();
      console.error('Twitter API error:', twitterResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Twitter API error', 
          details: errorText,
          status: twitterResponse.status 
        }),
        { status: twitterResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await twitterResponse.json();
    console.log('Twitter API response:', JSON.stringify(data, null, 2));

    // Transform the response to a simpler format
    const results = data.data?.map((tweet: any) => {
      const author = data.includes?.users?.find((u: any) => u.id === tweet.author_id);
      return {
        title: `@${author?.username || 'unknown'}`,
        snippet: tweet.text,
        link: `https://twitter.com/${author?.username}/status/${tweet.id}`,
        source: 'Twitter',
        date: tweet.created_at,
        author: author?.name || 'Unknown',
      };
    }) || [];

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-twitter function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
