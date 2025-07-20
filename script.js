let allProducts = [], displayed = [], selected = [];
const grid = document.getElementById('productGrid');
const catFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const selectedList = document.getElementById('selectedList');
const generateBtn = document.getElementById('generateBtn');
const followupInput = document.getElementById('followupInput');
const followupBtn = document.getElementById('followupBtn');
const chatWindow = document.getElementById('chatWindow');

async function init() {
  const res = await fetch('products.json');
  allProducts = await res.json();
  displayed = allProducts;
  populateCategories();
  renderGrid(displayed);
}
function populateCategories() {
  const cats = ['All', ...new Set(allProducts.map(p => p.category))];
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    catFilter.appendChild(opt);
  });
}
function renderGrid(list) {
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card' + (selected.includes(p.id) ? ' selected' : '');
    card.innerHTML = `<img src="${p.image}" alt="${p.name}"><h3>${p.name}</h3><p>${p.category}</p>`;
    card.onclick = () => {
      toggleSelect(p.id);
      renderGrid(displayed);
      renderSelected();
    };
    grid.appendChild(card);
  });
}
function toggleSelect(id) {
  if (selected.includes(id)) selected = selected.filter(x => x !== id);
  else selected.push(id);
}
function renderSelected() {
  selectedList.innerHTML = '';
  selected.forEach(id => {
    const p = allProducts.find(x => x.id === id);
    const li = document.createElement('li');
    li.textContent = p.name;
    li.onclick = () => { toggleSelect(p.id); renderGrid(displayed); renderSelected(); };
    selectedList.appendChild(li);
  });
}
searchInput.oninput = () => {
  const term = searchInput.value.toLowerCase();
  displayed = allProducts.filter(p => p.name.toLowerCase().includes(term));
  applyFilters();
};
catFilter.onchange = () => applyFilters();
function applyFilters() {
  const c = catFilter.value;
  displayed = allProducts.filter(p => (c === 'All' || p.category === c)
    && p.name.toLowerCase().includes(searchInput.value.toLowerCase()));
  renderGrid(displayed);
}
generateBtn.onclick = () => {
  if (!selected.length) return alert('Please select products first.');
  const info = selected.map(id => {
    const {name, brand, category, description} = allProducts.find(x => x.id === id);
    return {name, brand, category, description};
  });
  sendMessage('system', 'You are a L’Oréal expert. Create a skincare routine based on products: ' + JSON.stringify(info));
  sendMessage('user', 'Create a morning routine.');
};
followupBtn.onclick = () => {
  const q = followupInput.value.trim();
  if (!q) return;
  sendMessage('user', q);
  followupInput.value = '';
};
let messages = [];
async function sendMessage(role, content) {
  messages.push({role, content});
  if (role === 'user' || role === 'system') {
    const res = await fetch(WORKER_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({messages})
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'No response';
    messages.push({role:'assistant', content:reply});
    renderChat();
  }
}
function renderChat() {
  chatWindow.innerHTML = '';
  messages.forEach(m => {
    const div = document.createElement('div');
    div.className = m.role === 'assistant' ? 'bot-bubble' : 'user-bubble';
    div.textContent = m.content;
    chatWindow.appendChild(div);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
init();
