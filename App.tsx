
import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, MapPin, Star, Clock, ChevronRight, Plus, Minus,
  CheckCircle, Home, History, User, Search, Phone, CreditCard,
  ArrowLeft, BarChart3, Users, Bell, Package, Truck,
  Bike, Zap,
} from 'lucide-react';
import { Shop, Product, CartItem, Order, DeliveryPerson, UserRole, OrderStatus, PaymentMethod } from './types';
import { shops, products, deliveryPersons as initialDrivers, mockOrders } from './data/mockData';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const genId = () => `ABG-${Date.now().toString().slice(-6)}`;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  picked_up: 'Récupérée',
  delivering: 'En livraison',
  delivered: 'Livrée ✓',
  cancelled: 'Annulée',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-yellow-700 bg-yellow-50',
  confirmed: 'text-blue-700 bg-blue-50',
  preparing: 'text-orange-700 bg-orange-50',
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

const NEIGHBORHOODS = [
  'Centre-ville', 'Kennedy', 'Stade Municipal', 'Marché Central',
  'Résidentiel', 'Morafé', 'Lycée', 'Ancien Marché',
];

// ─── small reusable pieces ─────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide ${STATUS_COLORS[status]}`}>
    {STATUS_LABELS[status]}
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
        <span>⭐ {shop.rating} <span className="text-gray-300">({shop.reviewCount})</span></span>
        <span>⏱️ {shop.deliveryTime}</span>
        <span className="font-semibold text-primary">{fmt(shop.deliveryFee)}</span>
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
            <button
              onClick={onRemove}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
          {quantity > 0 && <span className="font-bold text-sm w-5 text-center">{quantity}</span>}
          <button
            onClick={onAdd}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white hover:bg-green-700 transition-colors"
          >
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

// ─── views ─────────────────────────────────────────────────────────────────────

