// ─────────────────────────────────────────────────────────
// Grdbase — Claude intake proxy
// Netlify Function: /.netlify/functions/claude-intake
//
// Set your API key in Netlify dashboard:
//   Site configuration → Environment variables
//   Key: ANTHROPIC_API_KEY
//   Value: your key from console.anthropic.com
// ─────────────────────────────────────────────────────────

exports.handler = async (event) => {

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // CORS — only allow requests from your own domain
  const allowedOrigins = ['https://grdbase.co.za', 'http://localhost:3000'];
  const origin = event.headers.origin || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const headers = {
    'Access-Control-Allow-Origin':  corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { messages, system } = body;

  if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'messages array required' }) };
  }

  // Rate limit: max 30 messages per session (abuse prevention)
  if (messages.length > 30) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Session too long — please refresh' }) };
  }

  // Call Anthropic API
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            process.env.ANTHROPIC_API_KEY,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error?.message || 'API error' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: data.content }),
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error — please try again' })
    };
  }
};
