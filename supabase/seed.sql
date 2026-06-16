-- ============================================================
-- Abengourou Express — Données initiales (seed)
-- ============================================================

-- Shops
insert into shops (id, name, category, description, address, neighborhood, rating, review_count, delivery_time, delivery_fee, min_order, is_open, emoji, featured, cover_color) values
('s1', 'Maquis Chez Mariama', 'restaurant', 'Cuisine ivoirienne authentique — Attiéké, Riz sauce, Poisson braisé', 'Rue du Commerce', 'Centre-ville', 4.8, 124, '20-35 min', 500, 1500, true, '🍽️', true, 'from-orange-500 to-yellow-500'),
('s2', 'Pharmacie Centrale', 'pharmacy', 'Médicaments, produits de santé et parapharmacie', 'Av. Houphouët-Boigny', 'Centre-ville', 4.9, 87, '15-25 min', 500, 1000, true, '💊', true, 'from-blue-500 to-cyan-500'),
('s3', 'Supermarché Le Bonheur', 'supermarket', 'Épicerie, produits alimentaires et ménagers', 'Boulevard du 7 Décembre', 'Stade Municipal', 4.6, 203, '25-40 min', 700, 2000, true, '🛒', false, 'from-green-500 to-emerald-600'),
('s4', 'Boulangerie du Roi', 'bakery', 'Pain frais, viennoiseries et pâtisseries artisanales', 'Quartier Résidentiel', 'Résidentiel', 4.7, 156, '15-25 min', 500, 500, true, '🥐', false, 'from-yellow-500 to-amber-500'),
('s5', 'Grillade Palace', 'restaurant', 'Poulet braisé, côtes de bœuf, alloco et brochettes', 'Quartier Kennedy', 'Kennedy', 4.5, 89, '30-45 min', 600, 2000, true, '🍗', true, 'from-red-500 to-orange-500'),
('s6', 'Bar Glacier Frais', 'drinks', 'Jus de fruits frais, boissons fraîches, glaces artisanales', 'Marché Central', 'Marché', 4.4, 67, '10-20 min', 500, 1000, true, '🥤', false, 'from-purple-500 to-pink-500'),
('s7', 'Boucherie Chez Koné', 'butcher', 'Viandes fraîches de qualité — Bœuf, Mouton, Porc, Abats', 'Marché Central, Allée des Bouchers', 'Marché', 4.6, 112, '20-35 min', 600, 2000, true, '🥩', true, 'from-red-700 to-rose-600')
on conflict (id) do nothing;

