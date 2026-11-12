"""A2Z Printing site and admin API.

Run from the project folder:
    python server.py

Public site:  http://127.0.0.1:8765/
Admin panel:  http://127.0.0.1:8765/admin/
"""
import hashlib
import json
import re
import secrets
import threading
from datetime import datetime, timezone
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
DB_PATH = DATA / "db.json"
UPLOADS = ROOT / "assets" / "uploads"
ARTWORK = ROOT / "assets" / "artwork"
ARTWORK_RE = re.compile(r"assets/artwork/[0-9a-f]{16}\.(pdf|ai|png|jpg|jpeg|tif|tiff|svg|webp)")
PORT = 8765
SESSIONS = {}
CUSTOMER_SESSIONS = {}
LOCK = threading.Lock()

DEFAULT_USER = "admin"
DEFAULT_PASSWORD = "a2zprint"


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def slugify(text):
    slug = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return slug or "item"


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(8)
    digest = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
    return f"{salt}${digest}"


def check_password(password, stored):
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest() == digest


def seed():
    products = [
        {"id": "floor-graphics", "name": "Floor Graphics", "price": 5000, "category": "Signage", "image": "assets/products/floor-graphics.jpg", "lead": "4–6 business days", "summary": "Durable floor decals for retail, events and wayfinding. Supplied print-ready with a slip-resistant laminate option.", "featured": True},
        {"id": "corflute", "name": "Corflute", "price": 3000, "category": "Rigid Signs", "image": "assets/products/corflute.jpg", "lead": "2–4 business days", "summary": "Lightweight corrugated plastic board for outdoor promotions, real estate and site signage.", "featured": True},
        {"id": "backlit-vinyl", "name": "Backlit Vinyl", "price": 2000, "category": "Signage", "image": "assets/products/backlit-vinyl.jpg", "lead": "5–7 business days", "summary": "Translucent film for lightboxes and illuminated displays, printed for even colour when lit.", "featured": True},
        {"id": "image-dot-vinyl", "name": "Image Dot Adhesive Vinyl", "price": 2500, "category": "Self Adhesive Vinyls", "image": "assets/products/image-dot-vinyl.jpg", "lead": "3–5 business days", "summary": "Perforated window film that reads as a print from outside and stays see-through from inside.", "featured": True},
        {"id": "foam-pvc", "name": "Foam PVC", "price": 4500, "category": "Wall Murals", "image": "assets/products/foam-pvc.jpg", "lead": "4–6 business days", "summary": "Flat, rigid foam board for indoor displays, exhibition panels and wall graphics.", "featured": True},
        {"id": "economy-clear-vinyl", "name": "Economy Clear Vinyl", "price": 2600, "category": "Self Adhesive Vinyls", "image": "assets/products/economy-clear-vinyl.jpg", "lead": "3–5 business days", "summary": "Clear adhesive vinyl for windows and glass, with a lower-cost film for short campaigns.", "featured": True},
        {"id": "design-services", "name": "Design Services", "price": 899, "category": "Signage", "image": "assets/products/design-services.jpg", "lead": "2–4 business days", "summary": "Artwork setup, layout and print-ready files when you need the studio to prepare the job.", "featured": True},
        {"id": "a-frame-900", "name": "Corflute Insertable A Frame 900 x 1200mm", "price": 499, "category": "A Frames", "image": "assets/products/a-frame.jpg", "lead": "2–3 business days", "summary": "Insertable A-frame with a 900 × 1200 mm corflute poster. Swap the print when the offer changes.", "featured": True},
        {"id": "business-cards", "name": "Business Cards", "price": 89, "category": "Business Cards", "image": "assets/art/cards.svg", "lead": "2–3 business days", "summary": "Thick card stock, single or double sided, with optional matte or gloss laminate.", "featured": False},
        {"id": "flyers", "name": "Flyers and Brochures", "price": 149, "category": "Flyers and Brochures", "image": "assets/art/flyers.svg", "lead": "2–4 business days", "summary": "Leaflets and folded brochures on a choice of paper weights and finishes.", "featured": False},
        {"id": "poster", "name": "Synthetic Poster", "price": 79, "category": "Posters", "image": "assets/art/poster.svg", "lead": "1–3 business days", "summary": "Weather-tolerant synthetic posters for indoor and short-run outdoor use.", "featured": False},
        {"id": "stickers", "name": "Round Stickers", "price": 69, "category": "Stickers", "image": "assets/art/stickers.svg", "lead": "2–4 business days", "summary": "Die-cut sticker sheets on vinyl or paper, supplied kiss-cut on a backing sheet.", "featured": False},
        {"id": "pvc-banner", "name": "PVC Banner", "price": 189, "category": "Banners", "image": "assets/art/banner.svg", "lead": "2–4 business days", "summary": "Hemmed PVC banner with eyelets, sized for fences, shopfronts and events.", "featured": False},
        {"id": "booklet", "name": "Saddle-Stitched Booklet", "price": 249, "category": "Booklet", "image": "assets/art/booklet.svg", "lead": "4–6 business days", "summary": "Multi-page booklets, stapled on the spine, for menus, lookbooks and catalogues.", "featured": False},
        {"id": "rigid-board", "name": "Rigid Signs", "price": 320, "category": "Rigid Signs", "image": "assets/art/rigid.svg", "lead": "3–5 business days", "summary": "Direct-to-board rigid prints for counters, hanging signs and feature walls.", "featured": False},
        {"id": "window-vinyl", "name": "Self Adhesive Vinyl", "price": 210, "category": "Self Adhesive Vinyls", "image": "assets/art/vinyl.svg", "lead": "3–5 business days", "summary": "Cut or printed self-adhesive vinyl for glass, boards and smooth walls.", "featured": False},
    ]
    categories = [
        {"id": "a-frames", "name": "A Frames", "image": "assets/art/a-frame.svg"},
        {"id": "flyers", "name": "Flyers and Brochures", "image": "assets/art/flyers.svg"},
        {"id": "posters", "name": "Posters", "image": "assets/art/poster.svg"},
        {"id": "signage", "name": "Signage", "image": "assets/art/signage.svg"},
        {"id": "wall-murals", "name": "Wall Murals", "image": "assets/art/mural.svg"},
        {"id": "stickers", "name": "Stickers", "image": "assets/art/stickers.svg"},
        {"id": "rigid-signs", "name": "Rigid Signs", "image": "assets/art/rigid.svg"},
        {"id": "vinyls", "name": "Self Adhesive Vinyls", "image": "assets/art/vinyl.svg"},
        {"id": "business-cards", "name": "Business Cards", "image": "assets/art/cards.svg"},
        {"id": "booklet", "name": "Booklet", "image": "assets/art/booklet.svg"},
        {"id": "banners", "name": "Banners", "image": "assets/art/banner.svg"},
    ]
    reviews = [
        {"id": "sally", "name": "Sally Lorraine", "when": "2 months ago", "stars": 5, "text": "A2Z Printing provided excellent service from start to finish. The team understood our requirements and delivered high-quality printing on time. The team was professional, helpful and communicated clearly throughout the entire process. The final printing quality was excellent and everything was delivered exactly as requested."},
        {"id": "craig", "name": "Craig Edwards", "when": "3 months ago", "stars": 5, "text": "I was impressed with the quality of the printed products. A2Z Printing made the entire process simple and delivered exactly what we needed. The ordering process was easy, the staff were responsive and the finished products looked professional. I am very happy with the service and would definitely use A2Z Printing again for future printing work."},
        {"id": "michael", "name": "Michael Brown", "when": "1 month ago", "stars": 5, "text": "Great printing service with professional results. The turnaround was quick, communication clear, and the final products looked fantastic. A2Z Printing handled the whole process professionally and made sure that our requirements were completed on time. The quality exceeded our expectations and we would happily recommend their printing services to others."},
    ]
    return {
        "auth": {"username": DEFAULT_USER, "password": hash_password(DEFAULT_PASSWORD), "mustChange": True},
        "settings": shop_settings(),
        "products": [dict(item, variantTypeIds=["size", "material", "sides", "finish"]) for item in products],
        "categories": categories,
        "reviews": reviews,
        "variantTypes": default_variant_types(),
        "variants": default_variants(),
        "orders": [],
        "customers": [],
        "inquiries": [],
    }


