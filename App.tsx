
import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, MapPin, ChevronRight, Plus, Minus,
  CheckCircle, Home, History, User, Search, Phone, CreditCard,
  ArrowLeft, Bell, ShoppingBag, Trash2, AlertCircle, Package,
} from 'lucide-react';
import { Shop, Product, CartItem, Order, DeliveryPerson, UserRole, OrderStatus, PaymentMethod, ShoppingItem, SupplierAccount, SupplierStatus } from './types';
import { DELIVERY_FEES, SHOPPING_FEE, NEIGHBORHOODS } from './data/mockData';
import { SupplierView } from './views/SupplierView';
import { DeliveryView } from './views/DeliveryView';
import { AdminView } from './views/AdminView';
import { LoginScreen } from './components/LoginScreen';
import { useRealtimeOrders } from './hooks/useRealtimeOrders';
import { useSupabaseData } from './hooks/useSupabaseData';
import { supabase, insertOrder } from './lib/supabase';
import { generateCustomerReceipt } from './lib/pdf';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const genId = () => `ABG-${Date.now().toString().slice(-6)}`;
const uid = () => Math.random().toString(36).slice(2, 8);

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prêt ✓',
  picked_up: 'Récupérée',
  delivering: 'En livraison',
  delivered: 'Livrée ✓',
  cancelled: 'Annulée',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-yellow-700 bg-yellow-50',
  confirmed: 'text-blue-700 bg-blue-50',
  preparing: 'text-orange-700 bg-orange-50',
  ready: 'text-green-700 bg-green-100',
  picked_up: 'text-purple-700 bg-purple-50',
  delivering: 'text-green-700 bg-green-50',
  delivered: 'text-gray-600 bg-gray-100',
  cancelled: 'text-red-700 bg-red-50',
};

const CAT_ICONS: Record<string, string> = {
  all: '🏪', restaurant: '🍽️', pharmacy: '💊',
  supermarket: '🛒', bakery: '🥐', drinks: '🥤',
};

const CAT_LABELS: Record<string, string> = {
  all: 'Tout', restaurant: 'Restaurants', pharmacy: 'Pharmacies',
  supermarket: 'Supermarchés', bakery: 'Boulangeries', drinks: 'Boissons',
};

// ─── small reusable pieces ─────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide ${STATUS_COLORS[status]}`}>
    {STATUS_LABELS[status]}
  </span>
);

const TypeBadge: React.FC<{ type: 'delivery' | 'shopping' }> = ({ type }) => (
  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
    type === 'shopping' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'
  }`}>
    {type === 'shopping' ? '🛒 Courses' : '🛍️ Livraison'}
  </span>
);

const CategoryBtn: React.FC<{ cat: string; active: boolean; onClick: () => void }> = ({ cat, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all ${
      active ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-100 hover:border-green-300'
    }`}
  >
    <span className="text-xl">{CAT_ICONS[cat]}</span>
    <span className="text-[10px] font-bold whitespace-nowrap">{CAT_LABELS[cat]}</span>
  </button>
);

