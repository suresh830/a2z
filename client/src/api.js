export async function getContent() {
  const response = await fetch("/api/content");
  if (!response.ok) throw new Error("Could not load the shop");
  return response.json();
}

export async function sendInquiry(body) {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not send the message");
  return data;
}

export async function checkout(body) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not place the order");
  return data;
}

export function money(value) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value || 0);
}
