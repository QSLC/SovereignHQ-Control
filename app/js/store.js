// Store View — product catalog

let allProducts = [];

async function loadStore() {
  try {
    const { data, error } = await DB.getProducts();
    if (error) throw error;
    allProducts = data || [];
    renderProducts(allProducts);
  } catch (e) {
    console.error('Store load error:', e);
    document.getElementById('productGrid').innerHTML = '<div class="empty-state">Unable to load products. Check Supabase config.</div>';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="empty-state">No products available yet</div>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="product-card" onclick="handleProductClick('${p.id}')">
      ${p.cover_image_url 
        ? `<img src="${p.cover_image_url}" class="product-image" alt="${p.title}">` 
        : `<div class="product-image" style="display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:40px;">📄</div>`}
      <div class="product-info">
        <div class="product-title">${p.title}</div>
        <div class="product-price">${formatMoney(p.price_cents)}</div>
        <div class="product-cat">${p.category}</div>
      </div>
    </div>
  `).join('');
}

function handleProductClick(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  
  if (!currentUser) {
    alert('Sign in to purchase items.');
    document.getElementById('loginBtn').click();
    return;
  }

  purchaseProduct(product);
}

// Admin: product management
async function loadAdminProducts() {
  try {
    const { data, error } = await DB.getAllProducts();
    if (error) throw error;
    const list = document.getElementById('adminProductList');
    if (!data || data.length === 0) {
      list.innerHTML = '<div class="empty-state">No products yet. Add one above.</div>';
      return;
    }
    list.innerHTML = data.map(p => `
      <div class="admin-product-item">
        <div>
          <div style="font-weight:600">${p.title}</div>
          <div style="font-size:12px;color:var(--text-dim)">${p.category} — ${formatMoney(p.price_cents)} — ${p.is_published ? 'Published' : 'Draft'}</div>
        </div>
        <button class="btn btn-sm" onclick="togglePublish('${p.id}', ${!p.is_published})">${p.is_published ? 'Unpublish' : 'Publish'}</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Admin products load error:', e);
  }
}

async function togglePublish(id, publish) {
  try {
    await DB.updateProduct(id, { is_published: publish });
    loadAdminProducts();
  } catch (e) { console.error('Toggle publish error:', e); }
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const data = {
    title: document.getElementById('productTitle').value,
    description: document.getElementById('productDesc').value,
    category: document.getElementById('productCategory').value,
    price_cents: parseInt(document.getElementById('productPrice').value),
    cover_image_url: document.getElementById('productImage').value || null,
    is_published: true
  };
  try {
    await DB.createProduct(data);
    document.getElementById('productForm').reset();
    loadAdminProducts();
    loadStore();
    alert('Product published!');
  } catch (e) {
    alert('Error creating product: ' + e.message);
  }
}
