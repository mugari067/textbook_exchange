import "./App.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, LogIn, LogOut, BookOpen, Heart, Trash2, Star, X, CheckCircle2, MessageCircle, Phone, Filter, Upload, User } from "lucide-react";

// Utility helpers
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const nowISO = () => new Date().toISOString();

// LocalStorage wrapper
const LS = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "") ?? fallback; } catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  del(key) { localStorage.removeItem(key); }
};

const KEYS = {
  users: "tx_users",
  books: "tx_books",
  favs: "tx_favs",
  session: "tx_session"
};

// Seed demo data on first load
function useSeed() {
  useEffect(() => {
    const users = LS.get(KEYS.users, []);
    const books = LS.get(KEYS.books, []);
    if (users.length === 0 && books.length === 0) {
      const u1 = { id: uid(), name: "Alex Student", email: "alex@campus.ac.za", phone: "0601234567", created_at: nowISO(), password: "pass" };
      const u2 = { id: uid(), name: "Bongani N.", email: "bongani@campus.ac.za", phone: "0619876543", created_at: nowISO(), password: "pass" };
      const demoBooks = [
        { id: uid(), title: "Discrete Mathematics and Its Applications", author: "Rosen", course: "CS201", price: 300, condition: "Good", image: "", seller_id: u1.id, status: "Available", created_at: nowISO() },
        { id: uid(), title: "Introduction to Algorithms", author: "CLRS", course: "CS301", price: 450, condition: "Used", image: "", seller_id: u2.id, status: "Available", created_at: nowISO() },
      ];
      LS.set(KEYS.users, [u1, u2]);
      LS.set(KEYS.books, demoBooks);
    }
  }, []);
}

function useStore() {
  const [users, setUsers] = useState(() => LS.get(KEYS.users, []));
  const [books, setBooks] = useState(() => LS.get(KEYS.books, []));
  const [session, setSession] = useState(() => LS.get(KEYS.session, null));
  const [favs, setFavs] = useState(() => LS.get(KEYS.favs, {})); // { [userId]: { [bookId]: true } }

  useEffect(() => LS.set(KEYS.users, users), [users]);
  useEffect(() => LS.set(KEYS.books, books), [books]);
  useEffect(() => LS.set(KEYS.session, session), [session]);
  useEffect(() => LS.set(KEYS.favs, favs), [favs]);

  return { users, setUsers, books, setBooks, session, setSession, favs, setFavs };
}

