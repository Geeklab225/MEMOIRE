
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
  // ── Restaurants ──────────────────────────────────────────
  { id: 's1',       name: 'Maquis Chez Mariama',  category: 'restaurant',   description: 'Cuisine ivoirienne authentique — Attiéké, Riz sauce, Poisson braisé', address: 'Rue du Commerce',                    neighborhood: 'Centre-ville',    rating: 4.8, reviewCount: 124, deliveryTime: '20-35 min', deliveryFee: 500, minOrder: 1500, isOpen: true,  emoji: '🍽️', featured: true,  coverColor: 'from-orange-500 to-yellow-500' },
  { id: 's5',       name: 'Grillade Palace',       category: 'restaurant',   description: 'Poulet braisé, côtes de bœuf, alloco et brochettes',                   address: 'Quartier Kennedy',                   neighborhood: 'Kennedy',         rating: 4.5, reviewCount: 89,  deliveryTime: '30-45 min', deliveryFee: 600, minOrder: 2000, isOpen: true,  emoji: '🍗', featured: true,  coverColor: 'from-red-500 to-orange-500' },
  // ── Pharmacie ────────────────────────────────────────────
  { id: 's2',       name: 'Pharmacie Centrale',    category: 'pharmacy',     description: 'Médicaments, produits de santé et parapharmacie',                       address: 'Av. Houphouët-Boigny',               neighborhood: 'Centre-ville',    rating: 4.9, reviewCount: 87,  deliveryTime: '15-25 min', deliveryFee: 500, minOrder: 1000, isOpen: true,  emoji: '💊', featured: true,  coverColor: 'from-blue-500 to-cyan-500' },
  // ── Supermarchés ─────────────────────────────────────────
  { id: 'bon-prix', name: 'BON PRIX',              category: 'supermarket',  description: 'Prix imbattables — Alimentation, Ménager, Épicerie quotidienne',        address: 'Rue du Marché, Centre-ville',        neighborhood: 'Centre-ville',    rating: 4.3, reviewCount: 318, deliveryTime: '25-40 min', deliveryFee: 600, minOrder: 2000, isOpen: true,  emoji: '🏷️', featured: true,  coverColor: 'from-green-600 to-teal-500' },
  { id: 'cdci',     name: 'CDCI',                  category: 'supermarket',  description: 'Centre de Distribution Côte d\'Ivoire — large choix alimentaire',      address: 'Bd du 7 Décembre',                   neighborhood: 'Stade Municipal', rating: 4.5, reviewCount: 243, deliveryTime: '25-40 min', deliveryFee: 600, minOrder: 2000, isOpen: true,  emoji: '🏬', featured: false, coverColor: 'from-blue-600 to-indigo-500' },
  { id: 'rizkalah', name: 'Chez Rizkalah',         category: 'supermarket',  description: 'Épicerie fine — Produits importés, conserves, fromages, spécialités',  address: 'Av. des Palmiers',                   neighborhood: 'Centre-ville',    rating: 4.7, reviewCount: 156, deliveryTime: '20-35 min', deliveryFee: 600, minOrder: 2500, isOpen: true,  emoji: '🫒', featured: false, coverColor: 'from-amber-500 to-orange-400' },
  { id: 'ochan',    name: 'OCHAN',                 category: 'supermarket',  description: 'Alimentation locale & traditionnelle — Attiéké, Gari, Épices',         address: 'Marché Central',                     neighborhood: 'Marché Central',  rating: 4.2, reviewCount: 189, deliveryTime: '20-30 min', deliveryFee: 500, minOrder: 1500, isOpen: true,  emoji: '🌿', featured: false, coverColor: 'from-lime-500 to-green-400' },
  { id: 'bakus',    name: 'SUPER BAKUS',            category: 'supermarket',  description: 'Supermarché de quartier — Épicerie, Hygiène, Boissons, Surgelés',      address: 'Quartier Résidentiel',               neighborhood: 'Résidentiel',     rating: 4.4, reviewCount: 207, deliveryTime: '30-45 min', deliveryFee: 700, minOrder: 2000, isOpen: true,  emoji: '🛍️', featured: false, coverColor: 'from-violet-600 to-purple-500' },
  { id: 'panicom',  name: 'PANICOM',               category: 'supermarket',  description: 'Ménager, Hygiène, Boissons et produits d\'entretien maison',            address: 'Rue des Fleurs',                     neighborhood: 'Kennedy',         rating: 4.3, reviewCount: 134, deliveryTime: '25-40 min', deliveryFee: 700, minOrder: 2000, isOpen: true,  emoji: '🧴', featured: false, coverColor: 'from-sky-500 to-cyan-400' },
  { id: 'sococe',   name: 'SOCOCE',                category: 'supermarket',  description: 'La grande surface d\'Abengourou — Premium, large gamme',                address: 'Av. Houphouët-Boigny, Centre Comm.', neighborhood: 'Centre-ville',    rating: 4.6, reviewCount: 412, deliveryTime: '30-45 min', deliveryFee: 700, minOrder: 3000, isOpen: true,  emoji: '⭐', featured: true,  coverColor: 'from-rose-500 to-pink-400' },
  // ── Boulangerie ──────────────────────────────────────────
  { id: 's4',       name: 'Boulangerie du Roi',    category: 'bakery',       description: 'Pain frais, viennoiseries et pâtisseries artisanales',                   address: 'Quartier Résidentiel',               neighborhood: 'Résidentiel',     rating: 4.7, reviewCount: 156, deliveryTime: '15-25 min', deliveryFee: 500, minOrder: 500,  isOpen: true,  emoji: '🥐', featured: false, coverColor: 'from-yellow-500 to-amber-500' },
  // ── Boissons ─────────────────────────────────────────────
  { id: 's6',       name: 'Bar Glacier Frais',     category: 'drinks',       description: 'Jus de fruits frais, boissons fraîches, glaces artisanales',            address: 'Marché Central',                     neighborhood: 'Marché Central',  rating: 4.4, reviewCount: 67,  deliveryTime: '10-20 min', deliveryFee: 500, minOrder: 1000, isOpen: true,  emoji: '🥤', featured: false, coverColor: 'from-purple-500 to-pink-500' },
  // ── Boucherie ────────────────────────────────────────────
  { id: 's7',       name: 'Boucherie Chez Koné',   category: 'butcher',      description: 'Viandes fraîches de qualité — Bœuf, Mouton, Porc, Abats',              address: 'Marché Central, Allée des Bouchers', neighborhood: 'Marché Central',  rating: 4.6, reviewCount: 112, deliveryTime: '20-35 min', deliveryFee: 600, minOrder: 2000, isOpen: true,  emoji: '🥩', featured: true,  coverColor: 'from-red-700 to-rose-600' },
];

