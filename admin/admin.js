(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const gate = $("#gate");
  const shell = $("#shell");
  const main = $("#main");
  const views = new Set(["dashboard", "products", "variantTypes", "variants", "categories", "reviews", "orders", "customers", "inquiries", "website", "sections", "settings"]);
  const readView = () => {
    const name = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    return views.has(name) ? name : "dashboard";
  };
  let data = null;
  let view = readView();
  let productQuery = "";
  let productCategory = "";
  let productShown = "all";
  let orderQuery = "";
  let orderStatus = "all";
  let orderPay = "all";
  let openOrder = "";
  let inquiryQuery = "";
  let inquiryStatus = "all";
  let typeQuery = "";
  let variantQuery = "";
  let variantTypeFilter = "all";
  let categoryQuery = "";
  let customerQuery = "";

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const money = (n) => "$" + Number(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const names = {
    products: "Product",
    categories: "Category",
    reviews: "Review",
    "variant-types": "Variant type",
    variants: "Variant",
    orders: "Order",
    customers: "Customer",
    inquiries: "Inquiry"
  };

  function notify(ok, title, text) {
    if (window.Swal) {
      Swal.fire({
        icon: ok ? "success" : "error",
        title,
        text: text || "",
        confirmButtonColor: "#1f6feb",
        timer: ok ? 1700 : undefined,
        timerProgressBar: !!ok,
        showConfirmButton: !ok
      });
      return;
    }
    if (!ok) window.alert([title, text].filter(Boolean).join("\n"));
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || "Request failed");
    return payload;
  }

  function showApp() {
    gate.hidden = true;
    shell.hidden = false;
  }

  async function load() {
    data = await api("/api/admin/data");
    render();
  }

  function render() {
    if (!data) return;
    if (!views.has(view)) view = "dashboard";
    const hash = "#" + view;
    if (location.hash !== hash) history.replaceState(null, "", hash);
    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.view === view);
    });
    const screens = { dashboard, products, variantTypes, variants, categories, reviews, orders, customers, inquiries, website, sections: pageSections, settings };
    main.innerHTML = screens[view]();
    bind();
  }

  function dashboard() {
    const featured = data.products.filter((item) => item.featured).length;
    const latest = data.inquiries.slice(0, 4).map((item) => {
      const initial = esc(String(item.name || "?").trim().charAt(0).toUpperCase());
      const when = esc(String(item.created || "").replace("T", " ").replace("Z", ""));
      return `<article class="inq">
        <span class="inq-mark">${initial}</span>
        <div>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.status || "New")} · ${esc(item.topic || "Enquiry")} · ${esc(item.email)}</p>
          <p class="snippet">${esc(item.message)}</p>
        </div>
        <time>${when}</time>
      </article>`;
    }).join("");
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Studio overview</span>
          <h1>The shop at a glance</h1>
          <p class="muted">Saved changes appear on the website the next time a visitor loads a page.</p>
        </div>
        <a class="btn" href="/" target="_blank" rel="noopener">View website</a>
      </header>
      ${data.mustChange ? `<div class="banner"><div><strong>Change the first password</strong><p>The sign-in hint stays on the login screen until you set a new one.</p></div><button type="button" data-jump="settings">Open settings</button></div>` : ""}
      <div class="stats">
        <button type="button" class="stat" data-jump="products"><span class="stat-icon">P</span><span>Products</span><b>${data.products.length}</b><small>${featured} on the homepage</small></button>
        <button type="button" class="stat tone-2" data-jump="categories"><span class="stat-icon">C</span><span>Categories</span><b>${data.categories.length}</b><small>Used in the menu and filters</small></button>
        <button type="button" class="stat tone-3" data-jump="reviews"><span class="stat-icon">R</span><span>Reviews</span><b>${data.reviews.length}</b><small>Shown on the homepage</small></button>
        <button type="button" class="stat tone-4" data-jump="inquiries"><span class="stat-icon">Q</span><span>Inquiries</span><b>${data.inquiries.length}</b><small>Enquiries from the website</small></button>
        <button type="button" class="stat" data-jump="orders"><span class="stat-icon">O</span><span>Orders</span><b>${(data.orders || []).length}</b><small>Placed from the website</small></button>
        <button type="button" class="stat tone-2" data-jump="customers"><span class="stat-icon">U</span><span>Customers</span><b>${(data.customers || []).length}</b><small>People who wrote or ordered</small></button>
      </div>
      <div class="dash-grid">
        <section class="panel-card">
          <div class="panel-head"><h2>Latest inquiries</h2><button type="button" class="text-btn" data-jump="inquiries">View all</button></div>
          <div class="inq-list">${latest || "<p class='empty-note'>No inquiries yet. Messages from the quote forms will show up here.</p>"}</div>
        </section>
        <section class="panel-card">
          <h2>Quick actions</h2>
          <div class="quick-list">
            <button type="button" class="quick" data-jump="products"><strong>Edit products</strong><span>Prices, photos, and homepage picks</span></button>
            <button type="button" class="quick" data-jump="categories"><strong>Edit categories</strong><span>Menu bar and category tiles</span></button>
            <button type="button" class="quick" data-jump="reviews"><strong>Edit reviews</strong><span>Names, stars, and quotes</span></button>
            <button type="button" class="quick" data-jump="orders"><strong>Orders</strong><span>Status and payment</span></button>
            <button type="button" class="quick" data-jump="customers"><strong>Customers</strong><span>Names from quotes and orders</span></button>
            <button type="button" class="quick" data-jump="settings"><strong>Shop details</strong><span>Phone, payment, SMS, and mail</span></button>
          </div>
        </section>
      </div>`;
  }

  function actions(key, id) {
    return `<td class="num"><div class="actions">
      <button type="button" class="icon-btn" data-edit="${key}" data-id="${esc(id)}">Edit</button>
      <button type="button" class="icon-btn danger" data-delete="${key}" data-id="${esc(id)}">Delete</button>
    </div></td>`;
  }

  function variantCount(item) {
    if (Array.isArray(item.variantIds)) return item.variantIds.length;
    return (data.variants || []).filter((variant) => (item.variantTypeIds || []).includes(variant.typeId)).length;
  }

  function products() {
    const home = data.products.filter((item) => item.featured).length;
    const withVariants = data.products.filter((item) => variantCount(item) > 0).length;
    const categories = [...new Set(data.products.map((item) => item.category).filter(Boolean))];
    const rows = data.products.map((item) => {
      const count = variantCount(item);
      return `<tr data-product-row data-name="${esc(item.name)}" data-cat="${esc(item.category)}" data-home="${item.featured ? "1" : "0"}" data-has-variants="${count ? "1" : "0"}">
        <td><div class="who"><img src="/${esc(item.image)}" alt="" /><div><strong>${esc(item.name)}</strong><span>${esc(item.lead || "")} · ${count} variant${count === 1 ? "" : "s"}</span></div></div></td>
        <td>${esc(item.category)}</td>
        <td class="num">${money(item.price)}</td>
        <td>${item.featured ? '<span class="pill">Homepage</span>' : '<span class="pill off">Catalogue</span>'}</td>
        ${actions("products", item.id)}
      </tr>`;
    }).join("");
    const categoryOptions = categories.map((name) => `<option value="${esc(name)}" ${name === productCategory ? "selected" : ""}>${esc(name)}</option>`).join("");
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Catalogue</span>
          <h1>Products</h1>
          <p class="muted">Search the catalogue, then filter by category or where a product is shown.</p>
        </div>
        <button type="button" id="add-product">Add product</button>
      </header>
      <div class="stats product-stats">
        <button type="button" class="stat" data-product-filter="all"><span class="stat-icon">P</span><span>All products</span><b>${data.products.length}</b><small>In the catalogue</small></button>
        <button type="button" class="stat tone-2" data-product-filter="home"><span class="stat-icon">H</span><span>Homepage</span><b>${home}</b><small>Featured on the shop</small></button>
        <button type="button" class="stat tone-3" data-product-filter="catalog"><span class="stat-icon">C</span><span>Catalogue only</span><b>${data.products.length - home}</b><small>Not on the homepage</small></button>
        <button type="button" class="stat tone-4" data-product-filter="variants"><span class="stat-icon">V</span><span>With variants</span><b>${withVariants}</b><small>Size, finish, and more</small></button>
      </div>
      <section class="table-card">
        <div class="catalog-tools">
          <input id="product-search" type="search" placeholder="Search name or category" value="${esc(productQuery)}" />
          <select id="product-category">
            <option value="">All categories</option>
            ${categoryOptions}
          </select>
          <select id="product-shown">
            <option value="all" ${productShown === "all" ? "selected" : ""}>All products</option>
            <option value="home" ${productShown === "home" ? "selected" : ""}>Homepage</option>
            <option value="catalog" ${productShown === "catalog" ? "selected" : ""}>Catalogue only</option>
            <option value="variants" ${productShown === "variants" ? "selected" : ""}>With variants</option>
          </select>
          <span class="tool-count" data-product-count></span>
        </div>
        <div class="table-wrap"><table class="grid">
          <thead><tr><th>Product</th><th>Category</th><th class="num">Price</th><th>Shown</th><th class="num">Actions</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No products yet.</td></tr>'}</tbody>
        </table></div>
        <p class="empty-note catalog-empty" id="product-empty" hidden>No products match that search.</p>
      </section>
      <div class="modal" id="product-modal" hidden>
        <form class="modal-card wide" id="product-form">
          <div class="modal-head"><h2>Add product</h2><button type="button" class="icon-x" data-cancel aria-label="Close">×</button></div>
          <input type="hidden" name="id" />
          <label>Name<input name="name" required /></label>
          <div class="form-grid">
            <label>Price (AUD)<input name="price" type="number" min="0" step="0.01" required /></label>
            <label>Category<input name="category" list="cat-names" required /></label>
          </div>
          <datalist id="cat-names">${data.categories.map((c) => `<option value="${esc(c.name)}"></option>`).join("")}</datalist>
          <label>Lead time<input name="lead" placeholder="2–4 business days" /></label>
          <label>Summary<textarea name="summary"></textarea></label>
          <label>Image<input name="file" type="file" accept="image/*" /></label>
          <input type="hidden" name="image" />
          <img class="thumb" alt="" hidden data-preview />
          <label class="check"><input name="featured" type="checkbox" /> Show on the homepage</label>
          <div class="picker-head"><strong>Variants</strong><span>Tick the options, then change the price for this product only.</span></div>
          <div class="variant-picker">${variantPicker()}</div>
          <div class="modal-actions"><button type="button" class="ghost" data-cancel>Cancel</button><button type="submit">Save product</button></div>
          <p class="error" data-form-error></p>
        </form>
      </div>`;
  }

  function variantPicker() {
    const types = data.variantTypes || [];
    const variants = data.variants || [];
    if (!types.length || !variants.length) return "<p class='muted'>Add variant types and variants first.</p>";
    return types.map((type) => {
      const choices = variants.filter((variant) => variant.typeId === type.id);
      if (!choices.length) return "";
      const options = choices.map((variant) => {
        const amount = Number(variant.amount);
        const hint = type.mode === "add" ? "Adds $" : "Multiplies by";
        return `<div class="variant-line">
          <label class="check"><input type="checkbox" name="variant" value="${esc(variant.id)}" data-type="${esc(type.id)}" /> <span>${esc(variant.name)}</span></label>
          <label class="variant-price">${hint}<input type="number" step="0.01" data-variant-price="${esc(variant.id)}" data-base="${esc(amount)}" value="${esc(amount)}" /></label>
        </div>`;
      }).join("");
      return `<div class="variant-group">
        <div class="variant-group-head"><strong>${esc(type.name)}</strong><span>${type.mode === "add" ? "Adds to the price" : "Multiplies the price"}</span><button type="button" class="text-btn" data-variant-all="${esc(type.id)}">All</button></div>
        <div class="variant-options">${options}</div>
      </div>`;
    }).join("") || "<p class='muted'>Add variant types and variants first.</p>";
  }

  function categories() {
    const rows = data.categories.map((item) => {
      const used = data.products.filter((product) => product.category === item.name).length;
      return `<tr data-category-row data-q="${esc(item.name)}">
        <td><div class="who"><img src="/${esc(item.image)}" alt="" /><strong>${esc(item.name)}</strong></div></td>
        <td>${used} product${used === 1 ? "" : "s"}</td>
        ${actions("categories", item.id)}
      </tr>`;
    }).join("");
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Menu</span>
          <h1>Categories</h1>
          <p class="muted">${data.categories.length} categories in the bar and filters. Search by name.</p>
        </div>
        <button type="button" id="add-category">Add category</button>
      </header>
      <section class="table-card">
        <div class="catalog-tools">
          <input id="category-search" type="search" placeholder="Search category" value="${esc(categoryQuery)}" />
          <span class="tool-count" data-category-count></span>
        </div>
        <div class="table-wrap"><table class="grid">
          <thead><tr><th>Category</th><th>Products</th><th class="num">Actions</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3">No categories yet.</td></tr>'}</tbody>
        </table></div>
        <p class="empty-note catalog-empty" id="category-empty" hidden>No categories match that search.</p>
      </section>
      <div class="modal" id="category-modal" hidden>
        <form class="modal-card" id="category-form">
          <div class="modal-head"><h2>Add category</h2><button type="button" class="icon-x" data-cancel aria-label="Close">×</button></div>
          <input type="hidden" name="id" />
          <label>Name<input name="name" required /></label>
          <label>Image<input name="file" type="file" accept="image/*" /></label>
          <input type="hidden" name="image" />
          <img class="thumb" alt="" hidden data-preview />
          <div class="modal-actions"><button type="button" class="ghost" data-cancel>Cancel</button><button type="submit">Save category</button></div>
          <p class="error" data-form-error></p>
        </form>
      </div>`;
  }

  function reviews() {
    const rows = data.reviews.map((item) => `
      <tr>
        <td><div class="who"><span class="inq-mark">${esc(String(item.name || "?").trim().charAt(0).toUpperCase())}</span><div><strong>${esc(item.name)}</strong><span>${esc(item.when || "")}</span></div></div></td>
        <td class="star" aria-label="${item.stars} stars">${"★".repeat(item.stars || 0)}</td>
        <td><p class="clip">${esc(item.text)}</p></td>
        ${actions("reviews", item.id)}
      </tr>`).join("");
    return `
      <section class="table-card">
        <header class="module-head">
          <div><span class="kicker">Homepage</span><h1>Reviews</h1><p class="muted">${data.reviews.length} reviews in the carousel</p></div>
          <button type="button" id="add-review">Add review</button>
        </header>
        <div class="table-wrap"><table class="grid">
          <thead><tr><th>Customer</th><th>Stars</th><th>Review</th><th class="num">Actions</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">No reviews yet.</td></tr>'}</tbody>
        </table></div>
      </section>
      <div class="modal" id="review-modal" hidden>
        <form class="modal-card" id="review-form">
          <div class="modal-head"><h2>Add review</h2><button type="button" class="icon-x" data-cancel aria-label="Close">×</button></div>
          <input type="hidden" name="id" />
          <div class="form-grid">
            <label>Name<input name="name" required /></label>
            <label>When<input name="when" placeholder="2 months ago" /></label>
          </div>
          <label>Stars<select name="stars">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n}</option>`).join("")}</select></label>
          <label>Review<textarea name="text" required></textarea></label>
          <div class="modal-actions"><button type="button" class="ghost" data-cancel>Cancel</button><button type="submit">Save review</button></div>
          <p class="error" data-form-error></p>
        </form>
      </div>`;
  }

  function variantTypes() {
    const rows = (data.variantTypes || []).map((item) => {
      const count = (data.variants || []).filter((variant) => variant.typeId === item.id).length;
      const effect = item.mode === "add" ? "Add to price" : "Multiply price";
      return `<tr data-type-row data-q="${esc(item.name + " " + effect)}">
        <td><strong>${esc(item.name)}</strong></td>
        <td>${esc(effect)}</td>
        <td>${count}</td>
        ${actions("variant-types", item.id)}
      </tr>`;
    }).join("");
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Options</span>
          <h1>Variant types</h1>
          <p class="muted">Groups such as size, material, or finish. Assign them on a product.</p>
        </div>
        <button type="button" id="add-type">Add type</button>
      </header>
      <section class="table-card">
        <div class="catalog-tools">
          <input id="type-search" type="search" placeholder="Search type or price effect" value="${esc(typeQuery)}" />
          <span class="tool-count" data-type-count></span>
        </div>
        <div class="table-wrap"><table class="grid">
          <thead><tr><th>Type</th><th>Price effect</th><th>Variants</th><th class="num">Actions</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">No variant types yet.</td></tr>'}</tbody>
        </table></div>
        <p class="empty-note catalog-empty" id="type-empty" hidden>No variant types match that search.</p>
      </section>
      <div class="modal" id="type-modal" hidden>
        <form class="modal-card" id="type-form">
          <div class="modal-head"><h2>Add variant type</h2><button type="button" class="icon-x" data-cancel aria-label="Close">×</button></div>
          <input type="hidden" name="id" />
          <label>Name<input name="name" required placeholder="Size" /></label>
          <label>Price effect<select name="mode"><option value="multiply">Multiply the product price</option><option value="add">Add an amount in AUD</option></select></label>
          <div class="modal-actions"><button type="button" class="ghost" data-cancel>Cancel</button><button type="submit">Save type</button></div>
          <p class="error" data-form-error></p>
        </form>
      </div>`;
  }

  function variants() {
    const typeName = (id) => (data.variantTypes || []).find((type) => type.id === id)?.name || id;
    const rows = (data.variants || []).map((item) => {
      const type = typeName(item.typeId);
      return `<tr data-variant-row data-q="${esc(item.name + " " + type)}" data-type="${esc(item.typeId)}">
        <td><strong>${esc(item.name)}</strong>${item.isDefault ? ' <span class="pill">Default</span>' : ""}</td>
        <td>${esc(type)}</td>
        <td class="num">${item.amount}</td>
        ${actions("variants", item.id)}
      </tr>`;
    }).join("");
    const typeOptions = (data.variantTypes || []).map((type) => `<option value="${esc(type.id)}" ${type.id === variantTypeFilter ? "selected" : ""}>${esc(type.name)}</option>`).join("");
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Options</span>
          <h1>Variants</h1>
          <p class="muted">Choices inside a type. Multiply uses 1 as no change. Add uses 0 as no change.</p>
        </div>
        <button type="button" id="add-variant">Add variant</button>
      </header>
      <section class="table-card">
        <div class="catalog-tools">
          <input id="variant-search" type="search" placeholder="Search variant or type" value="${esc(variantQuery)}" />
          <select id="variant-type">
            <option value="all" ${variantTypeFilter === "all" ? "selected" : ""}>All types</option>
            ${typeOptions}
          </select>
          <span class="tool-count" data-variant-count></span>
        </div>
        <div class="table-wrap"><table class="grid">
          <thead><tr><th>Variant</th><th>Type</th><th class="num">Amount</th><th class="num">Actions</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">No variants yet.</td></tr>'}</tbody>
        </table></div>
        <p class="empty-note catalog-empty" id="variant-empty" hidden>No variants match that search.</p>
      </section>
      <div class="modal" id="variant-modal" hidden>
        <form class="modal-card" id="variant-form">
          <div class="modal-head"><h2>Add variant</h2><button type="button" class="icon-x" data-cancel aria-label="Close">×</button></div>
          <input type="hidden" name="id" />
          <label>Type<select name="typeId" required>${typeOptions}</select></label>
          <label>Name<input name="name" required placeholder="Large" /></label>
          <label>Amount<input name="amount" type="number" step="0.01" required /></label>
          <label class="check"><input name="isDefault" type="checkbox" /> Selected when the product page opens</label>
          <div class="modal-actions"><button type="button" class="ghost" data-cancel>Cancel</button><button type="submit">Save variant</button></div>
          <p class="error" data-form-error></p>
        </form>
      </div>`;
  }

  function placed(value) {
    return esc(String(value || "").replace("T", " ").replace("Z", "").slice(0, 16));
  }

  function artworkView(item) {
    const path = String(item.artwork || "");
    if (!/^assets\/artwork\/[0-9a-f]{16}\.(pdf|ai|png|jpg|jpeg|tif|tiff|svg|webp)$/i.test(path)) return "";
    const src = "/" + path;
    const name = item.artworkName || "Artwork";
    const image = /\.(png|jpe?g|gif|webp|svg)$/i.test(path);
    return `<div class="artwork-file">${image ? `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt=""></a>` : ""}<a href="${esc(src)}" target="_blank" rel="noopener">${esc(name)}</a></div>`;
  }

  function orderTags(item) {
    const payClass = item.payment === "Paid" ? "paid" : item.payment === "Refunded" ? "refund" : "";
    return `<span class="tag">${esc(item.status || "New")}</span><span class="tag pay ${payClass}">${esc(item.payment || "Unpaid")}</span>`;
  }

  function orderDetail(id) {
    const item = (data.orders || []).find((order) => order.id === id);
    if (!item) {
      return `
        <header class="dash-head"><div><span class="kicker">Sales</span><h1>Order</h1><p class="muted">That order is no longer in the list.</p></div></header>
        <button type="button" class="ghost" data-order-back>Back to orders</button>`;
    }
    const statusOptions = ["New", "In production", "Ready", "Dispatched", "Cancelled"].map((status) => `<option ${status === item.status ? "selected" : ""}>${status}</option>`).join("");
    const payOptions = ["Unpaid", "Paid", "Refunded"].map((status) => `<option ${status === item.payment ? "selected" : ""}>${status}</option>`).join("");
    const lines = (item.items || []).map((line) => `
      <div class="order-line">
        <div><strong>${esc(line.qty)} × ${esc(line.name)}</strong>${line.options ? `<p>${esc(line.options)}</p>` : ""}${artworkView(line)}</div>
        <b>${money((line.price || 0) * (line.qty || 0))}</b>
      </div>`).join("") || `<p class="muted">No line items were stored.</p>`;
    return `
      <header class="dash-head">
        <div>
          <button type="button" class="ghost order-back" data-order-back>Back to orders</button>
          <h1>${esc(item.number)}</h1>
          <p class="muted">Placed ${placed(item.created)}</p>
        </div>
        <div class="order-tags">${orderTags(item)}</div>
      </header>
      <div class="order-sheet" data-order-sheet data-status="${esc(item.status)}" data-pay="${esc(item.payment)}">
        <section class="set-card">
          <header class="set-head"><span class="set-mark">J</span><div><h2>Job</h2><p>${(item.items || []).length} line${(item.items || []).length === 1 ? "" : "s"}</p></div></header>
          <div class="order-lines">${lines}</div>
          <div class="order-total-row"><span>Total</span><strong>${money(item.total)}</strong></div>
          ${item.note ? `<p class="order-note"><strong>Note</strong>${esc(item.note)}</p>` : ""}
        </section>
        <section class="set-card">
          <header class="set-head"><span class="set-mark tone-pay">C</span><div><h2>Customer</h2><p>Where this job should go.</p></div></header>
          <dl class="order-facts">
            <div><dt>Name</dt><dd>${esc(item.name || "—")}</dd></div>
            <div><dt>Email</dt><dd>${esc(item.email || "—")}</dd></div>
            <div><dt>Phone</dt><dd>${esc(item.phone || "—")}</dd></div>
            <div><dt>Delivery</dt><dd>${esc(item.address || "—")}</dd></div>
          </dl>
          <label>Status<select class="mini" data-order="${esc(item.id)}" data-field="status">${statusOptions}</select></label>
          <label>Payment<select class="mini" data-order="${esc(item.id)}" data-field="payment">${payOptions}</select></label>
        </section>
      </div>`;
  }

  function orders() {
    if (openOrder) return orderDetail(openOrder);
    const list = data.orders || [];
    const countStatus = (status) => list.filter((item) => item.status === status).length;
    const unpaid = list.filter((item) => item.payment === "Unpaid").length;
    const rows = list.map((item) => {
      const summary = (item.items || []).map((line) => `${line.qty} × ${line.name}`).join(", ");
      const haystack = [item.number, item.name, item.email, item.phone, summary].join(" ");
      const payClass = item.payment === "Paid" ? "paid" : item.payment === "Refunded" ? "refund" : "";
      return `<tr data-order-row data-q="${esc(haystack)}" data-status="${esc(item.status)}" data-pay="${esc(item.payment)}">
        <td class="order-main"><strong>${esc(item.number)}</strong><p class="clip">${esc(summary || "No items stored")}</p></td>
        <td class="order-main"><strong>${esc(item.name)}</strong><p>${esc(item.email || "")}</p></td>
        <td class="num">${money(item.total)}</td>
        <td><span class="tag">${esc(item.status || "New")}</span></td>
        <td><span class="tag pay ${payClass}">${esc(item.payment || "Unpaid")}</span></td>
        <td class="nowrap">${placed(item.created)}</td>
        <td class="act"><button type="button" class="icon-btn" data-order-open="${esc(item.id)}">View</button></td>
      </tr>`;
    }).join("");
    const statusChoices = ["all", "New", "In production", "Ready", "Dispatched", "Cancelled"];
    const payChoices = ["all", "Unpaid", "Paid", "Refunded"];
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Sales</span>
          <h1>Orders</h1>
          <p class="muted">Search by order, customer, or product, then open an order to update it.</p>
        </div>
      </header>
      <div class="stats product-stats">
        <button type="button" class="stat" data-order-filter="all"><span class="stat-icon">O</span><span>All orders</span><b>${list.length}</b><small>From the website cart</small></button>
        <button type="button" class="stat tone-3" data-order-filter="New"><span class="stat-icon">N</span><span>New</span><b>${countStatus("New")}</b><small>Waiting to start</small></button>
        <button type="button" class="stat tone-2" data-order-filter="In production"><span class="stat-icon">P</span><span>In production</span><b>${countStatus("In production")}</b><small>Being printed</small></button>
        <button type="button" class="stat tone-4" data-order-filter="Unpaid"><span class="stat-icon">$</span><span>Unpaid</span><b>${unpaid}</b><small>Payment still open</small></button>
      </div>
      <section class="table-card order-board">
        <div class="catalog-tools">
          <input id="order-search" type="search" placeholder="Search order, customer, or product" value="${esc(orderQuery)}" />
          <select id="order-status">${statusChoices.map((status) => `<option value="${esc(status)}" ${status === orderStatus ? "selected" : ""}>${status === "all" ? "All statuses" : esc(status)}</option>`).join("")}</select>
          <select id="order-pay">${payChoices.map((status) => `<option value="${esc(status)}" ${status === orderPay ? "selected" : ""}>${status === "all" ? "All payments" : esc(status)}</option>`).join("")}</select>
          <span class="tool-count" data-order-count></span>
        </div>
        <div class="table-wrap"><table class="grid">
          <thead><tr><th>Order</th><th>Customer</th><th class="num">Total</th><th>Status</th><th>Payment</th><th>Placed</th><th class="act"></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="7">No orders yet. A quote sent with items in the cart becomes an order.</td></tr>'}</tbody>
        </table></div>
        <p class="empty-note catalog-empty" id="order-empty" hidden>No orders match that search.</p>
      </section>`;
  }

  function customers() {
    const list = data.customers || [];
    const rows = list.map((item) => `<tr data-customer-row data-q="${esc([item.name, item.email, item.phone].join(" "))}">
      <td><div class="who"><span class="inq-mark">${esc(String(item.name || "?").trim().charAt(0).toUpperCase())}</span><strong>${esc(item.name)}</strong></div></td>
      <td>${esc(item.email)}</td>
      <td>${esc(item.phone || "—")}</td>
      <td class="num">${item.orders || 0}</td>
      <td class="nowrap">${placed(item.created)}</td>
    </tr>`).join("");
    const people = list.length === 1 ? "1 person" : `${list.length} people`;
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Sales</span>
          <h1>Customers</h1>
          <p class="muted">${people} saved from quotes and orders. Search by name, email, or phone.</p>
        </div>
      </header>
      <section class="table-card">
        <div class="catalog-tools">
          <input id="customer-search" type="search" placeholder="Search name, email, or phone" value="${esc(customerQuery)}" />
          <span class="tool-count" data-customer-count></span>
        </div>
        <div class="table-wrap"><table class="grid">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th class="num">Orders</th><th>Since</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No customers yet.</td></tr>'}</tbody>
        </table></div>
        <p class="empty-note catalog-empty" id="customer-empty" hidden>No customers match that search.</p>
      </section>`;
  }

  function inquiries() {
    const list = data.inquiries || [];
    const statuses = ["New", "In progress", "Replied", "Closed"];
    const rows = list.map((item) => {
      const status = item.status || "New";
      const haystack = [item.name, item.email, item.phone, item.topic, item.message].join(" ");
      const options = statuses.map((choice) => `<option ${choice === status ? "selected" : ""}>${esc(choice)}</option>`).join("");
      return `<tr data-inquiry-row data-q="${esc(haystack)}" data-status="${esc(status)}">
        <td class="order-main"><strong>${esc(item.name)}</strong><p>${esc(item.email)}</p></td>
        <td>${esc(item.phone || "—")}</td>
        <td>${esc(item.topic || "Enquiry")}${item.budget ? `<p class="clip">${esc(item.budget)}</p>` : ""}</td>
        <td><p class="clip">${esc(item.message)}</p></td>
        <td class="nowrap">${placed(item.created)}</td>
        <td><select class="mini" data-inquiry="${esc(item.id)}">${options}</select></td>
        <td class="act"><button type="button" class="icon-btn danger" data-delete="inquiries" data-id="${esc(item.id)}">Delete</button></td>
      </tr>`;
    }).join("");
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Sales</span>
          <h1>Inquiries</h1>
          <p class="muted">Messages sent from the contact page. Change the status as you reply.</p>
        </div>
      </header>
      <section class="table-card">
        <div class="catalog-tools">
          <input id="inquiry-search" type="search" placeholder="Search name, email, or message" value="${esc(inquiryQuery)}" />
          <select id="inquiry-status">
            <option value="all" ${inquiryStatus === "all" ? "selected" : ""}>All statuses</option>
            ${statuses.map((status) => `<option value="${esc(status)}" ${inquiryStatus === status ? "selected" : ""}>${esc(status)}</option>`).join("")}
          </select>
          <span class="tool-count" data-inquiry-count></span>
        </div>
        <div class="table-wrap"><table class="grid">
          <thead><tr><th>From</th><th>Phone</th><th>Topic</th><th>Message</th><th>Received</th><th>Status</th><th class="act"></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="7">No inquiries yet. Messages sent from the contact page appear here.</td></tr>'}</tbody>
        </table></div>
        <p class="empty-note catalog-empty" id="inquiry-empty" hidden>No inquiries match that search.</p>
      </section>`;
  }

  function previewSrc(src) {
    if (!src) return "";
    const text = String(src);
    if (text.startsWith("data:") || text.startsWith("/") || text.startsWith("http")) return text;
    return "/" + text;
  }

  function mediaFields(image) {
    const src = previewSrc(image);
    return `
      <label>Image<input type="file" accept="image/*" data-file /></label>
      <input type="hidden" data-image value="${esc(image || "")}" />
      <img class="thumb" alt="" data-preview ${src ? `src="${esc(src)}"` : "hidden"} />`;
  }

  function announceRow(item) {
    return `<div class="content-item" data-item data-announce>
      <div class="form-grid">
        <label>Text<input data-text value="${esc(item.text || "")}" /></label>
        <label>Link<input data-href value="${esc(item.href || "")}" placeholder="Optional, such as account.html" /></label>
      </div>
      ${mediaFields(item.image)}
      <button type="button" class="ghost" data-remove-row>Remove</button>
    </div>`;
  }

  function stepRow(item, index) {
    return `<div class="content-item" data-item data-step>
      <strong>Step ${index + 1}</strong>
      <label>Title<input data-title value="${esc(item.title || "")}" /></label>
      <label>Text<textarea data-text>${esc(item.text || "")}</textarea></label>
      ${mediaFields(item.image)}
      <button type="button" class="ghost" data-remove-row>Remove</button>
    </div>`;
  }

  function pageSections() {
    const blocks = ((data.settings && data.settings.website) || {}).blocks || {};
    const how = blocks.how || {};
    const reasons = blocks.reasons || {};
    const choose = blocks.choose || {};
    const announcements = blocks.announcements || [];
    const steps = how.steps || [];
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Studio</span>
          <h1>Page sections</h1>
          <p class="muted">Choose a section, edit its text and images, then save.</p>
        </div>
      </header>
      <form id="sections-form" class="section-editor">
        <div class="section-tabs" role="tablist" aria-label="Page sections">
          <button type="button" class="is-on" data-section-tab="announce" role="tab" aria-selected="true">Announcement bar</button>
          <button type="button" data-section-tab="how" role="tab" aria-selected="false">How it works</button>
          <button type="button" data-section-tab="reasons" role="tab" aria-selected="false">Reasons to print</button>
          <button type="button" data-section-tab="choose" role="tab" aria-selected="false">Why choose us</button>
        </div>
        <section class="set-card" data-section-panel="announce">
          <header class="set-head"><span class="set-mark">A</span><div><h2>Announcement bar</h2><p>The navy strip under the category menu. A link makes the line clickable. Leave the image blank to keep the icon.</p></div></header>
          <div data-announce-list>${announcements.map(announceRow).join("")}</div>
          <button type="button" class="ghost" data-add-announce>Add announcement</button>
        </section>
        <section class="set-card" data-section-panel="how" hidden>
          <header class="set-head"><span class="set-mark tone-pay">H</span><div><h2>How it works</h2><p>The steps on the homepage. An image replaces the red icon for that step.</p></div></header>
          <div class="form-grid">
            <label>Label<input name="howKicker" value="${esc(how.kicker || "")}" /></label>
            <label>Orange words<input name="howAccent" value="${esc(how.accent || "")}" placeholder="Words from the heading" /></label>
          </div>
          <label>Heading<input name="howTitle" value="${esc(how.title || "")}" /></label>
          <label>Introduction<textarea name="howText">${esc(how.text || "")}</textarea></label>
          <div class="form-grid">
            <label>Ready heading<input name="readyTitle" value="${esc(how.readyTitle || "")}" /></label>
            <label>Ready text<input name="readyText" value="${esc(how.readyText || "")}" /></label>
            <label>Button<input name="readyButton" value="${esc(how.readyButton || "")}" /></label>
            <label>Button link<input name="readyHref" value="${esc(how.readyHref || "")}" /></label>
          </div>
          <div data-step-list>${steps.map(stepRow).join("")}</div>
          <button type="button" class="ghost" data-add-step>Add step</button>
        </section>
        <section class="set-card" data-section-panel="reasons" hidden>
          <header class="set-head"><span class="set-mark tone-sms">R</span><div><h2>Reasons to print</h2><p>The photo and copy beside “Let’s Get Printing”.</p></div></header>
          <label>Label<input name="reasonsKicker" value="${esc(reasons.kicker || "")}" /></label>
          <label>Heading<input name="reasonsTitle" value="${esc(reasons.title || "")}" /></label>
          <label>Text<textarea name="reasonsText">${esc(reasons.text || "")}</textarea></label>
          ${mediaFields(reasons.image)}
        </section>
        <section class="set-card" data-section-panel="choose" hidden>
          <header class="set-head"><span class="set-mark tone-mail">W</span><div><h2>Why choose us</h2><p>The photo, copy, and button on the homepage.</p></div></header>
          <label>Label<input name="chooseKicker" value="${esc(choose.kicker || "")}" /></label>
          <label>Heading<input name="chooseTitle" value="${esc(choose.title || "")}" /></label>
          <label>Text<textarea name="chooseText">${esc(choose.text || "")}</textarea></label>
          <div class="form-grid">
            <label>Button<input name="chooseButton" value="${esc(choose.button || "")}" /></label>
            <label>Button link<input name="chooseHref" value="${esc(choose.href || "")}" /></label>
          </div>
          ${mediaFields(choose.image)}
        </section>
        <div class="set-save">
          <div>
            <p class="ok" data-saved hidden>Saved. The website updates the next time a page loads.</p>
            <p class="error" data-form-error></p>
          </div>
          <button type="submit">Save sections</button>
        </div>
      </form>`;
  }

  function website() {
    const site = (data.settings && data.settings.website) || {};
    const banners = site.banners || [{}, {}];
    const menu = site.menu || [];
    const sections = site.sections || {};
    const sectionList = [
      ["promo", "Announcement bar"],
      ["banner", "Homepage banner"],
      ["how", "How it works"],
      ["categories", "Popular categories"],
      ["products", "Featured products"],
      ["reasons", "Reasons to print"],
      ["choose", "Why choose us"],
      ["reviews", "Customer reviews"],
      ["quote", "Quote form"],
      ["trust", "Store promises"],
    ];
    const slideFields = (banner, index) => `
      <div class="variant-group" data-banner>
        <div class="variant-group-head"><strong>Slide ${index + 1}</strong></div>
        <label>Heading<input data-banner-title value="${esc(banner.title || "")}" placeholder="Leave blank to keep the designed heading" /></label>
        <label>Text<textarea data-banner-text>${esc(banner.text || "")}</textarea></label>
        <div class="form-grid">
          <label>Button<input data-banner-button value="${esc(banner.button || "")}" /></label>
          <label>Link<input data-banner-href value="${esc(banner.href || "")}" /></label>
        </div>
      </div>`;
    const menuRows = menu.map((item) => `
      <div class="menu-row" data-menu-row>
        <label class="check"><input type="checkbox" data-menu-on ${item.enabled ? "checked" : ""} /> Show</label>
        <label>Label<input data-menu-label value="${esc(item.label || "")}" /></label>
        <label>Link<input data-menu-href value="${esc(item.href || "")}" /></label>
      </div>`).join("");
    const switches = sectionList.map(([key, label]) => `
      <label class="switch"><input type="checkbox" data-section="${key}" ${sections[key] !== false ? "checked" : ""} /><span class="switch-ui"></span><span><strong>${label}</strong><small>${key === "products" ? "Products with “Show on the homepage” appear here." : "Turn this block off to hide it on the site."}</small></span></label>`).join("");
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Studio</span>
          <h1>Website</h1>
          <p class="muted">Banner, menu, and which homepage sections are visible. Featured products are chosen on the Products page.</p>
        </div>
      </header>
      <form id="website-form" class="settings-board">
        <section class="set-card">
          <header class="set-head"><span class="set-mark">B</span><div><h2>Banner</h2><p>The homepage slides. Leave a heading blank to keep the current design.</p></div></header>
          <label>Banner image<input name="bannerFile" type="file" accept="image/*" /></label>
          <input type="hidden" data-banner-image value="${esc(site.bannerImage || "")}" />
          <img class="thumb" alt="" data-banner-preview ${site.bannerImage ? `src="/${esc(site.bannerImage)}"` : "hidden"} />
          ${slideFields(banners[0] || {}, 0)}
          ${slideFields(banners[1] || {}, 1)}
        </section>
        <section class="set-card">
          <header class="set-head"><span class="set-mark tone-pay">M</span><div><h2>Menu</h2><p>The links in the top bar. Category names stay in Categories.</p></div></header>
          <div class="menu-list">${menuRows}</div>
        </section>
        <section class="set-card set-admin">
          <header class="set-head"><span class="set-mark tone-sms">S</span><div><h2>Sections</h2><p>Switch a block off to hide it. Featured products still come from each product.</p></div></header>
          <div class="section-switches">${switches}</div>
        </section>
        <div class="set-save">
          <div>
            <p class="ok" data-saved hidden>Saved. The website updates the next time a page loads.</p>
            <p class="error" data-form-error></p>
          </div>
          <button type="submit">Save website</button>
        </div>
      </form>`;
  }

  function settings() {
    const s = data.settings;
    const pay = s.payment || {};
    const sms = s.sms || {};
    const mail = s.mail || {};
    const on = (flag) => flag ? "checked" : "";
    return `
      <header class="dash-head">
        <div>
          <span class="kicker">Studio</span>
          <h1>Settings</h1>
          <p class="muted">Shop details appear on the website. Payment, SMS, and mail stay in the admin.</p>
        </div>
      </header>
      <form id="settings-form" class="settings-board">
        <section class="set-card">
          <header class="set-head">
            <span class="set-mark">S</span>
            <div><h2>Shop</h2><p>Phone, address, and opening hours on the public site.</p></div>
          </header>
          <div class="form-grid">
            <label>Phone<input name="phone" value="${esc(s.phone)}" /></label>
            <label>Email<input name="email" type="email" value="${esc(s.email)}" /></label>
          </div>
          <label>Address<input name="address" value="${esc(s.address)}" /></label>
          <div class="form-grid">
            <label>Hours<input name="hours" value="${esc(s.hours)}" /></label>
            <label>Hours note<input name="hoursNote" value="${esc(s.hoursNote)}" /></label>
          </div>
        </section>
        <section class="set-card">
          <header class="set-head">
            <span class="set-mark tone-pay">P</span>
            <div><h2>Payment</h2><p>Provider and keys for taking payment details.</p></div>
          </header>
          <label class="switch"><input name="paymentEnabled" type="checkbox" ${on(pay.enabled)} /><span class="switch-ui"></span><span><strong>Accept payment details</strong><small>Turn on when a provider is ready.</small></span></label>
          <div class="form-grid">
            <label>Provider<select name="paymentProvider"><option ${pay.provider === "Bank transfer" ? "selected" : ""}>Bank transfer</option><option ${pay.provider === "Stripe" ? "selected" : ""}>Stripe</option><option ${pay.provider === "PayPal" ? "selected" : ""}>PayPal</option></select></label>
            <label>Currency<input name="paymentCurrency" value="${esc(pay.currency || "AUD")}" /></label>
          </div>
          <label>Public key<input name="paymentPublicKey" value="${esc(pay.publicKey || "")}" autocomplete="off" /></label>
          <label>Secret key<input name="paymentSecretKey" type="password" autocomplete="new-password" placeholder="Leave blank to keep the saved key" /></label>
        </section>
        <section class="set-card">
          <header class="set-head">
            <span class="set-mark tone-sms">M</span>
            <div><h2>SMS</h2><p>Sender and keys for text updates.</p></div>
          </header>
          <label class="switch"><input name="smsEnabled" type="checkbox" ${on(sms.enabled)} /><span class="switch-ui"></span><span><strong>Send SMS updates</strong><small>Messages go out only when this is on.</small></span></label>
          <div class="form-grid">
            <label>Provider<select name="smsProvider"><option ${sms.provider === "Twilio" ? "selected" : ""}>Twilio</option><option ${sms.provider === "MessageMedia" ? "selected" : ""}>MessageMedia</option></select></label>
            <label>Sender name<input name="smsSender" value="${esc(sms.sender || "")}" /></label>
          </div>
          <label>API key<input name="smsApiKey" type="password" autocomplete="new-password" placeholder="Leave blank to keep the saved key" /></label>
          <label>API secret<input name="smsApiSecret" type="password" autocomplete="new-password" placeholder="Leave blank to keep the saved key" /></label>
        </section>
        <section class="set-card">
          <header class="set-head">
            <span class="set-mark tone-mail">@</span>
            <div><h2>Mail</h2><p>SMTP details for order email.</p></div>
          </header>
          <label class="switch"><input name="mailEnabled" type="checkbox" ${on(mail.enabled)} /><span class="switch-ui"></span><span><strong>Send order mail</strong><small>Uses the host and from address below.</small></span></label>
          <div class="form-grid">
            <label>SMTP host<input name="mailHost" value="${esc(mail.host || "")}" /></label>
            <label>Port<input name="mailPort" value="${esc(mail.port || "587")}" /></label>
          </div>
          <div class="form-grid">
            <label>Username<input name="mailUsername" value="${esc(mail.username || "")}" autocomplete="off" /></label>
            <label>Password<input name="mailPassword" type="password" autocomplete="new-password" placeholder="Leave blank to keep the saved password" /></label>
          </div>
          <div class="form-grid">
            <label>From email<input name="mailFromEmail" type="email" value="${esc(mail.fromEmail || "")}" /></label>
            <label>From name<input name="mailFromName" value="${esc(mail.fromName || "")}" /></label>
          </div>
        </section>
        <section class="set-card set-admin">
          <header class="set-head">
            <span class="set-mark">A</span>
            <div><h2>Admin sign in</h2><p>Leave the password blank to keep the current one.</p></div>
          </header>
          <div class="form-grid">
            <label>Admin username<input name="username" value="${esc(data.username)}" autocomplete="username" /></label>
            <label>New password<input name="password" type="password" autocomplete="new-password" placeholder="Leave blank to keep the current password" /></label>
          </div>
        </section>
        <div class="set-save">
          <div>
            <p class="ok" data-saved hidden>Saved. Shop details appear on the website. Payment, SMS, and mail stay in the admin.</p>
            <p class="error" data-form-error></p>
          </div>
          <button type="submit">Save settings</button>
        </div>
      </form>`;
  }

  function fill(form, item) {
    Object.entries(item).forEach(([key, value]) => {
      const field = form.elements[key];
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value ?? "";
    });
    const chosen = Array.isArray(item.variantIds)
      ? item.variantIds
      : (data.variants || []).filter((variant) => (item.variantTypeIds || []).includes(variant.typeId)).map((variant) => variant.id);
    form.querySelectorAll("[name='variant']").forEach((box) => {
      box.checked = chosen.includes(box.value);
    });
    const prices = item.variantPrices || {};
    form.querySelectorAll("[data-variant-price]").forEach((input) => {
      const custom = prices[input.dataset.variantPrice];
      input.value = custom != null && custom !== "" ? custom : input.dataset.base;
    });
  }

  async function fileToImage(form) {
    const file = form.elements.file && form.elements.file.files[0];
    if (!file) return form.elements.image ? form.elements.image.value : "";
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const uploaded = await api("/api/admin/upload", { method: "POST", body: { name: file.name, data: dataUrl } });
    return uploaded.image;
  }

  function wireRows(searchId, rowSelector, emptyId, countSelector, remember, extra) {
    const search = $(searchId);
    if (!search) return;
    const extraField = extra ? $(extra.id) : null;
    const apply = () => {
      const extraValue = extraField ? extraField.value : "";
      remember(search.value, extraValue);
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      main.querySelectorAll(rowSelector).forEach((row) => {
        const okQuery = !query || String(row.dataset.q || "").toLowerCase().includes(query);
        const okExtra = !extra || extra.match(row, extraValue);
        row.hidden = !(okQuery && okExtra);
        if (!row.hidden) visible += 1;
      });
      const empty = $(emptyId);
      if (empty) empty.hidden = visible !== 0 || !main.querySelector(rowSelector);
      const count = $(countSelector);
      if (count) count.textContent = visible + " shown";
    };
    search.addEventListener("input", apply);
    if (extraField) extraField.addEventListener("change", apply);
    apply();
  }

  function bind() {
    main.querySelectorAll("[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => { view = btn.dataset.jump; render(); });
    });
    $("#add-product")?.addEventListener("click", () => openForm("#product-form", "Add product"));
    $("#add-category")?.addEventListener("click", () => openForm("#category-form", "Add category"));
    $("#add-review")?.addEventListener("click", () => openForm("#review-form", "Add review"));
    $("#add-type")?.addEventListener("click", () => openForm("#type-form", "Add variant type"));
    $("#add-variant")?.addEventListener("click", () => openForm("#variant-form", "Add variant"));
    main.querySelectorAll("[data-order]").forEach((select) => {
      select.addEventListener("change", () => saveOrder(select));
    });
    main.querySelectorAll("[data-inquiry]").forEach((select) => {
      select.addEventListener("change", () => saveInquiry(select));
    });
    main.querySelectorAll("[data-order-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openOrder = btn.dataset.orderOpen;
        render();
        const work = document.querySelector(".work");
        if (work) work.scrollTop = 0;
      });
    });
    main.querySelectorAll("[data-order-back]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openOrder = "";
        render();
      });
    });
    main.querySelectorAll("[data-cancel]").forEach((btn) => btn.addEventListener("click", () => closeModal(btn.closest("form"))));
    main.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal(modal.querySelector("form"));
      });
    });
    main.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => edit(btn.dataset.edit, btn.dataset.id)));
    main.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => remove(btn.dataset.delete, btn.dataset.id)));
    main.querySelectorAll("form").forEach((form) => {
      const file = form.elements.file;
      if (!file) return;
      file.addEventListener("change", () => {
        const picked = file.files && file.files[0];
        if (!picked) return;
        const reader = new FileReader();
        reader.onload = () => showPreview(form, reader.result);
        reader.readAsDataURL(picked);
      });
    });
    const search = $("#product-search");
    const category = $("#product-category");
    const shown = $("#product-shown");
    if (search && category && shown) {
      const apply = () => {
        productQuery = search.value;
        productCategory = category.value;
        productShown = shown.value;
        const query = productQuery.trim().toLowerCase();
        let visible = 0;
        main.querySelectorAll("[data-product-row]").forEach((row) => {
          const name = row.dataset.name.toLowerCase();
          const cat = row.dataset.cat;
          const okQuery = !query || name.includes(query) || cat.toLowerCase().includes(query);
          const okCategory = !productCategory || cat === productCategory;
          const okShown = productShown === "all"
            || (productShown === "home" && row.dataset.home === "1")
            || (productShown === "catalog" && row.dataset.home !== "1")
            || (productShown === "variants" && row.dataset.hasVariants === "1");
          row.hidden = !(okQuery && okCategory && okShown);
          if (!row.hidden) visible += 1;
        });
        const empty = $("#product-empty");
        if (empty) empty.hidden = visible !== 0 || !main.querySelector("[data-product-row]");
        const count = $("[data-product-count]");
        if (count) count.textContent = visible + " shown";
        main.querySelectorAll("[data-product-filter]").forEach((btn) => {
          btn.classList.toggle("is-picked", btn.dataset.productFilter === productShown);
        });
      };
      search.addEventListener("input", apply);
      category.addEventListener("change", apply);
      shown.addEventListener("change", apply);
      main.querySelectorAll("[data-product-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
          shown.value = btn.dataset.productFilter;
          apply();
        });
      });
      apply();
    }
    wireRows("#type-search", "[data-type-row]", "#type-empty", "[data-type-count]", (value) => { typeQuery = value; });
    wireRows("#variant-search", "[data-variant-row]", "#variant-empty", "[data-variant-count]", (value, type) => {
      variantQuery = value;
      if (type) variantTypeFilter = type;
    }, { id: "#variant-type", match: (row, value) => value === "all" || row.dataset.type === value });
    wireRows("#category-search", "[data-category-row]", "#category-empty", "[data-category-count]", (value) => { categoryQuery = value; });
    wireRows("#customer-search", "[data-customer-row]", "#customer-empty", "[data-customer-count]", (value) => { customerQuery = value; });
    const orderSearch = $("#order-search");
    const orderStatusField = $("#order-status");
    const orderPayField = $("#order-pay");
    if (orderSearch && orderStatusField && orderPayField) {
      const applyOrders = () => {
        orderQuery = orderSearch.value;
        orderStatus = orderStatusField.value;
        orderPay = orderPayField.value;
        const query = orderQuery.trim().toLowerCase();
        let visible = 0;
        main.querySelectorAll("[data-order-row]").forEach((row) => {
          const okQuery = !query || row.dataset.q.toLowerCase().includes(query);
          const okStatus = orderStatus === "all" || row.dataset.status === orderStatus;
          const okPay = orderPay === "all" || row.dataset.pay === orderPay;
          row.hidden = !(okQuery && okStatus && okPay);
          if (!row.hidden) visible += 1;
        });
        const empty = $("#order-empty");
        if (empty) empty.hidden = visible !== 0 || !main.querySelector("[data-order-row]");
        const count = $("[data-order-count]");
        if (count) count.textContent = visible + " shown";
        main.querySelectorAll("[data-order-filter]").forEach((btn) => {
          const kind = btn.dataset.orderFilter;
          const picked = kind === "all" ? orderStatus === "all" && orderPay === "all"
            : kind === "Unpaid" ? orderPay === "Unpaid" && orderStatus === "all"
            : orderStatus === kind && orderPay === "all";
          btn.classList.toggle("is-picked", picked);
        });
      };
      orderSearch.addEventListener("input", applyOrders);
      orderStatusField.addEventListener("change", applyOrders);
      orderPayField.addEventListener("change", applyOrders);
      main.querySelectorAll("[data-order-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const kind = btn.dataset.orderFilter;
          if (kind === "Unpaid") {
            orderStatusField.value = "all";
            orderPayField.value = "Unpaid";
          } else if (kind === "all") {
            orderStatusField.value = "all";
            orderPayField.value = "all";
          } else {
            orderStatusField.value = kind;
            orderPayField.value = "all";
          }
          applyOrders();
        });
      });
      applyOrders();
    }
    const inquirySearch = $("#inquiry-search");
    const inquiryStatusField = $("#inquiry-status");
    if (inquirySearch && inquiryStatusField) {
      const applyInquiries = () => {
        inquiryQuery = inquirySearch.value;
        inquiryStatus = inquiryStatusField.value;
        const query = inquiryQuery.trim().toLowerCase();
        let visible = 0;
        main.querySelectorAll("[data-inquiry-row]").forEach((row) => {
          const okQuery = !query || row.dataset.q.toLowerCase().includes(query);
          const okStatus = inquiryStatus === "all" || row.dataset.status === inquiryStatus;
          row.hidden = !(okQuery && okStatus);
          if (!row.hidden) visible += 1;
        });
        const empty = $("#inquiry-empty");
        if (empty) empty.hidden = visible !== 0 || !main.querySelector("[data-inquiry-row]");
        const count = $("[data-inquiry-count]");
        if (count) count.textContent = visible + " shown";
      };
      inquirySearch.addEventListener("input", applyInquiries);
      inquiryStatusField.addEventListener("change", applyInquiries);
      applyInquiries();
    }
    main.querySelectorAll("[data-variant-all]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const boxes = [...main.querySelectorAll("[name='variant']")].filter((box) => box.dataset.type === btn.dataset.variantAll);
        const next = !boxes.every((box) => box.checked);
        boxes.forEach((box) => { box.checked = next; });
      });
    });
    $("#product-form")?.addEventListener("submit", (e) => saveItem(e, "products"));
    $("#category-form")?.addEventListener("submit", (e) => saveItem(e, "categories"));
    $("#review-form")?.addEventListener("submit", (e) => saveItem(e, "reviews"));
    $("#type-form")?.addEventListener("submit", (e) => saveItem(e, "variant-types"));
    $("#variant-form")?.addEventListener("submit", (e) => saveItem(e, "variants"));
    $("#settings-form")?.addEventListener("submit", saveSettings);
    $("#website-form")?.addEventListener("submit", saveWebsite);
    const sectionsForm = $("#sections-form");
    if (sectionsForm) {
      sectionsForm.addEventListener("submit", saveSections);
      sectionsForm.addEventListener("change", (event) => {
        const input = event.target.closest("[data-file]");
        if (!input || !input.files || !input.files[0]) return;
        const preview = input.closest(".set-card, .content-item").querySelector("[data-preview]");
        if (!preview) return;
        const reader = new FileReader();
        reader.onload = () => { preview.hidden = false; preview.src = reader.result; };
        reader.readAsDataURL(input.files[0]);
      });
      sectionsForm.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-section-tab]");
        if (tab) {
          sectionsForm.querySelectorAll("[data-section-tab]").forEach((btn) => {
            const on = btn === tab;
            btn.classList.toggle("is-on", on);
            btn.setAttribute("aria-selected", on ? "true" : "false");
          });
          sectionsForm.querySelectorAll("[data-section-panel]").forEach((panel) => {
            panel.hidden = panel.dataset.sectionPanel !== tab.dataset.sectionTab;
          });
          const work = document.querySelector(".work");
          if (work) work.scrollTop = 0;
          return;
        }
        const remove = event.target.closest("[data-remove-row]");
        if (remove) {
          const list = remove.closest("[data-announce-list], [data-step-list]");
          if (list && list.querySelectorAll("[data-item]").length <= 1) return;
          remove.closest("[data-item]").remove();
          return;
        }
        if (event.target.closest("[data-add-announce]")) {
          const list = sectionsForm.querySelector("[data-announce-list]");
          if (list.querySelectorAll("[data-announce]").length >= 8) return;
          list.insertAdjacentHTML("beforeend", announceRow({}));
        }
        if (event.target.closest("[data-add-step]")) {
          const list = sectionsForm.querySelector("[data-step-list]");
          if (list.querySelectorAll("[data-step]").length >= 12) return;
          list.insertAdjacentHTML("beforeend", stepRow({}, list.querySelectorAll("[data-step]").length));
        }
      });
    }
    const bannerFile = $("#website-form")?.elements.bannerFile;
    if (bannerFile) {
      bannerFile.addEventListener("change", () => {
        const picked = bannerFile.files && bannerFile.files[0];
        const preview = $("#website-form").querySelector("[data-banner-preview]");
        if (!picked || !preview) return;
        const reader = new FileReader();
        reader.onload = () => { preview.hidden = false; preview.src = reader.result; };
        reader.readAsDataURL(picked);
      });
    }
  }

  function showPreview(form, src) {
    const img = form.querySelector("[data-preview]");
    if (!img) return;
    if (!src) { img.hidden = true; img.removeAttribute("src"); return; }
    img.hidden = false;
    img.src = String(src).startsWith("data:") || String(src).startsWith("/") || String(src).startsWith("http") ? src : "/" + src;
  }

  function openModal(form) {
    const modal = form.closest(".modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    const field = form.querySelector("input:not([type=hidden]), textarea, select");
    if (field) field.focus();
  }

  function closeModal(form) {
    if (!form) return;
    const modal = form.closest(".modal");
    if (modal) modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function openForm(sel, title) {
    const form = $(sel);
    form.reset();
    if (form.elements.id) form.elements.id.value = "";
    const error = form.querySelector("[data-form-error]");
    if (error) error.textContent = "";
    const heading = form.querySelector("h2");
    if (heading) heading.textContent = title;
    showPreview(form, "");
    openModal(form);
  }

  function edit(key, id) {
    const sel = { products: "#product-form", categories: "#category-form", reviews: "#review-form", "variant-types": "#type-form", variants: "#variant-form" }[key];
    const list = { products: "products", categories: "categories", reviews: "reviews", "variant-types": "variantTypes", variants: "variants" }[key];
    const form = $(sel);
    const item = data[list].find((row) => row.id === id);
    const titles = { products: "Edit product", categories: "Edit category", reviews: "Edit review", "variant-types": "Edit variant type", variants: "Edit variant" };
    openForm(sel, titles[key]);
    fill(form, item);
    showPreview(form, item.image || "");
  }

  async function saveItem(event, key) {
    event.preventDefault();
    const form = event.currentTarget;
    const error = form.querySelector("[data-form-error]");
    error.textContent = "";
    const body = Object.fromEntries(new FormData(form).entries());
    if (form.elements.featured) body.featured = form.elements.featured.checked;
    if (form.elements.isDefault) body.isDefault = form.elements.isDefault.checked;
    if (form.querySelector("[name='variant']")) {
      const checked = [...form.querySelectorAll("[name='variant']:checked")];
      body.variantIds = checked.map((box) => box.value);
      body.variantTypeIds = [...new Set(checked.map((box) => box.dataset.type))];
      const prices = {};
      checked.forEach((box) => {
        const input = form.querySelector(`[data-variant-price="${box.value}"]`);
        if (!input) return;
        const amount = Number(input.value);
        const base = Number(input.dataset.base);
        if (Number.isFinite(amount) && amount !== base) prices[box.value] = amount;
      });
      body.variantPrices = prices;
    }
    const id = body.id;
    const name = names[key] || "Item";
    try {
      if (form.elements.file) body.image = await fileToImage(form) || body.image;
      delete body.file;
      delete body.id;
      if (id) await api(`/api/admin/${key}/${encodeURIComponent(id)}`, { method: "PUT", body });
      else await api(`/api/admin/${key}`, { method: "POST", body });
      await load();
      notify(true, id ? `${name} updated` : `${name} added`);
    } catch (err) {
      error.textContent = err.message;
      notify(false, id ? `Could not update ${name.toLowerCase()}` : `Could not add ${name.toLowerCase()}`, err.message);
    }
  }

  async function remove(key, id) {
    const name = names[key] || "Item";
    let yes = false;
    if (window.Swal) {
      const result = await Swal.fire({
        icon: "warning",
        title: `Delete this ${name.toLowerCase()}?`,
        text: "The website updates on the next visit.",
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#b42318",
        cancelButtonColor: "#64748b",
        reverseButtons: true
      });
      yes = result.isConfirmed;
    } else {
      yes = confirm(`Delete this ${name.toLowerCase()}? The website updates on the next visit.`);
    }
    if (!yes) return;
    try {
      await api(`/api/admin/${key}/${encodeURIComponent(id)}`, { method: "DELETE" });
      await load();
      notify(true, `${name} deleted`);
    } catch (err) {
      notify(false, "Could not delete", err.message);
    }
  }

  async function saveOrder(select) {
    const sheet = select.closest("[data-order-sheet]");
    const id = select.dataset.order;
    const status = sheet.querySelector("[data-field='status']").value;
    const payment = sheet.querySelector("[data-field='payment']").value;
    const order = (data.orders || []).find((item) => item.id === id);
    const previousStatus = order ? order.status : sheet.dataset.status;
    const previousPay = order ? order.payment : sheet.dataset.pay;
    try {
      await api(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PUT", body: { status, payment } });
      if (order) {
        order.status = status;
        order.payment = payment;
      }
      sheet.dataset.status = status;
      sheet.dataset.pay = payment;
      const tags = document.querySelector(".dash-head .order-tags");
      if (tags && order) tags.innerHTML = orderTags(order);
      notify(true, "Order updated");
    } catch (err) {
      sheet.querySelector("[data-field='status']").value = previousStatus;
      sheet.querySelector("[data-field='payment']").value = previousPay;
      notify(false, "Could not update order", err.message);
    }
  }

  async function saveInquiry(select) {
    const id = select.dataset.inquiry;
    const status = select.value;
    const item = (data.inquiries || []).find((row) => row.id === id);
    const row = select.closest("[data-inquiry-row]");
    const previous = item ? (item.status || "New") : (row ? row.dataset.status : "New");
    try {
      await api(`/api/admin/inquiries/${encodeURIComponent(id)}`, { method: "PUT", body: { status } });
      if (item) item.status = status;
      if (row) row.dataset.status = status;
      const filter = $("#inquiry-status");
      if (filter) filter.dispatchEvent(new Event("change"));
      notify(true, "Enquiry updated");
    } catch (err) {
      select.value = previous;
      notify(false, "Could not update enquiry", err.message);
    }
  }

  async function saveWebsite(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const error = form.querySelector("[data-form-error]");
    error.textContent = "";
    try {
      let bannerImage = form.querySelector("[data-banner-image]").value;
      const file = form.elements.bannerFile.files[0];
      if (file) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const uploaded = await api("/api/admin/upload", { method: "POST", body: { name: file.name, data: dataUrl } });
        bannerImage = uploaded.image;
      }
      const banners = [...form.querySelectorAll("[data-banner]")].map((row) => ({
        title: row.querySelector("[data-banner-title]").value,
        text: row.querySelector("[data-banner-text]").value,
        button: row.querySelector("[data-banner-button]").value,
        href: row.querySelector("[data-banner-href]").value,
      }));
      const menu = [...form.querySelectorAll("[data-menu-row]")].map((row) => ({
        label: row.querySelector("[data-menu-label]").value,
        href: row.querySelector("[data-menu-href]").value,
        enabled: row.querySelector("[data-menu-on]").checked,
      }));
      const sections = {};
      form.querySelectorAll("[data-section]").forEach((box) => { sections[box.dataset.section] = box.checked; });
      data = await api("/api/admin/settings", { method: "PUT", body: { website: { bannerImage, banners, menu, sections } } });
      form.querySelector("[data-saved]").hidden = false;
      notify(true, "Website updated");
    } catch (err) {
      error.textContent = err.message;
      notify(false, "Could not update website", err.message);
    }
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function storedImage(scope) {
    const input = scope.querySelector("[data-file]");
    const current = scope.querySelector("[data-image]");
    const file = input && input.files && input.files[0];
    if (!file) return current ? current.value : "";
    const uploaded = await api("/api/admin/upload", { method: "POST", body: { name: file.name, data: await readFile(file) } });
    return uploaded.image;
  }

  async function saveSections(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const error = form.querySelector("[data-form-error]");
    error.textContent = "";
    const site = (data.settings && data.settings.website) || {};
    try {
      const announcements = [];
      for (const row of form.querySelectorAll("[data-announce]")) {
        announcements.push({
          text: row.querySelector("[data-text]").value,
          href: row.querySelector("[data-href]").value,
          image: await storedImage(row),
        });
      }
      const steps = [];
      for (const row of form.querySelectorAll("[data-step]")) {
        steps.push({
          title: row.querySelector("[data-title]").value,
          text: row.querySelector("[data-text]").value,
          image: await storedImage(row),
        });
      }
      const reasonsCard = form.querySelector("[name=reasonsTitle]").closest(".set-card");
      const chooseCard = form.querySelector("[name=chooseTitle]").closest(".set-card");
      const blocks = {
        announcements,
        how: {
          kicker: form.elements.howKicker.value,
          title: form.elements.howTitle.value,
          accent: form.elements.howAccent.value,
          text: form.elements.howText.value,
          readyTitle: form.elements.readyTitle.value,
          readyText: form.elements.readyText.value,
          readyButton: form.elements.readyButton.value,
          readyHref: form.elements.readyHref.value,
          steps,
        },
        reasons: {
          kicker: form.elements.reasonsKicker.value,
          title: form.elements.reasonsTitle.value,
          text: form.elements.reasonsText.value,
          image: await storedImage(reasonsCard),
        },
        choose: {
          kicker: form.elements.chooseKicker.value,
          title: form.elements.chooseTitle.value,
          text: form.elements.chooseText.value,
          button: form.elements.chooseButton.value,
          href: form.elements.chooseHref.value,
          image: await storedImage(chooseCard),
        },
      };
      data = await api("/api/admin/settings", {
        method: "PUT",
        body: { website: { bannerImage: site.bannerImage, banners: site.banners, menu: site.menu, sections: site.sections, blocks } },
      });
      form.querySelector("[data-saved]").hidden = false;
      notify(true, "Page sections updated");
    } catch (err) {
      error.textContent = err.message;
      notify(false, "Could not update page sections", err.message);
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const error = form.querySelector("[data-form-error]");
    error.textContent = "";
    try {
      const body = Object.fromEntries(new FormData(form).entries());
      body.paymentEnabled = form.elements.paymentEnabled.checked;
      body.smsEnabled = form.elements.smsEnabled.checked;
      body.mailEnabled = form.elements.mailEnabled.checked;
      data = await api("/api/admin/settings", { method: "PUT", body });
      form.querySelector("[data-saved]").hidden = false;
      notify(true, "Settings updated");
    } catch (err) {
      error.textContent = err.message;
      notify(false, "Could not update settings", err.message);
    }
  }

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.view === "orders") openOrder = "";
      view = btn.dataset.view;
      const hash = "#" + view;
      if (location.hash !== hash) history.pushState(null, "", hash);
      render();
      const work = document.querySelector(".work");
      if (work) work.scrollTop = 0;
      window.scrollTo(0, 0);
    });
  });

  window.addEventListener("hashchange", () => {
    const next = readView();
    if (next === view) return;
    if (next === "orders") openOrder = "";
    view = next;
    if (!data) return;
    render();
    const work = document.querySelector(".work");
    if (work) work.scrollTop = 0;
  });

  $("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = $("#login-error");
    error.textContent = "";
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await api("/api/admin/login", { method: "POST", body });
      showApp();
      await load();
    } catch (err) {
      error.textContent = err.message;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const open = document.querySelector(".modal:not([hidden]) form");
    if (open) closeModal(open);
  });

  $("#logout").addEventListener("click", async () => {
    await api("/api/admin/logout", { method: "POST", body: {} });
    shell.hidden = true;
    gate.hidden = false;
  });

  api("/api/admin/session").then(async (session) => {
    if (!session.ok) return;
    showApp();
    await load();
  }).catch(() => {});
})();
