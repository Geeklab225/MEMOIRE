
export type ViewType = 'home' | 'shop' | 'cart' | 'confirm' | 'tracking' | 'history' | 'delivery' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'orange_money' | 'mtn_money';
export type UserRole = 'customer' | 'delivery' | 'admin';
export type ShopCategory = 'restaurant' | 'pharmacy' | 'supermarket' | 'bakery' | 'drinks';

export interface Shop {
  id: string;
  name: string;
  category: ShopCategory;
  description: string;
  address: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  emoji: string;
  featured: boolean;
  coverColor: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  available: boolean;
  popular: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicle: 'moto' | 'velo' | 'voiture';
  rating: number;
  totalDeliveries: number;
  isAvailable: boolean;
  currentOrderId?: string;
  avatar: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  items: CartItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryNeighborhood: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  estimatedDelivery?: string;
  notes?: string;
}
