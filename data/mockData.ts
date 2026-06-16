
import { Shop, Product, Order, DeliveryPerson, SupplierAccount } from '../types';

export const DELIVERY_FEES: Record<string, number> = {
  'Centre-ville':    500,
  'Kennedy':         700,
  'Stade Municipal': 600,
  'Marché Central':  500,
  'Résidentiel':     800,
  'Morafé':         1200,
  'Lycée':           700,
  'Ancien Marché':   600,
};

export const SHOPPING_FEE = 1000;
export const NEIGHBORHOODS = Object.keys(DELIVERY_FEES);

export const generateAccessCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export const shops: Shop[] = [
  { id: 's1', name: 'Maquis Chez Mariama', category: 'restaurant', description: 'Cuisine ivoirienne authentique — Attiéké, Riz sauce, Poisson braisé', address: 'Rue du Commerce', neighborhood: 'Centre-ville', rating: 4.8, reviewCount: 124, deliveryTime: '20-35 min', deliveryFee: 500, minOrder: 1500, isOpen: true, emoji: '🍽️', featured: true, coverColor: 'from-orange-500 to-yellow-500' },
  { id: 's2', name: 'Pharmacie Centrale', category: 'pharmacy', description: 'Médicaments, produits de santé et parapharmacie', address: 'Av. Houphouët-Boigny', neighborhood: 'Centre-ville', rating: 4.9, reviewCount: 87, deliveryTime: '15-25 min', deliveryFee: 500, minOrder: 1000, isOpen: true, emoji: '💊', featured: true, coverColor: 'from-blue-500 to-cyan-500' },
  { id: 's3', name: 'Supermarché Le Bonheur', category: 'supermarket', description: 'Épicerie, produits alimentaires et ménagers', address: 'Boulevard du 7 Décembre', neighborhood: 'Stade Municipal', rating: 4.6, reviewCount: 203, deliveryTime: '25-40 min', deliveryFee: 700, minOrder: 2000, isOpen: true, emoji: '🛒', featured: false, coverColor: 'from-green-500 to-emerald-600' },
  { id: 's4', name: 'Boulangerie du Roi', category: 'bakery', description: 'Pain frais, viennoiseries et pâtisseries artisanales', address: 'Quartier Résidentiel', neighborhood: 'Résidentiel', rating: 4.7, reviewCount: 156, deliveryTime: '15-25 min', deliveryFee: 500, minOrder: 500, isOpen: true, emoji: '🥐', featured: false, coverColor: 'from-yellow-500 to-amber-500' },
  { id: 's5', name: 'Grillade Palace', category: 'restaurant', description: 'Poulet braisé, côtes de bœuf, alloco et brochettes', address: 'Quartier Kennedy', neighborhood: 'Kennedy', rating: 4.5, reviewCount: 89, deliveryTime: '30-45 min', deliveryFee: 600, minOrder: 2000, isOpen: true, emoji: '🍗', featured: true, coverColor: 'from-red-500 to-orange-500' },
  { id: 's6', name: 'Bar Glacier Frais', category: 'drinks', description: 'Jus de fruits frais, boissons fraîches, glaces artisanales', address: 'Marché Central', neighborhood: 'Marché', rating: 4.4, reviewCount: 67, deliveryTime: '10-20 min', deliveryFee: 500, minOrder: 1000, isOpen: true, emoji: '🥤', featured: false, coverColor: 'from-purple-500 to-pink-500' },
  { id: 's7', name: 'Boucherie Chez Koné', category: 'butcher', description: 'Viandes fraîches de qualité — Bœuf, Mouton, Porc, Abats', address: 'Marché Central, Allée des Bouchers', neighborhood: 'Marché', rating: 4.6, reviewCount: 112, deliveryTime: '20-35 min', deliveryFee: 600, minOrder: 2000, isOpen: true, emoji: '🥩', featured: true, coverColor: 'from-red-700 to-rose-600' },
];

