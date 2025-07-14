// script.js
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const responseContainer = document.getElementById('response');

chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  responseContainer.textContent = 'Loading…';

  const payload = {
    messages: [
      { role: 'system', content: 'You are a helpful assistant that only answers questions related to L’Oréal products, routines, and beauty tips.' },
      { role: 'user', content: question }
    ]
  };

  try {
    const res = await fetch(WORKER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I didn't get a response.";
    responseContainer.textContent = reply;
  } catch (err) {
    console.error(err);
    responseContainer.textContent = 'Error fetching response.';
  }

  userInput.value = '';
});
