// script.js
let allProducts = [];
let selected = JSON.parse(localStorage.getItem('selected')) || [];
let msgs = [];

const categoryFilter = document.getElementById('categoryFilter');
const productGrid = document.getElementById('productGrid');
const selectedList = document.getElementById('selectedList');
const generateBtn = document.getElementById('generateBtn');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const responseDiv = document.getElementById('response');

// Fetch products and init UI
fetch('products.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    initCategoryFilter();
    renderGrid(allProducts);
    updateSelectedUI();
    // initialize msgs with system prompt
    msgs = [{ role: 'system', content: '你是 L’Oréal 专家，只根据给定产品生成日常护理步骤，并回答后续相关问题。' }];
  });

function initCategoryFilter() {
  const cats = Array.from(new Set(allProducts.map(p => p.category)));
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
  categoryFilter.addEventListener('change', () => {
    const cat = categoryFilter.value;
    renderGrid(cat === '全部' ? allProducts : allProducts.filter(p => p.category === cat));
  });
}

function renderGrid(list) {
  productGrid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card' + (selected.includes(p.id) ? ' selected' : '');
    card.textContent = p.name;
    card.onclick = () => toggleSelect(p.id);
    productGrid.appendChild(card);
  });
}

function toggleSelect(id) {
  if (selected.includes(id)) {
    selected = selected.filter(x => x !== id);
  } else {
    selected.push(id);
  }
  localStorage.setItem('selected', JSON.stringify(selected));
  const current = categoryFilter.value === '全部' ? allProducts : allProducts.filter(p => p.category === categoryFilter.value);
  renderGrid(current);
  updateSelectedUI();
}

function updateSelectedUI() {
  selectedList.innerHTML = '';
  selected.forEach(id => {
    const p = allProducts.find(x => x.id === id);
    const li = document.createElement('li');
    li.textContent = p.name;
    li.onclick = () => toggleSelect(id);
    selectedList.appendChild(li);
  });
}

generateBtn.addEventListener('click', async () => {
  if (selected.length === 0) {
    alert('请先选产品');
    return;
  }
  const productsInfo = selected.map(id => {
    const { name, brand, category, description } = allProducts.find(x => x.id === id);
    return { name, brand, category, description };
  });
  msgs.push({ role: 'user', content: `请用以下产品${JSON.stringify(productsInfo)}生成一个护肤 routine：` });
  responseDiv.innerHTML = '<p>Loading…</p>';
  await callWorker();
});

chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const q = userInput.value.trim();
  if (!q) return;
  msgs.push({ role: 'user', content: q });
  displayMessage('user', q);
  userInput.value = '';
  await callWorker();
});

async function callWorker() {
  const res = await fetch(WORKER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: msgs }),
  });
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || '抱歉，未收到有效回复。';
  msgs.push({ role: 'assistant', content: reply });
  displayMessage('bot', reply);
}

function displayMessage(sender, text) {
  const bubble = document.createElement('div');
  bubble.className = sender === 'user' ? 'user-bubble' : 'bot-bubble';
  bubble.textContent = text;
  responseDiv.appendChild(bubble);
  responseDiv.scrollTop = responseDiv.scrollHeight;
}
