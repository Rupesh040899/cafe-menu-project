import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Search, ShoppingBag, Plus, Minus, Trash2, Coffee, X, CheckCircle2, AlertCircle, Utensils, QrCode, Clock3 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const money = value => `₹${Number(value || 0).toFixed(0)}`;
const fallbackItems = [
  { _id: "demo-1", name: "Cappuccino", description: "Double espresso, steamed milk and soft foam.", category: "Coffee", price: 160, image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80", available: true },
  { _id: "demo-2", name: "Iced Latte", description: "Chilled espresso with creamy milk over ice.", category: "Coffee", price: 180, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80", available: true },
  { _id: "demo-3", name: "Classic Croissant", description: "Buttery, flaky and baked fresh every morning.", category: "Bakery", price: 120, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80", available: true },
  { _id: "demo-4", name: "Avocado Toast", description: "Sourdough, smashed avocado and chilli flakes.", category: "Food", price: 240, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80", available: true },
  { _id: "demo-5", name: "Blueberry Cheesecake", description: "Creamy baked cheesecake with blueberry compote.", category: "Dessert", price: 210, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80", available: true },
  { _id: "demo-6", name: "Hot Chocolate", description: "Rich cocoa finished with a little whipped cream.", category: "Drinks", price: 170, image: "https://images.unsplash.com/photo-1542990253-0b8be9f5e9e8?auto=format&fit=crop&w=800&q=80", available: true }
];

export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [notice, setNotice] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [customer, setCustomer] = useState({ customerName: "", phone: "", tableNumber: new URLSearchParams(location.search).get("table") || "", notes: "" });
  const [placing, setPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);


async function loadMenu() {
  setLoading(true);

  const menuUrl = `${API_URL.replace(/\/+$/, "")}/menu`;

  try {
    console.log("Menu API URL:", menuUrl);

    const response = await fetch(menuUrl);

    console.log("Menu API status:", response.status);

    const result = await response.json();

    console.log("Menu API response:", result);

    if (!response.ok) {
      throw new Error(
        `API Error ${response.status}: ${result.message || "Request failed"}`
      );
    }

    if (!Array.isArray(result.data)) {
      throw new Error("Invalid API response: menu data is not an array");
    }

    setMenu(result.data);
    setApiError("");

  } catch (error) {
    console.error("Menu loading failed:", error);

    setMenu(fallbackItems);
    setApiError(
      `Live menu failed. URL: ${menuUrl}. Error: ${error.message}`
    );

  } finally {
    setLoading(false);
  }
}

  useEffect(() => { loadMenu(); }, []);

  const categories = useMemo(() => ["All", ...new Set(menu.map(item => item.category))], [menu]);
  const visibleMenu = useMemo(() => {
    let result = menu.filter(item => item.available !== false &&
      (category === "All" || item.category === category) &&
      `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
    if (sort === "low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "high") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [menu, category, search, sort]);

  const cartItems = Object.values(cart);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  function addItem(item) {
    setCart(current => ({ ...current, [item._id]: { ...item, quantity: (current[item._id]?.quantity || 0) + 1 } }));
    setNotice(`${item.name} added to your bag`);
    setTimeout(() => setNotice(""), 2200);
  }
  function updateQuantity(id, amount) {
    setCart(current => {
      const next = { ...current };
      const quantity = (next[id]?.quantity || 0) + amount;
      if (quantity <= 0) delete next[id]; else next[id] = { ...next[id], quantity };
      return next;
    });
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (cartItems.some(item => String(item._id).startsWith("demo-"))) {
      setNotice("Connect MongoDB and add menu items before placing a live order.");
      return;
    }
    setPlacing(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          items: cartItems.map(item => ({ menuItem: item._id, quantity: item.quantity }))
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Order could not be placed");
      setSuccessOrder(result.data);
      setCart({});
      setCheckoutOpen(false);
      setCartOpen(false);
    } catch (error) { setNotice(error.message); }
    finally { setPlacing(false); }
  }

  const qrValue = `${window.location.origin}${window.location.pathname}?table=${encodeURIComponent(customer.tableNumber || "1")}`;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-icon"><Coffee size={20}/></span><span>juniper<span className="brand-dot">.</span><small>COFFEE & KITCHEN</small></span></a>
        <nav><a href="#menu">Our menu</a><a href="#story">Our story</a></nav>
        <button className="bag-button" onClick={() => setCartOpen(true)}><ShoppingBag size={18}/> <span>Bag</span><b>{itemCount}</b></button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line"/> GOOD COFFEE. GOOD MOOD.</span>
            <h1>A little pause.<br/><em>A lot of flavour.</em></h1>
            <p>Your neighbourhood spot for slow mornings, fresh bakes and coffee worth staying for.</p>
            <a className="primary-button" href="#menu">Explore the menu <span>↗</span></a>
            <div className="hero-meta"><span><Clock3 size={15}/> 8 AM – 9 PM</span><span><Utensils size={15}/> Freshly made daily</span></div>
          </div>
          <div className="hero-image"><img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=85" alt="A warm cup of coffee on a cafe table"/><div className="image-note">MADE WITH CARE <span>✳</span></div></div>
          <div className="hero-number">01 <span>— 03</span></div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading"><div><span className="eyebrow">A MENU TO MAKE YOUR DAY</span><h2>Find your <em>favourite.</em></h2></div><button className="qr-button" onClick={() => setQrOpen(true)}><QrCode size={17}/> Get table QR</button></div>
          <div className="menu-tools">
            <div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coffee, bakes, and more..."/></div>
            <div className="sort-wrap"><label htmlFor="sort">Sort by</label><select id="sort" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
          </div>
          <div className="category-list">{categories.map(value => <button key={value} className={category === value ? "category active" : "category"} onClick={() => setCategory(value)}>{value}</button>)}</div>
          {apiError && <div className="inline-alert"><AlertCircle size={16}/>{apiError}</div>}
          {loading ? <div className="loading">Preparing something good...</div> :
            visibleMenu.length ? <div className="menu-grid">{visibleMenu.map(item => <article className="menu-card" key={item._id}>
              <div className="menu-photo"><img src={item.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"} alt={item.name}/><span className="photo-category">{item.category}</span></div>
              <div className="menu-card-body"><div className="item-title"><h3>{item.name}</h3><strong>{money(item.price)}</strong></div><p>{item.description}</p><button className="add-button" onClick={() => addItem(item)}><Plus size={16}/> Add to bag</button></div>
            </article>)}</div> : <div className="empty-state">No items found. Try another search or category.</div>}
        </section>

        <section className="story-section" id="story"><div className="story-mark">✳</div><div><span className="eyebrow">A TABLE FOR EVERYONE</span><h2>Come as you are.<br/><em>Stay a little longer.</em></h2></div><p>We believe the best things happen around a table. Thoughtful ingredients, familiar faces and a cup made just the way you like it.</p></section>
      </main>

      <footer><a className="brand" href="#"><span className="brand-icon"><Coffee size={18}/></span><span>juniper<span className="brand-dot">.</span><small>COFFEE & KITCHEN</small></span></a><span>Made for good days. © {new Date().getFullYear()} Juniper Cafe.</span><a href="#menu">Back to menu ↑</a></footer>

      {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}

      {cartOpen && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setCartOpen(false)}><aside className="drawer">
        <div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h2>Your bag <span>({itemCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)}><X/></button></div>
        {cartItems.length ? <><div className="cart-lines">{cartItems.map(item => <div className="cart-line" key={item._id}><img src={item.image} alt=""/><div className="cart-line-info"><strong>{item.name}</strong><span>{money(item.price)}</span><div className="quantity"><button onClick={() => updateQuantity(item._id, -1)}><Minus size={13}/></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item._id, 1)}><Plus size={13}/></button></div></div><button className="remove-button" onClick={() => updateQuantity(item._id, -item.quantity)} aria-label="Remove item"><Trash2 size={16}/></button></div>)}</div>
        <div className="cart-bottom"><div className="total-row"><span>Subtotal</span><strong>{money(total)}</strong></div><small>Taxes, if applicable, will be calculated at the cafe.</small><button className="primary-button full" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Continue to checkout <span>→</span></button></div></> :
        <div className="empty-cart"><ShoppingBag size={35}/><h3>Your bag is taking a break.</h3><p>Add something delicious from the menu.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Explore menu</button></div>}
      </aside></div>}

      {checkoutOpen && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setCheckoutOpen(false)}><div className="modal checkout-modal">
        <div className="modal-head"><div><span className="eyebrow">ALMOST THERE</span><h2>Place your order</h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)}><X/></button></div>
        <form onSubmit={placeOrder}><label>Your name<input required value={customer.customerName} onChange={e => setCustomer({...customer, customerName:e.target.value})} placeholder="e.g. Aditi Sharma"/></label><label>Phone number<input required type="tel" pattern="[+0-9 ()-]{7,20}" value={customer.phone} onChange={e => setCustomer({...customer, phone:e.target.value})} placeholder="Your contact number"/></label><label>Table number <span className="optional">(optional)</span><input value={customer.tableNumber} onChange={e => setCustomer({...customer, tableNumber:e.target.value})} placeholder="e.g. 04"/></label><label>Order notes <span className="optional">(optional)</span><textarea rows="2" value={customer.notes} onChange={e => setCustomer({...customer, notes:e.target.value})} placeholder="Any special requests?"/></label><div className="checkout-total"><span>{itemCount} items</span><strong>{money(total)}</strong></div><button className="primary-button full" disabled={placing}>{placing ? "Placing order..." : "Confirm order"} <span>→</span></button></form>
      </div></div>}

      {qrOpen && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setQrOpen(false)}><div className="modal qr-modal"><button className="icon-button modal-close" onClick={() => setQrOpen(false)}><X/></button><span className="eyebrow">ORDER FROM YOUR TABLE</span><h2>Scan. Browse. Enjoy.</h2><p>Choose a table number and scan this QR code to open the menu with your table pre-filled.</p><label>Table number<input value={customer.tableNumber} onChange={e => setCustomer({...customer, tableNumber:e.target.value})} placeholder="e.g. 04"/></label><div className="qr-code"><QRCodeCanvas value={qrValue} size={190} level="H"/></div><small>For a deployed cafe, print one QR code per table using your live website URL.</small></div></div>}

      {successOrder && <div className="overlay"><div className="modal success-modal"><div className="success-icon"><CheckCircle2 size={34}/></div><span className="eyebrow">ORDER RECEIVED</span><h2>Thanks, {successOrder.customerName}!</h2><p>Your order has been sent to the cafe. Keep this order ID handy.</p><div className="order-reference">#{successOrder._id}</div><div className="total-row"><span>Order total</span><strong>{money(successOrder.totalAmount)}</strong></div><button className="primary-button full" onClick={() => setSuccessOrder(null)}>Back to menu</button></div></div>}
    </div>
  );
}
