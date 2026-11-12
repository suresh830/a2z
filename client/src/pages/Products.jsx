import { Link, useSearchParams } from "react-router-dom";
import { money } from "../api";
import { useCart } from "../cart";

export default function Products({ content }) {
  const cart = useCart();
  const [params, setParams] = useSearchParams();
  const selected = params.get("cat") || "";
  const products = (content?.products || []).filter((item) => !selected || item.category === selected);
  const categories = content?.categories || [];

  return (
    <section className="section">
      <div className="container">
        <h1>Products</h1>
        <div className="catbar" style={{ margin: "18px 0 28px" }}>
          <div className="catbar-track">
            <button type="button" onClick={() => setParams({})}>All</button>
            {categories.map((category) => (
              <button type="button" key={category.id} onClick={() => setParams({ cat: category.name })}>{category.name}</button>
            ))}
          </div>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-visual">
                <Link to={`/products/${product.id}`}><img src={`/${product.image}`} alt={product.name} /></Link>
              </div>
              <div className="product-meta">
                <h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
                <p className="price">{money(product.price)}</p>
                <button className="btn" type="button" onClick={() => cart.add(product)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
