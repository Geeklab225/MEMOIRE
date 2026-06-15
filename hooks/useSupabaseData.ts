import { useState, useEffect, useCallback } from 'react';
import {
  supabase,
  fetchShops, fetchProducts, fetchDeliveryPersons, fetchSupplierAccounts,
  toggleProductAvailability, updateSupplierStatus, insertSupplierAccount,
  DbShop, DbProduct, DbDeliveryPerson, DbSupplierAccount,
} from '../lib/supabase';
import { Shop, Product, DeliveryPerson, SupplierAccount, SupplierStatus } from '../types';
import {
  shops as mockShops, products as mockProducts,
  deliveryPersons as mockDrivers, mockSupplierAccounts,
} from '../data/mockData';

const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

// ── Converters ──────────────────────────────────────────────

function dbShopToShop(s: DbShop): Shop {
  return {
    id: s.id, name: s.name, category: s.category as Shop['category'],
    description: s.description, address: s.address, neighborhood: s.neighborhood,
    rating: s.rating, reviewCount: s.review_count, deliveryTime: s.delivery_time,
    deliveryFee: s.delivery_fee, minOrder: s.min_order, isOpen: s.is_open,
    emoji: s.emoji, featured: s.featured, coverColor: s.cover_color,
  };
}

function dbProductToProduct(p: DbProduct): Product {
  return {
    id: p.id, shopId: p.shop_id, name: p.name, description: p.description,
    price: p.price, category: p.category, emoji: p.emoji,
    available: p.available, popular: p.popular,
  };
}

function dbDpToDriver(d: DbDeliveryPerson): DeliveryPerson {
  return {
    id: d.id, name: d.name, phone: d.phone, vehicle: d.vehicle,
    rating: d.rating, totalDeliveries: d.total_deliveries,
    isAvailable: d.is_available, currentOrderId: d.current_order_id ?? undefined,
    avatar: d.avatar,
  };
}

function dbSupplierToSupplier(s: DbSupplierAccount): SupplierAccount {
  return {
    id: s.id, shopId: s.shop_id, shopName: s.shop_name,
    ownerName: s.owner_name, email: s.email, phone: s.phone,
    status: s.status, joinedDate: s.joined_date,
    commissionRate: s.commission_rate, accessCode: s.access_code,
  };
}

// ── Hook ────────────────────────────────────────────────────

export function useSupabaseData() {
  const [shops, setShops] = useState<Shop[]>(mockShops);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>(mockDrivers);
  const [supplierAccounts, setSupplierAccounts] = useState<SupplierAccount[]>(mockSupplierAccounts);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      setIsLoading(true);
      const [dbShops, dbProducts, dbDps, dbSuppliers] = await Promise.all([
        fetchShops(), fetchProducts(), fetchDeliveryPersons(), fetchSupplierAccounts(),
      ]);
      setShops(dbShops.map(dbShopToShop));
      setProducts(dbProducts.map(dbProductToProduct));
      setDeliveryPersons(dbDps.map(dbDpToDriver));
      setSupplierAccounts(dbSuppliers.map(dbSupplierToSupplier));
    } catch (e) {
      console.error('[useSupabaseData] Erreur:', e);
      // Garder les données mock en fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    if (!isSupabaseConfigured) return;

    // Realtime sur les produits (toggle disponibilité)
    const productsChannel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, payload => {
        const p = payload.new as DbProduct;
        setProducts(prev => prev.map(prod => prod.id === p.id ? dbProductToProduct(p) : prod));
      })
      .subscribe();

    // Realtime sur les livreurs (disponibilité)
    const dpChannel = supabase
      .channel('dp-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'delivery_persons' }, payload => {
        const d = payload.new as DbDeliveryPerson;
        setDeliveryPersons(prev => prev.map(dp => dp.id === d.id ? dbDpToDriver(d) : dp));
      })
      .subscribe();

    // Realtime sur les fournisseurs
    const suppChannel = supabase
      .channel('suppliers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supplier_accounts' }, () => {
        fetchSupplierAccounts().then(data => setSupplierAccounts(data.map(dbSupplierToSupplier)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(dpChannel);
      supabase.removeChannel(suppChannel);
    };
  }, [load]);

  // ── Mutations ──────────────────────────────────────────────

  const handleToggleProduct = useCallback(async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newAvailable = !product.available;

    // Optimistic update
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, available: newAvailable } : p));

    if (isSupabaseConfigured) {
      try {
        await toggleProductAvailability(productId, newAvailable);
      } catch {
        // Rollback
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, available: !newAvailable } : p));
      }
    }
  }, [products]);

  const handleUpdateSupplierStatus = useCallback(async (supplierId: string, status: SupplierStatus) => {
    setSupplierAccounts(prev => prev.map(s => s.id === supplierId ? { ...s, status } : s));

    if (isSupabaseConfigured) {
      try {
        await updateSupplierStatus(supplierId, status);
      } catch (e) {
        console.error('[useSupabaseData] Erreur mise à jour fournisseur:', e);
        await load();
      }
    }
  }, [load]);

  const handleAddSupplier = useCallback(async (account: SupplierAccount) => {
    setSupplierAccounts(prev => [...prev, account]);

    if (isSupabaseConfigured) {
      try {
        await insertSupplierAccount({
          id: account.id,
          shop_id: account.shopId,
          shop_name: account.shopName,
          owner_name: account.ownerName,
          email: account.email,
          phone: account.phone,
          status: account.status,
          joined_date: account.joinedDate,
          commission_rate: account.commissionRate,
          access_code: account.accessCode,
        });
      } catch (e) {
        console.error('[useSupabaseData] Erreur ajout fournisseur:', e);
        await load();
      }
    }
  }, [load]);

  return {
    shops, products, deliveryPersons, supplierAccounts, isLoading,
    toggleProduct: handleToggleProduct,
    updateSupplierStatus: handleUpdateSupplierStatus,
    addSupplier: handleAddSupplier,
    refetch: load,
  };
}
