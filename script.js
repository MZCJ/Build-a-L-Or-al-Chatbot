// Load products and initialize UI
let allProducts = [];
let selected = JSON.parse(localStorage.getItem('selected')) || [];
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const productGrid = document.getElementById('productGrid');
const selectedList = document.getElementById('selectedList');

fetch('products.json')
  .then(r => r.json())
  .then(data => {
    allProducts = data;
    populateCategories();
    renderGrid(allProducts);
    renderSelected();
  });

function populateCategories() {
  const cats = ['All', ...new Set(allProducts.map(p => p.category))];
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

searchInput.addEventListener('input', () => {
  filterAndRender();
});
categoryFilter.addEventListener('change', () => {
  filterAndRender();
});

function filterAndRender() {
  const q = searchInput.value.toLowerCase();
  const cat = categoryFilter.value;
  const filtered = allProducts.filter(p =>
    (p.name.toLowerCase().includes(q)) &&
    (cat === 'All' || p.category === cat)
  );
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
    card.onclick = () => {
      toggleSelect(p.id);
      renderGrid(list);
      renderSelected();
    };
    productGrid.appendChild(card);
  });
}

function toggleSelect(id) {
  if (selected.includes(id)) selected = selected.filter(x => x !== id);
  else selected.push(id);
  localStorage.setItem('selected', JSON.stringify(selected));
}

function renderSelected() {
  selectedList.innerHTML = '';
  selected.forEach(id => {
    const p = allProducts.find(x => x.id === id);
    const li = document.createElement('li');
    li.textContent = p.name;
    li.onclick = () => {
      toggleSelect(id);
      renderGrid(allProducts);
      renderSelected();
    };
    selectedList.appendChild(li);
  });
}

// Generate Routine
const generateBtn = document.getElementById('generateBtn');
const chatWindow = document.getElementById('chatWindow');
const followupInput = document.getElementById('followupInput');
const followupBtn = document.getElementById('followupBtn');
let messages = [];

generateBtn.onclick = async () => {
  if (selected.length === 0) return alert('Please select products first.');
  const selectedInfo = selected.map(id => {
    const { name, brand, category, description } = allProducts.find(x => x.id === id);
    return { name, brand, category, description };
  });
  messages = [
    { role: 'system', content: 'You are a L’Oréal expert. Create a routine using these products only.' },
    { role: 'user', content: `Please create a skincare routine for me using these products: ${JSON.stringify(selectedInfo)}` }
  ];
  chatWindow.innerHTML = '';
  await callWorker(messages);
};

followupBtn.onclick = async () => {
  const q = followupInput.value.trim();
  if (!q) return;
  messages.push({ role: 'user', content: q });
  followupInput.value = '';
  await callWorker(messages);
};

async function callWorker(msgs) {
  chatWindow.innerHTML = '<p>Loading…</p>';
  try {
    const res = await fetch(WORKER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs })
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'No response.';
    messages.push({ role: 'assistant', content: reply });
    displayChat();
  } catch (e) {
    console.error(e);
    chatWindow.innerHTML = '<p>Error fetching response.</p>';
  }
}

function displayChat() {
  chatWindow.innerHTML = '';
  messages.forEach(m => {
    const p = document.createElement('p');
    p.textContent = m.content;
    chatWindow.appendChild(p);
  });
}
