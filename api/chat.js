module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Anthropic expects system prompt separate from messages
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMsgs  = messages.filter(m => m.role !== 'system');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemMsg ? systemMsg.content : '',
        messages: chatMsgs
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ error: data.error });
    }

    // Normalise to OpenAI-style response so frontend works unchanged
    return res.status(200).json({
      choices: [{
        message: {
          content: data.content[0].text
        }
      }]
    });
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
};
