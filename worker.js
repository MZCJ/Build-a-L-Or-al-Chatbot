export default {
  async fetch(request, env) {
    const { messages } = await request.json();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages }),
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {'Content-Type':'application/json'},
    });
  }
};