const HomeView: React.FC<{
  onShopSelect: (shop: Shop) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
}> = ({ onShopSelect, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }) => {
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
      <div className="bg-gradient-to-br from-primary to-green-700 px-5 pt-5 pb-12">
        <p className="text-green-200 text-xs font-semibold mb-1">📍 Abengourou, Côte d'Ivoire</p>
        <h1 className="text-white text-2xl font-black leading-tight mb-5">
          Que voulez-vous<br />recevoir aujourd'hui ?
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

      <div className="px-4 -mt-4 space-y-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {['all', 'restaurant', 'pharmacy', 'supermarket', 'bakery', 'drinks'].map(cat => (
            <CategoryBtn key={cat} cat={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-gray-900 text-lg">⭐ En vedette</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {featured.map(shop => (
                <div
                  key={shop.id}
                  className="flex-shrink-0 w-56 cursor-pointer"
                  onClick={() => onShopSelect(shop)}
                >
                  <div className={`h-32 bg-gradient-to-br ${shop.coverColor} rounded-2xl flex items-center justify-center mb-2 hover:opacity-90 transition-opacity`}>
                    <span className="text-6xl">{shop.emoji}</span>
                  </div>
                  <p className="font-bold text-sm text-gray-900 truncate">{shop.name}</p>
                  <p className="text-xs text-gray-400">{shop.deliveryTime} · {fmt(shop.deliveryFee)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All */}
        <div>
          <h2 className="font-black text-gray-900 text-lg mb-3">Tous les commerces</h2>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-bold">Aucun résultat</p>
              <p className="text-sm mt-1">Essayez un autre mot-clé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {others.map(shop => <ShopCard key={shop.id} shop={shop} onClick={() => onShopSelect(shop)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ShopView: React.FC<{
  shop: Shop;
  cart: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onGoCart: () => void;
}> = ({ shop, cart, onAdd, onRemove, onBack, onGoCart }) => {
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
              <span>🛵 {fmt(shop.deliveryFee)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-6">
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="font-black text-gray-500 text-xs uppercase tracking-widest mb-3">{cat}</h3>
            <div className="space-y-2">
              {shopProducts
                .filter(p => p.category === cat)
                .map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    quantity={qty(p.id)}
                    onAdd={() => onAdd(p)}
                    onRemove={() => onRemove(p.id)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {count > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto">
          <button
            onClick={onGoCart}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-between px-6 shadow-2xl"
          >
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">{count} article{count > 1 ? 's' : ''}</span>
            <span>Voir le panier</span>
            <span>{fmt(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const CartView: React.FC<{
  cart: CartItem[];
  shop: Shop | null;
  onAdd: (p: Product) => void;
  onRemove: (id: string) => void;
  onPlaceOrder: (address: string, neighborhood: string, payment: PaymentMethod, notes: string) => void;
  onBack: () => void;
}> = ({ cart, shop, onAdd, onRemove, onPlaceOrder, onBack }) => {
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0]);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const fee = shop?.deliveryFee ?? 500;
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
        <button onClick={onBack} className="text-white/70 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-black text-lg flex-1">Mon Panier</h1>
        {shop && <span className="text-green-200 text-xs">📍 {shop.name}</span>}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Items */}
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

        {/* Address */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" /> Adresse de livraison
          </h3>
          <select
            value={neighborhood}
            onChange={e => setNeighborhood(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none"
          >
            {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
          </select>
          <input
            type="text"
            placeholder="Rue, maison, point de repère..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100 outline-none"
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
              <button
                key={pm.id}
                onClick={() => setPayment(pm.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  payment === pm.id ? 'border-primary bg-green-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <p className="text-xl mb-1">{pm.emoji}</p>
                <p className="text-[10px] font-bold leading-tight">{pm.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 space-y-2 shadow-sm border border-gray-100">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sous-total</span><span className="font-bold">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Frais de livraison</span><span className="font-bold">{fmt(fee)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-primary text-base">
            <span>TOTAL</span><span>{fmt(total)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto">
        <button
          onClick={() => address.trim() && onPlaceOrder(address, neighborhood, payment, notes)}
          className={`w-full py-4 rounded-2xl font-black text-white transition-all ${
            address.trim() ? 'bg-primary shadow-xl hover:bg-green-700' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {address.trim() ? `Commander · ${fmt(total)}` : 'Ajoutez une adresse de livraison'}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ConfirmView: React.FC<{
  order: Order | null;
  onTrack: () => void;
  onHome: () => void;
}> = ({ order, onTrack, onHome }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pb-24">
    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl">
      <CheckCircle className="w-12 h-12 text-primary" />
    </div>
    <h1 className="font-black text-2xl text-gray-900 mb-1">Commande confirmée !</h1>
    <p className="text-gray-400 text-sm mb-4">Votre commande a bien été reçue</p>
    {order && (
      <>
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-4">
          <p className="text-xs text-gray-500 mb-1">Numéro de commande</p>
          <p className="font-black text-primary text-2xl">{order.id}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 w-full text-left space-y-2 mb-6 shadow-sm border border-gray-100 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Commerce</span><span className="font-bold">{order.shopName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span className="font-bold">{order.deliveryNeighborhood}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Paiement</span><span className="font-bold capitalize">{order.paymentMethod.replace('_', ' ')}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-black text-primary">{fmt(order.total)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Délai estimé</span><span className="font-bold text-green-600">~{order.estimatedDelivery}</span></div>
        </div>
      </>
    )}
    <div className="flex gap-3 w-full">
      <button onClick={onTrack} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg">
        Suivre la commande
      </button>
      <button onClick={onHome} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold">
        Accueil
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const TrackingView: React.FC<{
  order: Order | null;
  onBack: () => void;
}> = ({ order, onBack }) => {
  if (!order) return null;

  const steps: { status: OrderStatus; label: string; emoji: string }[] = [
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

        {/* Progress */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-4">Progression de la livraison</h3>
          <div className="space-y-5">
            {steps.map((step, i) => {
              const idx = ORDER.indexOf(step.status);
              const done = idx <= cur;
              const current = idx === cur;
              return (
                <div key={step.status} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 transition-all ${done ? 'bg-green-100 shadow-sm' : 'bg-gray-100'}`}>
                    {done ? step.emoji : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className={`font-bold text-sm ${done ? (current ? 'text-primary' : 'text-gray-900') : 'text-gray-300'}`}>
                      {step.label}
                    </p>
                    {current && order.status !== 'delivered' && (
                      <p className="text-xs text-primary mt-0.5">En cours...</p>
                    )}
                  </div>
                  {current && order.status !== 'delivered' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping mt-3" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
          <h3 className="font-black text-gray-900 mb-3">Articles commandés</h3>
          {order.items.map(item => (
            <div key={item.product.id} className="flex justify-between text-sm text-gray-600">
              <span>{item.product.emoji} {item.product.name} ×{item.quantity}</span>
              <span className="font-bold">{fmt(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-primary">
            <span>Total payé</span><span>{fmt(order.total)}</span>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl h-44 flex flex-col items-center justify-center text-gray-400 shadow-sm">
          <span className="text-5xl mb-2">🗺️</span>
          <p className="font-bold text-sm text-gray-600">Carte — Abengourou</p>
          <p className="text-xs text-gray-400 mt-1">Destination : {order.deliveryNeighborhood}</p>
          <p className="text-xs text-green-600 font-bold mt-2">🛵 Livraison en cours</p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const HistoryView: React.FC<{
  orders: Order[];
  onTrack: (o: Order) => void;
}> = ({ orders, onTrack }) => {
  const mine = [...orders]
    .filter(o => o.customerName === 'Adjoua Koffi')
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
                <p className="font-black text-sm text-gray-900">{order.shopName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{fmtTime(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-1">
              {order.items.map(i => `${i.product.name} ×${i.quantity}`).join(', ')}
            </p>
            <div className="flex justify-between items-center">
              <p className="font-black text-primary">{fmt(order.total)}</p>
              {['delivering', 'picked_up', 'preparing', 'confirmed'].includes(order.status) && (
                <button
                  onClick={() => onTrack(order)}
                  className="text-primary text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-green-100 transition-colors"
                >
                  Suivre <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ProfileView: React.FC = () => (
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
      <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
        <p className="text-xs text-gray-400">Version de l'application</p>
        <p className="font-black text-primary">Abengourou Express v1.0</p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const DeliveryView: React.FC<{
  orders: Order[];
  dps: DeliveryPerson[];
  onUpdate: (id: string, status: OrderStatus) => void;
}> = ({ orders, dps, onUpdate }) => {
  const me = dps[0];
  const available = orders.filter(o => ['confirmed', 'preparing'].includes(o.status) && !o.deliveryPersonId);
  const active = orders.filter(o => ['picked_up', 'delivering'].includes(o.status));

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-5 py-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Interface Livreur</p>
            <h1 className="text-white font-black text-2xl">Bonjour, {me.name.split(' ')[0]} 👋</h1>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${me.isAvailable ? 'bg-green-400/30 text-green-200' : 'bg-red-400/30 text-red-200'}`}>
              {me.isAvailable ? '🟢 Disponible' : '🔴 Occupé'}
            </span>
            <p className="text-blue-300 text-xs mt-1">{me.vehicle === 'moto' ? '🏍️ Moto' : me.vehicle === 'velo' ? '🚲 Vélo' : '🚗 Voiture'}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Livraisons', value: me.totalDeliveries, emoji: '📦' },
            { label: 'Note', value: `${me.rating} ⭐`, emoji: '' },
            { label: 'En attente', value: available.length, emoji: '🔔' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-xl mb-1">{stat.emoji}</p>
              <p className="font-black text-white text-lg">{stat.value}</p>
              <p className="text-[10px] text-blue-200 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {active.length > 0 && (
          <div>
            <h2 className="font-black text-gray-900 mb-3">🚀 En cours</h2>
            {active.map(order => (
              <div key={order.id} className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 space-y-3 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-gray-900">{order.shopName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {order.deliveryNeighborhood} · {order.customerName}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-600 bg-white/70 rounded-lg px-3 py-2">📫 {order.deliveryAddress}</p>
                <div className="flex gap-2">
                  {order.status === 'picked_up' && (
                    <button onClick={() => onUpdate(order.id, 'delivering')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-sm">
                      Démarrer la livraison 🛵
                    </button>
                  )}
                  {order.status === 'delivering' && (
                    <button onClick={() => onUpdate(order.id, 'delivered')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-sm">
                      Marquer comme livrée ✅
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="font-black text-gray-900 mb-3">🔔 Commandes disponibles ({available.length})</h2>
          {available.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl mb-2">😴</p>
              <p className="font-bold text-sm">Aucune commande pour le moment</p>
              <p className="text-xs mt-1">Les nouvelles commandes apparaîtront ici</p>
            </div>
          ) : available.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-gray-900">{order.shopName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.items.reduce((s, i) => s + i.quantity, 0)} article(s) · {fmt(order.total)}</p>
                </div>
                <span className="text-xs font-black text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-lg">💰 Commission</span>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2 space-y-1">
                <p className="text-xs text-gray-500"><span className="font-bold">Récupérer :</span> {order.shopName}</p>
                <p className="text-xs text-gray-500"><span className="font-bold">Livrer :</span> {order.deliveryNeighborhood}</p>
                <p className="text-xs text-gray-500">{order.deliveryAddress}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onUpdate(order.id, 'picked_up')} className="flex-1 bg-primary text-white py-3 rounded-xl font-black text-sm">
                  Accepter la livraison ✓
                </button>
                <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const AdminView: React.FC<{
  orders: Order[];
  dps: DeliveryPerson[];
}> = ({ orders, dps }) => {
  const delivered = orders.filter(o => o.status === 'delivered');
  const revenue = delivered.reduce((s, o) => s + o.total, 0);
  const active = orders.filter(o => ['delivering', 'picked_up', 'preparing', 'confirmed'].includes(o.status)).length;
  const available = dps.filter(d => d.isAvailable).length;

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 px-5 py-6">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Administration</p>
        <h1 className="text-white font-black text-2xl">🏢 Tableau de Bord</h1>
        <p className="text-gray-400 text-xs mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Commandes totales', value: orders.length, emoji: '📦', color: 'bg-blue-50 border-blue-100 text-blue-800' },
            { label: 'Revenus générés', value: fmt(revenue), emoji: '💰', color: 'bg-green-50 border-green-100 text-green-800' },
            { label: 'En cours', value: active, emoji: '🛵', color: 'bg-orange-50 border-orange-100 text-orange-800' },
            { label: 'Livreurs dispo.', value: `${available}/${dps.length}`, emoji: '👤', color: 'bg-purple-50 border-purple-100 text-purple-800' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} border rounded-2xl p-4`}>
              <p className="text-2xl mb-1">{stat.emoji}</p>
              <p className="font-black text-xl">{stat.value}</p>
              <p className="text-xs font-medium opacity-70 leading-tight mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Delivery persons */}
        <div>
          <h2 className="font-black text-gray-900 mb-3">👤 Livreurs ({dps.length})</h2>
          <div className="space-y-2">
            {dps.map(dp => (
              <div key={dp.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-2xl">{dp.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900">{dp.name}</p>
                  <p className="text-xs text-gray-400">
                    {dp.vehicle === 'moto' ? '🏍️' : dp.vehicle === 'velo' ? '🚲' : '🚗'} {dp.totalDeliveries} livraisons · ⭐{dp.rating}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${dp.isAvailable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {dp.isAvailable ? 'Dispo.' : 'En livraison'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <h2 className="font-black text-gray-900 mb-3">📋 Toutes les commandes</h2>
          <div className="space-y-2">
            {[...orders]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-black text-xs text-primary">{order.id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-400">{order.shopName} · {order.deliveryNeighborhood} · {fmtTime(order.createdAt)}</p>
                  {order.deliveryPersonName && (
                    <p className="text-xs text-blue-500 mt-0.5">🛵 {order.deliveryPersonName}</p>
                  )}
                  <p className="font-black text-sm text-primary mt-1">{fmt(order.total)}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── main app ──────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('customer');
  const [view, setView] = useState<string>('home');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [dps] = useState<DeliveryPerson[]>(initialDrivers);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

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

  const placeOrder = (address: string, neighborhood: string, payment: PaymentMethod, notes: string) => {
    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const deliveryFee = selectedShop?.deliveryFee ?? 500;
    const order: Order = {
      id: genId(),
      customerName: 'Adjoua Koffi',
      customerPhone: '+225 07 77 88 99',
      shopId: selectedShop?.id ?? '',
      shopName: selectedShop?.name ?? '',
      items: cart,
      status: 'confirmed',
      paymentMethod: payment,
      deliveryAddress: address,
      deliveryNeighborhood: neighborhood,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      createdAt: new Date().toISOString(),
      estimatedDelivery: selectedShop?.deliveryTime ?? '30 min',
      notes,
    };
    setOrders(prev => [order, ...prev]);
    setActiveOrder(order);
    setCart([]);
    setView('confirm');
  };

  const updateStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setTrackingOrder(prev => prev?.id === orderId ? { ...prev, status } : prev);
  };

  const switchRole = (r: UserRole) => {
    setRole(r);
    setView(r === 'customer' ? 'home' : r === 'delivery' ? 'delivery' : 'admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative font-sans">
      {/* Role switcher — demo bar */}
      <div className="bg-gray-900 px-4 py-2 flex gap-2 justify-center sticky top-0 z-50">
        {([
          ['customer', '👤 Client'],
          ['delivery', '🛵 Livreur'],
          ['admin', '🏢 Admin'],
        ] as [UserRole, string][]).map(([r, label]) => (
          <button
            key={r}
            onClick={() => switchRole(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
              role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-10 z-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛵</span>
          <div>
            <h1 className="font-black text-sm leading-none">Abengourou Express</h1>
            <p className="text-[10px] text-green-200 font-medium">Livraison rapide</p>
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
          <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
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
                onShopSelect={shop => { setSelectedShop(shop); setCart([]); setView('shop'); }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}
            {view === 'shop' && selectedShop && (
              <ShopView
                shop={selectedShop}
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
            {view === 'profile' && <ProfileView />}

            {/* Bottom nav for main customer views */}
            {!['shop', 'cart', 'confirm', 'tracking'].includes(view) && (
              <BottomNav view={view} setView={setView} cartCount={cartCount} />
            )}
          </>
        )}

        {role === 'delivery' && (
          <DeliveryView orders={orders} dps={dps} onUpdate={updateStatus} />
        )}

        {role === 'admin' && (
          <AdminView orders={orders} dps={dps} />
        )}
      </main>
    </div>
  );
};

export default App;