export const products: Product[] = [
  // Maquis Chez Mariama (s1)
  { id: 'p1', shopId: 's1', name: 'Attiéké Poisson Braisé', description: 'Attiéké frais avec poisson braisé, oignons et tomates', price: 2000, category: 'Plats principaux', emoji: '🐟', available: true, popular: true },
  { id: 'p2', shopId: 's1', name: 'Riz Sauce Arachide', description: 'Riz blanc avec sauce arachide maison et légumes', price: 1500, category: 'Plats principaux', emoji: '🍚', available: true, popular: true },
  { id: 'p3', shopId: 's1', name: 'Foutou Banane Sauce Graine', description: 'Foutou de banane plantain avec sauce de graine de palme', price: 1500, category: 'Plats principaux', emoji: '🫙', available: true, popular: false },
  { id: 'p4', shopId: 's1', name: 'Alloco au Poisson Fumé', description: 'Bananes plantain frites avec poisson fumé', price: 1000, category: 'Accompagnements', emoji: '🍌', available: true, popular: true },
  { id: 'p5', shopId: 's1', name: 'Jus Gingembre Maison', description: 'Jus de gingembre frais avec citron et miel', price: 500, category: 'Boissons', emoji: '🍹', available: true, popular: false },
  // Pharmacie Centrale (s2)
  { id: 'p6', shopId: 's2', name: 'Paracétamol 500mg', description: 'Boîte de 16 comprimés — Antidouleur', price: 600, category: 'Médicaments', emoji: '💊', available: true, popular: true },
  { id: 'p7', shopId: 's2', name: 'Coartem Antipaludéen', description: 'Traitement antipaludéen — 24 comprimés', price: 2500, category: 'Médicaments', emoji: '💊', available: true, popular: true },
  { id: 'p8', shopId: 's2', name: 'Savon Antiseptique Dettol', description: 'Savon liquide antibactérien 250ml', price: 1500, category: 'Hygiène', emoji: '🧼', available: true, popular: false },
  { id: 'p9', shopId: 's2', name: 'Gel Hydroalcoolique', description: 'Solution désinfectante 100ml', price: 1000, category: 'Hygiène', emoji: '🧴', available: true, popular: false },
  { id: 'p10', shopId: 's2', name: 'Thermomètre Digital', description: 'Thermomètre médical numérique', price: 3500, category: 'Matériel', emoji: '🌡️', available: true, popular: false },
  // Supermarché (s3)
  { id: 'p11', shopId: 's3', name: 'Riz Parfumé 5kg', description: 'Riz parfumé de qualité supérieure', price: 4000, category: 'Alimentation', emoji: '🌾', available: true, popular: true },
  { id: 'p12', shopId: 's3', name: 'Huile de Palme 1L', description: 'Huile de palme pure 1 litre', price: 1500, category: 'Alimentation', emoji: '🫙', available: true, popular: true },
  { id: 'p13', shopId: 's3', name: 'Tomates Concentrées 800g', description: 'Boîte de concentré de tomates', price: 800, category: 'Conserves', emoji: '🍅', available: true, popular: false },
  { id: 'p14', shopId: 's3', name: 'Sucre 1kg', description: 'Sucre blanc raffiné', price: 700, category: 'Alimentation', emoji: '🍬', available: true, popular: false },
  { id: 'p15', shopId: 's3', name: 'Lait Concentré Gloria', description: 'Lait concentré sucré 397g', price: 900, category: 'Produits laitiers', emoji: '🥛', available: true, popular: true },
  { id: 'p16', shopId: 's3', name: 'Lessive OMO 1kg', description: 'Lessive en poudre OMO', price: 1200, category: 'Ménager', emoji: '🧺', available: true, popular: false },
  // Boulangerie (s4)
  { id: 'p17', shopId: 's4', name: 'Baguette Tradition', description: 'Baguette de pain tradition française', price: 200, category: 'Pain', emoji: '🥖', available: true, popular: true },
  { id: 'p18', shopId: 's4', name: 'Croissant au Beurre', description: 'Croissant pur beurre artisanal', price: 300, category: 'Viennoiserie', emoji: '🥐', available: true, popular: true },
  { id: 'p19', shopId: 's4', name: 'Pain au Chocolat', description: 'Pain au chocolat noir', price: 300, category: 'Viennoiserie', emoji: '🍫', available: true, popular: true },
  { id: 'p20', shopId: 's4', name: "Gâteau d'Anniversaire", description: 'Sur commande, décorations personnalisées', price: 15000, category: 'Pâtisserie', emoji: '🎂', available: true, popular: false },
  { id: 'p21', shopId: 's4', name: 'Sandwich Thon-Mayo', description: 'Baguette, thon, mayonnaise, tomate', price: 1000, category: 'Sandwichs', emoji: '🥪', available: true, popular: true },
  // Grillade Palace (s5)
  { id: 'p22', shopId: 's5', name: 'Poulet Braisé Entier', description: 'Poulet entier grillé au charbon avec garniture', price: 5000, category: 'Grillades', emoji: '🍗', available: true, popular: true },
  { id: 'p23', shopId: 's5', name: 'Demi Poulet Braisé', description: 'Demi poulet grillé avec frites et sauce', price: 2500, category: 'Grillades', emoji: '🍗', available: true, popular: true },
  { id: 'p24', shopId: 's5', name: 'Brochettes Bœuf (5 pcs)', description: '5 brochettes de bœuf marinées et grillées', price: 2000, category: 'Brochettes', emoji: '🍢', available: true, popular: true },
  { id: 'p25', shopId: 's5', name: 'Côtes de Porc Grillées', description: 'Côtes marinées, grillées au charbon', price: 3000, category: 'Grillades', emoji: '🥩', available: true, popular: false },
  { id: 'p26', shopId: 's5', name: 'Alloco Grillé', description: 'Bananes plantain grillées au charbon', price: 500, category: 'Accompagnements', emoji: '🍌', available: true, popular: false },
  // Bar Glacier Frais (s6)
  { id: 'p27', shopId: 's6', name: 'Jus de Bissap Frais', description: "Jus d'hibiscus frais — 1 litre", price: 1000, category: 'Jus frais', emoji: '🍹', available: true, popular: true },
  { id: 'p28', shopId: 's6', name: 'Coca-Cola 33cl', description: 'Coca-Cola en canette fraîche', price: 500, category: 'Sodas', emoji: '🥤', available: true, popular: true },
  { id: 'p29', shopId: 's6', name: 'Citronnade Menthe', description: 'Citronnade avec feuilles de menthe', price: 700, category: 'Jus frais', emoji: '🍋', available: true, popular: false },
  { id: 'p30', shopId: 's6', name: 'Glace Vanille (2 boules)', description: 'Glace artisanale vanille', price: 500, category: 'Glaces', emoji: '🍦', available: true, popular: true },
  { id: 'p31', shopId: 's6', name: 'Eau Minérale 1.5L', description: 'Eau minérale naturelle fraîche', price: 500, category: 'Eaux', emoji: '💧', available: true, popular: false },

  // Boucherie Chez Koné (s7)
  { id: 'p32', shopId: 's7', name: 'Bœuf à Braiser (1kg)', description: 'Viande de bœuf en morceaux pour ragoût ou braisé', price: 3500, category: 'Bœuf', emoji: '🥩', available: true, popular: true },
  { id: 'p33', shopId: 's7', name: 'Viande Hachée Bœuf (500g)', description: 'Bœuf haché frais du jour', price: 2000, category: 'Bœuf', emoji: '🥩', available: true, popular: true },
  { id: 'p34', shopId: 's7', name: 'Côtes de Bœuf (1kg)', description: 'Côtes avec os pour bouillon ou grillade', price: 3000, category: 'Bœuf', emoji: '🦴', available: true, popular: false },
  { id: 'p35', shopId: 's7', name: 'Gigot de Mouton (1kg)', description: 'Mouton frais, idéal pour le garba et les fêtes', price: 4000, category: 'Mouton', emoji: '🐑', available: true, popular: true },
  { id: 'p36', shopId: 's7', name: 'Mouton Haché (500g)', description: 'Mouton haché frais pour boulettes et sauces', price: 2500, category: 'Mouton', emoji: '🥩', available: true, popular: false },
  { id: 'p37', shopId: 's7', name: 'Côtelettes de Porc (1kg)', description: 'Côtelettes de porc fraîches pour grillade', price: 2500, category: 'Porc', emoji: '🥓', available: true, popular: true },
  { id: 'p38', shopId: 's7', name: 'Poulet Entier Vif (2kg~)', description: 'Poulet fermier vif — plumé et vidé à la demande', price: 3000, category: 'Volaille', emoji: '🐓', available: true, popular: true },
  { id: 'p39', shopId: 's7', name: 'Foie de Bœuf (500g)', description: 'Foie frais riche en fer', price: 1500, category: 'Abats', emoji: '🫀', available: true, popular: false },
  { id: 'p40', shopId: 's7', name: 'Tripes (500g)', description: 'Tripes nettoyées — pour sauce fétri ou kedjenou', price: 1200, category: 'Abats', emoji: '🍲', available: false, popular: false },
];

