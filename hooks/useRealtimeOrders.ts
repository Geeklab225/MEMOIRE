import { useEffect, useState, useCallback } from 'react';
import { supabase, fetchOrders, updateOrderStatus, DbOrder } from '../lib/supabase';
import { Order, OrderStatus } from '../types';
import { mockOrders } from '../data/mockData';

const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

/** Convertit une DbOrder en Order (type interne de l'app) */
function dbOrderToOrder(o: DbOrder): Order {
  return {
    id: o.id,
    orderType: o.order_type,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    shopId: o.shop_id,
    shopName: o.shop_name,
    items: (o.order_items ?? []).map(i => ({
      product: {
        id: i.product_id,
        shopId: o.shop_id,
        name: i.product_name,
        description: '',
        price: i.product_price,
        category: '',
        emoji: i.product_emoji,
        available: true,
        popular: false,
      },
      quantity: i.quantity,
    })),
    shoppingList: (o.shopping_list_items ?? []).map(i => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      estimatedPrice: i.estimated_price ?? undefined,
    })),
    depositAmount: o.deposit_amount ?? undefined,
    status: o.status as OrderStatus,
    paymentMethod: o.payment_method as Order['paymentMethod'],
    deliveryAddress: o.delivery_address,
    deliveryNeighborhood: o.delivery_neighborhood,
    deliveryPersonId: o.delivery_person_id ?? undefined,
    deliveryPersonName: o.delivery_person_name ?? undefined,
    subtotal: o.subtotal,
    deliveryFee: o.delivery_fee,
    shoppingFee: o.shopping_fee ?? undefined,
    total: o.total,
    createdAt: o.created_at,
    estimatedDelivery: o.estimated_delivery ?? undefined,
    notes: o.notes ?? undefined,
  };
}

interface UseRealtimeOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useRealtimeOrders(shopId?: string): UseRealtimeOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      // Mode démo — utiliser les données mock
      setOrders(mockOrders);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await fetchOrders(shopId ? { shopId } : undefined);
      setOrders(data.map(dbOrderToOrder));
      setError(null);
    } catch (e) {
      console.error('[useRealtimeOrders] Erreur de chargement:', e);
      setError('Impossible de charger les commandes');
      setOrders(mockOrders); // fallback
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    load();

    if (!isSupabaseConfigured) return;

    // Abonnement Realtime sur les changements de commandes
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Recharger pour avoir les jointures (order_items, shopping_list_items)
            load();
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as DbOrder;
            setOrders(prev =>
              prev.map(o =>
                o.id === updated.id
                  ? { ...o, status: updated.status as OrderStatus }
                  : o
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== (payload.old as DbOrder).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const handleUpdateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

    if (!isSupabaseConfigured) return;

    try {
      await updateOrderStatus(orderId, status);
    } catch (e) {
      console.error('[useRealtimeOrders] Erreur mise à jour statut:', e);
      // Rollback
      await load();
    }
  }, [load]);

  return {
    orders,
    isLoading,
    error,
    updateStatus: handleUpdateStatus,
    refetch: load,
  };
}