-- Products — Maquis Chez Mariama
insert into products (id, shop_id, name, description, price, category, emoji, available, popular) values
('p1', 's1', 'Attiéké Poisson Braisé', 'Attiéké frais avec poisson braisé, oignons et tomates', 2000, 'Plats principaux', '🐟', true, true),
('p2', 's1', 'Riz Sauce Arachide', 'Riz blanc avec sauce arachide maison et légumes', 1500, 'Plats principaux', '🍚', true, true),
('p3', 's1', 'Foutou Banane Sauce Graine', 'Foutou de banane plantain avec sauce de graine de palme', 1500, 'Plats principaux', '🫙', true, false),
('p4', 's1', 'Alloco au Poisson Fumé', 'Bananes plantain frites avec poisson fumé', 1000, 'Accompagnements', '🍌', true, true),
('p5', 's1', 'Jus Gingembre Maison', 'Jus de gingembre frais avec citron et miel', 500, 'Boissons', '🍹', true, false),
-- Pharmacie
('p6', 's2', 'Paracétamol 500mg', 'Boîte de 16 comprimés — Antidouleur', 600, 'Médicaments', '💊', true, true),
('p7', 's2', 'Coartem Antipaludéen', 'Traitement antipaludéen — 24 comprimés', 2500, 'Médicaments', '💊', true, true),
('p8', 's2', 'Savon Antiseptique Dettol', 'Savon liquide antibactérien 250ml', 1500, 'Hygiène', '🧼', true, false),
('p9', 's2', 'Gel Hydroalcoolique', 'Solution désinfectante 100ml', 1000, 'Hygiène', '🧴', true, false),
('p10', 's2', 'Thermomètre Digital', 'Thermomètre médical numérique', 3500, 'Matériel', '🌡️', true, false),
-- Supermarché
('p11', 's3', 'Riz Parfumé 5kg', 'Riz parfumé de qualité supérieure', 4000, 'Alimentation', '🌾', true, true),
('p12', 's3', 'Huile de Palme 1L', 'Huile de palme pure 1 litre', 1500, 'Alimentation', '🫙', true, true),
('p13', 's3', 'Tomates Concentrées 800g', 'Boîte de concentré de tomates', 800, 'Conserves', '🍅', true, false),
('p14', 's3', 'Sucre 1kg', 'Sucre blanc raffiné', 700, 'Alimentation', '🍬', true, false),
('p15', 's3', 'Lait Concentré Gloria', 'Lait concentré sucré 397g', 900, 'Produits laitiers', '🥛', true, true),
('p16', 's3', 'Lessive OMO 1kg', 'Lessive en poudre OMO', 1200, 'Ménager', '🧺', true, false),
-- Boulangerie
('p17', 's4', 'Baguette Tradition', 'Baguette de pain tradition française', 200, 'Pain', '🥖', true, true),
('p18', 's4', 'Croissant au Beurre', 'Croissant pur beurre artisanal', 300, 'Viennoiserie', '🥐', true, true),
('p19', 's4', 'Pain au Chocolat', 'Pain au chocolat noir', 300, 'Viennoiserie', '🍫', true, true),
('p20', 's4', 'Gâteau d''Anniversaire', 'Sur commande, décorations personnalisées', 15000, 'Pâtisserie', '🎂', true, false),
('p21', 's4', 'Sandwich Thon-Mayo', 'Baguette, thon, mayonnaise, tomate', 1000, 'Sandwichs', '🥪', true, true),
-- Grillade Palace
('p22', 's5', 'Poulet Braisé Entier', 'Poulet entier grillé au charbon avec garniture', 5000, 'Grillades', '🍗', true, true),
('p23', 's5', 'Demi Poulet Braisé', 'Demi poulet grillé avec frites et sauce', 2500, 'Grillades', '🍗', true, true),
('p24', 's5', 'Brochettes Bœuf (5 pcs)', '5 brochettes de bœuf marinées et grillées', 2000, 'Brochettes', '🍢', true, true),
('p25', 's5', 'Côtes de Porc Grillées', 'Côtes marinées, grillées au charbon', 3000, 'Grillades', '🥩', true, false),
('p26', 's5', 'Alloco Grillé', 'Bananes plantain grillées au charbon', 500, 'Accompagnements', '🍌', true, false),
-- Bar Glacier
('p27', 's6', 'Jus de Bissap Frais', 'Jus d''hibiscus frais — 1 litre', 1000, 'Jus frais', '🍹', true, true),
('p28', 's6', 'Coca-Cola 33cl', 'Coca-Cola en canette fraîche', 500, 'Sodas', '🥤', true, true),
('p29', 's6', 'Citronnade Menthe', 'Citronnade avec feuilles de menthe', 700, 'Jus frais', '🍋', true, false),
('p30', 's6', 'Glace Vanille (2 boules)', 'Glace artisanale vanille', 500, 'Glaces', '🍦', true, true),
('p31', 's6', 'Eau Minérale 1.5L', 'Eau minérale naturelle fraîche', 500, 'Eaux', '💧', true, false),
-- Boucherie Chez Koné
('p32', 's7', 'Bœuf à Braiser (1kg)', 'Viande de bœuf en morceaux pour ragoût ou braisé', 3500, 'Bœuf', '🥩', true, true),
('p33', 's7', 'Viande Hachée Bœuf (500g)', 'Bœuf haché frais du jour', 2000, 'Bœuf', '🥩', true, true),
('p34', 's7', 'Côtes de Bœuf (1kg)', 'Côtes avec os pour bouillon ou grillade', 3000, 'Bœuf', '🦴', true, false),
('p35', 's7', 'Gigot de Mouton (1kg)', 'Mouton frais, idéal pour le garba et les fêtes', 4000, 'Mouton', '🐑', true, true),
('p36', 's7', 'Mouton Haché (500g)', 'Mouton haché frais pour boulettes et sauces', 2500, 'Mouton', '🥩', true, false),
('p37', 's7', 'Côtelettes de Porc (1kg)', 'Côtelettes de porc fraîches pour grillade', 2500, 'Porc', '🥓', true, true),
('p38', 's7', 'Poulet Entier Vif (2kg~)', 'Poulet fermier vif — plumé et vidé à la demande', 3000, 'Volaille', '🐓', true, true),
('p39', 's7', 'Foie de Bœuf (500g)', 'Foie frais riche en fer', 1500, 'Abats', '🫀', true, false),
('p40', 's7', 'Tripes (500g)', 'Tripes nettoyées — pour sauce fétri ou kedjenou', 1200, 'Abats', '🍲', false, false)
on conflict (id) do nothing;

-- Delivery persons
insert into delivery_persons (id, name, phone, vehicle, rating, total_deliveries, is_available, avatar) values
('d1', 'Kofi Asante', '+225 07 12 34 56', 'moto', 4.9, 347, true, '🧑🏿'),
('d2', 'Ama Kouamé', '+225 05 98 76 54', 'moto', 4.7, 213, false, '👩🏿'),
('d3', 'Yao Brou', '+225 01 23 45 67', 'velo', 4.5, 89, true, '🧑🏿')
on conflict (id) do nothing;

-- Supplier accounts
insert into supplier_accounts (id, shop_id, shop_name, owner_name, email, phone, status, joined_date, commission_rate, access_code) values
('sup1', 's1', 'Maquis Chez Mariama', 'Mariama Coulibaly', 'mariama@express.ci', '+225 07 11 22 33', 'active', '2024-01-15', 15, 'MAR001'),
('sup2', 's2', 'Pharmacie Centrale', 'Dr. Konan Yves', 'pharmacie@express.ci', '+225 05 44 55 66', 'active', '2024-02-03', 10, 'PHA002'),
('sup3', 's3', 'Supermarché Le Bonheur', 'Brou Amenan', 'bonheur@express.ci', '+225 01 77 88 99', 'active', '2024-01-28', 12, 'BON003'),
('sup4', 's4', 'Boulangerie du Roi', 'Jean-Pierre Akissi', 'boulangerie@express.ci', '+225 07 33 22 11', 'active', '2024-03-10', 12, 'ROI004'),
('sup5', 's5', 'Grillade Palace', 'Traoré Moussa', 'grillade@express.ci', '+225 05 66 77 88', 'pending', '2024-06-01', 15, 'GRI005'),
('sup6', 's6', 'Bar Glacier Frais', 'Adjoua Nadia', 'glacier@express.ci', '+225 01 99 00 11', 'suspended', '2024-04-20', 10, 'GLA006'),
('sup7', 's7', 'Boucherie Chez Koné', 'Koné Mamadou', 'boucherie@express.ci', '+225 07 55 44 33', 'active', '2024-05-12', 12, 'KON007')
on conflict (id) do nothing;