function Header({ session, onLogout, onShowAdd, onShowFavs, search, setSearch, filtersOpen, setFiltersOpen }) {
  return (
    <div className="btn sticky top-0 z-30 bg-white/80 backdrop-blur -b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <BookOpen className="w-6 h-6" />
        <h1 className="text-xl font-bold">Textbook Exchange</h1>
        <div className="flex-1" />
        <div className="flex items-center gap-2 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="btn btn-sm w-4 h-4 absolute left-3 to /2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, author, course..."
              className="btn w-full pl-9 pr-10 py-2 rounded-2xl focus:outline-none focus:ring"
            />
            <button
              className="btn btn-sm absolute right-2 to /2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              onClick={() => setFiltersOpen(!filtersOpen)}
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        {session ? (
          <div className="flex items-center gap-2">
            <button onClick={onShowFavs} className="btn px-3 py-2 rounded-2xl hover:bg-gray-50 flex items-center gap-2"><Heart className="w-4 h-4" /> Favorites</button>
            <button onClick={onShowAdd} className="btn btn-primary px-3 py-2 rounded-2xl"><Plus className="w-4 h-4" /> New Listing</button>
            <button onClick={onLogout} className="btn px-3 py-2 rounded-2xl hover:bg-gray-50 flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Auth({ onLoggedIn, users, setUsers }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const u = users.find(u => u.email === email && u.password === password);
      if (!u) return setError("Invalid email or password");
      onLoggedIn(u);
    } else {
      if (!name || !email || !password) return setError("All fields required");
      if (users.some(u => u.email === email)) return setError("Email already registered");
      const u = { id: uid(), name, email, phone, password, created_at: nowISO() };
      setUsers([...users, u]);
      onLoggedIn(u);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="btn rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{mode === "login" ? "Login" : "Create an account"}</h2>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input className="btn w-full rounded-xl px-3 py-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <input className="btn w-full rounded-xl px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode === "register" && (
            <input className="btn w-full rounded-xl px-3 py-2" placeholder="Phone / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
          )}
          <input className="btn w-full rounded-xl px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn btn-primary w-full">{mode === "login" ? "Login" : "Register"}</button>
        </form>
        <div className="text-sm text-center mt-4">
          {mode === "login" ? (
            <button className="underline" onClick={() => setMode("register")}>No account? Register</button>
          ) : (
            <button className="underline" onClick={() => setMode("login")}>Have an account? Login</button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">Demo note: passwords are stored in localStorage for demo purposes only. Do not use real credentials.</p>
    </div>
  );
}

function Filters({ filters, setFilters }) {
  return (
    <div className="grid sm:grid-cols-4 gap-3">
      <input className="btn rounded-xl px-3 py-2" placeholder="Course (e.g., CS201)" value={filters.course} onChange={(e)=>setFilters(v=>({...v, course:e.target.value}))} />
      <select className="btn rounded-xl px-3 py-2" value={filters.condition} onChange={(e)=>setFilters(v=>({...v, condition:e.target.value}))}>
        <option value="">Condition (any)</option>
        <option>New</option>
        <option>Good</option>
        <option>Used</option>
      </select>
      <input className="btn rounded-xl px-3 py-2" type="number" placeholder="Min price" value={filters.minPrice} onChange={(e)=>setFilters(v=>({...v, minPrice:e.target.value}))} />
      <input className="btn rounded-xl px-3 py-2" type="number" placeholder="Max price" value={filters.maxPrice} onChange={(e)=>setFilters(v=>({...v, maxPrice:e.target.value}))} />
    </div>
  );
}

function AddListingModal({ open, onClose, onAdd, session }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [course, setCourse] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Good");
  const [image, setImage] = useState("");

  const fileRef = useRef();

  if (!open) return null;

  const handleFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result.toString());
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    onAdd({ id: uid(), title, author, course, price: Number(price), condition, image, seller_id: session.id, status: "Available", created_at: nowISO() });
    onClose();
    setTitle(""); setAuthor(""); setCourse(""); setPrice(""); setCondition("Good"); setImage("");
  };

  return (
    <div className="btn btn-primary fixed inset-0">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">New Listing</h3>
          <button className="p-2 hover:bg-gray-100 rounded-xl" onClick={onClose}><X className="w-4 h-4"/></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input className="btn w-full rounded-xl px-3 py-2" placeholder="Book title" value={title} onChange={e=>setTitle(e.target.value)} />
          <input className="btn w-full rounded-xl px-3 py-2" placeholder="Author" value={author} onChange={e=>setAuthor(e.target.value)} />
          <input className="btn w-full rounded-xl px-3 py-2" placeholder="Course (e.g., CS201)" value={course} onChange={e=>setCourse(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="btn rounded-xl px-3 py-2" type="number" placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} />
            <select className="btn rounded-xl px-3 py-2" value={condition} onChange={e=>setCondition(e.target.value)}>
              <option>New</option>
              <option>Good</option>
              <option>Used</option>
            </select>
          </div>
          <div className="btn rounded-xl p-3">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Book cover (optional)</p>
                <p className="text-xs text-gray-500">PNG/JPG will be stored locally in your browser</p>
              </div>
              <div className="flex-1" />
              <button type="button" className="btn px-3 py-1.5 rounded-xl" onClick={()=>fileRef.current?.click()}>Choose file</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>handleFile(e.target.files?.[0])} />
            </div>
            {image && (<img alt="preview" src={image} className="mt-3 rounded-xl max-h-40 object-contain mx-auto" />)}
          </div>
          <button className="btn btn-primary w-full">Post Listing</button>
        </form>
      </div>
    </div>
  );
}