export const products: Product[] = [
  // ── Maquis Chez Mariama (s1) ─────────────────────────────
  { id: 'p1',  shopId: 's1', name: 'Attiéké Poisson Braisé',    description: 'Attiéké frais avec poisson braisé, oignons et tomates',           price: 2000,  category: 'Plats principaux', emoji: '🐟', available: true,  popular: true  },
  { id: 'p2',  shopId: 's1', name: 'Riz Sauce Arachide',         description: 'Riz blanc avec sauce arachide maison et légumes',                  price: 1500,  category: 'Plats principaux', emoji: '🍚', available: true,  popular: true  },
  { id: 'p3',  shopId: 's1', name: 'Foutou Banane Sauce Graine', description: 'Foutou de banane plantain avec sauce de graine de palme',          price: 1500,  category: 'Plats principaux', emoji: '🫙', available: true,  popular: false },
  { id: 'p4',  shopId: 's1', name: 'Alloco au Poisson Fumé',     description: 'Bananes plantain frites avec poisson fumé',                        price: 1000,  category: 'Accompagnements',  emoji: '🍌', available: true,  popular: true  },
  { id: 'p5',  shopId: 's1', name: 'Jus Gingembre Maison',       description: 'Jus de gingembre frais avec citron et miel',                       price: 500,   category: 'Boissons',         emoji: '🍹', available: true,  popular: false },

  // ── Pharmacie Centrale (s2) ──────────────────────────────
  { id: 'p6',  shopId: 's2', name: 'Paracétamol 500mg',          description: 'Boîte de 16 comprimés — Antidouleur',                              price: 600,   category: 'Médicaments',      emoji: '💊', available: true,  popular: true  },
  { id: 'p7',  shopId: 's2', name: 'Coartem Antipaludéen',       description: 'Traitement antipaludéen — 24 comprimés',                           price: 2500,  category: 'Médicaments',      emoji: '💊', available: true,  popular: true  },
  { id: 'p8',  shopId: 's2', name: 'Savon Antiseptique Dettol',  description: 'Savon liquide antibactérien 250ml',                                price: 1500,  category: 'Hygiène',          emoji: '🧼', available: true,  popular: false },
  { id: 'p9',  shopId: 's2', name: 'Gel Hydroalcoolique',        description: 'Solution désinfectante 100ml',                                     price: 1000,  category: 'Hygiène',          emoji: '🧴', available: true,  popular: false },
  { id: 'p10', shopId: 's2', name: 'Thermomètre Digital',        description: 'Thermomètre médical numérique',                                    price: 3500,  category: 'Matériel',         emoji: '🌡️', available: true,  popular: false },

  // ── BON PRIX (bon-prix) ──────────────────────────────────
  { id: 'p50', shopId: 'bon-prix', name: 'Riz Parfumé 5kg',            description: 'Riz parfumé 5kg — meilleur prix du marché',                   price: 3800,  category: 'Alimentation',     emoji: '🌾', available: true,  popular: true  },
  { id: 'p51', shopId: 'bon-prix', name: 'Huile Végétale Dinor 1L',    description: 'Huile végétale pure — cuisson quotidienne',                    price: 1200,  category: 'Alimentation',     emoji: '🫙', available: true,  popular: true  },
  { id: 'p52', shopId: 'bon-prix', name: 'Tomates Concentrées 400g',   description: 'Concentré de tomates en boîte',                               price: 500,   category: 'Conserves',        emoji: '🍅', available: true,  popular: false },
  { id: 'p53', shopId: 'bon-prix', name: 'Sucre Cristal 1kg',          description: 'Sucre blanc raffiné 1kg',                                     price: 650,   category: 'Alimentation',     emoji: '🍬', available: true,  popular: true  },
  { id: 'p54', shopId: 'bon-prix', name: 'Lait Concentré Gloria 397g', description: 'Lait concentré sucré Gloria',                                 price: 850,   category: 'Produits laitiers',emoji: '🥛', available: true,  popular: true  },
  { id: 'p55', shopId: 'bon-prix', name: 'Farine de Blé 1kg',          description: 'Farine de blé tout usage 1kg',                                price: 700,   category: 'Alimentation',     emoji: '🌾', available: true,  popular: false },
  { id: 'p56', shopId: 'bon-prix', name: 'Sardines en Boîte 125g',     description: 'Sardines à l\'huile végétale',                                price: 450,   category: 'Conserves',        emoji: '🐟', available: true,  popular: true  },
  { id: 'p57', shopId: 'bon-prix', name: 'Savon Lux (lot de 3)',        description: 'Savon de toilette Lux — lot de 3 savons',                     price: 900,   category: 'Ménager',          emoji: '🧼', available: true,  popular: false },
  { id: 'p58', shopId: 'bon-prix', name: 'Eau Minérale Awa 1.5L',      description: 'Eau minérale naturelle fraîche',                              price: 400,   category: 'Boissons',         emoji: '💧', available: true,  popular: true  },

  // ── CDCI (cdci) ─────────────────────────────────────────
  { id: 'p59', shopId: 'cdci', name: 'Riz Long Grain 5kg',        description: 'Riz long grain de qualité supérieure',                             price: 4500,  category: 'Alimentation',     emoji: '🌾', available: true,  popular: true  },
  { id: 'p60', shopId: 'cdci', name: 'Huile de Palme 2L',         description: 'Huile de palme rouge naturelle 2L',                               price: 2800,  category: 'Alimentation',     emoji: '🫙', available: true,  popular: true  },
  { id: 'p61', shopId: 'cdci', name: 'Pâtes Alimentaires 500g',   description: 'Pâtes spaghetti — cuisson rapide',                                price: 600,   category: 'Alimentation',     emoji: '🍝', available: true,  popular: false },
  { id: 'p62', shopId: 'cdci', name: 'Café Nescafé Classic 100g', description: 'Café soluble Nescafé — 100g',                                     price: 2500,  category: 'Boissons',         emoji: '☕', available: true,  popular: true  },
  { id: 'p63', shopId: 'cdci', name: 'Lessive OMO 1kg',           description: 'Lessive en poudre OMO — linge éclatant',                          price: 1200,  category: 'Ménager',          emoji: '🧺', available: true,  popular: false },
  { id: 'p64', shopId: 'cdci', name: 'Maquereau en Boîte 200g',   description: 'Maquereau à la sauce tomate',                                     price: 800,   category: 'Conserves',        emoji: '🐟', available: true,  popular: false },
  { id: 'p65', shopId: 'cdci', name: 'Sucre en Poudre 2kg',       description: 'Sucre blanc raffiné 2kg',                                         price: 1200,  category: 'Alimentation',     emoji: '🍬', available: true,  popular: true  },
  { id: 'p66', shopId: 'cdci', name: 'Cube Maggi (boîte 60 pcs)', description: 'Bouillon en cubes Maggi — boîte de 60',                           price: 1000,  category: 'Condiments',       emoji: '🧂', available: true,  popular: true  },
  { id: 'p67', shopId: 'cdci', name: 'Margarine Nioto 500g',      description: 'Margarine végétale pour tartines et cuisson',                     price: 1500,  category: 'Alimentation',     emoji: '🧈', available: true,  popular: false },
  { id: 'p68', shopId: 'cdci', name: 'Coca-Cola 1.5L',            description: 'Coca-Cola en bouteille fraîche',                                  price: 1000,  category: 'Boissons',         emoji: '🥤', available: true,  popular: true  },

  // ── Chez Rizkalah (rizkalah) ─────────────────────────────
  { id: 'p69', shopId: 'rizkalah', name: 'Riz Basmati 5kg',            description: 'Riz basmati long grain importé — parfum délicat',              price: 6500,  category: 'Alimentation',     emoji: '🌾', available: true,  popular: true  },
  { id: 'p70', shopId: 'rizkalah', name: 'Huile d\'Olive Vierge 500ml',description: 'Huile d\'olive extra vierge importée',                        price: 5500,  category: 'Alimentation',     emoji: '🫒', available: true,  popular: true  },
  { id: 'p71', shopId: 'rizkalah', name: 'Pois Chiches 400g',          description: 'Pois chiches en boîte — prêt à l\'emploi',                    price: 1200,  category: 'Conserves',        emoji: '🫘', available: true,  popular: false },
  { id: 'p72', shopId: 'rizkalah', name: 'Lentilles Vertes 500g',      description: 'Lentilles vertes sèches de qualité',                          price: 1000,  category: 'Alimentation',     emoji: '🫘', available: true,  popular: false },
  { id: 'p73', shopId: 'rizkalah', name: 'Fromage La Vache Qui Rit',   description: '8 portions de fromage fondu importé',                         price: 1800,  category: 'Produits laitiers',emoji: '🧀', available: true,  popular: true  },
  { id: 'p74', shopId: 'rizkalah', name: 'Jus Candia Multifruits 1L',  description: 'Jus multifruits 100% naturel — 1 litre',                      price: 1500,  category: 'Boissons',         emoji: '🧃', available: true,  popular: true  },
  { id: 'p75', shopId: 'rizkalah', name: 'Spaghetti De Cecco 500g',    description: 'Spaghetti italiens de qualité supérieure',                    price: 1400,  category: 'Alimentation',     emoji: '🍝', available: true,  popular: false },
  { id: 'p76', shopId: 'rizkalah', name: 'Biscuits Digestive 400g',    description: 'Biscuits McVitie\'s Digestive — idéal au thé',                price: 2200,  category: 'Snacks',           emoji: '🍪', available: true,  popular: false },
  { id: 'p77', shopId: 'rizkalah', name: 'Thon en Boîte Calvo 185g',   description: 'Thon au naturel de qualité supérieure',                       price: 1600,  category: 'Conserves',        emoji: '🐟', available: true,  popular: true  },
  { id: 'p78', shopId: 'rizkalah', name: 'Chips Pringles Original',     description: 'Chips Pringles en tube — goût Original',                     price: 2500,  category: 'Snacks',           emoji: '🥔', available: true,  popular: true  },

  // ── OCHAN (ochan) ────────────────────────────────────────
  { id: 'p79', shopId: 'ochan', name: 'Attiéké Emballé 1kg',      description: 'Attiéké de manioc frais emballé sous vide',                       price: 800,   category: 'Alimentation',     emoji: '🫙', available: true,  popular: true  },
  { id: 'p80', shopId: 'ochan', name: 'Gari de Manioc 1kg',        description: 'Gari blanc de manioc — semoule traditionnelle',                  price: 700,   category: 'Alimentation',     emoji: '🌾', available: true,  popular: true  },
  { id: 'p81', shopId: 'ochan', name: 'Piment Séché Moulu 100g',   description: 'Piment rouge séché moulu — fort et parfumé',                     price: 300,   category: 'Condiments',       emoji: '🌶️', available: true,  popular: false },
  { id: 'p82', shopId: 'ochan', name: 'Huile de Palme 1L',         description: 'Huile de palme traditionnelle — 1 litre',                        price: 1400,  category: 'Alimentation',     emoji: '🫙', available: true,  popular: true  },
  { id: 'p83', shopId: 'ochan', name: 'Cube Maggi Crevette (24)',   description: 'Bouillon saveur crevette — boîte de 24 cubes',                   price: 500,   category: 'Condiments',       emoji: '🧂', available: true,  popular: true  },
  { id: 'p84', shopId: 'ochan', name: 'Feuilles de Manioc 500g',   description: 'Feuilles de manioc fraîches — pour sauce',                       price: 400,   category: 'Alimentation',     emoji: '🌿', available: true,  popular: false },
  { id: 'p85', shopId: 'ochan', name: 'Savon Savane 400g',         description: 'Savon de lessive artisanal — grand lavage',                      price: 500,   category: 'Ménager',          emoji: '🧼', available: true,  popular: false },
  { id: 'p86', shopId: 'ochan', name: 'Sucre Roux 500g',           description: 'Sucre roux naturel — moins raffiné',                             price: 450,   category: 'Alimentation',     emoji: '🍬', available: true,  popular: false },
  { id: 'p87', shopId: 'ochan', name: 'Riz Brisé Local 5kg',       description: 'Riz brisé de production locale — prix doux',                     price: 3000,  category: 'Alimentation',     emoji: '🌾', available: true,  popular: true  },

  // ── SUPER BAKUS (bakus) ──────────────────────────────────
  { id: 'p88', shopId: 'bakus', name: 'Riz Étuvé Premium 5kg',    description: 'Riz étuvé de qualité — cuisson facile',                           price: 4200,  category: 'Alimentation',     emoji: '🌾', available: true,  popular: true  },
  { id: 'p89', shopId: 'bakus', name: 'Lait en Poudre Nido 400g', description: 'Lait entier en poudre Nido — riche en vitamines',                 price: 3500,  category: 'Produits laitiers',emoji: '🥛', available: true,  popular: true  },
  { id: 'p90', shopId: 'bakus', name: 'Chocolat Poulain 400g',    description: 'Chocolat en poudre sucré — petit-déjeuner',                       price: 3200,  category: 'Alimentation',     emoji: '🍫', available: true,  popular: true  },
  { id: 'p91', shopId: 'bakus', name: 'Dentifrice Colgate 75ml',  description: 'Dentifrice Triple Action Colgate',                                price: 1500,  category: 'Hygiène',          emoji: '🦷', available: true,  popular: false },
  { id: 'p92', shopId: 'bakus', name: 'Shampooing Pantène 200ml', description: 'Shampooing soin répare & protège',                                price: 2500,  category: 'Hygiène',          emoji: '🧴', available: true,  popular: false },
  { id: 'p93', shopId: 'bakus', name: 'Haricots Rouges 1kg',      description: 'Haricots rouges secs — pour plats mijotés',                       price: 1200,  category: 'Alimentation',     emoji: '🫘', available: true,  popular: false },
  { id: 'p94', shopId: 'bakus', name: 'Bouillon Jumbo (20 pcs)',   description: 'Bouillon Jumbo Poulet — boîte de 20',                             price: 800,   category: 'Condiments',       emoji: '🍗', available: true,  popular: true  },
  { id: 'p95', shopId: 'bakus', name: 'Eau de Javel 1L',          description: 'Eau de javel désinfectante — maison propre',                      price: 700,   category: 'Ménager',          emoji: '🧪', available: true,  popular: false },
  { id: 'p96', shopId: 'bakus', name: 'Jus d\'Orange Pur Jus 1L', description: 'Jus d\'orange 100% naturel sans sucre ajouté',                    price: 2000,  category: 'Boissons',         emoji: '🍊', available: true,  popular: true  },

  // ── PANICOM (panicom) ────────────────────────────────────
  { id: 'p97',  shopId: 'panicom', name: 'Riz Brisé 5kg',              description: 'Riz brisé économique — cuisson rapide',                       price: 3500,  category: 'Alimentation',     emoji: '🌾', available: true,  popular: true  },
  { id: 'p98',  shopId: 'panicom', name: 'Papier Hygiénique (6 roul)', description: 'Papier toilette double épaisseur — 6 rouleaux',               price: 1500,  category: 'Ménager',          emoji: '🧻', available: true,  popular: true  },
  { id: 'p99',  shopId: 'panicom', name: 'Liquide Vaisselle 500ml',    description: 'Liquide vaisselle dégraissant Palmolive',                     price: 1200,  category: 'Ménager',          emoji: '🍽️', available: true,  popular: false },
  { id: 'p100', shopId: 'panicom', name: 'Lessive Ariel 1kg',          description: 'Lessive en poudre Ariel — brillance longue durée',            price: 1800,  category: 'Ménager',          emoji: '🧺', available: true,  popular: true  },
  { id: 'p101', shopId: 'panicom', name: 'Déodorant Axe 150ml',        description: 'Déodorant spray Axe — 48h de fraîcheur',                      price: 3500,  category: 'Hygiène',          emoji: '💨', available: true,  popular: false },
  { id: 'p102', shopId: 'panicom', name: 'Huile de Maïs 1L',           description: 'Huile de maïs raffinée — légère en cuisson',                  price: 1600,  category: 'Alimentation',     emoji: '🫙', available: true,  popular: false },
  { id: 'p103', shopId: 'panicom', name: 'Céréales Cerelac 400g',      description: 'Farine bébé Nestlé Céréalac — 6 mois+',                       price: 4000,  category: 'Alimentation',     emoji: '🥣', available: true,  popular: false },
  { id: 'p104', shopId: 'panicom', name: 'Thé Lipton (50 sachets)',     description: 'Thé noir Lipton Yellow Label — boîte 50 sachets',             price: 2000,  category: 'Boissons',         emoji: '🍵', available: true,  popular: true  },
  { id: 'p105', shopId: 'panicom', name: 'Tomates Concentrées Heinz',  description: 'Concentré de tomates Heinz 800g — grande taille',              price: 2200,  category: 'Conserves',        emoji: '🍅', available: true,  popular: false },

  // ── SOCOCE (sococe) ──────────────────────────────────────
  { id: 'p106', shopId: 'sococe', name: 'Riz Jasmin Thaïlande 5kg',   description: 'Riz jasmin parfumé premium — importé de Thaïlande',            price: 7000,  category: 'Alimentation',     emoji: '🌾', available: true,  popular: true  },
  { id: 'p107', shopId: 'sococe', name: 'Huile de Tournesol 2L',      description: 'Huile de tournesol Lesieur — légère et saine',                 price: 4500,  category: 'Alimentation',     emoji: '🫙', available: true,  popular: true  },
  { id: 'p108', shopId: 'sococe', name: 'Fromage Edam 300g',          description: 'Fromage Edam hollandais en meule — à trancher',                price: 5500,  category: 'Produits laitiers',emoji: '🧀', available: true,  popular: false },
  { id: 'p109', shopId: 'sococe', name: 'Yaourt Activia (4 x 125g)', description: 'Yaourt nature Danone Activia — 4 pots',                         price: 2500,  category: 'Produits laitiers',emoji: '🥛', available: true,  popular: true  },
  { id: 'p110', shopId: 'sococe', name: 'Jambon Cuit Halal 200g',     description: 'Jambon cuit certifié halal — qualité traiteur',                price: 3500,  category: 'Charcuterie',      emoji: '🥩', available: true,  popular: false },
  { id: 'p111', shopId: 'sococe', name: 'Nutella 400g',               description: 'Pâte à tartiner Nutella — pot de 400g',                        price: 6500,  category: 'Snacks',           emoji: '🍫', available: true,  popular: true  },
  { id: 'p112', shopId: 'sococe', name: 'Céréales Kellogg\'s 500g',   description: 'Corn Flakes Kellogg\'s — petit-déjeuner classique',            price: 5000,  category: 'Alimentation',     emoji: '🥣', available: true,  popular: false },
  { id: 'p113', shopId: 'sococe', name: 'Lessive Skip 2kg',           description: 'Lessive Skip Active Clean — 2kg',                              price: 4500,  category: 'Ménager',          emoji: '🧺', available: true,  popular: false },
  { id: 'p114', shopId: 'sococe', name: 'Mayonnaise Heinz 450g',      description: 'Mayonnaise Heinz authentique — pot 450g',                      price: 3200,  category: 'Condiments',       emoji: '🥫', available: true,  popular: true  },
  { id: 'p115', shopId: 'sococe', name: 'Bières Heineken (6 x 33cl)', description: 'Pack 6 canettes Heineken 33cl fraîches',                       price: 6000,  category: 'Boissons',         emoji: '🍺', available: true,  popular: true  },

  // ── Boulangerie du Roi (s4) ──────────────────────────────
  { id: 'p17', shopId: 's4', name: 'Baguette Tradition',         description: 'Baguette de pain tradition française',                              price: 200,   category: 'Pain',             emoji: '🥖', available: true,  popular: true  },
  { id: 'p18', shopId: 's4', name: 'Croissant au Beurre',        description: 'Croissant pur beurre artisanal',                                   price: 300,   category: 'Viennoiserie',     emoji: '🥐', available: true,  popular: true  },
  { id: 'p19', shopId: 's4', name: 'Pain au Chocolat',           description: 'Pain au chocolat noir',                                            price: 300,   category: 'Viennoiserie',     emoji: '🍫', available: true,  popular: true  },
  { id: 'p20', shopId: 's4', name: "Gâteau d'Anniversaire",      description: 'Sur commande, décorations personnalisées',                         price: 15000, category: 'Pâtisserie',       emoji: '🎂', available: true,  popular: false },
  { id: 'p21', shopId: 's4', name: 'Sandwich Thon-Mayo',         description: 'Baguette, thon, mayonnaise, tomate',                              price: 1000,  category: 'Sandwichs',        emoji: '🥪', available: true,  popular: true  },

  // ── Grillade Palace (s5) ─────────────────────────────────
  { id: 'p22', shopId: 's5', name: 'Poulet Braisé Entier',       description: 'Poulet entier grillé au charbon avec garniture',                   price: 5000,  category: 'Grillades',        emoji: '🍗', available: true,  popular: true  },
  { id: 'p23', shopId: 's5', name: 'Demi Poulet Braisé',         description: 'Demi poulet grillé avec frites et sauce',                         price: 2500,  category: 'Grillades',        emoji: '🍗', available: true,  popular: true  },
  { id: 'p24', shopId: 's5', name: 'Brochettes Bœuf (5 pcs)',    description: '5 brochettes de bœuf marinées et grillées',                       price: 2000,  category: 'Brochettes',       emoji: '🍢', available: true,  popular: true  },
  { id: 'p25', shopId: 's5', name: 'Côtes de Porc Grillées',     description: 'Côtes marinées, grillées au charbon',                             price: 3000,  category: 'Grillades',        emoji: '🥩', available: true,  popular: false },
  { id: 'p26', shopId: 's5', name: 'Alloco Grillé',              description: 'Bananes plantain grillées au charbon',                            price: 500,   category: 'Accompagnements',  emoji: '🍌', available: true,  popular: false },

  // ── Bar Glacier Frais (s6) ───────────────────────────────
  { id: 'p27', shopId: 's6', name: 'Jus de Bissap Frais',        description: "Jus d'hibiscus frais — 1 litre",                                  price: 1000,  category: 'Jus frais',        emoji: '🍹', available: true,  popular: true  },
  { id: 'p28', shopId: 's6', name: 'Coca-Cola 33cl',             description: 'Coca-Cola en canette fraîche',                                    price: 500,   category: 'Sodas',            emoji: '🥤', available: true,  popular: true  },
  { id: 'p29', shopId: 's6', name: 'Citronnade Menthe',          description: 'Citronnade avec feuilles de menthe',                              price: 700,   category: 'Jus frais',        emoji: '🍋', available: true,  popular: false },
  { id: 'p30', shopId: 's6', name: 'Glace Vanille (2 boules)',   description: 'Glace artisanale vanille',                                        price: 500,   category: 'Glaces',           emoji: '🍦', available: true,  popular: true  },
  { id: 'p31', shopId: 's6', name: 'Eau Minérale 1.5L',         description: 'Eau minérale naturelle fraîche',                                  price: 500,   category: 'Eaux',             emoji: '💧', available: true,  popular: false },

  // ── Boucherie Chez Koné (s7) ─────────────────────────────
  { id: 'p32', shopId: 's7', name: 'Bœuf à Braiser (1kg)',       description: 'Viande de bœuf en morceaux pour ragoût ou braisé',                price: 3500,  category: 'Bœuf',             emoji: '🥩', available: true,  popular: true  },
  { id: 'p33', shopId: 's7', name: 'Viande Hachée Bœuf (500g)', description: 'Bœuf haché frais du jour',                                        price: 2000,  category: 'Bœuf',             emoji: '🥩', available: true,  popular: true  },
  { id: 'p34', shopId: 's7', name: 'Côtes de Bœuf (1kg)',        description: 'Côtes avec os pour bouillon ou grillade',                         price: 3000,  category: 'Bœuf',             emoji: '🦴', available: true,  popular: false },
  { id: 'p35', shopId: 's7', name: 'Gigot de Mouton (1kg)',      description: 'Mouton frais, idéal pour le garba et les fêtes',                  price: 4000,  category: 'Mouton',           emoji: '🐑', available: true,  popular: true  },
  { id: 'p36', shopId: 's7', name: 'Mouton Haché (500g)',        description: 'Mouton haché frais pour boulettes et sauces',                     price: 2500,  category: 'Mouton',           emoji: '🥩', available: true,  popular: false },
  { id: 'p37', shopId: 's7', name: 'Côtelettes de Porc (1kg)',   description: 'Côtelettes de porc fraîches pour grillade',                       price: 2500,  category: 'Porc',             emoji: '🥓', available: true,  popular: true  },
  { id: 'p38', shopId: 's7', name: 'Poulet Entier Vif (~2kg)',   description: 'Poulet fermier vif — plumé et vidé à la demande',                 price: 3000,  category: 'Volaille',         emoji: '🐓', available: true,  popular: true  },
  { id: 'p39', shopId: 's7', name: 'Foie de Bœuf (500g)',        description: 'Foie frais riche en fer',                                         price: 1500,  category: 'Abats',            emoji: '🫀', available: true,  popular: false },
  { id: 'p40', shopId: 's7', name: 'Tripes (500g)',              description: 'Tripes nettoyées — pour sauce fétri ou kedjenou',                 price: 1200,  category: 'Abats',            emoji: '🍲', available: false, popular: false },
];

