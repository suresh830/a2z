(async function () {
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Number(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const products = () => (window.A2Z && A2Z.products) || [];
  const findProduct = (id) => products().find((p) => p.id === id);
  const heart = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"/></svg>';
  const eye = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const bag = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>';
  const gmark = '<svg class="gmark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.6L6.4 14z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.6 9.4 5.9 12 5.9z"/></svg>';

  function productCard(p) {
    const id = encodeURIComponent(p.id);
    const name = esc(p.name);
    return `<article class="product-card" data-product data-cat="${esc(p.category)}" data-name="${name}">
      <div class="product-visual">
        <a href="product.html?id=${id}"><img src="${esc(p.image)}" alt="${name}"></a>
        <span class="product-actions">
          <button type="button" data-wish="${esc(p.id)}" aria-label="Save ${name}">${heart}</button>
          <a href="product.html?id=${id}" aria-label="View ${name}">${eye}</a>
          <button type="button" data-add="${esc(p.id)}" aria-label="Add ${name} to cart">${bag}</button>
        </span>
      </div>
      <div class="product-meta"><h3><a href="product.html?id=${id}">${name}</a></h3><p class="price">${money(p.price)}</p></div>
    </article>`;
  }

  function paintContent(content) {
    if (window.A2Z && Array.isArray(content.products)) A2Z.products = content.products;
    if (window.A2Z) {
      A2Z.variantTypes = content.variantTypes || [];
      A2Z.variants = content.variants || [];
      if (content.settings) A2Z.settings = content.settings;
    }
    const featured = document.querySelector("[data-featured]");
    if (featured && content.products) featured.innerHTML = content.products.filter((p) => p.featured).map(productCard).join("");
    const catalog = document.querySelector("[data-catalog]");
    if (catalog && content.products) catalog.innerHTML = content.products.map(productCard).join("");
    const cats = document.querySelector("[data-categories]");
    if (cats && content.categories) {
      cats.innerHTML = content.categories.map((c) => `<a class="cat-card" href="products.html?cat=${encodeURIComponent(c.name)}"><div class="cat-visual"><img src="${esc(c.image)}" alt="${esc(c.name)}"></div><h3>${esc(c.name)}</h3></a>`).join("");
    }
    if (content.categories) {
      document.querySelectorAll("[data-catbar]").forEach((bar) => {
        const links = content.categories.map((c) => `<a href="products.html?cat=${encodeURIComponent(c.name)}">${esc(c.name)}</a>`).join("");
        bar.innerHTML = links + links;
        bar.querySelectorAll("a").forEach((link, index, all) => {
          if (index >= all.length / 2) link.setAttribute("aria-hidden", "true");
        });
        bar.classList.add("is-loop");
      });
      const filters = document.querySelector("[data-filters]");
      if (filters) {
        filters.innerHTML = `<a class="chip" href="products.html">All</a>` + content.categories.map((c) => `<a class="chip" href="products.html?cat=${encodeURIComponent(c.name)}">${esc(c.name)}</a>`).join("");
      }
    }
    const reviewTrack = document.querySelector("[data-reviews]");
    if (reviewTrack && Array.isArray(content.reviews) && content.reviews.length) {
      reviewTrack.innerHTML = content.reviews.map((r) => {
        const stars = Math.min(5, Math.max(1, Number(r.stars) || 5));
        const face = r.image
          ? `<img src="${esc(r.image)}" alt="">`
          : esc(String(r.name || "?").trim().charAt(0).toUpperCase());
        return `<article class="review-card"><div class="review-top"><span class="avatar">${face}</span><div><strong>${esc(r.name)}</strong><span>${esc(r.when)}</span></div>${gmark}</div><div class="stars" aria-label="${stars} stars">${"★".repeat(stars)}</div><p>${esc(r.text)}</p></article>`;
      }).join("");
    }
    const settings = content.settings || {};
    const swapText = (el, text) => {
      const node = [...el.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim());
      if (node) node.textContent = " " + text;
    };
    if (settings.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
        link.setAttribute("href", "tel:" + (settings.phoneHref || String(settings.phone).replace(/\D/g, "")));
        swapText(link, settings.phone);
      });
    }
    if (settings.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
        link.setAttribute("href", "mailto:" + settings.email);
        swapText(link, settings.email);
      });
    }
    document.querySelectorAll("strong").forEach((strong) => {
      const parent = strong.parentElement;
      if (!parent) return;
      const label = strong.textContent.trim();
      const rest = label === "Address" ? settings.address : label === "Open Hours" ? [settings.hours, settings.hoursNote].filter(Boolean).join("\n") : "";
      if (!rest) return;
      [...parent.childNodes].forEach((node) => { if (node !== strong) node.remove(); });
      strong.insertAdjacentHTML("afterend", esc(rest).replace(/\n/g, "<br>"));
    });
    const topAddress = document.querySelector(".topbar-right span");
    if (topAddress && settings.address) swapText(topAddress, settings.address);
    applyWebsite(settings.website);
  }

  const promoIcons = [
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5L20 7"/></svg>',
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V5M8 8l4-4 4 4"/><path d="M4 20h16"/></svg>',
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>',
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7 12 3l9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>'
  ];
  const stepIcons = [
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/><path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2H17a1.5 1.5 0 0 0 1.5-1.2L20 8H7"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M12 16V6M8.5 9.5 12 6l3.5 3.5"/><path d="M5 16.5V19h14v-2.5"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M6 9l6 6 6-6"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M7 8V4h10v4"/><path d="M6 16H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-2"/><rect x="7" y="13" width="10" height="7" rx="1"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.6"/><circle cx="18" cy="17" r="1.6"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M12 13 4 7M12 13l8-6M12 13v8"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M8 14c1.2 1.5 2.5 2 4 2s2.8-.5 4-2"/><path d="M9 10h.01M15 10h.01"/></svg>'
  ];

  function titled(title, accent) {
    const text = String(title || "");
    const mark = String(accent || "");
    const at = mark ? text.indexOf(mark) : -1;
    if (at < 0) return esc(text);
    return esc(text.slice(0, at)) + `<span class="accent">${esc(mark)}</span>` + esc(text.slice(at + mark.length));
  }

  function applyBlocks(blocks) {
    if (!blocks) return;
    const items = Array.isArray(blocks.announcements) ? blocks.announcements : [];
    if (items.length) {
      document.querySelectorAll(".promobar-inner").forEach((bar) => {
        bar.innerHTML = items.map((item, index) => {
          const icon = item.image ? `<img src="${esc(item.image)}" alt="">` : promoIcons[index % promoIcons.length];
          const inner = `${icon} ${esc(item.text)}`;
          return item.href ? `<a href="${esc(item.href)}">${inner}</a>` : `<span>${inner}</span>`;
        }).join("");
      });
    }
    const how = blocks.how;
    const howRoot = document.querySelector("#how");
    if (how && howRoot) {
      const kicker = howRoot.querySelector(".how-intro .review-kicker");
      const heading = howRoot.querySelector(".how-intro h2");
      const lead = howRoot.querySelector(".how-intro p");
      if (kicker && how.kicker) kicker.textContent = how.kicker;
      if (heading && how.title) heading.innerHTML = titled(how.title, how.accent);
      if (lead && how.text) lead.innerHTML = esc(how.text).replace(/\n/g, "<br>");
      const steps = howRoot.querySelector(".steps");
      if (steps && Array.isArray(how.steps) && how.steps.length) {
        steps.innerHTML = how.steps.map((step, index) => {
          const icon = step.image ? `<img src="${esc(step.image)}" alt="">` : stepIcons[index % stepIcons.length];
          return `<article class="step"><span class="step-no">${String(index + 1).padStart(2, "0")}</span><div class="step-icon">${icon}</div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></article>`;
        }).join("");
      }
      const ready = howRoot.querySelector(".ready");
      if (ready) {
        const readyTitle = ready.querySelector("h3");
        const readyText = ready.querySelector("p");
        const readyLink = ready.querySelector("a");
        if (readyTitle && how.readyTitle) readyTitle.textContent = how.readyTitle;
        if (readyText && how.readyText) readyText.textContent = how.readyText;
        if (readyLink && how.readyButton) readyLink.textContent = how.readyButton;
        if (readyLink && how.readyHref) readyLink.setAttribute("href", how.readyHref);
      }
    }
    ["reasons", "choose"].forEach((key) => {
      const block = blocks[key];
      const root = document.querySelector(`[data-home="${key}"]`);
      if (!block || !root) return;
      const kicker = root.querySelector(".kicker");
      const heading = root.querySelector("h2");
      const text = root.querySelector("p");
      const image = root.querySelector("img");
      if (kicker && block.kicker) kicker.textContent = block.kicker;
      if (heading && block.title) heading.textContent = block.title;
      if (text && block.text) text.textContent = block.text;
      if (image && block.image) {
        image.setAttribute("src", block.image);
        if (block.title) image.setAttribute("alt", block.title);
      }
      const button = root.querySelector("a.btn");
      if (button && block.button) button.textContent = block.button;
      if (button && block.href) button.setAttribute("href", block.href);
    });
  }

  function applyWebsite(site) {
    if (!site) return;
    applyBlocks(site.blocks);
    const sections = site.sections || {};
    const targets = {
      promo: ".promobar", banner: ".hero-banner", how: "#how", categories: "#categories",
      products: "#products", reasons: "[data-home='reasons']", choose: "[data-home='choose']",
      reviews: "#reviews", quote: "#quote", trust: ".trust"
    };
    Object.entries(targets).forEach(([key, sel]) => {
      if (!(key in sections)) return;
      document.querySelectorAll(sel).forEach((el) => { el.hidden = sections[key] === false; });
    });
    const menu = Array.isArray(site.menu) ? site.menu.filter((item) => item.enabled !== false && item.label && item.href) : [];
    if (menu.length) {
      const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
      document.querySelectorAll("nav.nav").forEach((nav) => {
        nav.innerHTML = menu.map((item) => {
          const file = String(item.href).split("#")[0].split("/").pop().toLowerCase();
          return `<a href="${esc(item.href)}"${file === page ? ' aria-current="page"' : ""}>${esc(item.label)}</a>`;
        }).join("");
      });
    }
    const banners = Array.isArray(site.banners) ? site.banners : [];
    [...document.querySelectorAll(".hero-slide")].forEach((slide, index) => {
      const banner = banners[index];
      if (!banner) return;
      const lead = slide.querySelector(".lead");
      const button = slide.querySelector(".btn");
      const heading = slide.querySelector("h1");
      if (lead && banner.text) lead.textContent = banner.text;
      if (button && banner.button) button.textContent = banner.button;
      if (button && banner.href) button.setAttribute("href", banner.href);
      if (heading && banner.title) heading.textContent = banner.title;
    });
    const photo = document.querySelector(".hero-banner-photo");
    if (photo && site.bannerImage) photo.setAttribute("src", site.bannerImage);
  }

  try {
    const response = await fetch("/api/content", { cache: "no-store" });
    if (response.ok) paintContent(await response.json());
  } catch (e) { /* keep the page markup when the admin API is unavailable */ }

  const store = {
    get(key) {
      try { return JSON.parse(localStorage.getItem(key)) || []; }
      catch (e) { return []; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  };

  const header = document.querySelector(".header");
  const onScroll = () => header && header.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = document.querySelector("[data-menu]");
  const nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => btn.parentElement.classList.toggle("is-open"));
  });
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".lang.is-open").forEach((el) => {
      if (!el.contains(e.target)) el.classList.remove("is-open");
    });
  });
  const langLabel = document.querySelector("[data-lang-label]");
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (langLabel) langLabel.textContent = btn.dataset.lang === "fr" ? "Fr" : "En";
      document.documentElement.lang = btn.dataset.lang === "fr" ? "fr" : "en";
      document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("is-on", b === btn));
      btn.closest(".lang").classList.remove("is-open");
    });
  });

  const slides = [...document.querySelectorAll(".hero-slide")];
  const dots = [...document.querySelectorAll(".hero-dots button")];
  let slideIndex = 0;
  let slideTimer;
  function showSlide(i) {
    if (!slides.length) return;
    slideIndex = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("is-active", n === slideIndex));
    dots.forEach((d, n) => d.classList.toggle("is-active", n === slideIndex));
  }
  function startSlides() {
    if (slides.length < 2) return;
    clearInterval(slideTimer);
    slideTimer = setInterval(() => showSlide(slideIndex + 1), 6500);
  }
  dots.forEach((d, i) => d.addEventListener("click", () => { showSlide(i); startSlides(); }));
  startSlides();

  const track = document.querySelector("[data-reviews]");
  if (track) {
    const clip = track.parentElement;
    const originals = [...track.children];
    const count = originals.length;
    originals.forEach((card) => {
      const copy = card.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      track.appendChild(copy);
    });
    const cards = [...track.children];
    let index = 0;
    let animating = false;

    function perView() { return window.innerWidth <= 680 ? 1 : window.innerWidth <= 980 ? 2 : 3; }
    function cardStep() {
      const view = Math.min(perView(), count);
      const gap = 18;
      const clipWidth = clip.getBoundingClientRect().width;
      const cardW = (clipWidth - gap * (view - 1)) / view;
      cards.forEach((card) => { card.style.flexBasis = cardW + "px"; });
      return cardW + gap;
    }
    function place(to, animate) {
      index = to;
      track.style.transition = animate ? "transform 0.4s ease" : "none";
      track.style.transform = "translateX(" + (-index * cardStep()) + "px)";
    }
    function showReviews(dir) {
      if (!count || animating) return;
      if (dir < 0 && index === 0) {
        place(count, false);
        track.getBoundingClientRect();
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      animating = !reduce;
      place(index + dir, !reduce);
      const finish = () => {
        if (index >= count) place(0, false);
        animating = false;
      };
      if (reduce) finish();
      else {
        const timer = setTimeout(finish, 480);
        track.addEventListener("transitionend", function onEnd(event) {
          if (event.target !== track) return;
          clearTimeout(timer);
          track.removeEventListener("transitionend", onEnd);
          finish();
        });
      }
    }
    document.querySelectorAll("[data-rev]").forEach((btn) => {
      btn.addEventListener("click", () => showReviews(Number(btn.dataset.rev)));
    });
    window.addEventListener("resize", () => place(0, false));
    place(0, false);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2200);
  }

  const back = document.createElement("div");
  back.className = "drawer-back";
  const cartDrawer = document.createElement("aside");
  cartDrawer.className = "drawer";
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.innerHTML = `
    <header><h3>Your cart</h3><button class="ghost" type="button" data-close>Close</button></header>
    <div class="body" data-cart-body></div>
    <footer>
      <div><strong>Total</strong><div data-cart-total>$0.00</div></div>
      <div class="drawer-go">
        <a class="btn btn-soft" href="cart.html">View cart</a>
        <a class="btn" href="checkout.html">Checkout</a>
      </div>
    </footer>`;
  const wishDrawer = document.createElement("aside");
  wishDrawer.className = "drawer";
  wishDrawer.innerHTML = `
    <header><h3>Wishlist</h3><button class="ghost" type="button" data-close>Close</button></header>
    <div class="body" data-wish-body></div>
    <footer><a class="btn" href="products.html">Browse products</a></footer>`;
  const editModal = document.createElement("div");
  editModal.className = "cart-edit";
  editModal.hidden = true;
  editModal.innerHTML = `
    <form class="cart-edit-card" id="cart-edit-form">
      <header class="cart-edit-head">
        <div>
          <p class="cart-edit-kicker">Edit item</p>
          <h2 data-edit-name>Product</h2>
        </div>
        <button class="cart-edit-x" type="button" data-edit-cancel aria-label="Close">×</button>
      </header>
      <div class="cart-edit-body">
        <div class="cart-edit-fields" data-edit-fields></div>
        <div class="option cart-edit-qty"><label for="edit-qty">Quantity</label><input id="edit-qty" name="qty" type="number" min="1" max="500" value="1"></div>
      </div>
      <footer class="cart-edit-foot">
        <div><span>Line total</span><strong data-edit-price>$0.00</strong></div>
        <div class="cart-edit-actions">
          <button class="btn btn-soft" type="button" data-edit-cancel>Cancel</button>
          <button class="btn" type="submit">Update item</button>
        </div>
      </footer>
    </form>`;
  document.body.append(back, cartDrawer, wishDrawer, editModal);

  function openDrawer(which) {
    back.classList.add("is-open");
    cartDrawer.classList.toggle("is-open", which === "cart");
    wishDrawer.classList.toggle("is-open", which === "wish");
    cartDrawer.setAttribute("aria-hidden", which === "cart" ? "false" : "true");
  }
  function closeDrawers() {
    back.classList.remove("is-open");
    cartDrawer.classList.remove("is-open");
    wishDrawer.classList.remove("is-open");
  }
  back.addEventListener("click", closeDrawers);
  document.body.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeDrawers();
    if (e.target.closest("[data-open='cart']")) { renderCart(); openDrawer("cart"); }
    if (e.target.closest("[data-open='wish']")) { renderWish(); openDrawer("wish"); }
  });

  function counts() {
    const cart = store.get("a2z-cart");
    const wish = store.get("a2z-wish");
    const cartN = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = cartN; });
    document.querySelectorAll("[data-wish-count]").forEach((el) => { el.textContent = wish.length; });
    document.querySelectorAll("[data-wish]").forEach((btn) => {
      btn.classList.toggle("is-on", wish.includes(btn.dataset.wish));
    });
  }

  function renderCart() {
    const body = cartDrawer.querySelector("[data-cart-body]");
    const cart = store.get("a2z-cart");
    if (!cart.length) {
      body.innerHTML = '<p class="empty">Your cart is empty. Choose a product and add a configuration.</p>';
    } else {
      body.innerHTML = cart.map((item) => `
        <div class="line">
          <img src="${esc(item.image)}" alt="">
          <div>
            <h4>${esc(item.name)}</h4>
            <p>${esc(item.options || "Standard configuration")}</p>
            <strong>${money(item.price * item.qty)}</strong>
            <div class="qty-row">
              <button class="ghost" type="button" data-qty="${esc(item.key)}" data-dir="-1">−</button>
              <span>${item.qty}</span>
              <button class="ghost" type="button" data-qty="${esc(item.key)}" data-dir="1">+</button>
            </div>
          </div>
          <div class="line-actions">
            <button class="ghost" type="button" data-edit="${esc(item.key)}">Edit</button>
            <button class="ghost" type="button" data-remove="${esc(item.key)}">Remove</button>
          </div>
        </div>`).join("");
    }
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartDrawer.querySelector("[data-cart-total]").textContent = money(total);
    renderShopCart(cart, total);
    const box = document.querySelector("[data-checkout-summary]");
    if (box) {
      box.innerHTML = cart.length
        ? `<h3>Order summary</h3>` + cart.map((i) => `<p>${i.qty} × ${esc(i.name)}<br><span class="muted">${esc(i.options || "")}</span> — ${money(i.price * i.qty)}</p>`).join("") + `<p><strong>Total ${money(total)}</strong></p>`
        : "<p class=\"muted\">No items in the cart yet. You can still send a quote request.</p>";
    }
  }

  function renderWish() {
    const body = wishDrawer.querySelector("[data-wish-body]");
    const ids = store.get("a2z-wish");
    const items = ids.map(findProduct).filter(Boolean);
    body.innerHTML = items.length
      ? items.map((p) => `
        <div class="line">
          <img src="${esc(p.image)}" alt="">
          <div><h4>${esc(p.name)}</h4><strong>${money(p.price)}</strong></div>
          <button class="ghost" type="button" data-unwish="${esc(p.id)}">Remove</button>
        </div>`).join("")
      : '<p class="empty">Save products with the heart icon to compare them later.</p>';
  }

  function addToCart(id, extra) {
    const product = findProduct(id);
    if (!product) return;
    const price = extra.price != null ? extra.price : product.price;
    const options = extra.options || "";
    const qty = extra.qty || 1;
    const key = id + "|" + options + "|" + price;
    const cart = store.get("a2z-cart");
    const found = cart.find((i) => i.key === key);
    if (found) found.qty += qty;
    else cart.push({
      key, id, name: product.name, image: product.image, price, qty, options,
      artwork: extra.artwork || "", artworkName: extra.artworkName || ""
    });
    if (found && extra.artwork && !found.artwork) {
      found.artwork = extra.artwork;
      found.artworkName = extra.artworkName || "";
    }
    store.set("a2z-cart", cart);
    counts();
    renderCart();
    notify(product.name + " added to cart");
  }

  let editingKey = "";

  function optionParts(item) {
    return String(item.options || "").split(" · ").map((part) => part.trim()).filter(Boolean);
  }

  function lineQuantity(item) {
    const qtyPart = optionParts(item).find((part) => /^Qty\s+\d+$/i.test(part));
    const baked = qtyPart ? Number(qtyPart.replace(/^\D+/, "")) : 0;
    if (baked > 1 && Number(item.qty) === 1) return baked;
    return Math.max(1, Number(item.qty) || 1);
  }

  function editFields(product, names) {
    const types = (window.A2Z && A2Z.variantTypes) || [];
    const choices = (window.A2Z && A2Z.variants) || [];
    return (product.variantTypeIds || []).map((typeId) => {
      const type = types.find((item) => item.id === typeId);
      if (!type) return "";
      const picked = Array.isArray(product.variantIds) ? product.variantIds : null;
      const options = choices.filter((item) => item.typeId === type.id && (!picked || picked.includes(item.id)));
      if (!options.length) return "";
      return `<div class="option"><label>${esc(type.name)}</label>
        <select data-variant data-mode="${esc(type.mode)}">${options.map((choice) => {
          const prices = product.variantPrices || {};
          const amount = prices[choice.id] != null && prices[choice.id] !== "" ? prices[choice.id] : choice.amount;
          const selected = names.includes(choice.name) || (!names.some((name) => options.some((row) => row.name === name)) && choice.isDefault);
          return `<option value="${esc(amount)}"${selected ? " selected" : ""}>${esc(choice.name)}</option>`;
        }).join("")}</select></div>`;
    }).join("");
  }

  function editQuote(form, product) {
    const qty = Math.max(1, Math.min(500, Number(form.qty.value) || 1));
    let multiplier = 1;
    let extra = 0;
    const labels = [];
    form.querySelectorAll("[data-variant]").forEach((sel) => {
      const amount = Number(sel.value);
      if (sel.dataset.mode === "add") extra += amount;
      else multiplier *= Number.isFinite(amount) ? amount : 1;
      if (sel.selectedOptions[0]) labels.push(sel.selectedOptions[0].textContent);
    });
    return { qty, unit: Math.round((product.price * multiplier + extra) * 100) / 100, labels };
  }

  function closeCartEdit() {
    editingKey = "";
    editModal.hidden = true;
  }

  function openCartEdit(key) {
    const item = store.get("a2z-cart").find((row) => row.key === key);
    const product = item && findProduct(item.id);
    if (!item || !product) {
      notify("That product is no longer in the catalogue");
      return;
    }
    editingKey = key;
    const form = editModal.querySelector("form");
    const names = optionParts(item).filter((part) => !/^Qty\s+\d+$/i.test(part) && !part.startsWith("Artwork:"));
    editModal.querySelector("[data-edit-name]").textContent = product.name;
    editModal.querySelector("[data-edit-fields]").innerHTML = editFields(product, names) || "<p class=\"muted\">This product has no options. You can still change the quantity.</p>";
    form.qty.value = String(lineQuantity(item));
    const paint = () => {
      const quote = editQuote(form, product);
      editModal.querySelector("[data-edit-price]").textContent = money(quote.unit * quote.qty);
    };
    form.oninput = paint;
    paint();
    editModal.hidden = false;
    form.qty.focus();
  }

  editModal.addEventListener("click", (event) => {
    if (event.target === editModal || event.target.closest("[data-edit-cancel]")) closeCartEdit();
  });
  editModal.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const cart = store.get("a2z-cart");
    const index = cart.findIndex((row) => row.key === editingKey);
    const current = cart[index];
    const product = current && findProduct(current.id);
    if (!current || !product) {
      closeCartEdit();
      return;
    }
    const quote = editQuote(event.currentTarget, product);
    const artwork = optionParts(current).find((part) => part.startsWith("Artwork:"));
    const options = quote.labels.join(" · ") + (artwork ? " · " + artwork : "");
    const next = {
      key: current.id + "|" + options + "|" + quote.unit,
      id: current.id,
      name: product.name,
      image: product.image,
      price: quote.unit,
      qty: quote.qty,
      options,
      artwork: current.artwork || "",
      artworkName: current.artworkName || ""
    };
    cart.splice(index, 1);
    const same = cart.find((row) => row.key === next.key);
    if (same) same.qty = Math.min(500, same.qty + next.qty);
    else cart.splice(Math.min(index, cart.length), 0, next);
    store.set("a2z-cart", cart);
    counts();
    renderCart();
    closeCartEdit();
    notify(product.name + " updated");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !editModal.hidden) closeCartEdit();
  });

  document.body.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add && !add.closest("#product-config")) {
      e.preventDefault();
      addToCart(add.dataset.add, {});
    }
    const wish = e.target.closest("[data-wish]");
    if (wish) {
      e.preventDefault();
      const id = wish.dataset.wish;
      let ids = store.get("a2z-wish");
      ids = ids.includes(id) ? ids.filter((x) => x !== id) : ids.concat(id);
      store.set("a2z-wish", ids);
      counts();
      notify(ids.includes(id) ? "Saved to wishlist" : "Removed from wishlist");
    }
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const cart = store.get("a2z-cart");
      const item = cart.find((i) => i.key === qtyBtn.dataset.qty);
      if (item) {
        item.qty += Number(qtyBtn.dataset.dir);
        store.set("a2z-cart", cart.filter((i) => i.qty > 0));
        counts();
        renderCart();
      }
    }
    const remove = e.target.closest("[data-remove]");
    if (remove) {
      store.set("a2z-cart", store.get("a2z-cart").filter((i) => i.key !== remove.dataset.remove));
      counts();
      renderCart();
    }
    const edit = e.target.closest("[data-edit]");
    if (edit) openCartEdit(edit.dataset.edit);
    const unwish = e.target.closest("[data-unwish]");
    if (unwish) {
      store.set("a2z-wish", store.get("a2z-wish").filter((id) => id !== unwish.dataset.unwish));
      counts();
      renderWish();
    }
  });

  document.querySelectorAll("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.reset();
      notify("You are on the list");
    });
  });

  document.querySelectorAll("[data-quote]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const note = form.querySelector(".form-note");
      const enquiry = form.hasAttribute("data-enquiry");
      const body = Object.fromEntries(new FormData(form).entries());
      if (enquiry) body.enquiry = true;
      else body.items = cartItems();
      try {
        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error("send failed");
        if (payload.orderNumber) {
          store.set("a2z-cart", []);
          renderCart();
          counts();
        }
        if (note) note.textContent = payload.orderNumber
          ? "Thanks. Your order " + payload.orderNumber + " is with the A2Z team."
          : enquiry
            ? "Thanks. The studio has your enquiry."
            : "Thanks. The A2Z team has your message.";
        form.reset();
        notify(payload.orderNumber ? "Order " + payload.orderNumber + " sent" : enquiry ? "Enquiry sent" : "Quote request sent");
      } catch (err) {
        if (note) note.textContent = "We could not send that just now. Please call the studio or try again.";
        notify("Message was not sent");
      }
    });
  });

  const fileLabel = document.querySelector("[data-file-label]");
  const fileInput = document.querySelector("[data-file]");
  if (fileInput && fileLabel) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      fileLabel.textContent = file ? file.name : "Upload print-ready artwork (PDF, AI, PNG, JPG)";
    });
  }

  const params = new URLSearchParams(location.search);
  const cat = params.get("cat");
  const q = (params.get("q") || "").trim().toLowerCase();
  const cardsOnPage = [...document.querySelectorAll("[data-product]")];
  if (cardsOnPage.length && (cat || q)) {
    let shown = 0;
    cardsOnPage.forEach((card) => {
      const okCat = !cat || card.dataset.cat === cat;
      const okQ = !q || card.dataset.name.toLowerCase().includes(q);
      const ok = okCat && okQ;
      card.hidden = !ok;
      if (ok) shown += 1;
    });
    const empty = document.querySelector("[data-empty]");
    if (empty) empty.hidden = shown !== 0;
    const title = document.querySelector("[data-catalog-title]");
    if (title && cat) title.textContent = cat;
  }
  document.querySelectorAll(".chip").forEach((chip) => {
    const href = new URL(chip.href, location.href);
    const chipCat = href.searchParams.get("cat") || "";
    if ((chipCat || "") === (cat || "") && chip.pathname.endsWith("products.html")) chip.classList.add("is-on");
  });

  function variantFields(product) {
    const types = (window.A2Z && A2Z.variantTypes) || [];
    const choices = (window.A2Z && A2Z.variants) || [];
    return (product.variantTypeIds || []).map((typeId) => {
      const type = types.find((item) => item.id === typeId);
      if (!type) return "";
      const picked = Array.isArray(product.variantIds) ? product.variantIds : null;
      const options = choices.filter((item) => item.typeId === type.id && (!picked || picked.includes(item.id)));
      if (!options.length) return "";
      const fieldId = "variant-" + type.id;
      return `<div class="option"><label for="${esc(fieldId)}">${esc(type.name)}</label>
        <select id="${esc(fieldId)}" data-variant data-mode="${esc(type.mode)}">${options.map((choice) => {
          const prices = product.variantPrices || {};
          const amount = prices[choice.id] != null && prices[choice.id] !== "" ? prices[choice.id] : choice.amount;
          return `<option value="${esc(amount)}"${choice.isDefault ? " selected" : ""}>${esc(choice.name)}</option>`;
        }).join("")}</select>
      </div>`;
    }).join("");
  }

  const root = document.querySelector("#product-root");
  if (root) {
    const product = findProduct(params.get("id")) || products()[0];
    if (!product) {
      root.innerHTML = "<p>No products are available.</p>";
    } else {
      document.title = product.name + " — A2Z Printing";
      root.innerHTML = `
        <p class="crumbs"><a href="index.html">Home</a> / <a href="products.html">Products</a> / ${esc(product.category)}</p>
        <div class="detail">
          <div class="detail-photo"><img src="${esc(product.image)}" alt="${esc(product.name)}"></div>
          <div>
            <p class="kicker">${esc(product.category)}</p>
            <h1 style="margin:12px 0 6px">${esc(product.name)}</h1>
            <p class="muted">${esc(product.summary)}</p>
            <div class="price-lg" data-live-price>${money(product.price)}</div>
            <p class="help">Estimated lead time: ${esc(product.lead)}. Price updates from the options below.</p>
            <form id="product-config">
              ${variantFields(product)}
              <div class="option"><label for="qty">Quantity</label>
                <input id="qty" name="qty" type="number" min="1" max="500" value="1">
              </div>
              <label class="drop">
                <input data-file type="file" accept=".pdf,.ai,.png,.jpg,.jpeg,.tif,.svg">
                <strong data-file-label>Upload print-ready artwork (PDF, AI, PNG, JPG)</strong>
                <span class="help">Saved with the order so the studio can open it. PDF, AI, PNG, or JPG, under 4 MB.</span>
              </label>
              <div style="height:14px"></div>
              <button class="btn" type="submit">Add to cart</button>
              <button class="btn btn-line" type="button" data-wish="${esc(product.id)}" style="color:var(--ink);border-color:var(--line);box-shadow:none;margin-left:8px">Save</button>
            </form>
          </div>
        </div>`;
      const form = document.querySelector("#product-config");
      const priceEl = root.querySelector("[data-live-price]");
      const quote = () => {
        const qty = Math.max(1, Number(form.qty.value) || 1);
        let multiplier = 1;
        let extra = 0;
        const labels = [];
        form.querySelectorAll("[data-variant]").forEach((sel) => {
          const amount = Number(sel.value);
          if (sel.dataset.mode === "add") extra += amount;
          else multiplier *= Number.isFinite(amount) ? amount : 1;
          labels.push(sel.selectedOptions[0].textContent);
        });
        const unit = product.price * multiplier + extra;
        return { qty, unit, total: unit * qty, options: labels.join(" · ") };
      };
      const paint = () => { priceEl.textContent = money(quote().total); };
      form.addEventListener("input", paint);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const qte = quote();
        const file = form.querySelector("[data-file]").files[0];
        let artwork = "";
        let artworkName = "";
        if (file) {
          if (file.size > 4000000) {
            notify("Use a file under 4 MB");
            return;
          }
          try {
            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const res = await fetch("/api/artwork", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: file.name, data: dataUrl })
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(payload.error || "upload failed");
            artwork = payload.artwork;
            artworkName = payload.name || file.name;
          } catch (err) {
            notify(err.message || "Artwork was not saved");
            return;
          }
        }
        addToCart(product.id, {
          price: Math.round(qte.unit * 100) / 100,
          qty: qte.qty,
          options: qte.options + (artworkName ? " · Artwork: " + artworkName : ""),
          artwork,
          artworkName
        });
        openDrawer("cart");
      });
      const input = form.querySelector("[data-file]");
      const label = form.querySelector("[data-file-label]");
      input.addEventListener("change", () => {
        label.textContent = input.files[0] ? input.files[0].name : "Upload print-ready artwork (PDF, AI, PNG, JPG)";
      });
      paint();
      counts();
    }
  }

  function cartItems() {
    return store.get("a2z-cart").map((item) => ({
      id: item.id, name: item.name, qty: item.qty, price: item.price, options: item.options || "",
      artwork: item.artwork || "", artworkName: item.artworkName || ""
    }));
  }

  function artworkView(item) {
    const path = String(item.artwork || "");
    if (!/^assets\/artwork\/[0-9a-f]{16}\.(pdf|ai|png|jpg|jpeg|tif|tiff|svg|webp)$/i.test(path)) return "";
    const src = "/" + path;
    const name = item.artworkName || "Artwork";
    const image = /\.(png|jpe?g|gif|webp|svg)$/i.test(path);
    return `<div class="artwork-file">${image ? `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt=""></a>` : ""}<a href="${esc(src)}" target="_blank" rel="noopener">${esc(name)}</a></div>`;
  }

  function renderShopCart(cart, total) {
    const lines = document.querySelector("[data-cart-lines]");
    const summary = document.querySelector("[data-cart-summary]");
    if (lines) {
      lines.innerHTML = cart.length ? cart.map((item) => `
        <article class="cart-line">
          <img src="${esc(item.image)}" alt="">
          <div>
            <h3>${esc(item.name)}</h3>
            <p>${esc(item.options || "Standard configuration")}</p>
            <div class="qty-row">
              <button class="ghost" type="button" data-qty="${esc(item.key)}" data-dir="-1" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button class="ghost" type="button" data-qty="${esc(item.key)}" data-dir="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-actions">
            <strong>${money(item.price * item.qty)}</strong>
            <button class="ghost" type="button" data-edit="${esc(item.key)}">Edit</button>
            <button class="ghost" type="button" data-remove="${esc(item.key)}">Remove</button>
          </div>
        </article>`).join("") : '<div class="summary-card"><h2>Your cart is empty</h2><p class="muted">Add a product, then come back here to review it.</p><a class="btn" href="products.html">Browse products</a></div>';
    }
    if (summary) {
      summary.innerHTML = cart.length ? `
        <h2>Summary</h2>
        <div class="sum-row"><span>${cart.reduce((s, i) => s + i.qty, 0)} item${cart.reduce((s, i) => s + i.qty, 0) === 1 ? "" : "s"}</span><strong>${money(total)}</strong></div>
        <p class="muted">The studio confirms artwork, price and lead time before production. Payment stays unpaid until the team marks it.</p>
        <a class="btn btn-block" href="checkout.html">Checkout</a>
        <a class="btn btn-soft btn-block" href="products.html">Continue shopping</a>` : "";
    }
    const box = document.querySelector("[data-checkout-box]");
    if (box) {
      const pay = window.A2Z && A2Z.settings && A2Z.settings.payment;
      const payNote = pay && pay.enabled && pay.provider
        ? "Payment method on file: " + esc(pay.provider) + ". Card details are not taken on this page."
        : "The studio confirms payment after the order is placed. Card details are not taken on this page.";
      box.innerHTML = cart.length
        ? `<h2>Your order</h2><div class="co-lines">${cart.map((item) => `<article class="co-line"><img src="${esc(item.image)}" alt=""><div><strong>${item.qty} × ${esc(item.name)}</strong><span>${esc(item.options || "Standard configuration")}</span></div><b>${money(item.price * item.qty)}</b></article>`).join("")}</div><div class="co-total"><span>Total</span><strong>${money(total)}</strong></div><p class="co-note">${payNote}</p>`
        : `<h2>Your cart is empty</h2><p class="muted">Add a product before checkout.</p><a class="btn" href="products.html">Browse products</a>`;
      const form = document.querySelector("[data-checkout]");
      if (form) form.hidden = !cart.length;
    }
  }

  function when(value) {
    const text = String(value || "").replace("T", " ").replace("Z", "");
    return text.slice(0, 16);
  }

  function trackHtml(order) {
    if (order.status === "Cancelled") {
      return `<p class="pill muted">Cancelled</p><p class="muted">This order was cancelled. Call the studio on 08 6288 5285 if you still need the job.</p>`;
    }
    const steps = [
      ["New", "Order received", "The studio has the order."],
      ["In production", "In production", "Artwork and print are underway."],
      ["Ready", "Ready", "The job is finished and waiting to go out."],
      ["Dispatched", "Dispatched", "The order is on its way or ready to collect."]
    ];
    const index = Math.max(0, steps.findIndex((step) => step[0] === order.status));
    return `<div class="track">${steps.map((step, i) => `
      <div class="track-step${i <= index ? " is-done" : ""}">
        <div><i></i>${i < steps.length - 1 ? "<span></span>" : ""}</div>
        <div><strong>${esc(step[1])}</strong><small>${esc(step[2])}</small></div>
      </div>`).join("")}</div>`;
  }

  function orderDetail(order) {
    const items = (order.items || []).map((item) => `<div class="sum-row"><span>${item.qty} × ${esc(item.name)}<br><small class="muted">${esc(item.options || "")}</small>${artworkView(item)}</span><strong>${money(item.price * item.qty)}</strong></div>`).join("");
    return `
      <p class="crumbs"><a href="account.html?panel=orders">Orders</a> / ${esc(order.number)}</p>
      <h2>${esc(order.number)}</h2>
      <p class="muted">Placed ${esc(when(order.created))}</p>
      ${trackHtml(order)}
      <div class="order-meta"><span class="pill">${esc(order.status)}</span><span class="pill ${order.payment === "Paid" ? "paid" : ""}">${esc(order.payment)}</span></div>
      <h3>Items</h3>
      ${items || "<p class='muted'>No line items were stored.</p>"}
      <div class="sum-row"><span>Total</span><strong>${money(order.total)}</strong></div>
      ${order.address ? `<h3>Delivery</h3><p>${esc(order.address)}</p>` : ""}
      ${order.note ? `<h3>Note</h3><p>${esc(order.note)}</p>` : ""}
      <p class="muted">Questions about this job: <a href="tel:0862885285">08 6288 5285</a></p>`;
  }

  async function accountRequest(path, options) {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...options,
      body: options && options.body ? JSON.stringify(options.body) : undefined
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || "Request failed");
    return payload;
  }

  async function paintAccount() {
    try {
      const payload = await accountRequest("/api/account");
      if (!window.A2Z) window.A2Z = {};
      A2Z.customer = payload.ok ? payload.customer : null;
      A2Z.orders = payload.orders || [];
    } catch (err) {
      if (window.A2Z) A2Z.customer = null;
    }
    document.querySelectorAll("[data-account-link]").forEach((link) => {
      const customer = window.A2Z && A2Z.customer;
      link.href = customer ? "account.html" : "sign-in.html";
      link.setAttribute("aria-label", customer ? "Account, " + customer.name : "Sign in");
    });
  }

  function safeNext(next) {
    if (!next) return "";
    const path = String(next).split("?")[0];
    const allowed = ["cart.html", "checkout.html", "account.html", "order-success.html"];
    return allowed.includes(path) ? next : "";
  }

  function showAccount() {
    const root = document.querySelector("[data-account]");
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const customer = window.A2Z && A2Z.customer;
    const auth = root.querySelector("[data-auth]");
    const dash = root.querySelector("[data-dash]");
    const title = document.querySelector("[data-account-title]");
    const lead = document.querySelector("[data-account-lead]");
    const onSignIn = /sign-in\.html$/i.test(location.pathname);
    if (!customer) {
      if (!onSignIn) {
        const dest = new URLSearchParams();
        if (params.get("next")) dest.set("next", params.get("next"));
        else if (params.get("order")) dest.set("next", "account.html?order=" + params.get("order"));
        else if (params.get("panel")) dest.set("next", "account.html?panel=" + params.get("panel"));
        if (params.get("tab")) dest.set("tab", params.get("tab"));
        location.replace("sign-in.html" + (dest.toString() ? "?" + dest.toString() : ""));
        return;
      }
      if (auth) auth.hidden = false;
      if (dash) dash.hidden = true;
      root.hidden = false;
      const tab = params.get("tab") === "signup" ? "signup" : "login";
      root.querySelectorAll("[data-auth-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.authPanel !== tab;
      });
      root.querySelectorAll("[data-auth-tab]").forEach((button) => {
        const on = button.dataset.authTab === tab;
        button.classList.toggle("is-on", on);
        button.setAttribute("aria-selected", on ? "true" : "false");
      });
      return;
    }
    if (onSignIn || !dash) {
      location.replace(safeNext(params.get("next")) || "account.html");
      return;
    }
    root.hidden = false;
    if (auth) auth.hidden = true;
    dash.hidden = false;
    const orderId = params.get("order");
    const panel = orderId ? "order" : (params.get("panel") === "orders" ? "orders" : "profile");
    if (title) title.textContent = customer.name;
    if (lead) lead.textContent = customer.email;
    root.querySelectorAll("[data-dash-panel]").forEach((node) => {
      node.hidden = node.dataset.dashPanel !== panel;
    });
    root.querySelectorAll("[data-dash-tab]").forEach((tab) => {
      tab.classList.toggle("is-on", tab.dataset.dashTab === (panel === "order" ? "orders" : panel));
    });
    const profile = root.querySelector("[data-profile-form]");
    if (profile && !profile.dataset.ready) {
      profile.elements.name.value = customer.name || "";
      profile.elements.phone.value = customer.phone || "";
      profile.elements.address.value = customer.address || "";
      profile.dataset.ready = "1";
    }
    const list = root.querySelector("[data-order-list]");
    const orders = (window.A2Z && A2Z.orders) || [];
    if (list) {
      list.innerHTML = orders.length ? `<table class="order-table"><thead><tr><th>Order</th><th>Placed</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${orders.map((order) => `<tr><td><strong>${esc(order.number)}</strong></td><td>${esc(when(order.created))}</td><td>${money(order.total)}</td><td><span class="pill">${esc(order.status)}</span></td><td><a href="account.html?order=${encodeURIComponent(order.id)}">View</a></td></tr>`).join("")}</tbody></table>` : `<p class="muted">No orders yet. <a href="products.html">Browse products</a> and check out when the cart is ready.</p>`;
    }
    const detail = root.querySelector("[data-order-detail]");
    if (detail) {
      const order = orders.find((item) => item.id === orderId);
      detail.innerHTML = order ? orderDetail(order) : `<p class="muted">That order is not on this account.</p><a href="account.html?panel=orders">Back to orders</a>`;
    }
  }

  function showSuccess() {
    const root = document.querySelector("[data-success]");
    if (!root) return;
    const number = new URLSearchParams(location.search).get("number") || "";
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem("a2z-order") || "null"); } catch (err) { saved = null; }
    if (saved && number && saved.number !== number) saved = null;
    if (!saved && !number) {
      root.innerHTML = `
        <header class="checkout-head">
          <h1>No order to show</h1>
          <p>This browser does not have a recent order. Track one from your account, or start a new job from the catalogue.</p>
        </header>
        <div class="success-actions">
          <a class="btn" href="account.html?panel=orders">View orders</a>
          <a class="btn btn-soft" href="products.html">Browse products</a>
        </div>`;
      return;
    }
    const order = saved || { number };
    const customer = window.A2Z && A2Z.customer;
    const items = order.items || [];
    const lines = items.map((item) => {
      const product = findProduct(item.id);
      const image = item.image || (product && product.image) || "assets/art/poster.svg";
      return `<article class="co-line"><img src="${esc(image)}" alt=""><div><strong>${esc(item.qty)} × ${esc(item.name)}</strong><span>${esc(item.options || "Standard configuration")}</span></div><b>${money(item.price * item.qty)}</b></article>`;
    }).join("");
    const facts = [
      order.created && ["Placed", when(order.created)],
      order.email && ["Email", order.email],
      order.phone && ["Phone", order.phone],
      order.address && ["Delivery", order.address],
      order.note && ["Notes", order.note]
    ].filter(Boolean);
    const track = customer && order.id
      ? `<a class="btn" href="account.html?order=${encodeURIComponent(order.id)}">Track this order</a>`
      : `<a class="btn" href="sign-in.html?tab=signup">Create an account to track it</a>`;
    root.innerHTML = `
      <header class="checkout-head success-head">
        <div class="success-mark" aria-hidden="true">✓</div>
        <div>
          <p class="success-kicker">Order received</p>
          <h1>${esc(order.number)}</h1>
          <p>The Malaga studio will check the artwork, price and lead time. Payment stays unpaid until the team confirms it.</p>
        </div>
      </header>
      <div class="shop-grid checkout-grid">
        <div class="success-panel">
          <div class="success-status">
            <span class="pill">${esc(order.status || "New")}</span>
            <span class="pill ${order.payment === "Paid" ? "paid" : "muted"}">${esc(order.payment || "Unpaid")}</span>
          </div>
          <h2>What happens next</h2>
          <ol class="success-next">
            <li><div><strong>Artwork check</strong><span>The studio reviews the file before anything is printed.</span></div></li>
            <li><div><strong>Price and timing</strong><span>You hear back if the quote or lead time needs a change.</span></div></li>
            <li><div><strong>Production</strong><span>The status moves to In production, then Ready, then Dispatched.</span></div></li>
          </ol>
          ${facts.length ? `<dl class="success-facts">${facts.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>` : ""}
          <div class="success-actions">${track}<a class="btn btn-soft" href="products.html">Back to products</a></div>
        </div>
        <aside class="checkout-summary">
          <h2>Your order</h2>
          ${lines
            ? `<div class="co-lines">${lines}</div>${order.total != null ? `<div class="co-total"><span>Total</span><strong>${money(order.total)}</strong></div>` : ""}`
            : `<p class="muted">Line items for this order are not stored in this browser. Open it from your account to see the full job.</p>`}
          <p class="co-note">Card details are not taken on this site. The order stays unpaid until the Malaga team marks it paid.</p>
        </aside>
      </div>`;
  }

  const checkoutForm = document.querySelector("[data-checkout]");
  if (checkoutForm) {
    const customer = window.A2Z && A2Z.customer;
    if (customer) {
      checkoutForm.elements.name.value = customer.name || "";
      checkoutForm.elements.email.value = customer.email || "";
      checkoutForm.elements.phone.value = customer.phone || "";
      checkoutForm.elements.address.value = customer.address || "";
      checkoutForm.elements.email.readOnly = true;
    }
    checkoutForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = checkoutForm.querySelector(".form-note");
      note.classList.remove("is-error");
      note.textContent = "";
      const body = Object.fromEntries(new FormData(checkoutForm).entries());
      body.items = cartItems();
      try {
        const payload = await accountRequest("/api/checkout", { method: "POST", body });
        sessionStorage.setItem("a2z-order", JSON.stringify(payload.order));
        store.set("a2z-cart", []);
        location.href = "order-success.html?number=" + encodeURIComponent(payload.orderNumber);
      } catch (err) {
        note.textContent = err.message;
        note.classList.add("is-error");
      }
    });
  }

  const accountRoot = document.querySelector("[data-account]");
  if (accountRoot) {
    accountRoot.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const next = new URLSearchParams(location.search);
        if (tab.dataset.authTab === "signup") next.set("tab", "signup");
        else next.delete("tab");
        history.replaceState(null, "", "sign-in.html" + (next.toString() ? "?" + next.toString() : ""));
        showAccount();
      });
    });
    accountRoot.querySelectorAll("[data-dash-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        location.href = "account.html" + (tab.dataset.dashTab === "orders" ? "?panel=orders" : "");
      });
    });
    const loginForm = accountRoot.querySelector("[data-login]");
    const signupForm = accountRoot.querySelector("[data-signup]");
    const afterAuth = () => {
      location.href = safeNext(new URLSearchParams(location.search).get("next")) || "account.html";
    };
    async function submitAuth(event, path) {
      event.preventDefault();
      const form = event.currentTarget;
      const note = form.querySelector(".form-note");
      note.classList.remove("is-error");
      note.textContent = "";
      try {
        await accountRequest(path, { method: "POST", body: Object.fromEntries(new FormData(form).entries()) });
        await paintAccount();
        afterAuth();
      } catch (err) {
        note.textContent = err.message;
        note.classList.add("is-error");
      }
    }
    if (loginForm) loginForm.addEventListener("submit", (event) => submitAuth(event, "/api/account/login"));
    if (signupForm) signupForm.addEventListener("submit", (event) => submitAuth(event, "/api/account/signup"));
    const profile = accountRoot.querySelector("[data-profile-form]");
    if (profile) {
      profile.addEventListener("submit", async (event) => {
        event.preventDefault();
        const note = profile.querySelector(".form-note");
        note.classList.remove("is-error");
        note.textContent = "";
        try {
          const payload = await accountRequest("/api/account", { method: "PUT", body: Object.fromEntries(new FormData(profile).entries()) });
          A2Z.customer = payload.customer;
          profile.elements.password.value = "";
          note.textContent = "Profile saved.";
        } catch (err) {
          note.textContent = err.message;
          note.classList.add("is-error");
        }
      });
    }
    const logout = accountRoot.querySelector("[data-logout]");
    if (logout) {
      logout.addEventListener("click", async () => {
        await accountRequest("/api/account/logout", { method: "POST", body: {} });
        if (window.A2Z) A2Z.customer = null;
        location.href = "sign-in.html";
      });
    }
  }

  await paintAccount();
  if (accountRoot) showAccount();
  showSuccess();
  if (checkoutForm && window.A2Z && A2Z.customer) {
    checkoutForm.elements.name.value = A2Z.customer.name || checkoutForm.elements.name.value;
    checkoutForm.elements.email.value = A2Z.customer.email || "";
    checkoutForm.elements.phone.value = A2Z.customer.phone || checkoutForm.elements.phone.value;
    checkoutForm.elements.address.value = A2Z.customer.address || checkoutForm.elements.address.value;
    checkoutForm.elements.email.readOnly = true;
    const guest = checkoutForm.querySelector("[data-guest]");
    if (guest) guest.hidden = true;
  }
  counts();
  renderCart();
})();