def shop_settings():
    return {
        "phone": "08 6288 5285",
        "phoneHref": "0862885285",
        "email": "Sales@a2zprinting.com.au",
        "address": "Unit 10 / 114 Malaga Road, Malaga 6090",
        "hours": "Mon – Sat: 9 am – 6 pm",
        "hoursNote": "Sunday: CLOSED",
        "payment": {"enabled": False, "provider": "Bank transfer", "publicKey": "", "secretKey": "", "currency": "AUD"},
        "sms": {"enabled": False, "provider": "Twilio", "sender": "A2Z", "apiKey": "", "apiSecret": ""},
        "mail": {"enabled": False, "host": "", "port": "587", "username": "", "password": "", "fromEmail": "info@a2zprinting.com.au", "fromName": "A2Z Printing"},
        "website": default_website(),
    }


def default_blocks():
    return {
        "announcements": [
            {"text": "Free artwork check on every order", "href": "", "image": ""},
            {"text": "Australia-wide delivery", "href": "", "image": ""},
            {"text": "Upload your artwork online", "href": "", "image": ""},
            {"text": "24 hour production available on some products", "href": "", "image": ""},
            {"text": "Track my order", "href": "account.html", "image": ""},
        ],
        "how": {
            "kicker": "HOW IT WORKS",
            "title": "From Your Idea to Perfect Print",
            "accent": "Perfect Print",
            "text": "Getting your printing project started is simple.\nChoose what you need, upload your artwork, approve your proof, and let our team handle the rest — from printing to delivery.",
            "readyTitle": "Ready to get started?",
            "readyText": "Bring your next printing project to life.",
            "readyButton": "Start your order →",
            "readyHref": "products.html",
            "steps": [
                {"title": "Choose Your Product", "text": "Browse our range of printing and signage products, then choose your size, material and quantity.", "image": ""},
                {"title": "Upload Your Artwork", "text": "Upload your artwork with your order, or send your print-ready files when you are ready.", "image": ""},
                {"title": "Artwork Check", "text": "Our team carefully checks your artwork for size, quality, colours and print requirements.", "image": ""},
                {"title": "Approve Your Proof", "text": "Review your digital proof and approve it before we move your order into production.", "image": ""},
                {"title": "We Print Your Order", "text": "Once approved, your artwork goes into production and is professionally printed.", "image": ""},
                {"title": "Delivery", "text": "Your finished order is carefully packed and delivered straight to your chosen address.", "image": ""},
                {"title": "Payment Confirmation", "text": "Confirm payment and, once it is complete, the approved project moves forward into production.", "image": ""},
                {"title": "Pack & Dispatch", "text": "The completed order is packed, prepared for dispatch and sent to your delivery address.", "image": ""},
                {"title": "Enjoy Your Finished Product", "text": "Receive professionally printed products and put high-quality work in front of your customers.", "image": ""},
            ],
        },
        "reasons": {
            "kicker": "Let's Get Printing",
            "title": "Reasons To Get Printing Started With Us",
            "text": "Start your printing journey with A2Z Printing for quality, reliability, and professional results. We offer customised printing solutions, premium materials, fast turnaround, and affordable options for businesses of all sizes. From promotional materials to signage and business essentials, A2Z Printing makes every project simple, efficient, and designed to help your brand stand out.",
            "image": "assets/workshop.webp",
        },
        "choose": {
            "kicker": "Why choose us",
            "title": "Power Your Business Growth With Digital Printing",
            "text": "We make professional printing and signage simple, reliable and hassle-free. From business cards and banners to large-format displays, wall murals and custom signage, the colour is produced to help your brand stand out.",
            "button": "About Us",
            "href": "about.html",
            "image": "assets/press-photo.webp",
        },
    }


def default_website():
    return {
        "bannerImage": "assets/hero-banner.webp",
        "banners": [
            {"title": "", "text": "Your trusted partner for fast, professional and high-quality printing solutions across Australia.", "button": "Get a Quote", "href": "contact.html#quote"},
            {"title": "", "text": "High-quality printing, signage and promotional solutions designed to make your brand stand out.", "button": "Explore Our Services", "href": "products.html"},
        ],
        "menu": [
            {"label": "Home", "href": "index.html", "enabled": True},
            {"label": "About Us", "href": "about.html", "enabled": True},
            {"label": "Products", "href": "products.html", "enabled": True},
            {"label": "Contact Us", "href": "contact.html", "enabled": True},
        ],
        "sections": {
            "promo": True, "banner": True, "how": True, "categories": True, "products": True,
            "reasons": True, "choose": True, "reviews": True, "quote": True, "trust": True,
        },
        "blocks": default_blocks(),
    }