const fp = (id: string): Product => products.find(p => p.id === id)!;

export const deliveryPersons: DeliveryPerson[] = [
  { id: 'd1', name: 'Kofi Asante', phone: '+225 07 12 34 56', vehicle: 'moto', rating: 4.9, totalDeliveries: 347, isAvailable: true, avatar: '🧑🏿' },
  { id: 'd2', name: 'Ama Kouamé', phone: '+225 05 98 76 54', vehicle: 'moto', rating: 4.7, totalDeliveries: 213, isAvailable: false, currentOrderId: 'ABG-001', avatar: '👩🏿' },
  { id: 'd3', name: 'Yao Brou', phone: '+225 01 23 45 67', vehicle: 'velo', rating: 4.5, totalDeliveries: 89, isAvailable: true, avatar: '🧑🏿' },
];

export const mockSupplierAccounts: SupplierAccount[] = [
  { id: 'sup1', shopId: 's1', shopName: 'Maquis Chez Mariama', ownerName: 'Mariama Coulibaly', email: 'mariama@express.ci', phone: '+225 07 11 22 33', status: 'active', joinedDate: '2024-01-15', commissionRate: 15, accessCode: 'MAR001' },
  { id: 'sup2', shopId: 's2', shopName: 'Pharmacie Centrale', ownerName: 'Dr. Konan Yves', email: 'pharmacie@express.ci', phone: '+225 05 44 55 66', status: 'active', joinedDate: '2024-02-03', commissionRate: 10, accessCode: 'PHA002' },
  { id: 'sup3', shopId: 's3', shopName: 'Supermarché Le Bonheur', ownerName: 'Brou Amenan', email: 'bonheur@express.ci', phone: '+225 01 77 88 99', status: 'active', joinedDate: '2024-01-28', commissionRate: 12, accessCode: 'BON003' },
  { id: 'sup4', shopId: 's4', shopName: 'Boulangerie du Roi', ownerName: 'Jean-Pierre Akissi', email: 'boulangerie@express.ci', phone: '+225 07 33 22 11', status: 'active', joinedDate: '2024-03-10', commissionRate: 12, accessCode: 'ROI004' },
  { id: 'sup5', shopId: 's5', shopName: 'Grillade Palace', ownerName: 'Traoré Moussa', email: 'grillade@express.ci', phone: '+225 05 66 77 88', status: 'pending', joinedDate: '2024-06-01', commissionRate: 15, accessCode: 'GRI005' },
  { id: 'sup6', shopId: 's6', shopName: 'Bar Glacier Frais', ownerName: 'Adjoua Nadia', email: 'glacier@express.ci', phone: '+225 01 99 00 11', status: 'suspended', joinedDate: '2024-04-20', commissionRate: 10, accessCode: 'GLA006' },
  { id: 'sup7', shopId: 's7', shopName: 'Boucherie Chez Koné', ownerName: 'Koné Mamadou', email: 'boucherie@express.ci', phone: '+225 07 55 44 33', status: 'active', joinedDate: '2024-05-12', commissionRate: 12, accessCode: 'KON007' },
];