function BookCard({ book, seller, isOwner, onDelete, onToggleSold, onFav, favbedByUser }) {
  return (
    <motion.div layout className="btn rounded-2xl shadow-sm p-4 flex gap-4">
      <div className="w-24 h-28 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
        {book.image ? <img alt={book.title} src={book.image} className="btn btn-primary w-full h-full object-cover" /> : <BookOpen className="w-8 h-8 opacity-50" />}
      </div>
      <div className="flex-1">
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-lg">{book.title}</h4>
          {book.status === "Sold" && (
            <span className="btn btn-sm ml-2 inline-flex items-center ga text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3"/> Sold</span>
          )}
        </div>
        <p className="text-sm text-gray-600">{book.author} • {book.course} • <span className="font-medium">R{book.price}</span> • {book.condition}</p>
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span className="btn btn-sm inline-flex items-center ga"><User className="w-4 h-4" /> {seller?.name || "Unknown"}</span>
          {seller?.phone && (
            <a href={`https://wa.me/${seller.phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(seller.name)},%20I'm%20interested%20in%20${encodeURIComponent(book.title)}.`}
               target="_blank" rel="noreferrer"
               className="btn btn-sm inline-flex items-center ga underline">
              <Phone className="w-4 h-4" /> WhatsApp
            </a>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {!isOwner && (
            <button onClick={onFav} className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${favbedByUser ? "bg-pink-50" : ""}`}>
              <Heart className="w-4 h-4" /> {favbedByUser ? "Saved" : "Save"}
            </button>
          )}
          {isOwner && (
            <>
              <button onClick={onToggleSold} className="btn px-3 py-1.5 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {book.status === "Available" ? "Mark as Sold" : "Mark as Available"}</button>
              <button onClick={onDelete} className="btn px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Delete</button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Listings({ books, users, currentUser, onDelete, onToggleSold, onFav, favs, search, filters }) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books
      .filter(b => b.status !== "Hidden")
      .filter(b => !q || [b.title, b.author, b.course].some(x => (x||"").toLowerCase().includes(q)))
      .filter(b => !filters.course || (b.course||"").toLowerCase().includes(filters.course.toLowerCase()))
      .filter(b => !filters.condition || b.condition === filters.condition)
      .filter(b => !filters.minPrice || Number(b.price) >= Number(filters.minPrice))
      .filter(b => !filters.maxPrice || Number(b.price) <= Number(filters.maxPrice))
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }, [books, search, filters]);

  if (filtered.length === 0) {
    return <p className="text-center text-gray-500 py-10">No books match your search yet. Try clearing filters or add a new listing.</p>;
  }

  return (
    <AnimatePresence mode="popLayout">
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(b => (
          <BookCard
            key={b.id}
            book={b}
            seller={users.find(u=>u.id===b.seller_id)}
            isOwner={currentUser?.id === b.seller_id}
            favbedByUser={!!favs?.[currentUser?.id||"" ]?.[b.id]}
            onDelete={() => onDelete(b.id)}
            onToggleSold={() => onToggleSold(b.id)}
            onFav={() => onFav(b.id)}
          />
        ))}
      </div>
    </AnimatePresence>
  );
}

function Favorites({ currentUser, favs, books, users, onFavToggle }) {
  const favIds = Object.entries(favs[currentUser.id] || {}).filter(([,v])=>v).map(([k])=>k);
  const favBooks = books.filter(b=>favIds.includes(b.id));
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Heart className="w-4 h-4" /> Your Favorites</h3>
      {favBooks.length === 0 ? (
        <p className="text-gray-500">No favorites yet. Click "Save" on listings you like.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {favBooks.map(b => (
            <BookCard
              key={b.id}
              book={b}
              seller={users.find(u=>u.id===b.seller_id)}
              isOwner={false}
              favbedByUser={true}
              onDelete={()=>{}}
              onToggleSold={()=>{}}
              onFav={() => onFavToggle(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  useSeed();
  const { users, setUsers, books, setBooks, session, setSession, favs, setFavs } = useStore();

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ course: "", condition: "", minPrice: "", maxPrice: "" });
  const [showFavs, setShowFavs] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const handleLogin = (u) => setSession(u);
  const handleLogout = () => setSession(null);

  const addBook = (b) => setBooks([b, ...books]);
  const delBook = (id) => setBooks(books.filter(b=>b.id!==id));
  const toggleSold = (id) => setBooks(books.map(b=> b.id===id ? { ...b, status: b.status === "Available" ? "Sold" : "Available" } : b));
  const toggleFav = (bookId) => setFavs(prev => {
    const userId = session?.id;
    if (!userId) return prev;
    const curr = prev[userId] || {};
    const next = { ...prev, [userId]: { ...curr, [bookId]: !curr[bookId] } };
    return next;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header
        session={session}
        onLogout={handleLogout}
        onShowAdd={() => setAddOpen(true)}
        onShowFavs={() => setShowFavs(v=>!v)}
        search={search}
        setSearch={setSearch}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!session ? (
          <Auth onLoggedIn={handleLogin} users={users} setUsers={setUsers} />
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Logged in as</span>
                <span className="px-2 py-1 rounded-xl bg-gray-100 text-sm">{session.name}</span>
              </div>
            </div>

            <AnimatePresence>
              {filtersOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 overflow-hidden">
                  <div className="btn rounded-2xl p-4 bg-white shadow-sm">
                    <Filters filters={filters} setFilters={setFilters} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Listings
                  books={books}
                  users={users}
                  currentUser={session}
                  onDelete={delBook}
                  onToggleSold={toggleSold}
                  onFav={toggleFav}
                  favs={favs}
                  search={search}
                  filters={filters}
                />
              </div>
              <aside className="md:col-span-1">
                <div className="btn rounded-2xl p-4 bg-white shadow-sm sticky top-20">
                  <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button onClick={() => setAddOpen(true)} className="btn btn-primary w-full px-3 py-2 rounded-xl"><Plus className="w-4 h-4"/> New Listing</button>
                    <button onClick={() => setShowFavs(v=>!v)} className="btn w-full px-3 py-2 rounded-xl flex items-center gap-2 justify-center"><Heart className="w-4 h-4"/> {showFavs ? "Hide" : "Show"} Favorites</button>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Tip: Use the search bar to quickly find by <span className="font-medium">title, author, or course</span>. You can also filter by condition and price.</p>
                  </div>
                </div>
              </aside>
            </div>

            <AnimatePresence>
              {showFavs && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6">
                  <div className="btn rounded-2xl p-4 bg-white shadow-sm">
                    <Favorites currentUser={session} favs={favs} books={books} users={users} onFavToggle={toggleFav} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AddListingModal open={addOpen} onClose={()=>setAddOpen(false)} onAdd={addBook} session={session} />
          </>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-500">
        <div className="btn rounded-3xl p-4 text-center">
          <p><strong>Student Project Demo</strong> — Data is stored locally in your browser (localStorage). For a production app, connect a backend (Node, PHP, or Django) and a real database (MySQL/PostgreSQL/MongoDB).</p>
        </div>
      </footer>
    </div>
  );
}