const ShopCard: React.FC<{ shop: Shop; onClick: () => void }> = ({ shop, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
  >
    <div className={`h-28 bg-gradient-to-br ${shop.coverColor} flex items-center justify-center`}>
      <span className="text-5xl">{shop.emoji}</span>
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{shop.name}</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {shop.isOpen ? 'Ouvert' : 'Fermé'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3 line-clamp-1">{shop.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>⭐ {shop.rating}</span>
        <span>⏱️ {shop.deliveryTime}</span>
        <span className="font-semibold text-primary">Livraison selon quartier</span>
      </div>
    </div>
  </div>
);

const ProductCard: React.FC<{
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}> = ({ product, quantity, onAdd, onRemove }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-3xl">
      {product.emoji}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-gray-900 text-sm leading-tight">{product.name}</p>
      {product.popular && (
        <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
          ⭐ POPULAIRE
        </span>
      )}
      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{product.description}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="font-black text-primary text-sm">{fmt(product.price)}</p>
        <div className="flex items-center gap-2">
          {quantity > 0 && (
            <button onClick={onRemove} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
          {quantity > 0 && <span className="font-bold text-sm w-5 text-center">{quantity}</span>}
          <button onClick={onAdd} className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white hover:bg-green-700 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const BottomNav: React.FC<{ view: string; setView: (v: string) => void; cartCount: number }> = ({ view, setView, cartCount }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-40 max-w-lg mx-auto shadow-lg">
    {[
      { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Accueil' },
      { id: 'cart', icon: <ShoppingCart className="w-5 h-5" />, label: 'Panier', badge: cartCount },
      { id: 'history', icon: <History className="w-5 h-5" />, label: 'Commandes' },
      { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Profil' },
    ].map(nav => (
      <button
        key={nav.id}
        onClick={() => setView(nav.id)}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl relative transition-colors ${view === nav.id ? 'text-primary' : 'text-gray-400'}`}
      >
        {nav.icon}
        {nav.badge && nav.badge > 0 ? (
          <span className="absolute -top-1 right-1 bg-accent text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {nav.badge}
          </span>
        ) : null}
        <span className="text-[10px] font-bold">{nav.label}</span>
      </button>
    ))}
  </nav>
);

// ─── HomeView ────────────────────────────────────────────────────────────────

const HomeView: React.FC<{
  shops: Shop[];
  onShopSelect: (shop: Shop) => void;
  onGoShopping: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
}> = ({ shops, onShopSelect, onGoShopping, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }) => {
  const filtered = useMemo(() => {
    return shops.filter(s => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQ = !searchQuery || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [searchQuery, selectedCategory]);

  const featured = filtered.filter(s => s.featured);
  const others = filtered.filter(s => !s.featured);

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-green-700 px-5 pt-5 pb-14">
        <p className="text-green-200 text-xs font-semibold mb-1">📍 Abengourou, Côte d'Ivoire</p>
        <h1 className="text-white text-2xl font-black leading-tight mb-5">
          Que souhaitez-vous<br />recevoir aujourd'hui ?
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Chercher un restaurant, pharmacie..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm outline-none shadow-xl"
          />
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-6">
        {/* Two service cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Commander en ligne */}
          <div
            onClick={() => setSelectedCategory('all')}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-all active:scale-[0.97]"
          >
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">🛍️</span>
            </div>
            <p className="font-black text-gray-900 text-sm leading-tight">Commander en ligne</p>
            <p className="text-xs text-gray-400 mt-1 leading-tight">Choisissez parmi nos commerces partenaires</p>
          </div>

          {/* Faire les courses */}
          <div
            onClick={onGoShopping}
            className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-[0.97]"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">🛒</span>
            </div>
            <p className="font-black text-white text-sm leading-tight">Faire mes courses</p>
            <p className="text-xs text-white/80 mt-1 leading-tight">Notre livreur fait vos achats et vous livre</p>
          </div>
        </div>

        {/* How it works — shopping promo */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="font-black text-orange-800 text-sm mb-2">🛒 Comment fonctionne le service Courses ?</p>
          <div className="space-y-1.5">
            {[
              '1️⃣  Envoyez votre liste de courses',
              '2️⃣  Déposez le montant estimé + frais',
              '3️⃣  Le livreur fait vos achats au marché',
              '4️⃣  Livraison à domicile + rendu de monnaie',
            ].map(s => (
              <p key={s} className="text-xs text-orange-700 font-medium">{s}</p>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <p className="font-black text-gray-900 text-lg mb-3">Commerces partenaires</p>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar mb-4">
            {['all', 'restaurant', 'pharmacy', 'supermarket', 'bakery', 'drinks'].map(cat => (
              <CategoryBtn key={cat} cat={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div>
            <p className="font-black text-gray-900 text-lg mb-3">⭐ En vedette</p>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {featured.map(shop => (
                <div key={shop.id} className="flex-shrink-0 w-52 cursor-pointer" onClick={() => onShopSelect(shop)}>
                  <div className={`h-32 bg-gradient-to-br ${shop.coverColor} rounded-2xl flex items-center justify-center mb-2 hover:opacity-90 transition-opacity`}>
                    <span className="text-6xl">{shop.emoji}</span>
                  </div>
                  <p className="font-bold text-sm text-gray-900 truncate">{shop.name}</p>
                  <p className="text-xs text-gray-400">{shop.deliveryTime}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All */}
        <div>
          <p className="font-black text-gray-900 text-lg mb-3">Tous les commerces</p>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-bold">Aucun résultat</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {others.map(shop => <ShopCard key={shop.id} shop={shop} onClick={() => onShopSelect(shop)} />)}
            </div>
          )}
        </div>

        {/* Delivery fees info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="font-black text-gray-900 text-sm mb-3">🛵 Frais de livraison par quartier</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DELIVERY_FEES).map(([q, fee]) => (
              <div key={q} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-600 font-medium">{q}</span>
                <span className="text-xs font-black text-primary">{fmt(fee)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ShopView ────────────────────────────────────────────────────────────────

const ShopView: React.FC<{
  shop: Shop;
  products: Product[];
  cart: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onGoCart: () => void;
}> = ({ shop, products, cart, onAdd, onRemove, onBack, onGoCart }) => {
  const shopProducts = products.filter(p => p.shopId === shop.id);
  const categories = [...new Set(shopProducts.map(p => p.category))];
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const qty = (id: string) => cart.find(i => i.product.id === id)?.quantity ?? 0;

  return (
    <div className="pb-32">
      <div className={`bg-gradient-to-br ${shop.coverColor} relative pt-16 pb-6 px-5`}>
        <button onClick={onBack} className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm p-2 rounded-full">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-end gap-4">
          <span className="text-5xl">{shop.emoji}</span>
          <div className="text-white">
            <h1 className="font-black text-xl leading-tight">{shop.name}</h1>
            <p className="text-white/80 text-xs mt-0.5">{shop.description}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/70">
              <span>⭐ {shop.rating}</span>
              <span>⏱️ {shop.deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery fee notice */}
      <div className="mx-4 mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
        <p className="text-xs text-green-700 font-bold">
          🛵 Frais de livraison selon votre quartier — de {fmt(Math.min(...Object.values(DELIVERY_FEES)))} à {fmt(Math.max(...Object.values(DELIVERY_FEES)))}
        </p>
      </div>

      <div className="px-4 mt-4 space-y-6">
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="font-black text-gray-500 text-xs uppercase tracking-widest mb-3">{cat}</h3>
            <div className="space-y-2">
              {shopProducts.filter(p => p.category === cat).map(p => (
                <ProductCard key={p.id} product={p} quantity={qty(p.id)} onAdd={() => onAdd(p)} onRemove={() => onRemove(p.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {count > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto">
          <button onClick={onGoCart} className="w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-between px-6 shadow-2xl">
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">{count} article{count > 1 ? 's' : ''}</span>
            <span>Voir le panier</span>
            <span>{fmt(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── CartView ─────────────────────────────────────────────────────────────────

const CartView: React.FC<{
  cart: CartItem[];
  shop: Shop | null;
  onAdd: (p: Product) => void;
  onRemove: (id: string) => void;
  onPlaceOrder: (name: string, phone: string, address: string, neighborhood: string, payment: PaymentMethod, notes: string) => void;
  onBack: () => void;
}> = ({ cart, shop, onAdd, onRemove, onPlaceOrder, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0]);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const fee = DELIVERY_FEES[neighborhood] ?? 500;
  const total = subtotal + fee;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 pb-24">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="font-black text-xl text-gray-900 mb-2">Panier vide</h2>
        <p className="text-gray-400 text-sm mb-6">Ajoutez des articles pour passer une commande</p>
        <button onClick={onBack} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold">
          Parcourir les commerces
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="bg-primary px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-white/70 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-white font-black text-lg flex-1">Mon Panier</h1>
        {shop && <span className="text-green-200 text-xs">📍 {shop.name}</span>}
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50 shadow-sm border border-gray-100">
          {cart.map(item => (
            <div key={item.product.id} className="p-4 flex items-center gap-3">
              <span className="text-2xl">{item.product.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-400">{fmt(item.product.price)} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onRemove(item.product.id)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <Minus className="w-3 h-3 text-gray-600" />
                </button>
                <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                <button onClick={() => onAdd(item.product)} className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>
              <p className="font-black text-sm text-primary w-20 text-right">{fmt(item.product.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-primary" /> Vos informations
          </h3>
          <input
            type="text"
            placeholder="Nom et prénom *"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none focus:border-primary transition-colors"
          />
          <input
            type="tel"
            placeholder="Numéro de téléphone * (ex: 07 00 00 00 00)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" /> Adresse de livraison
          </h3>
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1 block">Quartier</label>
            <select
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none"
            >
              {NEIGHBORHOODS.map(n => (
                <option key={n} value={n}>{n} — {fmt(DELIVERY_FEES[n])}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Lieu de livraison — Rue, maison, point de repère *"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none focus:border-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Notes pour le livreur (optionnel)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none"
          />
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-primary" /> Mode de paiement
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'cash' as PaymentMethod, label: 'Espèces', emoji: '💵' },
              { id: 'orange_money' as PaymentMethod, label: 'Orange Money', emoji: '🟠' },
              { id: 'mtn_money' as PaymentMethod, label: 'MTN Money', emoji: '🟡' },
            ]).map(pm => (
              <button key={pm.id} onClick={() => setPayment(pm.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${payment === pm.id ? 'border-primary bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-xl mb-1">{pm.emoji}</p>
                <p className="text-[10px] font-bold leading-tight">{pm.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 space-y-2 shadow-sm border border-gray-100">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sous-total articles</span><span className="font-bold">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Livraison — {neighborhood}</span><span className="font-bold">{fmt(fee)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-primary text-base">
            <span>TOTAL</span><span>{fmt(total)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto">
        <button
          onClick={() => name.trim() && phone.trim() && address.trim() && onPlaceOrder(name.trim(), phone.trim(), address, neighborhood, payment, notes)}
          className={`w-full py-4 rounded-2xl font-black text-white transition-all ${name.trim() && phone.trim() && address.trim() ? 'bg-primary shadow-xl hover:bg-green-700' : 'bg-gray-200 text-gray-400'}`}
        >
          {name.trim() && phone.trim() && address.trim() ? `Commander · ${fmt(total)}` : 'Remplissez vos informations'}
        </button>
      </div>
    </div>
  );
};

// ─── ShoppingView (service Courses) ──────────────────────────────────────────

const ShoppingView: React.FC<{
  onBack: () => void;
  onSubmit: (params: {
    name: string;
    phone: string;
    items: ShoppingItem[];
    neighborhood: string;
    address: string;
    depositAmount: number;
    doShopping: boolean;
    payment: PaymentMethod;
    notes: string;
  }) => void;
}> = ({ onBack, onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: uid(), name: '', quantity: '' },
  ]);
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0]);
  const [address, setAddress] = useState('');
  const [depositStr, setDepositStr] = useState('');
  const [doShopping, setDoShopping] = useState(true);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  const deliveryFee = DELIVERY_FEES[neighborhood] ?? 500;
  const shoppingFee = doShopping ? SHOPPING_FEE : 0;
  const deposit = parseInt(depositStr.replace(/\s/g, '')) || 0;
  const total = deposit + deliveryFee + shoppingFee;

  const addItem = () => setItems(prev => [...prev, { id: uid(), name: '', quantity: '' }]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof ShoppingItem, val: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));

  const validItems = items.filter(i => i.name.trim());
  const canSubmit = validItems.length > 0 && name.trim() && phone.trim() && address.trim() && (!doShopping || deposit > 0);

  return (
    <div className="pb-32">
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 px-5 py-5">
        <button onClick={onBack} className="text-white/70 hover:text-white mb-3 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour</span>
        </button>
        <h1 className="text-white font-black text-2xl">🛒 Faire mes courses</h1>
        <p className="text-white/80 text-sm mt-1">Envoyez votre liste, nous faisons vos achats</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Shopping list */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2 text-sm">
            📝 Ma liste de courses
            <span className="text-[10px] text-gray-400 font-normal">({validItems.length} article{validItems.length > 1 ? 's' : ''})</span>
          </h3>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center">
                <span className="text-gray-300 text-xs font-bold w-4 flex-shrink-0">{idx + 1}.</span>
                <input
                  type="text"
                  placeholder="Article (ex: Riz parfumé)"
                  value={item.name}
                  onChange={e => updateItem(item.id, 'name', e.target.value)}
                  className="flex-1 p-2.5 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none min-w-0"
                />
                <input
                  type="text"
                  placeholder="Qté (ex: 2kg)"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                  className="w-24 p-2.5 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none flex-shrink-0"
                />
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addItem} className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Ajouter un article
          </button>
        </div>

        {/* Service type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-3 text-sm">🛵 Type de service</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setDoShopping(true)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${doShopping ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-sm text-gray-900">🛒 Courses + Livraison</p>
                  <p className="text-xs text-gray-500 mt-0.5">Notre livreur fait vos achats puis vous livre</p>
                </div>
                <span className="text-xs font-black text-orange-600 bg-orange-100 px-2 py-1 rounded-lg ml-2 flex-shrink-0">
                  +{fmt(SHOPPING_FEE)}
                </span>
              </div>
            </button>
            <button
              onClick={() => setDoShopping(false)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${!doShopping ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-sm text-gray-900">🚶 J'ai déjà fait mes achats</p>
                  <p className="text-xs text-gray-500 mt-0.5">Le livreur collecte vos achats et vous livre</p>
                </div>
                <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-lg ml-2 flex-shrink-0">
                  Sans supplément
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-orange-500" /> Vos informations
          </h3>
          <input
            type="text"
            placeholder="Nom et prénom *"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none focus:border-orange-400 transition-colors"
          />
          <input
            type="tel"
            placeholder="Numéro de téléphone * (ex: 07 00 00 00 00)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" /> Adresse de livraison
          </h3>
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1 block">Quartier</label>
            <select
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none"
            >
              {NEIGHBORHOODS.map(n => (
                <option key={n} value={n}>{n} — {fmt(DELIVERY_FEES[n])}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Lieu de livraison — Rue, maison, point de repère *"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none focus:border-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Notes (lieu d'achat préféré, etc.)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none"
          />
        </div>

        {/* Deposit */}
        {doShopping && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 mb-1 flex items-center gap-2 text-sm">
              💰 Dépôt pour les achats
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Montant estimé de vos courses. Le livreur vous rend la monnaie si les achats coûtent moins.
            </p>
            <div className="relative">
              <input
                type="number"
                placeholder="Ex: 10000"
                value={depositStr}
                onChange={e => setDepositStr(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">FCFA</span>
            </div>
            {deposit > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-bold">
                  ℹ️ Si les achats coûtent moins de {fmt(deposit)}, le livreur vous rend la différence à la livraison.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-primary" /> Mode de paiement des frais
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'cash' as PaymentMethod, label: 'Espèces', emoji: '💵' },
              { id: 'orange_money' as PaymentMethod, label: 'Orange Money', emoji: '🟠' },
              { id: 'mtn_money' as PaymentMethod, label: 'MTN Money', emoji: '🟡' },
            ]).map(pm => (
              <button key={pm.id} onClick={() => setPayment(pm.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${payment === pm.id ? 'border-primary bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-xl mb-1">{pm.emoji}</p>
                <p className="text-[10px] font-bold leading-tight">{pm.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 shadow-sm">
          <p className="font-black text-white text-sm mb-4">📋 Récapitulatif total à déposer</p>
          <div className="space-y-2">
            {doShopping && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Dépôt pour les achats</span>
                <span className="font-bold text-white">{deposit > 0 ? fmt(deposit) : '—'}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Frais de livraison ({neighborhood})</span>
              <span className="font-bold text-white">{fmt(deliveryFee)}</span>
            </div>
            {doShopping && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Frais de courses</span>
                <span className="font-bold text-orange-300">{fmt(SHOPPING_FEE)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="font-black text-white">TOTAL À DÉPOSER</span>
              <span className="font-black text-green-400 text-lg">{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Warning if no deposit */}
        {doShopping && !canSubmit && validItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 font-medium">
              {!name.trim() || !phone.trim() ? "Renseignez votre nom et téléphone." : !address.trim() ? "Ajoutez votre adresse de livraison." : "Entrez le montant du dépôt pour vos achats."}
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto">
        <button
          onClick={() => canSubmit && onSubmit({ name: name.trim(), phone: phone.trim(), items: validItems, neighborhood, address, depositAmount: deposit, doShopping, payment, notes })}
          className={`w-full py-4 rounded-2xl font-black text-white transition-all ${canSubmit ? 'bg-orange-500 shadow-xl hover:bg-orange-600' : 'bg-gray-200 text-gray-400'}`}
        >
          {canSubmit ? `Valider ma liste · ${fmt(total)}` : 'Complétez le formulaire'}
        </button>
      </div>
    </div>
  );
};

// ─── ConfirmView ─────────────────────────────────────────────────────────────

const ConfirmView: React.FC<{
  order: Order | null;
  onTrack: () => void;
  onHome: () => void;
}> = ({ order, onTrack, onHome }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pb-24">
    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl">
      <CheckCircle className="w-12 h-12 text-primary" />
    </div>
    <h1 className="font-black text-2xl text-gray-900 mb-1">
      {order?.orderType === 'shopping' ? 'Liste envoyée !' : 'Commande confirmée !'}
    </h1>
    <p className="text-gray-400 text-sm mb-4">
      {order?.orderType === 'shopping'
        ? 'Votre livreur va faire vos courses et vous livrer'
        : 'Votre commande a bien été reçue'}
    </p>
    {order && (
      <>
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-4">
          <p className="text-xs text-gray-500 mb-1">Numéro de commande</p>
          <p className="font-black text-primary text-2xl">{order.id}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 w-full text-left space-y-2 mb-6 shadow-sm border border-gray-100 text-sm">
          {order.orderType === 'shopping' && order.shoppingList && (
            <div>
              <p className="text-gray-500 mb-2 font-bold">Liste de courses :</p>
              {order.shoppingList.map(i => (
                <p key={i.id} className="text-gray-700">• {i.name} — {i.quantity}</p>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2" />
            </div>
          )}
          <div className="flex justify-between"><span className="text-gray-500">Quartier</span><span className="font-bold">{order.deliveryNeighborhood}</span></div>
          {order.depositAmount && <div className="flex justify-between"><span className="text-gray-500">Dépôt achats</span><span className="font-bold">{fmt(order.depositAmount)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Frais livraison</span><span className="font-bold">{fmt(order.deliveryFee)}</span></div>
          {order.shoppingFee && <div className="flex justify-between"><span className="text-gray-500">Frais de courses</span><span className="font-bold text-orange-600">{fmt(order.shoppingFee)}</span></div>}
          <div className="flex justify-between font-black text-primary border-t border-gray-100 pt-2">
            <span>TOTAL DÉPOSÉ</span><span>{fmt(order.total)}</span>
          </div>
          <div className="flex justify-between text-green-600"><span className="text-gray-500">Délai estimé</span><span className="font-bold">~{order.estimatedDelivery}</span></div>
        </div>
      </>
    )}
    {order && (
      <button
        onClick={() => generateCustomerReceipt(order)}
        className="w-full mb-3 bg-green-50 border border-green-200 text-green-700 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
      >
        📄 Télécharger le reçu PDF
      </button>
    )}
    <div className="flex gap-3 w-full">
      <button onClick={onTrack} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg">
        Suivre ma commande
      </button>
      <button onClick={onHome} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold">
        Accueil
      </button>
    </div>
  </div>
);

// ─── TrackingView ────────────────────────────────────────────────────────────

const TrackingView: React.FC<{ order: Order | null; onBack: () => void }> = ({ order, onBack }) => {
  if (!order) return null;
  const isShop = order.orderType === 'shopping';

  const steps: { status: OrderStatus; label: string; emoji: string }[] = isShop
    ? [
        { status: 'confirmed', label: 'Liste reçue et validée', emoji: '✅' },
        { status: 'preparing', label: 'Livreur en route pour les courses', emoji: '🛵' },
        { status: 'picked_up', label: 'Achats en cours au marché', emoji: '🛒' },
        { status: 'delivering', label: 'En livraison chez vous', emoji: '📍' },
        { status: 'delivered', label: 'Livré + monnaie rendue !', emoji: '🎉' },
      ]
    : [
        { status: 'confirmed', label: 'Commande confirmée', emoji: '✅' },
        { status: 'preparing', label: 'En préparation', emoji: '👨‍🍳' },
        { status: 'picked_up', label: 'Livreur en route', emoji: '🛵' },
        { status: 'delivering', label: 'En livraison', emoji: '📍' },
        { status: 'delivered', label: 'Livré !', emoji: '🎉' },
      ];

  const ORDER = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivering', 'delivered'];
  const cur = ORDER.indexOf(order.status);

  return (
    <div className="pb-24">
      <div className="bg-primary px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-white/70 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-white font-black text-lg">Suivi de commande</h1>
        <div className="ml-auto"><TypeBadge type={order.orderType} /></div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm border border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Commande</p>
            <p className="font-black text-primary text-xl">{order.id}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {order.deliveryPersonName && (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">🛵</div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Votre livreur</p>
              <p className="font-black text-gray-900">{order.deliveryPersonName}</p>
            </div>
            <button className="bg-primary text-white px-3 py-2 rounded-xl flex items-center gap-1 text-sm font-bold">
              <Phone className="w-3.5 h-3.5" /> Appeler
            </button>
          </div>
        )}

        {/* Shopping list summary */}
        {isShop && order.shoppingList && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <p className="font-black text-orange-800 text-sm mb-2">🛒 Liste de courses</p>
            {order.shoppingList.map(i => (
              <p key={i.id} className="text-sm text-orange-700 font-medium">• {i.name} — {i.quantity}</p>
            ))}
            {order.depositAmount && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-xs text-orange-600 font-bold">
                  💰 Dépôt pour les achats : {fmt(order.depositAmount)} — Le livreur vous rend la monnaie
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-4">Progression</h3>
          <div className="space-y-5">
            {steps.map(step => {
              const idx = ORDER.indexOf(step.status);
              const done = idx <= cur;
              const current = idx === cur;
              return (
                <div key={step.status} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {done ? step.emoji : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className={`font-bold text-sm ${done ? (current ? 'text-primary' : 'text-gray-900') : 'text-gray-300'}`}>
                      {step.label}
                    </p>
                    {current && order.status !== 'delivered' && <p className="text-xs text-primary mt-0.5">En cours...</p>}
                  </div>
                  {current && order.status !== 'delivered' && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping mt-3" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
          <h3 className="font-black text-gray-900 mb-3">Récapitulatif financier</h3>
          {!isShop && order.items.map(item => (
            <div key={item.product.id} className="flex justify-between text-sm text-gray-600">
              <span>{item.product.emoji} {item.product.name} ×{item.quantity}</span>
              <span className="font-bold">{fmt(item.product.price * item.quantity)}</span>
            </div>
          ))}
          {isShop && order.depositAmount && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Dépôt pour achats</span>
              <span className="font-bold">{fmt(order.depositAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Frais de livraison</span>
            <span className="font-bold">{fmt(order.deliveryFee)}</span>
          </div>
          {order.shoppingFee && (
            <div className="flex justify-between text-sm text-orange-600">
              <span>Frais de courses</span>
              <span className="font-bold">{fmt(order.shoppingFee)}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-primary">
            <span>Total déposé</span><span>{fmt(order.total)}</span>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl h-40 flex flex-col items-center justify-center text-gray-400">
          <span className="text-4xl mb-2">🗺️</span>
          <p className="text-sm font-bold text-gray-600">Carte — Abengourou</p>
          <p className="text-xs mt-1">Destination : {order.deliveryNeighborhood}</p>
        </div>
      </div>
    </div>
  );
};

// ─── HistoryView ─────────────────────────────────────────────────────────────

const HistoryView: React.FC<{
  orders: Order[];
  onTrack: (o: Order) => void;
}> = ({ orders, onTrack }) => {
  const mine = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="pb-24">
      <div className="bg-primary px-5 py-5">
        <h1 className="text-white font-black text-xl">Mes Commandes</h1>
        <p className="text-green-200 text-xs mt-0.5">{mine.length} commande{mine.length > 1 ? 's' : ''}</p>
      </div>
      <div className="px-4 mt-4 space-y-3">
        {mine.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-bold">Aucune commande</p>
          </div>
        ) : mine.map(order => (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <TypeBadge type={order.orderType} />
                </div>
                <p className="font-black text-sm text-gray-900">
                  {order.orderType === 'shopping' ? '🛒 ' + order.shopName : order.shopName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{fmtTime(order.createdAt)} · {order.deliveryNeighborhood}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-1">
              {order.orderType === 'shopping' && order.shoppingList
                ? order.shoppingList.map(i => `${i.name} (${i.quantity})`).join(', ')
                : order.items.map(i => `${i.product.name} ×${i.quantity}`).join(', ')}
            </p>
            <div className="flex justify-between items-center gap-2">
              <p className="font-black text-primary">{fmt(order.total)}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => generateCustomerReceipt(order)}
                  className="text-green-700 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-green-100 transition-colors"
                >
                  📄 Reçu
                </button>
                {['delivering', 'picked_up', 'preparing', 'confirmed'].includes(order.status) && (
                  <button onClick={() => onTrack(order)} className="text-primary text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-green-100 transition-colors">
                    Suivre <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ProfileView ─────────────────────────────────────────────────────────────

const ProfileView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <div className="pb-24">
    <div className="bg-gradient-to-br from-primary to-green-700 px-5 py-8 flex flex-col items-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-3">👩🏿</div>
      <h2 className="text-white font-black text-xl">Adjoua Koffi</h2>
      <p className="text-green-200 text-sm">+225 07 77 88 99</p>
    </div>
    <div className="px-4 mt-4 space-y-3">
      {[
        { emoji: '📍', label: 'Adresse favorite', value: 'Kennedy, Rue des Fleurs' },
        { emoji: '💳', label: 'Paiement par défaut', value: 'Orange Money' },
        { emoji: '🔔', label: 'Notifications', value: 'Activées' },
        { emoji: '🌍', label: 'Langue', value: 'Français' },
      ].map(item => (
        <div key={item.label} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
          <span className="text-2xl">{item.emoji}</span>
          <div className="flex-1">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="font-bold text-sm text-gray-900">{item.value}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      ))}
      <button
        onClick={onLogout}
        className="w-full bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 font-bold text-sm hover:bg-red-100 transition-colors"
      >
        🚪 Se déconnecter
      </button>
    </div>
  </div>
);


// ─── main app ──────────────────────────────────────────────────────────────────

const isSupabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

const App: React.FC = () => {
  // ── Auth ──────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(!isSupabaseConfigured);
  const [role, setRole] = useState<UserRole>('customer');
  const [activeSupplierShopId, setActiveSupplierShopId] = useState<string>('s1');

  // ── App navigation state ──────────────────────────────────
  const [view, setView] = useState<string>('home');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ── Supabase data (avec fallback mock auto) ───────────────
  const {
    shops, products, deliveryPersons: dps, supplierAccounts,
    toggleProduct, updateSupplierStatus, addSupplier,
  } = useSupabaseData();

  const { orders, updateStatus } = useRealtimeOrders();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // ── Auth handlers ─────────────────────────────────────────

  const handleLogin = (loginRole: UserRole, supplierId?: string) => {
    setRole(loginRole);
    setIsAuthenticated(true);
    if (loginRole === 'supplier' && supplierId) {
      // Trouver le shopId depuis l'ID ou le code d'accès
      const supplier = supplierAccounts.find(s => s.id === supplierId || s.accessCode === supplierId);
      if (supplier) setActiveSupplierShopId(supplier.shopId);
    }
    setView(loginRole === 'customer' ? 'home' : loginRole);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setIsAuthenticated(false);
    setRole('customer');
    setView('home');
    setCart([]);
  };

  // ── Cart helpers ──────────────────────────────────────────

  const addToCart = (product: Product) =>
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });

  const removeFromCart = (productId: string) =>
    setCart(prev => {
      const ex = prev.find(i => i.product.id === productId);
      if (!ex) return prev;
      if (ex.quantity === 1) return prev.filter(i => i.product.id !== productId);
      return prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
    });

  // ── Place order (delivery) ────────────────────────────────

  const placeOrder = async (name: string, phone: string, address: string, neighborhood: string, payment: PaymentMethod, notes: string) => {
    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const deliveryFee = DELIVERY_FEES[neighborhood] ?? 500;
    const id = genId();

    const order: Order = {
      id, orderType: 'delivery',
      customerName: name, customerPhone: phone,
      shopId: selectedShop?.id ?? '', shopName: selectedShop?.name ?? '',
      items: cart, status: 'confirmed',
      paymentMethod: payment, deliveryAddress: address, deliveryNeighborhood: neighborhood,
      subtotal, deliveryFee, total: subtotal + deliveryFee,
      createdAt: new Date().toISOString(), estimatedDelivery: selectedShop?.deliveryTime ?? '30 min',
      notes,
    };

    if (isSupabaseConfigured) {
      try {
        await insertOrder(
          {
            id, order_type: 'delivery', customer_name: order.customerName,
            customer_phone: order.customerPhone, shop_id: order.shopId, shop_name: order.shopName,
            status: 'confirmed', payment_method: payment, delivery_address: address,
            delivery_neighborhood: neighborhood, delivery_person_id: null, delivery_person_name: null,
            deposit_amount: null, subtotal, delivery_fee: deliveryFee, shopping_fee: null,
            total: subtotal + deliveryFee, estimated_delivery: order.estimatedDelivery,
            notes: notes || null, customer_user_id: null,
          },
          cart.map(i => ({
            product_id: i.product.id, product_name: i.product.name,
            product_price: i.product.price, product_emoji: i.product.emoji, quantity: i.quantity,
          })),
          [],
        );
      } catch (e) {
        console.error('[placeOrder] Erreur Supabase:', e);
      }
    }

    setActiveOrder(order);
    setCart([]);
    setView('confirm');
  };

  // ── Place order (courses) ─────────────────────────────────

  const placeShoppingOrder = async (params: {
    name: string;
    phone: string;
    items: ShoppingItem[];
    neighborhood: string;
    address: string;
    depositAmount: number;
    doShopping: boolean;
    payment: PaymentMethod;
    notes: string;
  }) => {
    const deliveryFee = DELIVERY_FEES[params.neighborhood] ?? 500;
    const shoppingFee = params.doShopping ? SHOPPING_FEE : 0;
    const id = genId();

    const order: Order = {
      id, orderType: 'shopping',
      customerName: params.name, customerPhone: params.phone,
      shopId: '', shopName: 'Courses au marché', items: [],
      shoppingList: params.items,
      depositAmount: params.doShopping ? params.depositAmount : undefined,
      status: 'confirmed', paymentMethod: params.payment,
      deliveryAddress: params.address, deliveryNeighborhood: params.neighborhood,
      subtotal: 0, deliveryFee,
      shoppingFee: params.doShopping ? shoppingFee : undefined,
      total: (params.doShopping ? params.depositAmount : 0) + deliveryFee + shoppingFee,
      createdAt: new Date().toISOString(), estimatedDelivery: '40-60 min',
      notes: params.notes,
    };

    if (isSupabaseConfigured) {
      try {
        await insertOrder(
          {
            id, order_type: 'shopping', customer_name: order.customerName,
            customer_phone: order.customerPhone, shop_id: '', shop_name: 'Courses au marché',
            status: 'confirmed', payment_method: params.payment, delivery_address: params.address,
            delivery_neighborhood: params.neighborhood, delivery_person_id: null, delivery_person_name: null,
            deposit_amount: params.doShopping ? params.depositAmount : null,
            subtotal: 0, delivery_fee: deliveryFee,
            shopping_fee: params.doShopping ? shoppingFee : null,
            total: order.total, estimated_delivery: '40-60 min',
            notes: params.notes || null, customer_user_id: null,
          },
          [],
          params.items.map(i => ({
            id: i.id, name: i.name, quantity: i.quantity,
            estimated_price: i.estimatedPrice ?? null,
          })),
        );
      } catch (e) {
        console.error('[placeShoppingOrder] Erreur Supabase:', e);
      }
    }

    setActiveOrder(order);
    setView('confirm');
  };

  // ── Status update with tracking sync ─────────────────────

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateStatus(orderId, status);
    setTrackingOrder(prev => prev?.id === orderId ? { ...prev, status } : prev);
  };

  // ── Demo role switcher (mode démo seulement) ──────────────

  const switchRole = (r: UserRole) => {
    setRole(r);
    if (r === 'customer') setView('home');
    else if (r === 'delivery') setView('delivery');
    else if (r === 'admin') setView('admin');
    else if (r === 'supplier') setView('supplier');
  };

  const activeSupplier = supplierAccounts.find(s => s.shopId === activeSupplierShopId);
  const activeSupplierShop = shops.find(s => s.id === activeSupplierShopId) ?? null;

  // ── Login screen ──────────────────────────────────────────

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ── App UI ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative font-sans">
      {/* Demo role switcher (mode sans Supabase seulement) */}
      {!isSupabaseConfigured && (
        <div className="bg-gray-900 px-2 py-2 flex gap-1 justify-center sticky top-0 z-50 overflow-x-auto">
          {([
            ['customer', '👤 Client'],
            ['delivery', '🛵 Livreur'],
            ['supplier', '🏪 Fournisseur'],
            ['admin', '🏢 Admin'],
          ] as [UserRole, string][]).map(([r, label]) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Supplier shop selector */}
      {role === 'supplier' && (
        <div className={`bg-gray-800 px-3 py-1.5 flex gap-2 overflow-x-auto ${!isSupabaseConfigured ? '' : 'sticky top-0 z-50'}`}>
          {supplierAccounts.filter(s => s.status === 'active').map(s => (
            <button
              key={s.shopId}
              onClick={() => setActiveSupplierShopId(s.shopId)}
              className={`flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full transition-all ${
                activeSupplierShopId === s.shopId ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s.shopName}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <header className={`text-white px-4 py-3 flex items-center justify-between shadow-lg sticky z-40 ${
        role === 'supplier' ? 'top-[4.75rem]' : (isSupabaseConfigured ? 'top-0' : 'top-10')
      } ${
        role === 'delivery' ? 'bg-blue-800' :
        role === 'supplier' ? 'bg-emerald-700' :
        role === 'admin' ? 'bg-gray-800' :
        'bg-primary'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {role === 'delivery' ? '🛵' : role === 'supplier' ? '🏪' : role === 'admin' ? '🏢' : '🛵'}
          </span>
          <div>
            <h1 className="font-black text-sm leading-none">Abengourou Express</h1>
            <p className="text-[10px] text-white/60 font-medium">
              {role === 'delivery' ? 'Interface Livreur' :
               role === 'supplier' ? (activeSupplierShop?.name ?? 'Fournisseur') :
               role === 'admin' ? 'Administration' :
               'Livraison & Courses rapides'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {role === 'customer' && (
            <button onClick={() => setView('cart')} className="relative p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-xs font-bold"
            title="Déconnexion"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Views */}
      <main>
        {role === 'customer' && (
          <>
            {view === 'home' && (
              <HomeView
                shops={shops}
                onShopSelect={shop => { setSelectedShop(shop); setCart([]); setView('shop'); }}
                onGoShopping={() => setView('shopping')}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}
            {view === 'shopping' && (
              <ShoppingView
                onBack={() => setView('home')}
                onSubmit={placeShoppingOrder}
              />
            )}
            {view === 'shop' && selectedShop && (
              <ShopView
                shop={selectedShop}
                products={products}
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onBack={() => setView('home')}
                onGoCart={() => setView('cart')}
              />
            )}
            {view === 'cart' && (
              <CartView
                cart={cart}
                shop={selectedShop}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onPlaceOrder={placeOrder}
                onBack={() => setView(selectedShop ? 'shop' : 'home')}
              />
            )}
            {view === 'confirm' && (
              <ConfirmView
                order={activeOrder}
                onTrack={() => { setTrackingOrder(activeOrder); setView('tracking'); }}
                onHome={() => setView('home')}
              />
            )}
            {view === 'tracking' && (
              <TrackingView
                order={trackingOrder}
                onBack={() => setView('history')}
              />
            )}
            {view === 'history' && (
              <HistoryView
                orders={orders}
                onTrack={order => { setTrackingOrder(order); setView('tracking'); }}
              />
            )}
            {view === 'profile' && <ProfileView onLogout={handleLogout} />}

            {!['shop', 'cart', 'confirm', 'tracking', 'shopping'].includes(view) && (
              <BottomNav view={view} setView={setView} cartCount={cartCount} />
            )}
          </>
        )}

        {role === 'delivery' && (
          <DeliveryView orders={orders} dps={dps} onUpdate={handleUpdateStatus} />
        )}

        {role === 'supplier' && activeSupplier && activeSupplierShop && (
          <SupplierView
            supplier={activeSupplier}
            shop={activeSupplierShop}
            orders={orders}
            products={products}
            onUpdateStatus={handleUpdateStatus}
            onToggleProduct={toggleProduct}
          />
        )}

        {role === 'admin' && (
          <AdminView
            orders={orders}
            dps={dps}
            supplierAccounts={supplierAccounts}
            onUpdateSupplierStatus={updateSupplierStatus}
            onAddSupplier={addSupplier}
          />
        )}
      </main>
    </div>
  );
};

export default App;
