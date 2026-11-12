import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { getContent } from "./api";
import { CartProvider } from "./cart";
import Layout from "./Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import About from "./pages/About";

export default function App() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getContent().then(setContent).catch((err) => setError(err.message));
  }, []);

  return (
    <CartProvider>
      <Layout settings={content?.settings}>
        {error ? <p className="container section">{error}</p> : null}
        <Routes>
          <Route path="/" element={<Home content={content} />} />
          <Route path="/products" element={<Products content={content} />} />
          <Route path="/products/:id" element={<Product content={content} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </CartProvider>
  );
}
