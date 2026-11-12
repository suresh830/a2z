import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { sendInquiry } from "../api";

export default function Contact() {
  const [params] = useSearchParams();
  const order = params.get("order");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    try {
      const result = await sendInquiry({
        name: form.get("name"),
        email: form.get("email"),
        topic: form.get("topic"),
        message: form.get("message")
      });
      event.currentTarget.reset();
      setNote(`Message sent. Reference ${result.inquiry.id}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <h1>Contact Us</h1>
        {order ? <p>Order <strong>{order}</strong> has been received. The studio will confirm it by email.</p> : null}
        <p>Unit 10 / 114 Malaga Road, Malaga 6090 · 08 6288 5285 · Sales@a2zprinting.com.au</p>
        <form className="quote-form" onSubmit={submit}>
          <input name="name" required placeholder="What's Your Name?" />
          <input name="email" type="email" required placeholder="Email Address" />
          <select name="topic" aria-label="Discussion topic" defaultValue="">
            <option value="">Select Discussion Topic</option>
            <option>Signage</option>
            <option>Business Card</option>
            <option>Banners Print</option>
            <option>T-Shirt Printing</option>
          </select>
          <textarea name="message" required placeholder="A Brief Discussion About This Projects Describe Us."></textarea>
          {error ? <p>{error}</p> : null}
          {note ? <p className="form-note">{note}</p> : null}
          <button className="btn btn-block" type="submit">Send Message</button>
        </form>
      </div>
    </section>
  );
}
