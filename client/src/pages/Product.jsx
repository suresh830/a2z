import { Link, useParams } from "react-router-dom";
import { money } from "../api";
import { useCart } from "../cart";

export default function Product({ content }) {
  const { id } = useParams();
  const cart = useCart();
  const product = (content?.products || []).find((item) => item.id === id);

  if (!content) return <section className="section"><div className="container"><p>Loading product…</p></div></section>;
  if (!product) return <section className="section"><div className="container"><p>That product is not in the catalog.</p></div></section>;

  return (
    <section className="section">
      <div className="container split">
        <img src={`/${product.image}`} alt={product.name} />
        <div>
          <p className="kicker">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="price">{money(product.price)}</p>
          <p>{product.summary}</p>
          <p>Lead time: {product.lead}</p>
          <button className="btn" type="button" onClick={() => cart.add(product)}>Add to cart</button>
          <p><Link to="/products">Back to products</Link></p>
        </div>
      </div>
    </section>
  );
}