def default_variant_types():
    return [
        {"id": "size", "name": "Size", "mode": "multiply"},
        {"id": "material", "name": "Material", "mode": "multiply"},
        {"id": "sides", "name": "Sides", "mode": "multiply"},
        {"id": "finish", "name": "Finish", "mode": "add"},
    ]


def default_variants():
    return [
        {"id": "size-small", "typeId": "size", "name": "Small", "amount": 0.85, "isDefault": False},
        {"id": "size-standard", "typeId": "size", "name": "Standard", "amount": 1, "isDefault": True},
        {"id": "size-large", "typeId": "size", "name": "Large", "amount": 1.35, "isDefault": False},
        {"id": "material-standard", "typeId": "material", "name": "Standard stock", "amount": 1, "isDefault": True},
        {"id": "material-premium", "typeId": "material", "name": "Premium stock", "amount": 1.2, "isDefault": False},
        {"id": "material-heavy", "typeId": "material", "name": "Heavy duty / outdoor", "amount": 1.4, "isDefault": False},
        {"id": "sides-single", "typeId": "sides", "name": "Single sided", "amount": 1, "isDefault": True},
        {"id": "sides-double", "typeId": "sides", "name": "Double sided", "amount": 1.45, "isDefault": False},
        {"id": "finish-none", "typeId": "finish", "name": "No extra finish", "amount": 0, "isDefault": True},
        {"id": "finish-gloss", "typeId": "finish", "name": "Gloss laminate", "amount": 40, "isDefault": False},
        {"id": "finish-matte", "typeId": "finish", "name": "Matte laminate", "amount": 40, "isDefault": False},
        {"id": "finish-heavy", "typeId": "finish", "name": "Heavy laminate", "amount": 80, "isDefault": False},
    ]


def migrate(db):
    changed = False
    if "variantTypes" not in db:
        db["variantTypes"] = default_variant_types()
        changed = True
    if "variants" not in db:
        db["variants"] = default_variants()
        changed = True
    if "orders" not in db:
        db["orders"] = []
        changed = True
    if "customers" not in db:
        db["customers"] = []
        changed = True
    settings = db.setdefault("settings", {})
    defaults = shop_settings()
    for key in ("payment", "sms", "mail", "website"):
        if key not in settings:
            settings[key] = defaults[key]
            changed = True
    website = settings.setdefault("website", {})
    if not isinstance(website.get("blocks"), dict):
        website["blocks"] = default_blocks()
        changed = True
    inquiry_status = {"New", "In progress", "Replied", "Closed"}
    for item in db.get("inquiries", []):
        if item.get("status") not in inquiry_status:
            item["status"] = "New"
            changed = True
    type_ids = [item["id"] for item in db.get("variantTypes", [])]
    for product in db.get("products", []):
        if "variantTypeIds" not in product:
            product["variantTypeIds"] = type_ids[:]
            changed = True
    if changed:
        save_db(db)
    return db


def load_db():
    DATA.mkdir(exist_ok=True)
    UPLOADS.mkdir(parents=True, exist_ok=True)
    if not DB_PATH.exists():
        save_db(seed())
    with DB_PATH.open(encoding="utf-8") as handle:
        return migrate(json.load(handle))


def save_db(db):
    DATA.mkdir(exist_ok=True)
    text = json.dumps(db, indent=2)
    tmp = DB_PATH.with_suffix(".tmp")
    tmp.write_text(text, encoding="utf-8")
    try:
        tmp.replace(DB_PATH)
    except OSError:
        DB_PATH.write_text(text, encoding="utf-8")
        try:
            tmp.unlink()
        except OSError:
            pass


def public_settings(settings):
    payment = settings.get("payment") or {}
    return {
        "phone": settings.get("phone", ""),
        "phoneHref": settings.get("phoneHref", ""),
        "email": settings.get("email", ""),
        "address": settings.get("address", ""),
        "hours": settings.get("hours", ""),
        "hoursNote": settings.get("hoursNote", ""),
        "payment": {
            "enabled": bool(payment.get("enabled")),
            "provider": payment.get("provider", ""),
            "currency": payment.get("currency", "AUD"),
        },
        "website": settings.get("website") or default_website(),
    }


def public_view(db):
    return {
        "products": db["products"],
        "categories": db["categories"],
        "reviews": db["reviews"],
        "variantTypes": db.get("variantTypes", []),
        "variants": db.get("variants", []),
        "settings": public_settings(db.get("settings", {})),
    }


def admin_view(db):
    data = public_view(db)
    data["settings"] = db["settings"]
    data["inquiries"] = db["inquiries"]
    data["orders"] = db.get("orders", [])
    data["customers"] = [
        {key: value for key, value in item.items() if key != "password"}
        for item in db.get("customers", [])
    ]
    data["username"] = db["auth"]["username"]
    data["mustChange"] = db["auth"].get("mustChange", False)
    return data


def clean_line_items(raw):
    items = []
    if not isinstance(raw, list):
        return items
    for row in raw[:30]:
        if not isinstance(row, dict):
            continue
        name = str(row.get("name") or "").strip()[:120]
        if not name:
            continue
        try:
            qty = max(1, min(500, int(row.get("qty") or 1)))
            price = max(0, min(1_000_000, float(row.get("price") or 0)))
        except (TypeError, ValueError):
            continue
        artwork, artwork_name = clean_artwork(row)
        items.append({
            "id": str(row.get("id") or "")[:80],
            "name": name,
            "qty": qty,
            "price": round(price, 2),
            "options": str(row.get("options") or "")[:240],
            "artwork": artwork,
            "artworkName": artwork_name,
        })
    return items


def clean_artwork(row):
    path = str(row.get("artwork") or "")
    label = Path(str(row.get("artworkName") or "Artwork")).name[:120] or "Artwork"
    if not ARTWORK_RE.fullmatch(path) or not (ROOT / path).is_file():
        return "", ""
    return path, label


def valid_email(value):
    email = (value or "").strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return ""
    return email[:120]


def upsert_customer(db, name, email, phone, address=""):
    key = email.lower()
    found = next((item for item in db["customers"] if item.get("email", "").lower() == key), None)
    if found:
        if name:
            found["name"] = name
        if phone:
            found["phone"] = phone
        if address:
            found["address"] = address[:240]
        return found
    customer = {
        "id": secrets.token_hex(6),
        "name": name[:80],
        "email": email[:120],
        "phone": (phone or "")[:40],
        "address": (address or "")[:240],
        "password": "",
        "orders": 0,
        "created": now_iso(),
    }
    db["customers"].insert(0, customer)
    return customer


