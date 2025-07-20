// script.js

let allProducts = [];
let selected = JSON.parse(localStorage.getItem('selected')) || [];

const grid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const showMore = document.getElementById('showMore');
const selectedList = document.getElementById('selectedList');
const generateBtn = document.getElementById('generateBtn');
const chatWindow = document.getElementById('chatWindow');
const followupInput = document.getElementById('followupInput');
const followupBtn = document.getElementById('followupBtn');

// 加载产品和初始化
fetch('products.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderGrid(allProducts);
    renderSelected();
    populateCategories();
  });

function populateCategories() {
  const categories = ['全部', ...new Set(allProducts.map(p => p.category))];
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat === '全部' ? 'All Categories' : cat;
    categoryFilter.appendChild(opt);
  });
}

function renderGrid(list) {
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card' + (selected.includes(p.id) ? ' selected' : '');
    card.innerHTML = `
      <img src="\${p.image}" alt="\${p.name}" />
      <h3>\${p.name}</h3>
      <p>\${p.category}</p>
    `.replace(/\\$/g, '$');
    card.onclick = () => {
      toggleSelect(p.id);
      renderGrid(list);
      renderSelected();
    };
    grid.appendChild(card);
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
      renderGrid(filteredProducts());
      renderSelected();
    };
    selectedList.appendChild(li);
  });
}

function filteredProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  return allProducts.filter(p =>
    (category === '全部' || p.category === category) &&
    p.name.toLowerCase().includes(keyword)
  );
}

searchInput.addEventListener('input', () => renderGrid(filteredProducts()));
categoryFilter.addEventListener('change', () => renderGrid(filteredProducts()));
showMore.addEventListener('click', e => { e.preventDefault(); renderGrid(allProducts); });

// TODO: 绑定 generateBtn 和 followupBtn 的 AI 调用逻辑
