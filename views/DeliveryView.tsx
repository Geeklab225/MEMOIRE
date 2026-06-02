
import React, { useState } from 'react';
import { Phone, MapPin, Package, CheckCircle, TrendingUp, Navigation } from 'lucide-react';
import { Order, DeliveryPerson, OrderStatus } from '../types';

const fmt = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prêt à récupérer',
  picked_up: 'Récupérée',
  delivering: 'En livraison',
  delivered: 'Livrée ✓',
  cancelled: 'Annulée',
};

const TypeBadge: React.FC<{ type: 'delivery' | 'shopping' }> = ({ type }) => (
  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
    type === 'shopping' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'
  }`}>
    {type === 'shopping' ? '🛒 Courses' : '🛍️ Livraison'}
  </span>
);

interface Props {
  orders: Order[];
  dps: DeliveryPerson[];
  onUpdate: (id: string, status: OrderStatus) => void;
}

type Tab = 'active' | 'available' | 'earnings';

export const DeliveryView: React.FC<Props> = ({ orders, dps, onUpdate }) => {
  const [tab, setTab] = useState<Tab>('available');
  const me = dps[0];

  // Orders ready at supplier (status 'ready') + confirmed/preparing without a driver
  const available = orders.filter(o =>
    (o.status === 'ready' || (['confirmed', 'preparing'].includes(o.status) && !o.deliveryPersonId))
  );
  const active = orders.filter(o => ['picked_up', 'delivering'].includes(o.status));
  const delivered = orders.filter(o => o.status === 'delivered');
  const todayEarnings = delivered.reduce((s, o) => s + o.deliveryFee + (o.shoppingFee ?? 0), 0);

  const tabs = [
    { id: 'available' as Tab, label: 'Disponibles', count: available.length, emoji: '🔔' },
    { id: 'active' as Tab, label: 'En cours', count: active.length, emoji: '🚀' },
    { id: 'earnings' as Tab, label: 'Gains', count: null, emoji: '💰' },
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-5 pt-5 pb-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Interface Livreur</p>
            <h1 className="text-white font-black text-2xl">Bonjour, {me.name.split(' ')[0]} 👋</h1>
            <p className="text-blue-300 text-xs mt-0.5">{me.phone}</p>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
              me.isAvailable ? 'bg-green-400/30 text-green-200' : 'bg-red-400/30 text-red-200'
            }`}>
              {me.isAvailable ? '🟢 Disponible' : '🔴 Occupé'}
            </span>
            <p className="text-blue-300 text-xs mt-1">
              {me.vehicle === 'moto' ? '🏍️ Moto' : me.vehicle === 'velo' ? '🚲 Vélo' : '🚗 Voiture'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total livraisons', value: me.totalDeliveries, emoji: '📦' },
            { label: 'Note', value: `${me.rating}⭐`, emoji: '' },
            { label: 'Disponibles', value: available.length, emoji: '🔔' },
            { label: "Gains (FCFA)", value: todayEarnings.toLocaleString('fr-FR'), emoji: '💵' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-2xl p-2.5 text-center">
              <p className="text-base mb-0.5">{stat.emoji}</p>
              <p className="font-black text-white text-sm leading-none">{stat.value}</p>
              <p className="text-[9px] text-blue-200 font-medium mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-[5.5rem] z-30">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-black transition-colors relative ${
              tab === t.id ? 'text-blue-700 border-b-2 border-blue-600' : 'text-gray-400'
            }`}
          >
            <span>{t.emoji} {t.label}</span>
            {t.count !== null && t.count > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full inline-flex items-center justify-center">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-3">
        {/* Available orders tab */}
        {tab === 'available' && (
          <>
            {available.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-5xl mb-3">😴</p>
                <p className="font-bold">Aucune commande disponible</p>
                <p className="text-sm mt-1">Revenez dans quelques instants</p>
              </div>
            ) : available.map(order => (
              <div key={order.id} className={`rounded-2xl p-4 shadow-sm border space-y-3 ${
                order.status === 'ready' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
              }`}>
                {order.status === 'ready' && (
                  <div className="bg-green-100 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-xs font-black text-green-700">Commande prête chez le fournisseur !</p>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TypeBadge type={order.orderType} />
                      <span className="text-[10px] font-bold text-gray-400">{order.id}</span>
                    </div>
                    <p className="font-black text-gray-900">
                      {order.orderType === 'shopping' ? '🛒 Courses au marché' : order.shopName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.orderType === 'shopping'
                        ? `${order.shoppingList?.length ?? 0} articles · Budget ${fmt(order.depositAmount ?? 0)}`
                        : `${order.items.reduce((s, i) => s + i.quantity, 0)} article(s) · ${fmt(order.subtotal)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-green-700 bg-green-100 px-2 py-1 rounded-lg block">
                      +{fmt(order.deliveryFee + (order.shoppingFee ?? 0))}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-0.5">votre gain</p>
                  </div>
                </div>

                {order.orderType === 'shopping' && order.shoppingList && (
                  <div className="bg-orange-50 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-black text-orange-700 mb-1">🛒 Liste à acheter :</p>
                    {order.shoppingList.slice(0, 3).map(i => (
                      <p key={i.id} className="text-xs text-orange-700">• {i.name} — {i.quantity}</p>
                    ))}
                    {order.shoppingList.length > 3 && (
                      <p className="text-xs text-orange-400 font-bold">+{order.shoppingList.length - 3} autres...</p>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl px-3 py-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-600 font-medium">{order.deliveryNeighborhood}</p>
                  </div>
                  <p className="text-xs text-gray-400">{order.deliveryAddress}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdate(order.id, 'picked_up')}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-sm hover:bg-blue-700 transition-colors"
                  >
                    {order.status === 'ready'
                      ? 'Récupérer chez le fournisseur 🏪'
                      : order.orderType === 'shopping'
                      ? 'Accepter les courses ✓'
                      : 'Accepter la livraison ✓'}
                  </button>
                  <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Active orders tab */}
        {tab === 'active' && (
          <>
            {active.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-5xl mb-3">🛵</p>
                <p className="font-bold">Aucune livraison en cours</p>
              </div>
            ) : active.map(order => (
              <div key={order.id} className={`border-2 rounded-2xl p-4 space-y-3 ${
                order.orderType === 'shopping' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TypeBadge type={order.orderType} />
                    </div>
                    <p className="font-black text-gray-900">
                      {order.orderType === 'shopping' ? 'Courses au marché' : order.shopName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      📍 {order.deliveryNeighborhood} · {order.customerName}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                    order.status === 'picked_up' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {order.orderType === 'shopping' && order.shoppingList && (
                  <div className="bg-white rounded-xl p-3 space-y-1">
                    <p className="text-xs font-black text-orange-700 mb-1">🛒 Liste à acheter :</p>
                    {order.shoppingList.map(i => (
                      <p key={i.id} className="text-xs text-gray-700">• {i.name} — {i.quantity}</p>
                    ))}
                    {order.depositAmount && (
                      <p className="text-xs font-black text-green-600 mt-2 pt-2 border-t border-gray-100">
                        💰 Budget client : {fmt(order.depositAmount)} (rendez la monnaie)
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-white/70 rounded-xl px-3 py-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-3 h-3 text-gray-500" />
                      <p className="text-xs font-bold text-gray-700">{order.deliveryAddress}</p>
                    </div>
                    <a href={`tel:${order.customerPhone}`}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      <Phone className="w-3 h-3" /> Appeler
                    </a>
                  </div>
                  <p className="text-xs text-gray-400">{order.customerPhone}</p>
                </div>

                <div className="flex gap-2">
                  {order.status === 'picked_up' && (
                    <button
                      onClick={() => onUpdate(order.id, 'delivering')}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-sm hover:bg-blue-700"
                    >
                      {order.orderType === 'shopping' ? 'Partir livrer le client 🛵' : 'Démarrer la livraison 🛵'}
                    </button>
                  )}
                  {order.status === 'delivering' && (
                    <button
                      onClick={() => onUpdate(order.id, 'delivered')}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-sm hover:bg-green-700"
                    >
                      {order.orderType === 'shopping' ? 'Livré + monnaie rendue ✅' : 'Marquer comme livrée ✅'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Earnings tab */}
        {tab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white">
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Total Gains</p>
              <p className="text-3xl font-black">{fmt(todayEarnings)}</p>
              <p className="text-blue-300 text-xs mt-1">{delivered.length} livraison{delivered.length > 1 ? 's' : ''} complétée{delivered.length > 1 ? 's' : ''}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Livraisons', value: delivered.filter(o => o.orderType === 'delivery').length, color: 'bg-blue-50 text-blue-800 border-blue-100', emoji: '🛍️' },
                { label: 'Courses', value: delivered.filter(o => o.orderType === 'shopping').length, color: 'bg-orange-50 text-orange-800 border-orange-100', emoji: '🛒' },
                { label: 'Note moy.', value: `${me.rating}⭐`, color: 'bg-yellow-50 text-yellow-800 border-yellow-100', emoji: '' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-2xl p-3 text-center`}>
                  <p className="text-lg mb-0.5">{s.emoji}</p>
                  <p className="font-black text-xl">{s.value}</p>
                  <p className="text-[10px] font-medium opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="font-black text-gray-900 text-sm mb-3">📋 Historique des livraisons</p>
              {delivered.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">Aucune livraison complétée</p>
              ) : (
                <div className="space-y-2">
                  {delivered.map(order => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <TypeBadge type={order.orderType} />
                          <span className="text-[10px] text-gray-400">{order.id}</span>
                        </div>
                        <p className="text-xs text-gray-600">{order.deliveryNeighborhood} · {fmtTime(order.createdAt)}</p>
                      </div>
                      <p className="font-black text-green-700 text-sm">+{fmt(order.deliveryFee + (order.shoppingFee ?? 0))}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryView;