def add_order(db, customer, items, note, address=""):
    customer["orders"] = int(customer.get("orders") or 0) + 1
    number = 1000 + len(db["orders"]) + 1
    total = round(sum(item["price"] * item["qty"] for item in items), 2)
    order = {
        "id": secrets.token_hex(6),
        "number": f"A2Z-{number}",
        "customerId": customer["id"],
        "name": customer["name"],
        "email": customer["email"],
        "phone": customer.get("phone", ""),
        "address": (address or customer.get("address") or "")[:240],
        "items": items,
        "total": total,
        "status": "New",
        "payment": "Unpaid",
        "note": (note or "")[:400],
        "created": now_iso(),
    }
    db["orders"].insert(0, order)
    return order


def public_customer(customer):
    return {
        "id": customer.get("id", ""),
        "name": customer.get("name", ""),
        "email": customer.get("email", ""),
        "phone": customer.get("phone", ""),
        "address": customer.get("address", ""),
    }


def public_order(order):
    return {
        "id": order.get("id", ""),
        "number": order.get("number", ""),
        "name": order.get("name", ""),
        "email": order.get("email", ""),
        "phone": order.get("phone", ""),
        "address": order.get("address", ""),
        "items": order.get("items", []),
        "total": order.get("total", 0),
        "status": order.get("status", "New"),
        "payment": order.get("payment", "Unpaid"),
        "note": order.get("note", ""),
        "created": order.get("created", ""),
    }


def customer_token(handler):
    cookie = SimpleCookie(handler.headers.get("Cookie", ""))
    morsel = cookie.get("a2z_customer")
    return morsel.value if morsel else ""


def current_customer_id(handler):
    return CUSTOMER_SESSIONS.get(customer_token(handler))


def customer_cookie(token):
    if not token:
        return ("Set-Cookie", "a2z_customer=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax")
    return ("Set-Cookie", f"a2z_customer={token}; HttpOnly; Path=/; SameSite=Lax")


def read_json(handler):
    length = int(handler.headers.get("Content-Length") or 0)
    if length > 6_000_000:
        raise ValueError("Upload is too large")
    raw = handler.rfile.read(length) if length else b"{}"
    return json.loads(raw.decode("utf-8") or "{}")


def token_from(handler):
    cookie = SimpleCookie(handler.headers.get("Cookie", ""))
    morsel = cookie.get("a2z_admin")
    return morsel.value if morsel else ""


def authed(handler):
    return SESSIONS.get(token_from(handler)) == "ok"


