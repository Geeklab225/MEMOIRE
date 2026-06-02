
import React, { useState } from 'react';
import { TrendingUp, Package, ShoppingBag, ToggleLeft, ToggleRight, CheckCircle, ChevronRight, Star, AlertCircle } from 'lucide-react';
import { SupplierAccount, Shop, Order, Product, OrderStatus } from '../types';

const fmt = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', preparing: 'En préparation',
  ready: 'Prêt ✓', picked_up: 'Récupérée', delivering: 'En livraison',
  delivered: 'Livrée', cancelled: 'Annulée',
};

const STATUS_SUPPLIER_ACTIONS: Record<string, { label: string; next: OrderStatus; color: string } | null> = {
  confirmed: { label: 'Commencer la préparation 👨‍🍳', next: 'preparing', color: 'bg-orange-500' },
  preparing: { label: 'Prêt pour récupération ✅', next: 'ready', color: 'bg-green-600' },
  ready: null,
};

interface Props {
  supplier: SupplierAccount;
  shop: Shop;
  orders: Order[];
  products: Product[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onToggleProduct: (productId: string) => void;
}

type Tab = 'dashboard' | 'orders' | 'products' | 'sales';

export const SupplierView: React.FC<Props> = ({ supplier, shop, orders, products, onUpdateStatus, onToggleProduct }) => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'done'>('all');

