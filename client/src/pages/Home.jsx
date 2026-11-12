import { Link } from "react-router-dom";
import { money } from "../api";
import { useCart } from "../cart";

export default function Home({ content }) {
  const cart = useCart();
  const categories = content?.categories || [];
  const featured = (content?.products || []).filter((item) => item.featured);
  const reviews = content?.reviews || [];

  return (
    <>
      <section className="hero hero-banner">
        <img className="hero-banner-photo" src="/assets/hero-banner.webp" alt="Wide-format printer running a sheet of vibrant colour prints" />
        <div className="container">
          <article className="hero-slide is-active">
            <div className="hero-copy">
              <h1><span className="line"><span className="accent">Quality</span> Printing.</span><span className="line">Reliable Service.</span></h1>
              <p className="lead">Your trusted partner for fast, professional and high-quality printing solutions across Australia.</p>
              <Link className="btn" to="/contact">Get a Quote</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section section-soft" id="categories">
        <div className="container">
          <h2 className="center">Popular Categories</h2>
          <div className="cat-grid">
            {categories.map((category) => (
              <Link className="cat-card" key={category.id} to={`/products?cat=${encodeURIComponent(category.name)}`}>
                <div className="cat-visual"><img src={`/${category.image}`} alt={category.name} /></div>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="center">
            <span className="kicker">Our featured product</span>
            <h2 style={{ marginTop: 14 }}>Explore Featured Products</h2>
          </div>
          <div className="product-grid">
            {featured.map((product) => (
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

      <section className="section section-soft" id="reviews">
        <div className="container">
          <div className="center review-head">
            <div className="review-kicker">OUR CLIENTS SAY</div>
            <h2>What Our Customers Say About A2Z Printing</h2>
          </div>
          <div className="review-track">
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-top">
                  <span className="avatar"><img src={`/${review.image}`} alt="" /></span>
                  <div><strong>{review.name}</strong><span>{review.when}</span></div>
                </div>
                <div className="stars" aria-label={`${review.stars} stars`}>★★★★★</div>
                <p>{review.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
