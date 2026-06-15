import { jsPDF } from 'jspdf';
import { Order } from '../types';

// ── Helpers ─────────────────────────────────────────────────

const BRAND = 'Abengourou Express';
const TAGLINE = 'Livraison & Courses rapides — Abengourou, Côte d\'Ivoire';
const CONTACT = 'Tél : +225 07 00 00 00 00';
const GREEN = [22, 163, 74] as [number, number, number];
const DARK  = [30, 30, 30]  as [number, number, number];
const GRAY  = [120, 120, 120] as [number, number, number];
const LIGHT = [245, 250, 245] as [number, number, number];

const STATUS_LABELS: Record<string, string> = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  preparing:  'En préparation',
  ready:      'Prête',
  picked_up:  'Récupérée',
  delivering: 'En livraison',
  delivered:  'Livrée',
  cancelled:  'Annulée',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash:         'Espèces (à la livraison)',
  orange_money: 'Orange Money',
  mtn_money:    'MTN Mobile Money',
};

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

// ── Header shared by all PDF types ──────────────────────────

function drawHeader(doc: jsPDF, subtitle: string) {
  const W = doc.internal.pageSize.getWidth();

  // Green banner
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 28, 'F');

  // Brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(BRAND, 14, 11);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 240, 210);
  doc.text(TAGLINE, 14, 17);
  doc.text(CONTACT, 14, 22);

  // Subtitle badge (right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(subtitle, W - 14, 14, { align: 'right' });

  return 34; // Y cursor after header
}

// ── Section label ────────────────────────────────────────────

function sectionLabel(doc: jsPDF, text: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GREEN);
  doc.text(text.toUpperCase(), 14, y);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.line(14, y + 1, 196, y + 1);
  return y + 6;
}

// ── Key-value row ────────────────────────────────────────────

function kv(doc: jsPDF, label: string, value: string, y: number, bold = false) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(label + ' :', 14, y);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setTextColor(...DARK);
  doc.text(value, 70, y);
  return y + 6;
}

// ── Items table ──────────────────────────────────────────────

function drawItemsTable(doc: jsPDF, order: Order, y: number): number {
  const W = doc.internal.pageSize.getWidth();

  // Table header
  doc.setFillColor(...GREEN);
  doc.rect(14, y, W - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Article', 17, y + 5);
  doc.text('Qté', 130, y + 5, { align: 'right' });
  doc.text('P.U.', 160, y + 5, { align: 'right' });
  doc.text('Total', W - 16, y + 5, { align: 'right' });
  y += 9;

  // Rows
  let bg = false;
  for (const { product, quantity } of order.items) {
    const lineTotal = product.price * quantity;
    if (bg) {
      doc.setFillColor(...LIGHT);
      doc.rect(14, y - 4, W - 28, 7, 'F');
    }
    bg = !bg;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    const name = `${product.emoji ?? ''} ${product.name}`.trim();
    doc.text(name, 17, y);
    doc.text(String(quantity), 130, y, { align: 'right' });
    doc.text(formatPrice(product.price), 160, y, { align: 'right' });
    doc.text(formatPrice(lineTotal), W - 16, y, { align: 'right' });
    y += 7;
  }

  // Shopping list items (courses)
  if (order.shoppingList && order.shoppingList.length > 0) {
    for (const item of order.shoppingList) {
      if (bg) {
        doc.setFillColor(...LIGHT);
        doc.rect(14, y - 4, W - 28, 7, 'F');
      }
      bg = !bg;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
      doc.text(`🛒 ${item.name}`, 17, y);
      doc.text(item.quantity, 130, y, { align: 'right' });
      if (item.estimatedPrice) {
        doc.text(formatPrice(item.estimatedPrice), W - 16, y, { align: 'right' });
      }
      y += 7;
    }
  }

  return y + 2;
}

// ── Totals box ───────────────────────────────────────────────

function drawTotals(doc: jsPDF, order: Order, y: number): number {
  const W = doc.internal.pageSize.getWidth();
  const boxX = W - 90;
  const boxW = 76;

  const rows: [string, string, boolean][] = [
    ['Sous-total', formatPrice(order.subtotal), false],
    ['Frais de livraison', formatPrice(order.deliveryFee), false],
  ];
  if (order.shoppingFee) rows.push(['Frais de courses', formatPrice(order.shoppingFee), false]);
  if (order.depositAmount) rows.push(['Avance versée', formatPrice(order.depositAmount), false]);
  rows.push(['TOTAL', formatPrice(order.total), true]);

  const rowH = 6.5;
  const totalH = rows.length * rowH + 4;
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, y, boxW, totalH, 2, 2, 'FD');

  let ry = y + 5;
  for (const [label, value, bold] of rows) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 8.5);
    doc.setTextColor(bold ? GREEN[0] : DARK[0], bold ? GREEN[1] : DARK[1], bold ? GREEN[2] : DARK[2]);
    doc.text(label, boxX + 4, ry);
    doc.text(value, boxX + boxW - 4, ry, { align: 'right' });
    ry += rowH;
  }

  return y + totalH + 4;
}