const ago = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const mockOrders: Order[] = [
  {
    id: 'ABG-001', orderType: 'delivery', customerName: 'Adjoua Koffi', customerPhone: '+225 07 77 88 99',
    shopId: 's1', shopName: 'Maquis Chez Mariama',
    items: [{ product: fp('p1'), quantity: 2 }, { product: fp('p4'), quantity: 1 }],
    status: 'delivering', paymentMethod: 'orange_money',
    deliveryAddress: 'Rue des Fleurs, Maison bleue', deliveryNeighborhood: 'Kennedy',
    deliveryPersonId: 'd2', deliveryPersonName: 'Ama Kouamé',
    subtotal: 5000, deliveryFee: 700, total: 5700, createdAt: ago(25), estimatedDelivery: '10 min',
  },
  {
    id: 'ABG-002', orderType: 'shopping', customerName: 'Adjoua Koffi', customerPhone: '+225 07 77 88 99',
    shopId: '', shopName: 'Courses au marché', items: [],
    shoppingList: [
      { id: '1', name: 'Riz parfumé', quantity: '5 kg' },
      { id: '2', name: 'Huile de palme', quantity: '2 litres' },
      { id: '3', name: 'Oignons', quantity: '1 kg' },
      { id: '4', name: 'Tomates fraîches', quantity: '500 g' },
    ],
    depositAmount: 8000, status: 'confirmed', paymentMethod: 'cash',
    deliveryAddress: 'Rue des Fleurs, Maison bleue', deliveryNeighborhood: 'Kennedy',
    subtotal: 0, deliveryFee: 700, shoppingFee: 1000, total: 9700,
    createdAt: ago(8), estimatedDelivery: '40-50 min',
  },
  {
    id: 'ABG-003', orderType: 'delivery', customerName: 'Yves Kouassi', customerPhone: '+225 05 55 44 33',
    shopId: 's5', shopName: 'Grillade Palace',
    items: [{ product: fp('p23'), quantity: 1 }],
    status: 'preparing', paymentMethod: 'cash',
    deliveryAddress: 'Villa 12, Résidentiel', deliveryNeighborhood: 'Résidentiel',
    subtotal: 2500, deliveryFee: 800, total: 3300, createdAt: ago(10), estimatedDelivery: '30 min',
  },
  {
    id: 'ABG-004', orderType: 'delivery', customerName: 'Marie Akissi', customerPhone: '+225 01 22 33 44',
    shopId: 's1', shopName: 'Maquis Chez Mariama',
    items: [{ product: fp('p2'), quantity: 2 }, { product: fp('p5'), quantity: 1 }],
    status: 'confirmed', paymentMethod: 'mtn_money',
    deliveryAddress: 'Cité, Bloc D Porte 7', deliveryNeighborhood: 'Stade Municipal',
    subtotal: 3500, deliveryFee: 600, total: 4100, createdAt: ago(5), estimatedDelivery: '25 min',
  },
  {
    id: 'ABG-005', orderType: 'delivery', customerName: 'Adjoua Koffi', customerPhone: '+225 07 77 88 99',
    shopId: 's4', shopName: 'Boulangerie du Roi',
    items: [{ product: fp('p17'), quantity: 4 }, { product: fp('p18'), quantity: 2 }],
    status: 'delivered', paymentMethod: 'cash',
    deliveryAddress: 'Rue des Fleurs', deliveryNeighborhood: 'Kennedy',
    deliveryPersonId: 'd1', deliveryPersonName: 'Kofi Asante',
    subtotal: 1400, deliveryFee: 700, total: 2100, createdAt: ago(120), estimatedDelivery: 'Livré',
  },
  {
    id: 'ABG-006', orderType: 'delivery', customerName: 'Koné Ibrahim', customerPhone: '+225 07 55 66 77',
    shopId: 's2', shopName: 'Pharmacie Centrale',
    items: [{ product: fp('p6'), quantity: 2 }, { product: fp('p7'), quantity: 1 }],
    status: 'delivered', paymentMethod: 'orange_money',
    deliveryAddress: 'Av. de la Paix n°3', deliveryNeighborhood: 'Lycée',
    deliveryPersonId: 'd1', deliveryPersonName: 'Kofi Asante',
    subtotal: 3700, deliveryFee: 700, total: 4400, createdAt: ago(180), estimatedDelivery: 'Livré',
  },
  {
    id: 'ABG-007', orderType: 'delivery', customerName: 'Aya Diabaté', customerPhone: '+225 05 22 33 44',
    shopId: 's1', shopName: 'Maquis Chez Mariama',
    items: [{ product: fp('p1'), quantity: 1 }, { product: fp('p3'), quantity: 1 }],
    status: 'delivered', paymentMethod: 'cash',
    deliveryAddress: 'Rue neuve n°7', deliveryNeighborhood: 'Morafé',
    deliveryPersonId: 'd3', deliveryPersonName: 'Yao Brou',
    subtotal: 3500, deliveryFee: 1200, total: 4700, createdAt: ago(360), estimatedDelivery: 'Livré',
  },
  {
    id: 'ABG-008', orderType: 'delivery', customerName: 'Bamba Cheick', customerPhone: '+225 01 44 55 66',
    shopId: 's3', shopName: 'Supermarché Le Bonheur',
    items: [{ product: fp('p11'), quantity: 1 }, { product: fp('p12'), quantity: 2 }, { product: fp('p15'), quantity: 1 }],
    status: 'ready', paymentMethod: 'mtn_money',
    deliveryAddress: 'Cité ouvrière, n°22', deliveryNeighborhood: 'Stade Municipal',
    subtotal: 7300, deliveryFee: 600, total: 7900, createdAt: ago(15), estimatedDelivery: '20 min',
  },
];
