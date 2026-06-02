
import React, { useState } from 'react';
import { Plus, Check, X, Key, TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';
import { Order, DeliveryPerson, SupplierAccount, SupplierStatus } from '../types';
import { DELIVERY_FEES, SHOPPING_FEE, generateAccessCode } from '../data/mockData';

const fmt = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', preparing: 'En préparation',
  ready: 'Prêt ✓', picked_up: 'Récupérée', delivering: 'En livraison',
  delivered: 'Livrée ✓', cancelled: 'Annulée',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-700 bg-yellow-50',
  confirmed: 'text-blue-700 bg-blue-50',
  preparing: 'text-orange-700 bg-orange-50',
  ready: 'text-green-700 bg-green-100',
  picked_up: 'text-purple-700 bg-purple-50',
  delivering: 'text-green-700 bg-green-50',
  delivered: 'text-gray-600 bg-gray-100',
  cancelled: 'text-red-700 bg-red-50',
};

const SUPPLIER_STATUS_STYLES: Record<SupplierStatus, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
};

const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  active: '✅ Actif',
  pending: '⏳ En attente',
  suspended: '🚫 Suspendu',
};

interface Props {
  orders: Order[];
  dps: DeliveryPerson[];
  supplierAccounts: SupplierAccount[];
  onUpdateSupplierStatus: (supplierId: string, status: SupplierStatus) => void;
  onAddSupplier: (account: SupplierAccount) => void;
}

type Tab = 'dashboard' | 'orders' | 'drivers' | 'partners';

interface NewSupplierForm {
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  commissionRate: number;
}

const EMPTY_FORM: NewSupplierForm = {
  shopName: '', ownerName: '', email: '', phone: '', commissionRate: 12,
};

