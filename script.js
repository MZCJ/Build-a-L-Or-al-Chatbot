// script.js
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const productGrid = document.getElementById('productGrid');
const showMore = document.getElementById('showMore');
const generateBtn = document.getElementById('generateBtn');
const selectedList = document.getElementById('selectedList');
const chatWindow = document.getElementById('chatWindow');
const followupInput = document.getElementById('followupInput');
const followupBtn = document.getElementById('followupBtn');

let allProducts = [];
let selected = JSON.parse(localStorage.getItem('selected')) || [];
let messages = [];

// Load products
fetch('products.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    filterAndRender();
    renderSelected();
  });

// Search and filter
searchInput.addEventListener('input', filterAndRender);
categoryFilter.addEventListener('change', filterAndRender);

function filterAndRender() {
  const term = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const filtered = allProducts.filter(p => {
    const matchTerm = p.name.toLowerCase().includes(term);
    const matchCat = category === 'All' || p.category === category;
    return matchTerm && matchCat;
  });
  renderGrid(filtered);
}

function renderGrid(list) {
  productGrid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card' + (selected.includes(p.id) ? ' selected' : '');
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.category}</p>
    `;
    card.addEventListener('click', () => {
      toggleSelect(p.id);
      filterAndRender();
      renderSelected();
    });
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
}

function renderSelected() {
  selectedList.innerHTML = '';
  selected.forEach(id => {
    const p = allProducts.find(x => x.id === id);
    const li = document.createElement('li');
    li.textContent = p.name;
    li.addEventListener('click', () => {
      toggleSelect(id);
      filterAndRender();
      renderSelected();
    });
    selectedList.appendChild(li);
  });
}

// Generate routine
generateBtn.addEventListener('click', async () => {
  if (selected.length === 0) {
    alert('Please select at least one product.');
    return;
  }
  const productsInfo = selected.map(id => {
    const { name, category, description } = allProducts.find(x => x.id === id);
    return `${name} (${category}): ${description}`;
  }).join('\n');
  messages = [
    { role: 'system', content: "You are a L'Oréal expert. Based on the selected products, create a skincare routine." },
    { role: 'user', content: `Please create a skincare routine using these products:\n${productsInfo}` }
  ];
  chatWindow.innerHTML = '';
  displayMessage('bot', 'Loading…');
  const response = await callWorker(messages);
  chatWindow.innerHTML = '';
  displayMessage('bot', response);
});

// Follow-up questions
followupBtn.addEventListener('click', async () => {
  const q = followupInput.value.trim();
  if (!q) return;
  displayMessage('user', q);
  messages.push({ role: 'user', content: q });
  followupInput.value = '';
  displayMessage('bot', '…');
  const response = await callWorker(messages);
  const loading = chatWindow.querySelector('.msg.bot:last-child');
  if (loading) loading.remove();
  displayMessage('bot', response);
});

function displayMessage(sender, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + sender;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function callWorker(msgs) {
  const res = await fetch(WORKER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: msgs })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Error fetching response.';
}
