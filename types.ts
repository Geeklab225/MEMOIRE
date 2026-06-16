
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'orange_money' | 'mtn_money';
export type UserRole = 'customer' | 'delivery' | 'supplier' | 'admin';
export type ShopCategory = 'restaurant' | 'pharmacy' | 'supermarket' | 'bakery' | 'drinks' | 'butcher';
export type OrderType = 'delivery' | 'shopping';
export type SupplierStatus = 'active' | 'pending' | 'suspended';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  estimatedPrice?: number;
}

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
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  items: CartItem[];
  shoppingList?: ShoppingItem[];
  depositAmount?: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryNeighborhood: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  subtotal: number;
  deliveryFee: number;
  shoppingFee?: number;
  total: number;
  createdAt: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface SupplierAccount {
  id: string;
  shopId: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: SupplierStatus;
  joinedDate: string;
  commissionRate: number;
  accessCode: string;
}
