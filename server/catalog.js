const products = [
  { id: "floor-graphics", name: "Floor Graphics", price: 5000, category: "Signage", image: "assets/products/floor-graphics.jpg", lead: "4–6 business days", summary: "Durable floor decals for retail, events and wayfinding. Supplied print-ready with a slip-resistant laminate option.", featured: true },
  { id: "corflute", name: "Corflute", price: 3000, category: "Rigid Signs", image: "assets/products/corflute.jpg", lead: "2–4 business days", summary: "Lightweight corrugated plastic board for outdoor promotions, real estate and site signage.", featured: true },
  { id: "backlit-vinyl", name: "Backlit Vinyl", price: 2000, category: "Signage", image: "assets/products/backlit-vinyl.jpg", lead: "5–7 business days", summary: "Translucent film for lightboxes and illuminated displays, printed for even colour when lit.", featured: true },
  { id: "image-dot-vinyl", name: "Image Dot Adhesive Vinyl", price: 2500, category: "Self Adhesive Vinyls", image: "assets/products/image-dot-vinyl.jpg", lead: "3–5 business days", summary: "Perforated window film that reads as a print from outside and stays see-through from inside.", featured: true },
  { id: "foam-pvc", name: "Foam PVC", price: 4500, category: "Wall Murals", image: "assets/products/foam-pvc.jpg", lead: "4–6 business days", summary: "Flat, rigid foam board for indoor displays, exhibition panels and wall graphics.", featured: true },
  { id: "economy-clear-vinyl", name: "Economy Clear Vinyl", price: 2600, category: "Self Adhesive Vinyls", image: "assets/products/economy-clear-vinyl.jpg", lead: "3–5 business days", summary: "Clear adhesive vinyl for windows and glass, with a lower-cost film for short campaigns.", featured: true },
  { id: "design-services", name: "Design Services", price: 899, category: "Signage", image: "assets/products/design-services.jpg", lead: "2–4 business days", summary: "Artwork setup, layout and print-ready files when you need the studio to prepare the job.", featured: true },
  { id: "a-frame-900", name: "Corflute Insertable A Frame 900 x 1200mm", price: 699, category: "A Frames", image: "assets/products/a-frame.jpg", lead: "2–3 business days", summary: "Insertable A-frame with a 900 × 1200 mm corflute poster. Swap the print when the offer changes.", featured: true },
  { id: "business-cards", name: "Business Cards", price: 89, category: "Business Cards", image: "assets/art/cards.svg", lead: "2–3 business days", summary: "Thick card stock, single or double sided, with optional matte or gloss laminate.", featured: false },
  { id: "flyers", name: "Flyers and Brochures", price: 149, category: "Flyers and Brochures", image: "assets/art/flyers.svg", lead: "2–4 business days", summary: "Leaflets and folded brochures on a choice of paper weights and finishes.", featured: false },
  { id: "poster", name: "Synthetic Poster", price: 79, category: "Posters", image: "assets/art/poster.svg", lead: "1–3 business days", summary: "Weather-tolerant synthetic posters for indoor and short-run outdoor use.", featured: false },
  { id: "stickers", name: "Round Stickers", price: 69, category: "Stickers", image: "assets/art/stickers.svg", lead: "2–4 business days", summary: "Die-cut sticker sheets on vinyl or paper, supplied kiss-cut on a backing sheet.", featured: false },
  { id: "pvc-banner", name: "PVC Banner", price: 189, category: "Banners", image: "assets/art/banner.svg", lead: "2–4 business days", summary: "Hemmed PVC banner with eyelets, sized for fences, shopfronts and events.", featured: false },
  { id: "booklet", name: "Saddle-Stitched Booklet", price: 249, category: "Booklet", image: "assets/art/booklet.svg", lead: "4–6 business days", summary: "Multi-page booklets, stapled on the spine, for menus, lookbooks and catalogues.", featured: false },
  { id: "rigid-board", name: "Rigid Signs", price: 320, category: "Rigid Signs", image: "assets/art/rigid.svg", lead: "3–5 business days", summary: "Direct-to-board rigid prints for counters, hanging signs and feature walls.", featured: false },
  { id: "window-vinyl", name: "Self Adhesive Vinyl", price: 210, category: "Self Adhesive Vinyls", image: "assets/art/vinyl.svg", lead: "3–5 business days", summary: "Cut or printed self-adhesive vinyl for glass, boards and smooth walls.", featured: false }
];

const categories = [
  { id: "a-frames", name: "A Frames", image: "assets/products/a-frame.jpg" },
  { id: "flyers", name: "Flyers and Brochures", image: "assets/art/flyers-clear.png" },
  { id: "posters", name: "Posters", image: "assets/art/poster-clear.png" },
  { id: "signage", name: "Signage", image: "assets/art/signage.svg" },
  { id: "wall-murals", name: "Wall Murals", image: "assets/products/foam-pvc.jpg" },
  { id: "stickers", name: "Stickers", image: "assets/art/stickers.svg" },
  { id: "rigid-signs", name: "Rigid Signs", image: "assets/art/rigid.svg" },
  { id: "vinyls", name: "Self Adhesive Vinyls", image: "assets/art/vinyl.svg" },
  { id: "business-cards", name: "Business Cards", image: "assets/art/cards.svg" },
  { id: "booklet", name: "Booklet", image: "assets/art/booklet.svg" },
  { id: "banners", name: "Banners", image: "assets/art/banner.svg" }
];

const reviews = [
  { id: "sally", name: "Sally Lorraine", when: "2 months ago", stars: 5, image: "assets/reviews/sally.svg", text: "A2Z Printing provided excellent service from start to finish. The team understood our requirements and delivered high-quality printing on time." },
  { id: "craig", name: "Craig Edwards", when: "3 months ago", stars: 5, image: "assets/reviews/craig.svg", text: "I was impressed with the quality of the printed products. A2Z Printing made the entire process simple and delivered exactly what we needed." },
  { id: "michael", name: "Michael Brown", when: "1 month ago", stars: 5, image: "assets/reviews/michael.svg", text: "Great printing service with professional results. The turnaround was quick, communication clear, and the final products looked fantastic." }
];

const settings = {
  phone: "08 6288 5285",
  phoneHref: "0862885285",
  email: "Sales@a2zprinting.com.au",
  address: "Unit 10 / 114 Malaga Road, Malaga 6090",
  hours: "Mon – Sat: 9 am – 6 pm",
  hoursNote: "Sunday: CLOSED"
};

module.exports = { products, categories, reviews, settings };
