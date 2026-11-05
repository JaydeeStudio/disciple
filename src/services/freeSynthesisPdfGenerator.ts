import jsPDF from 'jspdf';
import { Archetype } from '../data/archetypes';
import { Dimension } from '../data/questions';
import { getArchetypeSilhouettePngDataUrl } from '../components/BiblicalSilhouette';

/**
 * Loads an image from a URL as a data URL using an offscreen canvas
 */
async function loadImageAsDataUrl(src: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const COLORS = {
  creamBg: [250, 247, 242] as [number, number, number],      // Web app exact warm beige #FAF7F2
  creamCard: [253, 251, 247] as [number, number, number],    // Crisp warm card surface
  parchment: [247, 242, 232] as [number, number, number],    // Inner arch background
  white: [255, 255, 255] as [number, number, number],
  charcoal: [36, 32, 29] as [number, number, number],        // Deep warm charcoal #24201D
  charcoalSoft: [58, 52, 47] as [number, number, number],    // Readable body charcoal #3A342F
  textMuted: [115, 110, 102] as [number, number, number],    // Elegant body text
  terracotta: [194, 94, 66] as [number, number, number],     // Terracotta accent #C25E42
  terracottaDark: [160, 72, 48] as [number, number, number],
  terracottaLight: [249, 238, 233] as [number, number, number],
  ochre: [212, 155, 68] as [number, number, number],         // Golden ochre #D49B44
  ochreLight: [252, 247, 238] as [number, number, number],
  sage: [95, 115, 99] as [number, number, number],           // Sage olive #5F7363
  borderTint: [229, 219, 203] as [number, number, number],   // Delicate hairline #E5DBCB
  archBorder: [220, 210, 195] as [number, number, number],
};

/**
 * Fallback architectural arch drawer
 */
export function drawArchedSilhouetteGraphic(
  doc: jsPDF,
  cx: number,
  cy: number,
  archetype: Archetype,
  scale: number = 1
) {
  const archW = 76 * scale;
  const archH = 86 * scale;
  const archX = cx - archW / 2;
  const archY = cy;
  const r = archW / 2;

  doc.setFillColor(COLORS.parchment[0], COLORS.parchment[1], COLORS.parchment[2]);
  doc.rect(archX, archY + r, archW, archH - r, 'F');
  doc.circle(cx, archY + r, r, 'F');

  doc.setDrawColor(COLORS.archBorder[0], COLORS.archBorder[1], COLORS.archBorder[2]);
  doc.setLineWidth(0.6 * scale);
  doc.line(archX, archY + r, archX, archY + archH);
  doc.line(archX, archY + archH, archX + archW, archY + archH);
  doc.line(archX + archW, archY + r, archX + archW, archY + archH);

  const steps = 32;
  for (let i = 0; i < steps; i++) {
    const a1 = Math.PI + (i / steps) * Math.PI;
    const a2 = Math.PI + ((i + 1) / steps) * Math.PI;
    doc.line(
      cx + r * Math.cos(a1),
      archY + r + r * Math.sin(a1),
      cx + r * Math.cos(a2),
      archY + r + r * Math.sin(a2)
    );
  }

  const haloCy = archY + 44 * scale;
  const haloR = 21 * scale;
  doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
  doc.circle(cx, haloCy, 24 * scale, 'F');

  doc.setFillColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  for (let deg = 0; deg < 360; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const hx = cx + haloR * Math.cos(rad);
    const hy = haloCy + haloR * Math.sin(rad);
    doc.circle(hx, hy, 0.45 * scale, 'F');
  }

  doc.setFillColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  doc.circle(cx, archY + 22 * scale, 1.8 * scale, 'F');

  doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.ellipse(cx, archY + 34 * scale, 10 * scale, 12.5 * scale, 'F');

  doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.ellipse(cx, archY + 41 * scale, 8 * scale, 10 * scale, 'F');

  doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.roundedRect(cx - 15 * scale, archY + 46 * scale, 30 * scale, 32 * scale, 3 * scale, 3 * scale, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cx - 8.5 * scale, archY + 49 * scale, 7.5 * scale, 6 * scale, 0.8 * scale, 0.8 * scale, 'F');
  doc.roundedRect(cx + 1 * scale, archY + 49 * scale, 7.5 * scale, 6 * scale, 0.8 * scale, 0.8 * scale, 'F');

  doc.setDrawColor(COLORS.archBorder[0], COLORS.archBorder[1], COLORS.archBorder[2]);
  doc.setLineWidth(0.8 * scale);
  doc.line(archX + 4 * scale, archY + archH - 4 * scale, archX + archW - 4 * scale, archY + archH - 4 * scale);
}

/**
 * Draws the shared prestigious cover page matching the web app result page
 * and screenshot (Capture_d_e_cran_2026-10-29_a__13.59.25_21601c8f.jpg).
 */
export async function drawPrestigeCoverPage(
  doc: jsPDF,
  options: {
    archetype: Archetype;
    participantName: string;
    reportDate: string;
    surTitre: string;
    badgeTitle: string;
  }
) {
  const { archetype, participantName, reportDate, surTitre, badgeTitle } = options;

  // 1. Full-bleed seamless warm paper background #FBF8F1
  doc.setFillColor(251, 248, 241);
  doc.rect(0, 0, 210, 297, 'F');

  // 2. Top Header (CSS: .document-header, width 79.13%, margin-top 93*u = 13.5mm, border-bottom 2*u)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(37, 33, 30); // --ink: #25211e
  doc.text(participantName.toUpperCase(), 22, 17.0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(118, 113, 107); // --muted: #76716b
  const dateW = doc.getTextWidth(reportDate.toUpperCase());
  doc.text(reportDate.toUpperCase(), 188 - dateW, 17.0);

  // Hairline rule under header (CSS: 2*u = 0.29mm, #e6dacb)
  doc.setDrawColor(230, 218, 203);
  doc.setLineWidth(0.4);
  doc.line(22, 20.7, 188, 20.7);

  // 3. Top Pill Badge (CSS: .edition-badge, margin-top 106*u = 15.4mm, min-height 98*u = 14.2mm, border 4*u = 0.58mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const pillText = surTitre.toUpperCase();
  const pillTextW = doc.getTextWidth(pillText);
  const pillW = Math.min(166, pillTextW + 24);
  const pillH = 13.5;
  const pillX = 105 - pillW / 2;
  const pillY = 36.0;

  doc.setFillColor(250, 236, 229); // --badge-fill: #faece5
  doc.setDrawColor(240, 205, 191); // --badge-border: #f0cdbf
  doc.setLineWidth(0.6);
  doc.roundedRect(pillX, pillY, pillW, pillH, pillH / 2, pillH / 2, 'FD');

  doc.setTextColor(202, 84, 55); // --terracotta: #ca5437
  doc.text(pillText, 105, pillY + 8.8, { align: 'center' });

  // 4. Subtitle under pill (CSS: .edition-description, margin-top 30*u = 4.35mm, font-size 40*u = 16pt)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14.5);
  doc.setTextColor(37, 33, 30); // --ink: #25211e
  doc.text(badgeTitle, 105, 58.0, { align: 'center' });

  // 5. Arched Biblical Character Graphic (CSS: .portrait, width 36.63% = 76.9mm, margin-top 157*u = 22.8mm)
  const imgW = 77;
  const imgH = 77;
  const imgX = (210 - imgW) / 2;
  const imgY = 78.0;

  try {
    const pngData = await getArchetypeSilhouettePngDataUrl(archetype, 900);
    if (pngData) {
      doc.addImage(pngData, 'PNG', imgX, imgY, imgW, imgH);
    } else {
      drawArchedSilhouetteGraphic(doc, 105, imgY, archetype, 0.95);
    }
  } catch (e) {
    console.warn('Error embedding silhouette PNG, using fallback:', e);
    drawArchedSilhouetteGraphic(doc, 105, imgY, archetype, 0.95);
  }

  // 6. Category Tag (CSS: .profile-label, margin-top 143*u = 20.8mm, font-size 32*u = 12.5pt bold)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(202, 84, 55); // --terracotta: #ca5437
  doc.text(`PROFIL DE ${participantName.toUpperCase()}`, 105, 180.0, { align: 'center' });

  // 7. Character Name (CSS: h1, margin-top 49*u = 7.1mm, font-serif, font-size 144*u = 54pt bold)
  doc.setFont('times', 'bold');
  doc.setFontSize(54);
  doc.setTextColor(37, 33, 30); // --ink: #25211e
  doc.text(archetype.name, 105, 201.0, { align: 'center' });

  // 8. Character Title (CSS: .profile-subtitle, margin-top 38*u = 5.5mm, font-serif italic, font-size 54*u = 19pt)
  doc.setFont('times', 'italic');
  doc.setFontSize(19);
  doc.setTextColor(93, 117, 100); // --sage: #5d7564
  doc.text(archetype.title, 105, 212.0, { align: 'center' });

  // 9. Quotation Divider Rule (CSS: .quotation::before, width 35.2% = 74mm, border-top 4*u = 0.58mm)
  const ruleW = 74;
  doc.setDrawColor(230, 218, 203); // --rule: #e6dacb
  doc.setLineWidth(0.6);
  doc.line(105 - ruleW / 2, 225.5, 105 + ruleW / 2, 225.5);

  // 10. Scripture Verse (CSS: .quotation, margin-top 77*u = 11.2mm, font-serif italic, font-size 36*u = 13.5pt)
  doc.setFont('times', 'italic');
  doc.setFontSize(13.5);
  doc.setTextColor(37, 33, 30); // --ink: #25211e
  const splitVerse = doc.splitTextToSize(`« ${archetype.biblicalVerse} »`, 180);
  doc.text(splitVerse, 105, 241.0, { align: 'center', lineHeightFactor: 1.4 });

  // 11. Discreet Footer (CSS: .document-footer, margin-top 85*u = 12.3mm, font-size 24*u = 9.5pt)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(118, 113, 107); // --muted: #76716b
  doc.text("Projet Disciples • discipledejesus.netlify.app", 105, 278.0, { align: 'center' });
}

export interface FreeSynthesisOptions {
  archetype: Archetype;
  participantName?: string;
  affinity?: number;
  dimensions?: {
    interiorite: number;
    soumission: number;
    verite: number;
    lettre: number;
    reforme: number;
  };
  rawScores?: Record<Dimension, number>;
  paymentUrl?: string;
}

/**
 * Generate a high-end, 3-page A4 PDF Synthesis & Repère Guide
 * Perfectly balanced, zero text overflow, no unicode artifacts,
 * and seamless alignment with the user's reference capture.
 */
export async function generateFreeSynthesisPdf(options: FreeSynthesisOptions): Promise<void> {
  const {
    archetype,
    participantName = 'Disciple',
    affinity = 94,
    dimensions = {
      interiorite: 75,
      soumission: 65,
      verite: 80,
      lettre: 40,
      reforme: 60,
    },
    rawScores,
    paymentUrl = 'https://buy.stripe.com/7sY8wP6Xj2ta06oexaeIw00'
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // ==========================================
  // PAGE 1 : COUVERTURE SOBRE & PRESTIGIEUSE
  // ==========================================
  await drawPrestigeCoverPage(doc, {
    archetype,
    participantName,
    reportDate: todayStr,
    surTitre: "SYNTHÈSE DE PROFIL & FICHE REPÈRE",
    badgeTitle: "Fiche repère et clés de discernement"
  });

  // ==========================================
  // PAGE 2 : ANALYSE DE PROFIL & ÉQUILIBRES
  // ==========================================
  doc.addPage();

  // Minimal Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`SYNTHÈSE DE PROFIL • ${participantName.toUpperCase()}`, 20, 16);
  doc.text("Page 2 sur 3", 190, 16, { align: 'right' });

  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.line(20, 19, 190, 19);

  // Page 2 Title
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Analyse de tempérament : ${archetype.name}`, 20, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Repères de posture intérieure, dons majeurs et équilibres mesurés.`, 20, 35);

  // Box 1 : Description textuelle de droite (38mm height)
  const b1Y = 40;
  const b1W = 170;
  const b1H = 38;
  doc.setFillColor(COLORS.creamCard[0], COLORS.creamCard[1], COLORS.creamCard[2]);
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, b1Y, b1W, b1H, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text('POSTURE DE DISCIPLE & DYNAMIQUE NATURELLE', 26, b1Y + 9);

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const splitDesc = doc.splitTextToSize(archetype.description, 158);
  doc.text(splitDesc, 26, b1Y + 17);

  // Box 2 : 2 Colonnes sobres (Dons vs Vigilances)
  const colY = 84;
  const colW = 82;
  const colH = 74;

  // Colonne Gauche : Dons & Forces (Fond crème très doux)
  doc.setFillColor(COLORS.creamCard[0], COLORS.creamCard[1], COLORS.creamCard[2]);
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, colY, colW, colH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.sage[0], COLORS.sage[1], COLORS.sage[2]);
  doc.text('3 FORCES & DONS NATURELS', 26, colY + 9);

  const forces = [
    { title: '1. Clarté d’ancrage', desc: 'Capacité à demeurer fidèle à vos convictions profondes sans dispersion.' },
    { title: '2. Qualité de présence', desc: 'Écoute sincère et engagement authentique qui rassurent votre entourage.' },
    { title: '3. Sensibilité spirituelle', desc: 'Perception fine des enjeux humains et spirituels au-delà des apparences.' }
  ];
  let fy = colY + 18;
  forces.forEach(f => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(f.title, 26, fy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const sf = doc.splitTextToSize(f.desc, 70); // Strictly constrained to 70mm, zero overflow
    doc.text(sf, 26, fy + 4);
    fy += 17;
  });

  // Colonne Droite : Points de vigilance (Fond blanc épuré)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(108, colY, colW, colH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text('3 POINTS DE VIGILANCE', 114, colY + 9);

  const vigilances = [
    { title: '1. Risque d’isolement', desc: 'Sous tension, tendance à intérioriser la peine plutôt qu’à ouvrir le dialogue.' },
    { title: '2. Réticence au conflit', desc: 'Difficulté à poser une limite ferme de peur de rompre l’harmonie fraternelle.' },
    { title: '3. Exigence silencieuse', desc: 'Attente implicite que les autres partagent le même degré de délicatesse.' }
  ];
  let vy = colY + 18;
  vigilances.forEach(v => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(v.title, 114, vy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const sv = doc.splitTextToSize(v.desc, 70); // Strictly constrained to 70mm, zero overflow
    doc.text(sv, 114, vy + 4);
    vy += 17;
  });

  // Box 3 : Aperçu des 5 dimensions fondamentales (Clean Sliders)
  const gBoxY = 164;
  const gBoxW = 170;
  const gBoxH = 112;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, gBoxY, gBoxW, gBoxH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text('VOS 5 ÉQUILIBRES INTÉRIEURS (APERÇU DES DIMENSIONS)', 26, gBoxY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text('Les curseurs ci-dessous situent votre sensibilité sur chaque spectre (de 0% à 100%) :', 26, gBoxY + 15);

  const dimGauges = [
    { name: '1. Intériorité spirituelle', left: 'Action extérieure', right: 'Contemplation intérieure', val: dimensions.interiorite, color: COLORS.terracotta },
    { name: '2. Soumission & Autorité', left: 'Initiative libre', right: 'Obéissance / Dévouement', val: dimensions.soumission, color: COLORS.sage },
    { name: '3. Vérité & Grâce', left: 'Grâce / Compassion', right: 'Droiture de la Vérité', val: dimensions.verite, color: COLORS.ochre },
    { name: '4. Lettre & Esprit', left: 'Liberté de l’Esprit', right: 'Fidélité au Texte', val: dimensions.lettre, color: [95, 120, 145] as [number, number, number] },
    { name: '5. Réforme & Continuité', left: 'Continuité des pères', right: 'Élan réformateur', val: dimensions.reforme, color: [140, 105, 150] as [number, number, number] },
  ];

  let gy = gBoxY + 24;
  dimGauges.forEach(g => {
    // Dimension title on left
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(g.name, 26, gy);

    // Percentage on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(g.color[0], g.color[1], g.color[2]);
    doc.text(`${g.val}%`, 184, gy, { align: 'right' });

    // Track
    const trackX = 26;
    const trackW = 158;
    const trackH = 4.5;
    doc.setFillColor(242, 238, 232);
    doc.roundedRect(trackX, gy + 2, trackW, trackH, 2, 2, 'F');

    // Filled bar starting cleanly from the left
    const fillW = Math.max(8, (trackW * g.val) / 100);
    doc.setFillColor(g.color[0], g.color[1], g.color[2]);
    doc.roundedRect(trackX, gy + 2, fillW, trackH, 2, 2, 'F');

    // Marker circle at score position
    const pointerX = trackX + (g.val / 100) * trackW;
    doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.circle(pointerX, gy + 4.25, 2.5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(pointerX, gy + 4.25, 1, 'F');

    // Labels under bar (NO UNICODE ARROWS! standard readable text)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(`Pôle gauche : ${g.left}`, trackX, gy + 10.5);
    doc.text(`Pôle droit : ${g.right}`, 184, gy + 10.5, { align: 'right' });

    gy += 16.5;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text('Synthèse offerte • Pour approfondir, découvrez le dossier complet de 36 pages', 20, 285);
  doc.text('Page 2 sur 3', 190, 285, { align: 'right' });

  // ==========================================
  // PAGE 3 : ENCHÂSSEMENT MARKETING & ÉDITORIAL
  // ==========================================
  doc.addPage();

  // Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`APPROFONDISSEMENT • ${participantName.toUpperCase()}`, 20, 16);
  doc.text("Page 3 sur 3", 190, 16, { align: 'right' });

  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.line(20, 19, 190, 19);

  // Top Title
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text('Donnez toute sa valeur à votre évaluation', 20, 29);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text('POURQUOI PASSER AU DOSSIER COMPLET D’ACCOMPAGNEMENT DE 36 PAGES', 20, 35);

  // Editorial reflection box (42mm height)
  const editY = 40;
  doc.setFillColor(COLORS.creamCard[0], COLORS.creamCard[1], COLORS.creamCard[2]);
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, editY, 170, 42, 3, 3, 'FD');

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const editText = `« Cette fiche de synthèse vous a offert un aperçu précieux de votre profil biblique de référence. Mais un test de personnalité ne prend toute sa portée que lorsqu’il devient un instrument pratique de sanctification, d’ajustement relationnel et de croissance.
Pour ne pas vous enfermer dans une simple étiquette mais véritablement identifier vos angles morts, désamorcer vos réflexes sous stress et grandir en maturité afin de devenir un meilleur disciple de Jésus-Christ au quotidien, découvrez votre Dossier d’approfondissement personnel (36 pages). »`;
  const splitEdit = doc.splitTextToSize(editText, 158);
  doc.text(splitEdit, 26, editY + 8);

  // The 5 Exclusive Pillars
  const pilY = 87;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text('Ce que contient exclusivement votre dossier complet (36 pages) :', 20, pilY);

  const pillars = [
    {
      num: '01',
      title: 'Cartographie 2D & 4 jauges profondes',
      desc: 'Positionnement dans la matrice des 4 quadrants et comparaison entre Élan spontané, Comportement habituel, Besoins profonds et Réactions sous tension.',
      color: COLORS.ochre
    },
    {
      num: '02',
      title: 'Dynamique sous tension & réflexes d’évitement',
      desc: 'Mise en lumière de vos mécanismes de défense inconscients en situation de crise ou de fatigue, avec exercices ciblés de régulation.',
      color: COLORS.terracotta
    },
    {
      num: '03',
      title: 'Guide d’alliance & communication fraternelle',
      desc: 'Comment collaborer avec vos profils complémentaires, désamorcer les incompréhensions mutuelles et exprimer vos besoins réels avec grâce.',
      color: COLORS.sage
    },
    {
      num: '04',
      title: 'Plan de transformation spirituelle sur 30 jours',
      desc: '4 semaines de défis pratiques balisés (observation, réajustement, service, ancrage) avec cases à cocher et 10 questions d’auto-coaching.',
      color: [95, 120, 145] as [number, number, number]
    },
    {
      num: '05',
      title: 'Tableau de bord de synthèse & Diplôme solennel',
      desc: 'Une planche récapitulative visuelle exhaustive réunissant toutes vos données clés, suivie de votre Certificat d’accomplissement officiel.',
      color: COLORS.ochre
    }
  ];

  // Preload preview images for page 3 upsell
  const [imgCouv, imgRadar, imgSynthese] = await Promise.all([
    loadImageAsDataUrl('/images/guide-preview/couverture.jpg'),
    loadImageAsDataUrl('/images/guide-preview/page-radar.jpg'),
    loadImageAsDataUrl('/images/guide-preview/page-synthese.jpg')
  ]);

  let py = pilY + 4;
  pillars.forEach(p => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, py, 170, 13.5, 2, 2, 'FD');

    // Number badge
    doc.setFillColor(p.color[0], p.color[1], p.color[2]);
    doc.roundedRect(23, py + 2, 9, 9.5, 1.2, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(p.num, 27.5, py + 8.5, { align: 'center' });

    // Title & desc
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(p.title, 36, py + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const splitPDesc = doc.splitTextToSize(p.desc, 148);
    doc.text(splitPDesc, 36, py + 9.8);

    py += 15.5;
  });

  // Grand CTA Marketing Box with 3 Real Preview Images
  const ctaY = 171;
  const ctaH = 108;
  doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.roundedRect(20, ctaY, 170, ctaH, 4, 4, 'F');

  // Inner subtle gold frame
  doc.setDrawColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(22, ctaY + 2, 166, ctaH - 4, 3, 3, 'S');

  // Badge
  doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.roundedRect(65, ctaY + 5, 80, 6, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('ACCÈS IMMÉDIAT • ÉDITION SUR MESURE (36 PAGES)', 105, ctaY + 9.2, { align: 'center' });

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Débloquez votre Dossier Complet de 36 pages', 105, ctaY + 17.5, { align: 'center' });

  // 3 Images row
  const imgY = ctaY + 21;
  const imgW = 28;
  const imgH = 37;
  const imgSpacing = 24;
  const startX = 39;

  const previewCards = [
    { data: imgCouv, label: 'Couverture reliée', sub: 'Page 1' },
    { data: imgRadar, label: 'Roue polaire radar', sub: 'Page 4' },
    { data: imgSynthese, label: 'Cartographie 2D', sub: 'Page 35' }
  ];

  previewCards.forEach((c, idx) => {
    const cx = startX + idx * (imgW + imgSpacing);

    if (c.data) {
      try {
        doc.addImage(c.data, 'JPEG', cx, imgY, imgW, imgH);
      } catch {
        doc.setFillColor(50, 45, 40);
        doc.rect(cx, imgY, imgW, imgH, 'F');
      }
    } else {
      doc.setFillColor(50, 45, 40);
      doc.rect(cx, imgY, imgW, imgH, 'F');
    }

    doc.setDrawColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
    doc.setLineWidth(0.4);
    doc.rect(cx, imgY, imgW, imgH, 'S');

    doc.setTextColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(c.label, cx + imgW / 2, imgY + imgH + 3.2, { align: 'center' });

    doc.setTextColor(190, 185, 175);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(c.sub, cx + imgW / 2, imgY + imgH + 6.2, { align: 'center' });
  });

  // Price & Details
  doc.setFont('times', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  doc.text('Tarif unique : 19 € (au lieu de 29 €)', 105, ctaY + 73, { align: 'center' });

  // Large Action Button
  const btnX = 26;
  const btnY = ctaY + 77.5;
  const btnW = 158;
  const btnH = 12;
  doc.setFillColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  doc.roundedRect(btnX, btnY, btnW, btnH, 2.5, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text('COMMANDER ET TÉLÉCHARGER LE DOSSIER COMPLET (36 PAGES)', 105, btnY + 7.5, { align: 'center' });

  // Dynamic target link preserving the participant's exact answers across devices
  let effectiveTargetUrl = paymentUrl || 'https://buy.stripe.com/7sY8wP6Xj2ta06oexaeIw00';
  if (rawScores) {
    const scoresStr = `${rawScores.I_A},${rawScores.S_E},${rawScores.V_G},${rawScores.L_F},${rawScores.R_M}`;
    effectiveTargetUrl = `https://discipledejesus.netlify.app/resultats/${archetype.key}?nom=${encodeURIComponent(participantName)}&scores=${scoresStr}&aff=${affinity}&commander=1`;
  }

  // Clickable link on the button
  try {
    if (typeof (doc as any).link === 'function') {
      (doc as any).link(btnX, btnY, btnW, btnH, { url: effectiveTargetUrl });
    }
  } catch (e) {
    console.warn('PDF link addition error:', e);
  }

  // Security assurance note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(195, 190, 180);
  doc.text('Paiement 100% sécurisé par Stripe • Téléchargement direct immédiat en PDF HD', 105, ctaY + 97.5, { align: 'center' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text('Synthèse offerte • Pour approfondir, découvrez le dossier complet de 36 pages', 20, 285);
  doc.text('Page 3 sur 3', 190, 285, { align: 'right' });

  // Save the PDF
  const safeName = participantName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Synthese_Fiche_Repere_${archetype.name}_${safeName}.pdf`);
}
