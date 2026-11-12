import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkout, money } from "../api";
import { useCart } from "../cart";

export default function Cart() {
  const cart = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await checkout({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        address: form.get("address"),
        notes: form.get("notes"),
        items: cart.items
      });
      cart.clear();
      navigate(`/contact?order=${encodeURIComponent(result.order.id)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <h1>Cart</h1>
        {!cart.items.length ? <p>Your cart is empty. <Link to="/products">Browse products</Link></p> : (
          <div className="split">
            <div>
              {cart.items.map((item) => (
                <div className="sum-row" key={item.id}>
                  <span>{item.name}<br /><small>{money(item.price)}</small></span>
                  <input type="number" min="0" value={item.qty} aria-label={`${item.name} quantity`} onChange={(event) => cart.update(item.id, Number(event.target.value))} />
                  <strong>{money(item.price * item.qty)}</strong>
                </div>
              ))}
              <p><strong>Total {money(cart.total)}</strong></p>
            </div>
            <form className="quote-form" onSubmit={submit}>
              <input name="name" required placeholder="What's Your Name?" />
              <input name="email" type="email" required placeholder="Email Address" />
              <input name="phone" placeholder="Phone" />
              <input name="address" placeholder="Delivery address" />
              <textarea name="notes" placeholder="Artwork notes or special instructions"></textarea>
              {error ? <p>{error}</p> : null}
              <button className="btn btn-block" type="submit" disabled={pending}>{pending ? "Sending…" : "Place order"}</button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