// ── Footer ───────────────────────────────────────────────────

function drawFooter(doc: jsPDF, note?: string) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setFillColor(...GREEN);
  doc.rect(0, H - 14, W, 14, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 240, 210);
  doc.text(note ?? 'Merci de votre confiance — Abengourou Express', W / 2, H - 5, { align: 'center' });
}

// ════════════════════════════════════════════════════════════
// 1. REÇU CLIENT
// ════════════════════════════════════════════════════════════

export function generateCustomerReceipt(order: Order): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc, 'REÇU CLIENT');

  // Order summary strip
  doc.setFillColor(...LIGHT);
  doc.rect(14, y, W - 28, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text(`Commande #${shortId(order.id)}`, 20, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(formatDate(order.createdAt), 20, y + 16);

  // Status badge
  const statusColor = order.status === 'delivered' ? GREEN : order.status === 'cancelled' ? [220, 38, 38] as [number, number, number] : [234, 88, 12] as [number, number, number];
  doc.setFillColor(...statusColor);
  doc.roundedRect(W - 60, y + 5, 46, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(STATUS_LABELS[order.status] ?? order.status, W - 37, y + 11.5, { align: 'center' });
  y += 28;

  // Client info
  y = sectionLabel(doc, 'Informations client', y);
  y = kv(doc, 'Nom', order.customerName, y);
  y = kv(doc, 'Téléphone', order.customerPhone, y);
  y = kv(doc, 'Adresse', order.deliveryAddress, y);
  y = kv(doc, 'Quartier', order.deliveryNeighborhood, y);
  if (order.notes) y = kv(doc, 'Notes', order.notes, y);
  y += 4;

  // Order info
  y = sectionLabel(doc, 'Détails de la commande', y);
  y = kv(doc, 'Boutique', order.shopName, y);
  y = kv(doc, 'Type', order.orderType === 'shopping' ? 'Service Courses' : 'Livraison boutique', y);
  y = kv(doc, 'Paiement', PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod, y);
  if (order.deliveryPersonName) y = kv(doc, 'Livreur', order.deliveryPersonName, y);
  if (order.estimatedDelivery) y = kv(doc, 'Livraison estimée', order.estimatedDelivery, y);
  y += 4;

  // Items
  y = sectionLabel(doc, 'Articles commandés', y);
  y = drawItemsTable(doc, order, y);
  y += 2;

  // Totals
  y = drawTotals(doc, order, y);

  // Payment notice
  if (order.paymentMethod === 'cash') {
    y += 4;
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, y, W - 28, 10, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 60, 0);
    doc.text(`💵  Montant à préparer : ${formatPrice(order.total)}`, W / 2, y + 6.5, { align: 'center' });
  }

  drawFooter(doc, 'Ce reçu fait foi de votre commande — Conservez-le jusqu\'à réception');
  doc.save(`recu-client-${shortId(order.id)}.pdf`);
}

// ════════════════════════════════════════════════════════════
// 2. BON DE LIVRAISON (livreur)
// ════════════════════════════════════════════════════════════

export function generateDeliverySlip(order: Order): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
  const W = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc, 'BON DE LIVRAISON');

  // Order ID
  doc.setFillColor(...DARK);
  doc.rect(14, y, W - 28, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`#${shortId(order.id)}`, W / 2, y + 8.5, { align: 'center' });
  y += 16;

  // ENLÈVEMENT
  y = sectionLabel(doc, '📦 Enlèvement chez le fournisseur', y);
  y = kv(doc, 'Boutique', order.shopName, y, true);
  y += 2;

  // LIVRAISON
  y = sectionLabel(doc, '📍 Livraison au client', y);
  y = kv(doc, 'Nom', order.customerName, y, true);
  y = kv(doc, 'Téléphone', order.customerPhone, y, true);
  y = kv(doc, 'Adresse', order.deliveryAddress, y);
  y = kv(doc, 'Quartier', order.deliveryNeighborhood, y);
  y += 2;

  // Articles (compact)
  y = sectionLabel(doc, 'Contenu du colis', y);
  if (order.items.length > 0) {
    for (const { product, quantity } of order.items) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
      doc.text(`• ${product.emoji ?? ''} ${product.name}  ×${quantity}`, 17, y);
      y += 5.5;
    }
  } else if (order.shoppingList && order.shoppingList.length > 0) {
    for (const item of order.shoppingList) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
      doc.text(`• 🛒 ${item.name} — ${item.quantity}`, 17, y);
      y += 5.5;
    }
  }
  y += 4;

  // Financial summary
  y = sectionLabel(doc, 'Règlement', y);

  const cashOnDelivery = order.paymentMethod === 'cash';
  doc.setFillColor(cashOnDelivery ? 255 : 240, cashOnDelivery ? 247 : 253, cashOnDelivery ? 237 : 240);
  doc.setDrawColor(cashOnDelivery ? 234 : 22, cashOnDelivery ? 88 : 163, cashOnDelivery ? 12 : 74);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, W - 28, cashOnDelivery ? 22 : 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...cashOnDelivery ? [180, 60, 0] as [number, number, number] : GREEN);
  doc.text(cashOnDelivery ? `💵 Encaissement espèces : ${formatPrice(order.total)}` : `✅ Déjà payé — ${PAYMENT_LABELS[order.paymentMethod]}`, W / 2, y + 6, { align: 'center' });
  if (cashOnDelivery) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(`Dont frais de livraison : ${formatPrice(order.deliveryFee)}`, W / 2, y + 13, { align: 'center' });
    doc.text(`(Déposez ${formatPrice(order.deliveryFee)} à l'agence)`, W / 2, y + 19, { align: 'center' });
  }
  y += cashOnDelivery ? 26 : 18;

  // Signature lines
  y = sectionLabel(doc, 'Signatures', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('Livreur : ___________________________', 14, y + 8);
  doc.text('Client : ____________________________', 14, y + 18);
  doc.text('Date : ______________________________', 14, y + 28);

  drawFooter(doc, 'Bon de livraison interne — Abengourou Express');
  doc.save(`bon-livraison-${shortId(order.id)}.pdf`);
}

