const express = require("express");
const fs = require("fs");
const path = require("path");
const catalog = require("./catalog");

const ROOT = path.join(__dirname, "..");
const STORE = path.join(ROOT, "data", "node-store.json");
const PORT = Number(process.env.PORT || 8787);
const HOST = "0.0.0.0";

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE, "utf8"));
  } catch {
    return { orders: [], inquiries: [] };
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify(store, null, 2));
}

function text(value, max) {
  return String(value || "").trim().slice(0, max);
}

function emailOf(value) {
  const email = text(value, 120).toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : "";
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/content", (_req, res) => {
  res.json(catalog);
});

app.post("/api/inquiries", (req, res) => {
  const name = text(req.body.name, 80);
  const email = emailOf(req.body.email);
  const message = text(req.body.message, 2000);
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required." });
    return;
  }
  const store = readStore();
  const inquiry = {
    id: `INQ-${Date.now()}`,
    name,
    email,
    phone: text(req.body.phone, 40),
    topic: text(req.body.topic, 80),
    budget: text(req.body.budget, 40),
    message,
    createdAt: new Date().toISOString()
  };
  store.inquiries.push(inquiry);
  writeStore(store);
  res.status(201).json({ inquiry: { id: inquiry.id } });
});

app.post("/api/checkout", (req, res) => {
  const name = text(req.body.name, 80);
  const email = emailOf(req.body.email);
  const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 30) : [];
  const clean = [];
  for (const row of items) {
    const product = catalog.products.find((item) => item.id === row.id);
    const qty = Math.max(1, Math.min(500, Number(row.qty) || 1));
    if (!product) continue;
    clean.push({
      id: product.id,
      name: product.name,
      qty,
      price: product.price,
      options: text(row.options, 240)
    });
  }
  if (!name || !email || !clean.length) {
    res.status(400).json({ error: "Name, email, and at least one product are required." });
    return;
  }
  const store = readStore();
  const order = {
    id: `A2Z-${2000 + store.orders.length + 1}`,
    name,
    email,
    phone: text(req.body.phone, 40),
    address: text(req.body.address, 240),
    notes: text(req.body.notes, 500),
    items: clean,
    total: clean.reduce((sum, item) => sum + item.price * item.qty, 0),
    createdAt: new Date().toISOString()
  };
  store.orders.push(order);
  writeStore(store);
  res.status(201).json({ order: { id: order.id, total: order.total } });
});

app.use("/assets", express.static(path.join(ROOT, "assets")));
app.use("/css", express.static(path.join(ROOT, "css")));

const dist = path.join(ROOT, "client", "dist");
app.use(express.static(dist));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) {
    next();
    return;
  }
  const page = path.join(dist, "index.html");
  if (!fs.existsSync(page)) {
    res.status(503).type("text").send("React app is not built yet. Run npm run build.");
    return;
  }
  res.sendFile(page);
});

app.listen(PORT, HOST, () => {
  console.log(`A2Z Node API http://${HOST}:${PORT}`);
});