export const AdminView: React.FC<Props> = ({ orders, dps, supplierAccounts, onUpdateSupplierStatus, onAddSupplier }) => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewSupplierForm>(EMPTY_FORM);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [partnerFilter, setPartnerFilter] = useState<'all' | SupplierStatus>('all');

  const delivered = orders.filter(o => o.status === 'delivered');
  const active = orders.filter(o => ['confirmed', 'preparing', 'ready', 'picked_up', 'delivering'].includes(o.status));
  const deliveryRevenue = delivered.filter(o => o.orderType === 'delivery').reduce((s, o) => s + o.deliveryFee, 0);
  const shoppingRevenue = delivered.filter(o => o.orderType === 'shopping').reduce((s, o) => s + (o.shoppingFee ?? 0) + o.deliveryFee, 0);
  const totalRevenue = deliveryRevenue + shoppingRevenue;
  const availableDrivers = dps.filter(d => d.isAvailable).length;

  const filteredPartners = partnerFilter === 'all'
    ? supplierAccounts
    : supplierAccounts.filter(s => s.status === partnerFilter);

  const handleGenerateCode = () => {
    setGeneratedCode(generateAccessCode());
  };

  const handleAddSupplier = () => {
    if (!form.shopName || !form.ownerName || !form.email || !form.phone) return;
    const code = generatedCode || generateAccessCode();
    const newAccount: SupplierAccount = {
      id: `sup${Date.now()}`,
      shopId: `s_new_${Date.now()}`,
      shopName: form.shopName,
      ownerName: form.ownerName,
      email: form.email,
      phone: form.phone,
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0],
      commissionRate: form.commissionRate,
      accessCode: code,
    };
    onAddSupplier(newAccount);
    setForm(EMPTY_FORM);
    setGeneratedCode(null);
    setShowAddForm(false);
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Tableau', emoji: '📊' },
    { id: 'orders' as Tab, label: 'Commandes', emoji: '📦' },
    { id: 'drivers' as Tab, label: 'Livreurs', emoji: '🛵' },
    { id: 'partners' as Tab, label: 'Partenaires', emoji: '🏪' },
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 px-5 pt-5 pb-6">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Administration</p>
        <h1 className="text-white font-black text-2xl">🏢 Tableau de Bord</h1>
        <p className="text-gray-400 text-xs mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Commandes', value: orders.length, emoji: '📦' },
            { label: 'En cours', value: active.length, emoji: '🚀' },
            { label: 'Revenus', value: `${(totalRevenue / 1000).toFixed(0)}k`, emoji: '💰' },
            { label: 'Partenaires', value: supplierAccounts.filter(s => s.status === 'active').length, emoji: '🏪' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-2xl p-2.5 text-center">
              <p className="text-base mb-0.5">{stat.emoji}</p>
              <p className="font-black text-white text-sm leading-none">{stat.value}</p>
              <p className="text-[9px] text-gray-300 font-medium mt-0.5 leading-tight">{stat.label}</p>
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
            className={`flex-1 py-3 text-[10px] font-black transition-colors ${
              tab === t.id ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Dashboard tab */}
        {tab === 'dashboard' && (
          <>
            {/* Revenue breakdown */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="font-black text-gray-900 text-sm mb-3">💰 Revenus (frais Abengourou Express)</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">🛍️ Frais de livraison</span>
                  <span className="font-black text-primary">{fmt(deliveryRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">🛒 Frais courses + livraison</span>
                  <span className="font-black text-orange-600">{fmt(shoppingRevenue)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-primary">{fmt(totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Service breakdown bars */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="font-black text-gray-900 text-sm mb-3">📊 Répartition des services</p>
              {orders.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>🛍️ Livraisons</span>
                      <span className="font-bold">{orders.filter(o => o.orderType === 'delivery').length} commandes</span>
                    </div>
                    <div className="bg-blue-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${(orders.filter(o => o.orderType === 'delivery').length / orders.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>🛒 Courses</span>
                      <span className="font-bold">{orders.filter(o => o.orderType === 'shopping').length} commandes</span>
                    </div>
                    <div className="bg-orange-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full"
                        style={{ width: `${(orders.filter(o => o.orderType === 'shopping').length / orders.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tarifs quartiers */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="font-black text-gray-900 text-sm mb-3">🗺️ Tarifs par quartier</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(DELIVERY_FEES).map(([q, fee]) => (
                  <div key={q} className="flex justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-600 font-medium truncate">{q}</span>
                    <span className="text-xs font-black text-primary ml-2 flex-shrink-0">{fmt(fee)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-500">Supplément courses</span>
                <span className="font-black text-orange-600">+{fmt(SHOPPING_FEE)}</span>
              </div>
            </div>
          </>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { label: 'Toutes', value: orders.length, color: 'bg-gray-100 text-gray-800' },
                { label: 'En cours', value: active.length, color: 'bg-orange-50 text-orange-800' },
                { label: 'Livrées', value: delivered.length, color: 'bg-green-50 text-green-800' },
                { label: 'Annulées', value: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-50 text-red-800' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                  <p className="font-black text-xl">{s.value}</p>
                  <p className="text-[10px] font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black text-gray-400">{order.id}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        order.orderType === 'shopping' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {order.orderType === 'shopping' ? '🛒 Courses' : '🛍️ Livraison'}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.deliveryNeighborhood} · {order.customerPhone}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-500">
                    {order.orderType === 'delivery'
                      ? `${order.items.reduce((s, i) => s + i.quantity, 0)} article(s) chez ${order.shopName}`
                      : `${order.shoppingList?.length ?? 0} articles à acheter`}
                  </p>
                  <p className="font-black text-primary text-sm">{fmt(order.total)}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Drivers tab */}
        {tab === 'drivers' && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-2">
              {[
                { label: 'Total', value: dps.length, color: 'bg-blue-50 text-blue-800 border-blue-100' },
                { label: 'Disponibles', value: availableDrivers, color: 'bg-green-50 text-green-800 border-green-100' },
                { label: 'En livraison', value: dps.length - availableDrivers, color: 'bg-orange-50 text-orange-800 border-orange-100' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-2xl p-3 text-center`}>
                  <p className="font-black text-xl">{s.value}</p>
                  <p className="text-[10px] font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            {dps.map(dp => (
              <div key={dp.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">{dp.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{dp.name}</p>
                  <p className="text-xs text-gray-400">{dp.phone}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dp.vehicle === 'moto' ? '🏍️' : dp.vehicle === 'velo' ? '🚲' : '🚗'} {dp.totalDeliveries} livraisons · ⭐{dp.rating}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                  dp.isAvailable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {dp.isAvailable ? 'Dispo.' : 'En livraison'}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Partners tab */}
        {tab === 'partners' && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Actifs', value: supplierAccounts.filter(s => s.status === 'active').length, color: 'bg-green-50 text-green-800 border-green-100' },
                { label: 'En attente', value: supplierAccounts.filter(s => s.status === 'pending').length, color: 'bg-yellow-50 text-yellow-800 border-yellow-100' },
                { label: 'Suspendus', value: supplierAccounts.filter(s => s.status === 'suspended').length, color: 'bg-red-50 text-red-800 border-red-100' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-2xl p-3 text-center`}>
                  <p className="font-black text-xl">{s.value}</p>
                  <p className="text-[10px] font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter + Add button */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-1 overflow-x-auto">
                {(['all', 'active', 'pending', 'suspended'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setPartnerFilter(f)}
                    className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                      partnerFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Tous' : SUPPLIER_STATUS_LABELS[f]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl font-black text-xs hover:bg-green-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>

            {/* Add partner form */}
            {showAddForm && (
              <div className="bg-gray-50 border-2 border-dashed border-green-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-black text-gray-900 text-sm">Nouveau partenaire</p>
                  <button onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); setGeneratedCode(null); }}
                    className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {[
                  { key: 'shopName', label: 'Nom du commerce', placeholder: 'Ex: Pharmacie du Centre' },
                  { key: 'ownerName', label: 'Nom du propriétaire', placeholder: 'Ex: Kouassi Aya' },
                  { key: 'email', label: 'Email', placeholder: 'email@exemple.ci' },
                  { key: 'phone', label: 'Téléphone', placeholder: '+225 07 XX XX XX' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-gray-600 block mb-1">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={form[field.key as keyof NewSupplierForm] as string}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-green-400 bg-white"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Commission (%)</label>
                  <select
                    value={form.commissionRate}
                    onChange={e => setForm(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-green-400 bg-white"
                  >
                    {[8, 10, 12, 15, 18, 20].map(r => (
                      <option key={r} value={r}>{r}%</option>
                    ))}
                  </select>
                </div>

                {/* Access code generation */}
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Code d'accès</label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5">
                      <Key className="w-4 h-4 text-gray-400 mr-2" />
                      <span className={`text-sm font-black tracking-widest ${generatedCode ? 'text-primary' : 'text-gray-300'}`}>
                        {generatedCode ?? '------'}
                      </span>
                    </div>
                    <button
                      onClick={handleGenerateCode}
                      className="px-3 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-gray-700 transition-colors"
                    >
                      Générer
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddSupplier}
                  disabled={!form.shopName || !form.ownerName || !form.email || !form.phone || !generatedCode}
                  className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm disabled:opacity-40 hover:bg-green-700 transition-colors"
                >
                  ✅ Créer le partenariat
                </button>
              </div>
            )}

            {/* Partner list */}
            {filteredPartners.map(supplier => (
              <div key={supplier.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm leading-tight">{supplier.shopName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{supplier.ownerName}</p>
                    <p className="text-xs text-gray-400">{supplier.email} · {supplier.phone}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ml-2 ${SUPPLIER_STATUS_STYLES[supplier.status]}`}>
                    {SUPPLIER_STATUS_LABELS[supplier.status]}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <div className="flex items-center justify-center gap-1">
                      <Key className="w-3 h-3 text-gray-400" />
                      <p className="font-black text-xs text-gray-700 tracking-widest">{supplier.accessCode}</p>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">Code accès</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="font-black text-xs text-orange-600">{supplier.commissionRate}%</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Commission</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="font-black text-xs text-gray-700">{fmtDate(supplier.joinedDate)}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Rejoint le</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {supplier.status !== 'active' && (
                    <button
                      onClick={() => onUpdateSupplierStatus(supplier.id, 'active')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2.5 rounded-xl font-black text-xs hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Activer
                    </button>
                  )}
                  {supplier.status !== 'suspended' && (
                    <button
                      onClick={() => onUpdateSupplierStatus(supplier.id, 'suspended')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl font-black text-xs hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Suspendre
                    </button>
                  )}
                  {supplier.status !== 'pending' && (
                    <button
                      onClick={() => onUpdateSupplierStatus(supplier.id, 'pending')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-100 py-2.5 rounded-xl font-black text-xs hover:bg-yellow-100 transition-colors"
                    >
                      ⏳ Attente
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredPartners.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">🏪</p>
                <p className="font-bold">Aucun partenaire dans cette catégorie</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminView;