const fp = (id: string): Product => products.find(p => p.id === id)!;

export const deliveryPersons: DeliveryPerson[] = [
  { id: 'd1', name: 'Kofi Asante',  phone: '+225 07 12 34 56', vehicle: 'moto', rating: 4.9, totalDeliveries: 347, isAvailable: true,  avatar: '🧑🏿' },
  { id: 'd2', name: 'Ama Kouamé',   phone: '+225 05 98 76 54', vehicle: 'moto', rating: 4.7, totalDeliveries: 213, isAvailable: false, currentOrderId: 'ABG-001', avatar: '👩🏿' },
  { id: 'd3', name: 'Yao Brou',     phone: '+225 01 23 45 67', vehicle: 'velo', rating: 4.5, totalDeliveries: 89,  isAvailable: true,  avatar: '🧑🏿' },
];

export const mockSupplierAccounts: SupplierAccount[] = [
  { id: 'sup1',  shopId: 's1',       shopName: 'Maquis Chez Mariama', ownerName: 'Mariama Coulibaly',  email: 'mariama@express.ci',    phone: '+225 07 11 22 33', status: 'active',    joinedDate: '2024-01-15', commissionRate: 15, accessCode: 'MAR001' },
  { id: 'sup2',  shopId: 's2',       shopName: 'Pharmacie Centrale',  ownerName: 'Dr. Konan Yves',     email: 'pharmacie@express.ci',  phone: '+225 05 44 55 66', status: 'active',    joinedDate: '2024-02-03', commissionRate: 10, accessCode: 'PHA002' },
  { id: 'sup3',  shopId: 'bon-prix', shopName: 'BON PRIX',            ownerName: 'Kouamé Arsène',      email: 'bonprix@express.ci',    phone: '+225 07 22 11 33', status: 'active',    joinedDate: '2024-01-10', commissionRate: 8,  accessCode: 'BON003' },
  { id: 'sup4',  shopId: 's4',       shopName: 'Boulangerie du Roi',  ownerName: 'Jean-Pierre Akissi', email: 'boulangerie@express.ci',phone: '+225 07 33 22 11', status: 'active',    joinedDate: '2024-03-10', commissionRate: 12, accessCode: 'ROI004' },
  { id: 'sup5',  shopId: 's5',       shopName: 'Grillade Palace',     ownerName: 'Traoré Moussa',      email: 'grillade@express.ci',   phone: '+225 05 66 77 88', status: 'pending',   joinedDate: '2024-06-01', commissionRate: 15, accessCode: 'GRI005' },
  { id: 'sup6',  shopId: 's6',       shopName: 'Bar Glacier Frais',   ownerName: 'Adjoua Nadia',       email: 'glacier@express.ci',    phone: '+225 01 99 00 11', status: 'suspended', joinedDate: '2024-04-20', commissionRate: 10, accessCode: 'GLA006' },
  { id: 'sup7',  shopId: 's7',       shopName: 'Boucherie Chez Koné', ownerName: 'Koné Mamadou',       email: 'boucherie@express.ci',  phone: '+225 07 55 44 33', status: 'active',    joinedDate: '2024-05-12', commissionRate: 12, accessCode: 'KON007' },
  { id: 'sup8',  shopId: 'cdci',     shopName: 'CDCI',                ownerName: 'Diallo Seydou',      email: 'cdci@express.ci',       phone: '+225 05 33 44 55', status: 'active',    joinedDate: '2024-02-20', commissionRate: 8,  accessCode: 'CDC008' },
  { id: 'sup9',  shopId: 'rizkalah', shopName: 'Chez Rizkalah',       ownerName: 'Rizkalah Georges',   email: 'rizkalah@express.ci',   phone: '+225 07 88 99 00', status: 'active',    joinedDate: '2024-03-05', commissionRate: 10, accessCode: 'RIZ009' },
  { id: 'sup10', shopId: 'ochan',    shopName: 'OCHAN',               ownerName: 'Bamba Fatou',        email: 'ochan@express.ci',      phone: '+225 01 55 66 77', status: 'active',    joinedDate: '2024-01-25', commissionRate: 8,  accessCode: 'OCH010' },
  { id: 'sup11', shopId: 'bakus',    shopName: 'SUPER BAKUS',         ownerName: 'Tanoh Bernadette',   email: 'bakus@express.ci',      phone: '+225 05 11 22 33', status: 'active',    joinedDate: '2024-04-08', commissionRate: 10, accessCode: 'BAK011' },
  { id: 'sup12', shopId: 'panicom',  shopName: 'PANICOM',             ownerName: 'Abouo Jean-Marc',    email: 'panicom@express.ci',    phone: '+225 07 44 55 66', status: 'pending',   joinedDate: '2024-05-30', commissionRate: 10, accessCode: 'PAN012' },
  { id: 'sup13', shopId: 'sococe',   shopName: 'SOCOCE',              ownerName: 'Guédé Armand',       email: 'sococe@express.ci',     phone: '+225 01 66 77 88', status: 'active',    joinedDate: '2023-12-01', commissionRate: 7,  accessCode: 'SOC013' },
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
    shopId: 'bon-prix', shopName: 'BON PRIX',
    items: [{ product: fp('p50'), quantity: 1 }, { product: fp('p51'), quantity: 2 }, { product: fp('p54'), quantity: 1 }],
    status: 'ready', paymentMethod: 'mtn_money',
    deliveryAddress: 'Cité ouvrière, n°22', deliveryNeighborhood: 'Stade Municipal',
    subtotal: 7050, deliveryFee: 600, total: 7650, createdAt: ago(15), estimatedDelivery: '20 min',
  },
];