// ════════════════════════════════════════════════════════════
// 3. REÇU ADMIN (synthèse toutes commandes)
// ════════════════════════════════════════════════════════════

export function generateAdminOrderReport(orders: Order[], period?: string): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc, 'RAPPORT ADMIN');

  // Period & generation date
  doc.setFillColor(...LIGHT);
  doc.rect(14, y, W - 28, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('Rapport des commandes', 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(period ? `Période : ${period}` : `Généré le ${formatDate(new Date().toISOString())}`, 20, y + 12);
  y += 19;

  // KPI summary
  const total = orders.length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);

  const kpis: [string, string][] = [
    ['Total commandes', String(total)],
    ['Livrées', `${delivered} (${total ? Math.round(delivered / total * 100) : 0}%)`],
    ['Annulées', String(cancelled)],
    ['Chiffre d\'affaires', formatPrice(revenue)],
  ];

  const kpiW = (W - 28) / 4;
  for (let i = 0; i < kpis.length; i++) {
    const [label, value] = kpis[i];
    const x = 14 + i * kpiW;
    doc.setFillColor(i === 3 ? GREEN[0] : 250, i === 3 ? GREEN[1] : 250, i === 3 ? GREEN[2] : 250);
    doc.setDrawColor(...GRAY);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, kpiW - 2, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(i === 3 ? 255 : GREEN[0], i === 3 ? 255 : GREEN[1], i === 3 ? 255 : GREEN[2]);
    doc.text(value, x + kpiW / 2 - 1, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(i === 3 ? 200 : GRAY[0], i === 3 ? 240 : GRAY[1], i === 3 ? 210 : GRAY[2]);
    doc.text(label, x + kpiW / 2 - 1, y + 15.5, { align: 'center' });
  }
  y += 24;

  // Orders table header
  y = sectionLabel(doc, 'Liste des commandes', y);

  const cols = ['#', 'Client', 'Boutique', 'Quartier', 'Total', 'Paiement', 'Statut', 'Date'];
  const colW = [14, 32, 32, 24, 20, 22, 18, 22];
  const colX: number[] = [];
  let cx = 14;
  for (const w of colW) { colX.push(cx); cx += w; }

  doc.setFillColor(...DARK);
  doc.rect(14, y, W - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  for (let i = 0; i < cols.length; i++) {
    doc.text(cols[i], colX[i] + 1, y + 5);
  }
  y += 9;

  // Orders rows
  let bg = false;
  for (const o of orders) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    if (bg) {
      doc.setFillColor(...LIGHT);
      doc.rect(14, y - 4, W - 28, 7, 'F');
    }
    bg = !bg;

    const row = [
      shortId(o.id),
      o.customerName.length > 14 ? o.customerName.slice(0, 13) + '…' : o.customerName,
      o.shopName.length > 14 ? o.shopName.slice(0, 13) + '…' : o.shopName,
      o.deliveryNeighborhood,
      formatPrice(o.total),
      o.paymentMethod === 'cash' ? 'Espèces' : o.paymentMethod === 'orange_money' ? 'Orange' : 'MTN',
      STATUS_LABELS[o.status] ?? o.status,
      new Date(o.createdAt).toLocaleDateString('fr-FR'),
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    for (let i = 0; i < row.length; i++) {
      doc.text(row[i], colX[i] + 1, y);
    }
    y += 7;
  }

  // Revenue by shop
  y += 6;
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionLabel(doc, 'Chiffre d\'affaires par boutique', y);

  const byShop: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const o of orders.filter(o => o.status === 'delivered')) {
    if (!byShop[o.shopId]) byShop[o.shopId] = { name: o.shopName, count: 0, revenue: 0 };
    byShop[o.shopId].count++;
    byShop[o.shopId].revenue += o.total;
  }

  const shopRows = Object.values(byShop).sort((a, b) => b.revenue - a.revenue);
  bg = false;
  for (const s of shopRows) {
    if (bg) {
      doc.setFillColor(...LIGHT);
      doc.rect(14, y - 4, W - 28, 7, 'F');
    }
    bg = !bg;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(s.name, 17, y);
    doc.text(`${s.count} commande${s.count > 1 ? 's' : ''}`, 100, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GREEN);
    doc.text(formatPrice(s.revenue), W - 16, y, { align: 'right' });
    y += 7;
  }

  drawFooter(doc, 'Rapport confidentiel — usage interne Abengourou Express');
  doc.save(`rapport-commandes-${new Date().toISOString().slice(0, 10)}.pdf`);
}
