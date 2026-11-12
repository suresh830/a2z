import { Link, NavLink } from "react-router-dom";
import { useCart } from "./cart";

export default function Layout({ settings, children }) {
  const cart = useCart();
  const phone = settings?.phone || "08 6288 5285";
  const email = settings?.email || "Sales@a2zprinting.com.au";

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <a href={`tel:${settings?.phoneHref || "0862885285"}`}>{phone}</a>
            <a href={`mailto:${email}`}>{email}</a>
          </div>
          <div className="topbar-right">
            <span>Unit 10 / 114 Malaga Road, Malaga 6090</span>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Link className="logo" to="/" aria-label="A2Z Printing home">
            <img src="/assets/logo.svg" alt="A2Z Printing" />
          </Link>
          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/contact">Contact Us</NavLink>
          </nav>
          <div className="header-tools">
            <Link className="reviews-pill" to="/#reviews"><span className="dot"></span><span>See Our Reviews</span></Link>
            <Link className="icon-btn" to="/cart" aria-label="Open cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/><path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2H17a1.5 1.5 0 0 0 1.5-1.2L20 8H7"/></svg>
              <span className="badge">{cart.count}</span>
            </Link>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link className="logo" to="/"><img src="/assets/logo.svg" alt="A2Z Printing" /></Link>
            <p className="f-item"><span><strong>Address</strong>Unit 10 / 114 Malaga Road,<br />Malaga 6090</span></p>
            <p className="f-item"><span><strong>Phone Number</strong><a href={`tel:${settings?.phoneHref || "0862885285"}`}>{phone}</a></span></p>
            <p className="f-item"><span><strong>Open Hours</strong>{settings?.hours || "Mon – Sat: 9 am – 6 pm"}<br />{settings?.hoursNote || "Sunday: CLOSED"}</span></p>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/products">Products</Link>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/products">All products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/contact">Get a quote</Link>
          </div>
        </div>
        <div className="container legal-bar"><span>© 2026 A2Z Printing. Malaga, Western Australia.</span></div>
      </footer>
    </>
  );
}