  const myOrders = orders.filter(o => o.shopId === shop.id);
  const activeOrders = myOrders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status));
  const doneOrders = myOrders.filter(o => o.status === 'delivered');
  const myProducts = products.filter(p => p.shopId === shop.id);
  const weekRevenue = doneOrders.reduce((s, o) => s + o.subtotal, 0);
  const commission = Math.round(weekRevenue * (supplier.commissionRate / 100));
  const netRevenue = weekRevenue - commission;
  const availableCount = myProducts.filter(p => p.available).length;

  const filteredOrders = orderFilter === 'active' ? activeOrders : orderFilter === 'done' ? doneOrders : myOrders;

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'dashboard', label: 'Tableau', emoji: '📊' },
    { id: 'orders', label: 'Commandes', emoji: '📦' },
    { id: 'products', label: 'Produits', emoji: '🛍️' },
    { id: 'sales', label: 'Ventes', emoji: '💰' },
  ];

  const supplierStatusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    suspended: 'bg-red-100 text-red-700',
  };

  return (
    <div className="pb-20">
      {/* Supplier header */}
      <div className={`bg-gradient-to-br ${shop.coverColor} px-5 py-5`}>
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">{shop.emoji}</div>
            <div>
              <h1 className="text-white font-black text-lg leading-tight">{shop.name}</h1>
              <p className="text-white/70 text-xs">{supplier.ownerName}</p>
            </div>
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${supplierStatusColor[supplier.status]}`}>
            {supplier.status === 'active' ? '🟢 Actif' : supplier.status === 'pending' ? '🟡 En attente' : '🔴 Suspendu'}
          </span>
        </div>
        {supplier.status === 'pending' && (
          <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
            <p className="text-white text-xs font-bold">Compte en attente d'activation par l'administration</p>
          </div>
        )}
        {supplier.status === 'suspended' && (
          <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
            <p className="text-white text-xs font-bold">Compte suspendu — Contactez l'administration</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-20 z-30">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[10px] font-black uppercase tracking-wide transition-colors ${
              tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-gray-400'
            }`}
          >
            <span className="text-base">{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <div className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Commandes actives', value: activeOrders.length, emoji: '📦', color: 'bg-blue-50 border-blue-100 text-blue-800' },
              { label: 'Revenus (livrées)', value: fmt(weekRevenue), emoji: '💰', color: 'bg-green-50 border-green-100 text-green-800' },
              { label: 'Produits dispo.', value: `${availableCount}/${myProducts.length}`, emoji: '🛍️', color: 'bg-purple-50 border-purple-100 text-purple-800' },
            ].map(s => (
              <div key={s.label} className={`${s.color} border rounded-2xl p-3 text-center`}>
                <p className="text-xl mb-1">{s.emoji}</p>
                <p className="font-black text-sm leading-tight">{s.value}</p>
                <p className="text-[9px] font-medium opacity-70 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Commission info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="font-black text-gray-900 text-sm mb-3">💹 Résumé financier</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Total ventes</span><span className="font-bold">{fmt(weekRevenue)}</span></div>
              <div className="flex justify-between text-orange-600"><span>Commission ({supplier.commissionRate}%) Abengourou Express</span><span className="font-bold">− {fmt(commission)}</span></div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-green-600 text-base">
                <span>Votre revenu net</span><span>{fmt(netRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Active orders quick list */}
          {activeOrders.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <p className="font-black text-gray-900 text-sm">🔥 Commandes à traiter</p>
                <button onClick={() => setTab('orders')} className="text-xs text-primary font-bold flex items-center gap-1">
                  Voir tout <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {activeOrders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-900 truncate">{order.customerName}</p>
                    <p className="text-[10px] text-gray-400">{order.items.reduce((s, i) => s + i.quantity, 0)} article(s)</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                    order.status === 'ready' ? 'bg-green-100 text-green-700' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Account info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="font-black text-gray-900 text-sm mb-3">🔑 Informations du compte</p>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Partenaire depuis', value: new Date(supplier.joinedDate).toLocaleDateString('fr-FR') },
                { label: 'Code d\'accès', value: supplier.accessCode },
                { label: 'Commission', value: `${supplier.commissionRate}%` },
                { label: 'Téléphone', value: supplier.phone },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === 'orders' && (
        <div className="px-4 py-4 space-y-3">
          {/* Filter */}
          <div className="flex gap-2">
            {([['all', 'Toutes'], ['active', 'En cours'], ['done', 'Livrées']] as [typeof orderFilter, string][]).map(([f, label]) => (
              <button
                key={f}
                onClick={() => setOrderFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${orderFilter === f ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-100'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-bold text-sm">Aucune commande</p>
            </div>
          ) : filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => {
            const action = STATUS_SUPPLIER_ACTIONS[order.status] ?? null;
            return (
              <div key={order.id} className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${
                order.status === 'ready' ? 'border-green-200 bg-green-50/30' :
                order.status === 'preparing' ? 'border-orange-200 bg-orange-50/30' :
                order.status === 'confirmed' ? 'border-blue-200 bg-blue-50/30' :
                'border-gray-100'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-black text-sm text-gray-900">{order.customerName}</p>
                    <p className="text-[10px] text-gray-400">{order.id} · {fmtTime(order.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                    order.status === 'ready' ? 'bg-green-100 text-green-700' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {order.items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-xs text-gray-600">
                      <span>{item.product.emoji} {item.product.name} ×{item.quantity}</span>
                      <span className="font-bold">{fmt(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <p className="font-black text-primary text-sm">Sous-total : {fmt(order.subtotal)}</p>
                  {action && (
                    <button
                      onClick={() => onUpdateStatus(order.id, action.next)}
                      className={`${action.color} text-white text-xs font-black px-3 py-2 rounded-xl`}
                    >
                      {action.label}
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-2 rounded-xl">
                      En attente du livreur 🛵
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <div className="px-4 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-black text-gray-900">{myProducts.length} produits · {availableCount} disponibles</p>
          </div>

          {[...new Set(myProducts.map(p => p.category))].map(cat => (
            <div key={cat}>
              <p className="font-black text-gray-500 text-[10px] uppercase tracking-widest mb-2">{cat}</p>
              <div className="space-y-2">
                {myProducts.filter(p => p.category === cat).map(product => (
                  <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {product.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
                      <p className="font-black text-primary text-sm">{fmt(product.price)}</p>
                      {product.popular && <span className="text-[9px] text-orange-500 font-black bg-orange-50 px-1.5 rounded">⭐ Populaire</span>}
                    </div>
                    <button
                      onClick={() => onToggleProduct(product.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                        product.available
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {product.available ? (
                        <><ToggleRight className="w-4 h-4" /> Dispo</>
                      ) : (
                        <><ToggleLeft className="w-4 h-4" /> Indispo</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-blue-700 font-bold">💡 Pour ajouter ou modifier des produits,</p>
            <p className="text-xs text-blue-500 mt-0.5">contactez l'administration · admin@abengourou.express</p>
          </div>
        </div>
      )}

      {/* ── SALES ── */}
      {tab === 'sales' && (
        <div className="px-4 py-4 space-y-4">
          {/* Revenue summary */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
            <p className="text-gray-400 text-xs font-bold uppercase mb-3">Résumé financier total</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-300">Ventes via Abengourou Express</span><span className="font-bold">{fmt(weekRevenue)}</span></div>
              <div className="flex justify-between text-orange-300"><span>Commission {supplier.commissionRate}%</span><span className="font-bold">− {fmt(commission)}</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-lg font-black">
                <span>Votre revenu net</span><span className="text-green-400">{fmt(netRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Sales stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl mb-1">📦</p>
              <p className="font-black text-2xl text-gray-900">{myOrders.length}</p>
              <p className="text-xs text-gray-400">Commandes reçues</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl mb-1">✅</p>
              <p className="font-black text-2xl text-gray-900">{doneOrders.length}</p>
              <p className="text-xs text-gray-400">Commandes livrées</p>
            </div>
          </div>

          {/* Delivered orders list */}
          <div>
            <p className="font-black text-gray-900 mb-3">Historique des ventes</p>
            {doneOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm font-bold">Aucune vente pour l'instant</p>
              </div>
            ) : [...doneOrders].reverse().map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-2">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
                    <p className="text-[10px] text-gray-400">{order.id} · {fmtTime(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary text-sm">{fmt(order.subtotal)}</p>
                    <p className="text-[10px] text-orange-500">− {fmt(Math.round(order.subtotal * supplier.commissionRate / 100))} commission</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {order.items.map(i => `${i.product.name} ×${i.quantity}`).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
