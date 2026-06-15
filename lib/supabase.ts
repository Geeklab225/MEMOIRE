import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes — mode démo actif');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    realtime: { params: { eventsPerSecond: 10 } },
  }
);

// ──────────────────────────────────────────────────────────────
// Types base de données (miroir du schéma SQL)
// ──────────────────────────────────────────────────────────────

export interface DbShop {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  neighborhood: string;
  rating: number;
  review_count: number;
  delivery_time: string;
  delivery_fee: number;
  min_order: number;
  is_open: boolean;
  emoji: string;
  featured: boolean;
  cover_color: string;
  created_at: string;
}

export interface DbProduct {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  available: boolean;
  popular: boolean;
  created_at: string;
}

export interface DbDeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicle: 'moto' | 'velo' | 'voiture';
  rating: number;
  total_deliveries: number;
  is_available: boolean;
  current_order_id: string | null;
  avatar: string;
  user_id: string | null;
}

export interface DbSupplierAccount {
  id: string;
  shop_id: string;
  shop_name: string;
  owner_name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  joined_date: string;
  commission_rate: number;
  access_code: string;
  user_id: string | null;
}

export interface DbOrder {
  id: string;
  order_type: 'delivery' | 'shopping';
  customer_name: string;
  customer_phone: string;
  shop_id: string;
  shop_name: string;
  status: string;
  payment_method: string;
  delivery_address: string;
  delivery_neighborhood: string;
  delivery_person_id: string | null;
  delivery_person_name: string | null;
  deposit_amount: number | null;
  subtotal: number;
  delivery_fee: number;
  shopping_fee: number | null;
  total: number;
  estimated_delivery: string | null;
  notes: string | null;
  customer_user_id: string | null;
  created_at: string;
  order_items?: DbOrderItem[];
  shopping_list_items?: DbShoppingListItem[];
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_emoji: string;
  quantity: number;
}

export interface DbShoppingListItem {
  id: string;
  order_id: string;
  name: string;
  quantity: string;
  estimated_price: number | null;
}

export interface DbUserProfile {
  id: string;
  role: 'customer' | 'delivery' | 'supplier' | 'admin';
  name: string | null;
  phone: string | null;
  supplier_id: string | null;
  delivery_person_id: string | null;
}

// ──────────────────────────────────────────────────────────────
// Auth helpers
// ──────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentProfile(): Promise<DbUserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

/** Connexion fournisseur via code d'accès */
export async function signInWithAccessCode(accessCode: string) {
  const { data: supplier, error } = await supabase
    .from('supplier_accounts')
    .select('*')
    .eq('access_code', accessCode.toUpperCase())
    .eq('status', 'active')
    .single();

  if (error || !supplier) {
    return { error: { message: 'Code d\'accès invalide ou compte inactif.' } };
  }

  // Utilise l'email du fournisseur avec le code comme mot de passe
  const email = supplier.email || `${accessCode.toLowerCase()}@abengourou-express.ci`;
  const password = accessCode.toUpperCase();

  const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    // Première connexion — créer le compte
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'supplier', supplier_id: supplier.id },
      },
    });
    if (signUpError) return { error: signUpError };

    // Créer le profil utilisateur
    if (signUpData.user) {
      await supabase.from('user_profiles').upsert({
        id: signUpData.user.id,
        role: 'supplier',
        name: supplier.owner_name,
        supplier_id: supplier.id,
      });
      await supabase.from('supplier_accounts')
        .update({ user_id: signUpData.user.id })
        .eq('id', supplier.id);
    }
    return { data: signUpData, supplier };
  }

  return { data, supplier };
}

// ──────────────────────────────────────────────────────────────
// Fetch helpers
// ──────────────────────────────────────────────────────────────

export async function fetchShops(): Promise<DbShop[]> {
  const { data, error } = await supabase.from('shops').select('*').order('featured', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProducts(shopId?: string): Promise<DbProduct[]> {
  let q = supabase.from('products').select('*');
  if (shopId) q = q.eq('shop_id', shopId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchOrders(filters?: {
  shopId?: string;
  customerId?: string;
}): Promise<DbOrder[]> {
  let q = supabase
    .from('orders')
    .select('*, order_items(*), shopping_list_items(*)')
    .order('created_at', { ascending: false });
  if (filters?.shopId) q = q.eq('shop_id', filters.shopId);
  if (filters?.customerId) q = q.eq('customer_user_id', filters.customerId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchDeliveryPersons(): Promise<DbDeliveryPerson[]> {
  const { data, error } = await supabase.from('delivery_persons').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function fetchSupplierAccounts(): Promise<DbSupplierAccount[]> {
  const { data, error } = await supabase.from('supplier_accounts').select('*').order('joined_date');
  if (error) throw error;
  return data ?? [];
}

// ──────────────────────────────────────────────────────────────
// Mutation helpers
// ──────────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
}

export async function toggleProductAvailability(productId: string, available: boolean) {
  const { error } = await supabase.from('products').update({ available }).eq('id', productId);
  if (error) throw error;
}

export async function updateSupplierStatus(supplierId: string, status: 'active' | 'pending' | 'suspended') {
  const { error } = await supabase.from('supplier_accounts').update({ status }).eq('id', supplierId);
  if (error) throw error;
}

export async function insertSupplierAccount(account: Omit<DbSupplierAccount, 'user_id' | 'created_at'>) {
  const { data, error } = await supabase.from('supplier_accounts').insert(account).select().single();
  if (error) throw error;
  return data;
}

export async function insertOrder(
  order: Omit<DbOrder, 'created_at' | 'order_items' | 'shopping_list_items'>,
  items: Omit<DbOrderItem, 'id' | 'order_id'>[],
  shoppingItems: Omit<DbShoppingListItem, 'order_id'>[],
) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  if (orderError) throw orderError;

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items.map(i => ({ ...i, order_id: orderData.id })));
    if (itemsError) throw itemsError;
  }

  if (shoppingItems.length > 0) {
    const { error: shopItemsError } = await supabase
      .from('shopping_list_items')
      .insert(shoppingItems.map(i => ({ ...i, order_id: orderData.id })));
    if (shopItemsError) throw shopItemsError;
  }

  return orderData as DbOrder;
}