class App(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def send_json(self, code, payload, extra_headers=None):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for key, value in extra_headers or []:
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def require_admin(self):
        if authed(self):
            return True
        self.send_json(401, {"error": "Sign in required"})
        return False

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/content":
            with LOCK:
                db = load_db()
            self.send_json(200, public_view(db))
            return
        if path == "/api/admin/session":
            self.send_json(200, {"ok": authed(self)})
            return
        if path == "/api/admin/data":
            if not self.require_admin():
                return
            with LOCK:
                db = load_db()
            self.send_json(200, admin_view(db))
            return
        if path == "/api/account":
            self.account_view()
            return
        if path.startswith("/api/account/orders/"):
            self.account_order(unquote(path.rsplit("/", 1)[-1]))
            return
        self.serve_file(path)

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            body = read_json(self)
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"error": "Could not read that request"})
            return
        if path == "/api/admin/login":
            self.login(body)
            return
        if path == "/api/admin/logout":
            SESSIONS.pop(token_from(self), None)
            self.send_json(200, {"ok": True}, [("Set-Cookie", "a2z_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax")])
            return
        if path == "/api/inquiries":
            self.create_inquiry(body)
            return
        if path == "/api/orders":
            self.create_order(body)
            return
        if path == "/api/artwork":
            self.save_artwork(body)
            return
        if path == "/api/checkout":
            self.checkout(body)
            return
        if path == "/api/account/signup":
            self.account_signup(body)
            return
        if path == "/api/account/login":
            self.account_login(body)
            return
        if path == "/api/account/logout":
            self.account_logout()
            return
        if not self.require_admin():
            return
        if path == "/api/admin/upload":
            self.upload(body)
            return
        if path == "/api/admin/products":
            self.create_item("products", body, self.clean_product)
            return
        if path == "/api/admin/categories":
            self.create_item("categories", body, self.clean_category)
            return
        if path == "/api/admin/reviews":
            self.create_item("reviews", body, self.clean_review)
            return
        if path == "/api/admin/variant-types":
            self.create_item("variantTypes", body, self.clean_variant_type)
            return
        if path == "/api/admin/variants":
            self.create_item("variants", body, self.clean_variant)
            return
        self.send_json(404, {"error": "Not found"})

    def do_PUT(self):
        path = urlparse(self.path).path
        try:
            body = read_json(self)
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"error": "Could not read that request"})
            return
        if path == "/api/account":
            self.account_update(body)
            return
        if not self.require_admin():
            return
        parts = [p for p in path.split("/") if p]
        if parts[:2] == ["api", "admin"] and len(parts) == 4 and parts[2] == "orders":
            self.update_order(unquote(parts[3]), body)
            return
        if parts[:2] == ["api", "admin"] and len(parts) == 4 and parts[2] == "inquiries":
            self.update_inquiry(unquote(parts[3]), body)
            return
        keys = {"products": "products", "categories": "categories", "reviews": "reviews", "variant-types": "variantTypes", "variants": "variants"}
        if parts[:2] == ["api", "admin"] and len(parts) == 4 and parts[2] in keys:
            self.update_item(keys[parts[2]], unquote(parts[3]), body)
            return
        if path == "/api/admin/settings":
            self.update_settings(body)
            return
        self.send_json(404, {"error": "Not found"})

    def do_DELETE(self):
        if not self.require_admin():
            return
        parts = [unquote(p) for p in urlparse(self.path).path.split("/") if p]
        keys = {
            "products": "products", "categories": "categories", "reviews": "reviews",
            "inquiries": "inquiries", "orders": "orders", "customers": "customers",
            "variant-types": "variantTypes", "variants": "variants",
        }
        if parts[:2] == ["api", "admin"] and len(parts) == 4 and parts[2] in keys:
            key = keys[parts[2]]
            with LOCK:
                db = load_db()
                before = len(db[key])
                target = parts[3]
                db[key] = [item for item in db[key] if item.get("id") != target]
                if len(db[key]) == before:
                    self.send_json(404, {"error": "Not found"})
                    return
                if key == "variantTypes":
                    removed = {item["id"] for item in db["variants"] if item.get("typeId") == target}
                    db["variants"] = [item for item in db["variants"] if item.get("typeId") != target]
                    for product in db["products"]:
                        product["variantTypeIds"] = [item for item in product.get("variantTypeIds", []) if item != target]
                        if "variantIds" in product:
                            product["variantIds"] = [item for item in product.get("variantIds", []) if item not in removed]
                        prices = product.get("variantPrices") or {}
                        for gone in removed:
                            prices.pop(gone, None)
                        product["variantPrices"] = prices
                if key == "variants":
                    for product in db["products"]:
                        prices = product.get("variantPrices") or {}
                        if target in prices:
                            prices.pop(target, None)
                            product["variantPrices"] = prices
                        if target not in product.get("variantIds", []):
                            continue
                        product["variantIds"] = [item for item in product["variantIds"] if item != target]
                        kept = []
                        for variant in db["variants"]:
                            if variant["id"] in product["variantIds"] and variant.get("typeId") not in kept:
                                kept.append(variant["typeId"])
                        product["variantTypeIds"] = kept
                save_db(db)
            self.send_json(200, {"ok": True})
            return
        self.send_json(404, {"error": "Not found"})

    def login(self, body):
        with LOCK:
            db = load_db()
        username = (body.get("username") or "").strip()
        password = body.get("password") or ""
        auth = db["auth"]
        if username != auth["username"] or not check_password(password, auth["password"]):
            self.send_json(401, {"error": "Those details do not match"})
            return
        token = secrets.token_hex(24)
        SESSIONS[token] = "ok"
        self.send_json(200, {"ok": True, "mustChange": auth.get("mustChange", False)}, [
            ("Set-Cookie", f"a2z_admin={token}; HttpOnly; Path=/; SameSite=Lax"),
        ])

    def create_inquiry(self, body):
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip()
        message = (body.get("message") or "").strip()
        if not name or not email or not message:
            self.send_json(400, {"error": "Name, email and message are required"})
            return
        item = {
            "id": secrets.token_hex(6),
            "name": name[:80],
            "email": email[:120],
            "phone": (body.get("phone") or "")[:40],
            "topic": (body.get("topic") or "")[:80],
            "budget": (body.get("budget") or "")[:40],
            "message": message[:2000],
            "status": "New",
            "created": now_iso(),
        }
        with LOCK:
            db = load_db()
            db["inquiries"].insert(0, item)
            customer = upsert_customer(db, item["name"], item["email"], item["phone"])
            order = None
            lines = [] if body.get("enquiry") else clean_line_items(body.get("items"))
            if lines:
                order = add_order(db, customer, lines, item["message"])
            save_db(db)
        self.send_json(201, {"ok": True, "orderNumber": order["number"] if order else ""})

    def create_order(self, body):
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip()
        lines = clean_line_items(body.get("items"))
        if not name or not email or not lines:
            self.send_json(400, {"error": "Name, email and at least one item are required"})
            return
        with LOCK:
            db = load_db()
            customer = upsert_customer(db, name, email, body.get("phone") or "")
            order = add_order(db, customer, lines, body.get("note") or "")
            save_db(db)
        self.send_json(201, {"ok": True, "orderNumber": order["number"]})

    def find_customer(self, db, customer_id):
        return next((item for item in db["customers"] if item.get("id") == customer_id), None)

    def account_view(self):
        customer_id = current_customer_id(self)
        if not customer_id:
            self.send_json(200, {"ok": False})
            return
        with LOCK:
            db = load_db()
        customer = self.find_customer(db, customer_id)
        if not customer:
            CUSTOMER_SESSIONS.pop(customer_token(self), None)
            self.send_json(200, {"ok": False}, [customer_cookie("")])
            return
        email = customer.get("email", "").lower()
        orders = [
            public_order(item) for item in db["orders"]
            if item.get("customerId") == customer_id or item.get("email", "").lower() == email
        ]
        self.send_json(200, {"ok": True, "customer": public_customer(customer), "orders": orders})

    def account_order(self, order_id):
        customer_id = current_customer_id(self)
        if not customer_id:
            self.send_json(401, {"error": "Sign in required"})
            return
        with LOCK:
            db = load_db()
        customer = self.find_customer(db, customer_id)
        order = next((item for item in db["orders"] if item.get("id") == order_id), None)
        if not customer or not order:
            self.send_json(404, {"error": "Order not found"})
            return
        owns = order.get("customerId") == customer_id or order.get("email", "").lower() == customer.get("email", "").lower()
        if not owns:
            self.send_json(404, {"error": "Order not found"})
            return
        self.send_json(200, {"ok": True, "order": public_order(order)})

    def account_signup(self, body):
        name = (body.get("name") or "").strip()
        email = valid_email(body.get("email"))
        password = body.get("password") or ""
        phone = (body.get("phone") or "").strip()[:40]
        if not name or not email:
            self.send_json(400, {"error": "Name and a valid email are required"})
            return
        if len(password) < 6:
            self.send_json(400, {"error": "Use a password of at least 6 characters"})
            return
        with LOCK:
            db = load_db()
            found = next((item for item in db["customers"] if item.get("email", "").lower() == email), None)
            if found and found.get("password"):
                self.send_json(409, {"error": "An account with that email already exists. Sign in instead."})
                return
            if found:
                found["name"] = name[:80]
                if phone:
                    found["phone"] = phone
                found["password"] = hash_password(password)
                customer = found
            else:
                customer = upsert_customer(db, name, email, phone)
                customer["password"] = hash_password(password)
            save_db(db)
        token = secrets.token_hex(24)
        CUSTOMER_SESSIONS[token] = customer["id"]
        self.send_json(201, {"ok": True, "customer": public_customer(customer)}, [customer_cookie(token)])

    def account_login(self, body):
        email = valid_email(body.get("email"))
        password = body.get("password") or ""
        with LOCK:
            db = load_db()
        customer = next((item for item in db["customers"] if item.get("email", "").lower() == email), None)
        if not customer or not customer.get("password") or not check_password(password, customer["password"]):
            self.send_json(401, {"error": "Those details do not match"})
            return
        token = secrets.token_hex(24)
        CUSTOMER_SESSIONS[token] = customer["id"]
        self.send_json(200, {"ok": True, "customer": public_customer(customer)}, [customer_cookie(token)])

    def account_logout(self):
        CUSTOMER_SESSIONS.pop(customer_token(self), None)
        self.send_json(200, {"ok": True}, [customer_cookie("")])

    def account_update(self, body):
        customer_id = current_customer_id(self)
        if not customer_id:
            self.send_json(401, {"error": "Sign in required"})
            return
        name = (body.get("name") or "").strip()
        if not name:
            self.send_json(400, {"error": "Name is required"})
            return
        password = body.get("password") or ""
        if password and len(password) < 6:
            self.send_json(400, {"error": "Use a password of at least 6 characters"})
            return
        with LOCK:
            db = load_db()
            customer = self.find_customer(db, customer_id)
            if not customer:
                self.send_json(401, {"error": "Sign in required"})
                return
            customer["name"] = name[:80]
            customer["phone"] = (body.get("phone") or "")[:40]
            customer["address"] = (body.get("address") or "")[:240]
            if password:
                customer["password"] = hash_password(password)
            save_db(db)
            view = public_customer(customer)
        self.send_json(200, {"ok": True, "customer": view})

    def checkout(self, body):
        lines = clean_line_items(body.get("items"))
        if not lines:
            self.send_json(400, {"error": "Your cart is empty"})
            return
        name = (body.get("name") or "").strip()
        email = valid_email(body.get("email"))
        phone = (body.get("phone") or "").strip()[:40]
        address = (body.get("address") or "").strip()[:240]
        note = (body.get("note") or "").strip()[:400]
        customer_id = current_customer_id(self)
        with LOCK:
            db = load_db()
            customer = self.find_customer(db, customer_id) if customer_id else None
            if customer:
                email = customer.get("email") or email
                if name:
                    customer["name"] = name[:80]
                else:
                    name = customer.get("name") or ""
                if phone:
                    customer["phone"] = phone
                if address:
                    customer["address"] = address
            if not name or not email:
                self.send_json(400, {"error": "Name and a valid email are required"})
                return
            if not customer:
                customer = upsert_customer(db, name, email, phone, address)
            order = add_order(db, customer, lines, note, address)
            save_db(db)
            view = public_order(order)
        self.send_json(201, {"ok": True, "orderNumber": view["number"], "order": view})

    def update_inquiry(self, inquiry_id, body):
        allowed = {"New", "In progress", "Replied", "Closed"}
        status = body.get("status") or ""
        if status not in allowed:
            self.send_json(400, {"error": "Choose a valid status"})
            return
        with LOCK:
            db = load_db()
            current = next((item for item in db["inquiries"] if item.get("id") == inquiry_id), None)
            if not current:
                self.send_json(404, {"error": "Not found"})
                return
            current["status"] = status
            save_db(db)
        self.send_json(200, current)

    def update_order(self, order_id, body):
        allowed_status = {"New", "In production", "Ready", "Dispatched", "Cancelled"}
        allowed_payment = {"Unpaid", "Paid", "Refunded"}
        with LOCK:
            db = load_db()
            current = next((item for item in db["orders"] if item.get("id") == order_id), None)
            if not current:
                self.send_json(404, {"error": "Not found"})
                return
            status = body.get("status") or current.get("status")
            payment = body.get("payment") or current.get("payment")
            if status not in allowed_status or payment not in allowed_payment:
                self.send_json(400, {"error": "Choose a valid status"})
                return
            current["status"] = status
            current["payment"] = payment
            save_db(db)
        self.send_json(200, current)

    def save_artwork(self, body):
        name = Path(body.get("name") or "artwork.png").name
        data = body.get("data") or ""
        if "," in data:
            data = data.split(",", 1)[1]
        try:
            raw = __import__("base64").b64decode(data)
        except Exception:
            self.send_json(400, {"error": "That file could not be read"})
            return
        if not raw or len(raw) > 4_000_000:
            self.send_json(400, {"error": "Use a file under 4 MB"})
            return
        ext = Path(name).suffix.lower()
        if ext not in (".pdf", ".ai", ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".svg", ".webp"):
            self.send_json(400, {"error": "Use a PDF, AI, PNG, JPG, TIF, or SVG file"})
            return
        filename = f"{secrets.token_hex(8)}{ext}"
        ARTWORK.mkdir(parents=True, exist_ok=True)
        (ARTWORK / filename).write_bytes(raw)
        self.send_json(201, {"artwork": f"assets/artwork/{filename}", "name": name[:120]})

    def upload(self, body):
        name = Path(body.get("name") or "image.png").name
        data = body.get("data") or ""
        if "," in data:
            data = data.split(",", 1)[1]
        try:
            raw = __import__("base64").b64decode(data)
        except Exception:
            self.send_json(400, {"error": "Image could not be read"})
            return
        if not raw or len(raw) > 4_000_000:
            self.send_json(400, {"error": "Use an image under 4 MB"})
            return
        ext = Path(name).suffix.lower()
        if ext not in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"):
            ext = ".png"
        filename = f"{secrets.token_hex(8)}{ext}"
        UPLOADS.mkdir(parents=True, exist_ok=True)
        (UPLOADS / filename).write_bytes(raw)
        self.send_json(201, {"image": f"assets/uploads/{filename}"})

    def unique_id(self, items, wanted):
        base = slugify(wanted)
        taken = {item.get("id") for item in items}
        candidate = base
        n = 2
        while candidate in taken:
            candidate = f"{base}-{n}"
            n += 1
        return candidate

    def clean_product(self, body, current=None):
        name = (body.get("name") or "").strip()
        if not name:
            raise ValueError("Product name is required")
        try:
            price = float(body.get("price"))
        except (TypeError, ValueError):
            raise ValueError("Price must be a number")
        variant_ids, type_ids = self.assigned_variants(body, current)
        return {
            "id": (current or {}).get("id") or "",
            "name": name[:120],
            "price": round(price, 2),
            "category": (body.get("category") or "Signage").strip()[:80],
            "image": (body.get("image") or "assets/art/poster.svg").strip()[:240],
            "lead": (body.get("lead") or "2–4 business days").strip()[:80],
            "summary": (body.get("summary") or "").strip()[:600],
            "featured": bool(body.get("featured")),
            "variantIds": variant_ids,
            "variantTypeIds": type_ids,
            "variantPrices": self.clean_variant_prices(body, current, variant_ids),
        }

    def assigned_variants(self, body, current):
        variant_ids = self.clean_id_list(body, "variantIds", current, 60)
        type_ids = self.clean_type_ids(body, current)
        if "variantIds" not in body:
            return variant_ids, type_ids
        db = load_db()
        by_id = {item["id"]: item.get("typeId") for item in db.get("variants", [])}
        variant_ids = [item for item in variant_ids if item in by_id]
        type_ids = []
        for item in variant_ids:
            type_id = by_id[item]
            if type_id and type_id not in type_ids:
                type_ids.append(type_id)
        return variant_ids, type_ids

    def clean_variant_prices(self, body, current, variant_ids):
        if "variantPrices" in body:
            raw = body.get("variantPrices") or {}
        else:
            raw = (current or {}).get("variantPrices") or {}
        if not isinstance(raw, dict):
            raw = {}
        allowed = set(variant_ids)
        prices = {}
        for key, value in raw.items():
            variant_id = str(key).strip()[:40]
            if variant_id not in allowed:
                continue
            try:
                prices[variant_id] = round(float(value), 2)
            except (TypeError, ValueError):
                continue
        return prices

    def clean_id_list(self, body, key, current, limit):
        if key in body:
            raw = body.get(key)
        elif current and key in current:
            raw = current.get(key)
        else:
            raw = []
        if isinstance(raw, str):
            raw = [raw] if raw else []
        if not isinstance(raw, list):
            raw = []
        seen = []
        for item in raw:
            value = str(item).strip()[:40]
            if value and value not in seen:
                seen.append(value)
        return seen[:limit]

    def clean_type_ids(self, body, current=None):
        if "variantTypeIds" in body:
            raw = body.get("variantTypeIds")
        elif "variantType" in body:
            raw = body.get("variantType")
        else:
            raw = (current or {}).get("variantTypeIds", [])
        if isinstance(raw, str):
            raw = [raw] if raw else []
        if not isinstance(raw, list):
            raw = []
        return [str(item).strip()[:40] for item in raw if str(item).strip()][:12]

    def channel_present(self, group, fields, body):
        return any((group + field[:1].upper() + field[1:]) in body for field in fields)

    def clean_website(self, raw, current=None):
        base = default_website()
        banners = []
        for index, item in enumerate((raw.get("banners") or [])[:2]):
            if not isinstance(item, dict):
                item = {}
            fallback = base["banners"][index]
            banners.append({
                "title": str(item.get("title") or "")[:80],
                "text": str(item.get("text") or fallback["text"])[:240],
                "button": str(item.get("button") or fallback["button"])[:40],
                "href": str(item.get("href") or fallback["href"])[:160],
            })
        while len(banners) < 2:
            banners.append(dict(base["banners"][len(banners)]))
        menu = []
        for index, item in enumerate((raw.get("menu") or [])[:6]):
            if not isinstance(item, dict):
                continue
            label = str(item.get("label") or "").strip()[:40]
            href = str(item.get("href") or "").strip()[:160]
            if not label or not href:
                continue
            menu.append({"label": label, "href": href, "enabled": bool(item.get("enabled"))})
        if not menu:
            menu = base["menu"]
        sections = dict(base["sections"])
        incoming = raw.get("sections") if isinstance(raw.get("sections"), dict) else {}
        for key in sections:
            if key in incoming:
                sections[key] = bool(incoming[key])
        image = str(raw.get("bannerImage") or base["bannerImage"]).strip()[:240] or base["bannerImage"]
        current = current if isinstance(current, dict) else {}
        if isinstance(raw.get("blocks"), dict):
            blocks = self.clean_blocks(raw["blocks"])
        elif isinstance(current.get("blocks"), dict):
            blocks = self.clean_blocks(current["blocks"])
        else:
            blocks = default_blocks()
        return {"bannerImage": image, "banners": banners, "menu": menu, "sections": sections, "blocks": blocks}

    def clean_blocks(self, raw):
        base = default_blocks()
        raw = raw if isinstance(raw, dict) else {}

        def clip(value, limit, fallback=""):
            text = str(value if value is not None else "").strip()
            return (text or fallback)[:limit]

        announcements = []
        for item in (raw.get("announcements") or [])[:8]:
            if not isinstance(item, dict):
                continue
            text = str(item.get("text") or "").strip()[:120]
            if not text:
                continue
            announcements.append({
                "text": text,
                "href": str(item.get("href") or "").strip()[:160],
                "image": str(item.get("image") or "").strip()[:240],
            })
        if not announcements:
            announcements = [dict(item) for item in base["announcements"]]
        how_raw = raw.get("how") if isinstance(raw.get("how"), dict) else {}
        how_base = base["how"]
        steps = []
        for item in (how_raw.get("steps") or [])[:12]:
            if not isinstance(item, dict):
                continue
            title = str(item.get("title") or "").strip()[:80]
            if not title:
                continue
            steps.append({
                "title": title,
                "text": str(item.get("text") or "").strip()[:400],
                "image": str(item.get("image") or "").strip()[:240],
            })
        if not steps:
            steps = [dict(step) for step in how_base["steps"]]
        how = {
            "kicker": clip(how_raw.get("kicker"), 40, how_base["kicker"]),
            "title": clip(how_raw.get("title"), 120, how_base["title"]),
            "accent": str(how_raw.get("accent") or "").strip()[:40],
            "text": clip(how_raw.get("text"), 500, how_base["text"]),
            "readyTitle": clip(how_raw.get("readyTitle"), 80, how_base["readyTitle"]),
            "readyText": clip(how_raw.get("readyText"), 160, how_base["readyText"]),
            "readyButton": clip(how_raw.get("readyButton"), 40, how_base["readyButton"]),
            "readyHref": clip(how_raw.get("readyHref"), 160, how_base["readyHref"]),
            "steps": steps,
        }

        def panel(key):
            incoming = raw.get(key) if isinstance(raw.get(key), dict) else {}
            base_item = base[key]
            item = {
                "kicker": clip(incoming.get("kicker"), 40, base_item["kicker"]),
                "title": clip(incoming.get("title"), 140, base_item["title"]),
                "text": clip(incoming.get("text"), 800, base_item["text"]),
                "image": str(incoming.get("image") or base_item["image"]).strip()[:240] or base_item["image"],
            }
            if key == "choose":
                item["button"] = clip(incoming.get("button"), 40, base_item["button"])
                item["href"] = clip(incoming.get("href"), 160, base_item["href"])
            return item

        return {"announcements": announcements, "how": how, "reasons": panel("reasons"), "choose": panel("choose")}

    def save_channel(self, settings, group, body, fields, secrets):
        current = settings.setdefault(group, {})
        for field in fields:
            key = group + field[:1].upper() + field[1:]
            if field in secrets and not str(body.get(key) or "").strip():
                continue
            if field == "enabled":
                current["enabled"] = bool(body.get(key))
                continue
            if key not in body:
                continue
            current[field] = str(body.get(key) or "").strip()[:160]

    def clean_variant_type(self, body, current=None):
        name = (body.get("name") or "").strip()
        if not name:
            raise ValueError("Variant type name is required")
        mode = body.get("mode") if body.get("mode") in ("multiply", "add") else "multiply"
        return {"id": (current or {}).get("id") or "", "name": name[:80], "mode": mode}

    def clean_variant(self, body, current=None):
        name = (body.get("name") or "").strip()
        type_id = (body.get("typeId") or "").strip()
        if not name or not type_id:
            raise ValueError("Name and variant type are required")
        try:
            amount = float(body.get("amount"))
        except (TypeError, ValueError):
            raise ValueError("Amount must be a number")
        return {
            "id": (current or {}).get("id") or "",
            "typeId": type_id[:40],
            "name": name[:80],
            "amount": round(amount, 2),
            "isDefault": bool(body.get("isDefault")),
        }

    def clean_category(self, body, current=None):
        name = (body.get("name") or "").strip()
        if not name:
            raise ValueError("Category name is required")
        return {
            "id": (current or {}).get("id") or "",
            "name": name[:80],
            "image": (body.get("image") or "assets/art/poster.svg").strip()[:240],
        }

    def clean_review(self, body, current=None):
        name = (body.get("name") or "").strip()
        text = (body.get("text") or "").strip()
        if not name or not text:
            raise ValueError("Name and review text are required")
        try:
            stars = int(body.get("stars") or 5)
        except (TypeError, ValueError):
            stars = 5
        item = {
            "id": (current or {}).get("id") or "",
            "name": name[:80],
            "when": (body.get("when") or "Just now").strip()[:40],
            "stars": min(5, max(1, stars)),
            "text": text[:800],
        }
        image = str(body.get("image") or (current or {}).get("image") or "")
        if image.startswith("assets/"):
            item["image"] = image[:180]
        return item

    def create_item(self, key, body, cleaner):
        try:
            item = cleaner(body)
        except ValueError as exc:
            self.send_json(400, {"error": str(exc)})
            return
        with LOCK:
            db = load_db()
            item["id"] = self.unique_id(db[key], body.get("id") or item.get("name"))
            if key == "variants" and item.get("isDefault"):
                for row in db[key]:
                    if row.get("typeId") == item["typeId"]:
                        row["isDefault"] = False
            db[key].append(item)
            save_db(db)
        self.send_json(201, item)

    def update_item(self, key, item_id, body):
        cleaner = {
            "products": self.clean_product,
            "categories": self.clean_category,
            "reviews": self.clean_review,
            "variantTypes": self.clean_variant_type,
            "variants": self.clean_variant,
        }[key]
        with LOCK:
            db = load_db()
            current = next((item for item in db[key] if item.get("id") == item_id), None)
            if not current:
                self.send_json(404, {"error": "Not found"})
                return
            try:
                item = cleaner(body, current)
            except ValueError as exc:
                self.send_json(400, {"error": str(exc)})
                return
            item["id"] = item_id
            if key == "variants" and item.get("isDefault"):
                for row in db[key]:
                    if row.get("typeId") == item["typeId"] and row.get("id") != item_id:
                        row["isDefault"] = False
            db[key] = [item if row.get("id") == item_id else row for row in db[key]]
            save_db(db)
        self.send_json(200, item)

    def update_settings(self, body):
        with LOCK:
            db = load_db()
            settings = db["settings"]
            for key in ("phone", "email", "address", "hours", "hoursNote"):
                if key in body:
                    settings[key] = str(body.get(key) or "").strip()[:160]
            digits = re.sub(r"\D", "", settings.get("phone", ""))
            settings["phoneHref"] = digits or settings.get("phoneHref") or ""
            if self.channel_present("payment", ["enabled", "provider", "publicKey", "secretKey", "currency"], body):
                self.save_channel(settings, "payment", body, ["enabled", "provider", "publicKey", "secretKey", "currency"], {"secretKey"})
            if self.channel_present("sms", ["enabled", "provider", "sender", "apiKey", "apiSecret"], body):
                self.save_channel(settings, "sms", body, ["enabled", "provider", "sender", "apiKey", "apiSecret"], {"apiKey", "apiSecret"})
            if self.channel_present("mail", ["enabled", "host", "port", "username", "password", "fromEmail", "fromName"], body):
                self.save_channel(settings, "mail", body, ["enabled", "host", "port", "username", "password", "fromEmail", "fromName"], {"password"})
            if isinstance(body.get("website"), dict):
                settings["website"] = self.clean_website(body["website"], settings.get("website"))
            password = body.get("password") or ""
            if password:
                if len(password) < 6:
                    self.send_json(400, {"error": "Use a password of at least 6 characters"})
                    return
                db["auth"]["password"] = hash_password(password)
                db["auth"]["mustChange"] = False
            if body.get("username"):
                db["auth"]["username"] = str(body["username"]).strip()[:40] or db["auth"]["username"]
            save_db(db)
            view = admin_view(db)
        self.send_json(200, view)

    def serve_file(self, path):
        if path.startswith("/data") or path in ("/server.py", "/data/db.json"):
            self.send_error(404)
            return
        if path == "/admin" or path == "/admin/":
            path = "/admin/index.html"
        rel = unquote(path).lstrip("/")
        target = (ROOT / (rel or "index.html")).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            self.send_error(404)
            return
        if not target.is_file():
            self.send_error(404)
            return
        kind = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".pdf": "application/pdf",
            ".tif": "image/tiff",
            ".tiff": "image/tiff",
            ".ico": "image/x-icon",
        }.get(target.suffix.lower(), "application/octet-stream")
        data = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(data)))
        if target.suffix.lower() in (".html", ".js", ".css"):
            self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    load_db()
    print(f"A2Z site    http://127.0.0.1:{PORT}/")
    print(f"Admin panel http://127.0.0.1:{PORT}/admin/")
    print(f"Sign in with {DEFAULT_USER} / {DEFAULT_PASSWORD} until the password is changed")
    ThreadingHTTPServer(("127.0.0.1", PORT), App).serve_forever()
