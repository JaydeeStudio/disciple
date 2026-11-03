import { jsPDF } from 'jspdf';
import { Archetype, ARCHETYPES } from '../data/archetypes';
import { Dimension } from '../data/questions';
import { CharacterMatch, DimensionResult } from './calculation';
import { drawPrestigeCoverPage, drawArchedSilhouetteGraphic } from './freeSynthesisPdfGenerator';
import { getArchetypeSilhouettePngDataUrl } from '../components/BiblicalSilhouette';

export interface GuideGenerationParams {
  userName: string;
  userGender?: 'M' | 'F' | 'OTHER';
  userAge?: string;
  archetype: Archetype;
  affinity: number;
  dimensions: Record<Dimension, DimensionResult>;
  rawScores: Record<Dimension, number>;
  secondaryMatches?: CharacterMatch[];
  genderEquivalentMatch?: CharacterMatch;
}

// Visual color palette for elegant print styling (BibleProject / Birkman harmony)
const COLORS = {
  charcoal: [36, 32, 29] as [number, number, number],
  textMuted: [100, 95, 90] as [number, number, number],
  terracotta: [194, 94, 66] as [number, number, number],
  terracottaDark: [160, 75, 50] as [number, number, number],
  ochre: [212, 155, 68] as [number, number, number],
  ochreLight: [250, 246, 238] as [number, number, number],
  creamBg: [253, 250, 245] as [number, number, number],
  borderTint: [228, 220, 208] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  sage: [95, 115, 99] as [number, number, number],
  sageLight: [240, 245, 240] as [number, number, number],
  blue: [68, 108, 142] as [number, number, number],
  blueLight: [240, 246, 252] as [number, number, number],
  gold: [200, 145, 50] as [number, number, number]
};

const TOTAL_PAGES = 36;

/**
 * Running header with participant name
 */
function addPageHeader(doc: jsPDF, pageNum: number, userName: string, title?: string) {
  if (pageNum <= 1 || pageNum === TOTAL_PAGES) return; // Skip cover and certificate

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  
  const headerLeft = `Dossier d'approfondissement personnel • ${userName.toUpperCase()}`;
  const headerRight = title ? title : "Disciple de Jésus";

  doc.text(headerLeft, 20, 14);
  const rightWidth = doc.getTextWidth(headerRight);
  doc.text(headerRight, 190 - rightWidth, 14);

  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.line(20, 16.5, 190, 16.5);
}

/**
 * Running footer with page numbering (Page X sur 36)
 */
function addPageFooter(doc: jsPDF, pageNum: number) {
  if (pageNum <= 1 || pageNum === TOTAL_PAGES) return; // Skip cover and certificate

  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.line(20, 282, 190, 282);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);

  doc.text("Outil de compréhension et de travail sur soi • Document strictement confidentiel", 20, 287.5);
  
  const pageStr = `Page ${pageNum} sur ${TOTAL_PAGES}`;
  const pageStrWidth = doc.getTextWidth(pageStr);
  doc.text(pageStr, 190 - pageStrWidth, 287.5);
}

/**
 * Helper to draw a framed card box
 */
function drawCard(
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  bgColor = COLORS.white, 
  borderColor = COLORS.borderTint
) {
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 3, 3, 'FD');
}

/**
 * Draw Archetype Vector Silhouette Cartouche
 */
function drawArchetypeCoverSilhouette(doc: jsPDF, cx: number, cy: number, key: string, name: string) {
  // Radiant halo / aura
  doc.setFillColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  doc.circle(cx, cy, 26, 'F');
  doc.setDrawColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, 29, 'S');

  // Disciple cartouche silhouette in deep charcoal
  doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  // Head
  doc.ellipse(cx, cy - 8, 8, 10, 'F');
  // Body / tunic
  doc.roundedRect(cx - 15, cy + 1, 30, 22, 6, 6, 'F');

  // Cowl drape in terracotta
  doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.roundedRect(cx - 9, cy + 3, 18, 12, 3, 3, 'F');

  // Attribute icon (Scroll / Book / Star) in white
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cx - 6, cy + 13, 12, 7, 1.5, 1.5, 'F');
  doc.setDrawColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.setLineWidth(0.4);
  doc.line(cx, cy + 13, cx, cy + 20);

  // Small golden crown / light dot
  doc.setFillColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  doc.circle(cx, cy - 20, 2.2, 'F');
}

/**
 * Draws real vector symbols without font encoding issues (star, diamond, circle, square)
 */
function drawVectorSymbol(
  doc: jsPDF,
  symbol: 'star' | 'diamond' | 'circle' | 'square',
  cx: number,
  cy: number,
  s: number,
  color: [number, number, number]
) {
  doc.setFillColor(color[0], color[1], color[2]);
  if (symbol === 'star') {
    doc.triangle(cx, cy - s, cx - s * 0.35, cy, cx + s * 0.35, cy, 'F');
    doc.triangle(cx, cy + s, cx - s * 0.35, cy, cx + s * 0.35, cy, 'F');
    doc.triangle(cx - s, cy, cx, cy - s * 0.35, cx, cy + s * 0.35, 'F');
    doc.triangle(cx + s, cy, cx, cy - s * 0.35, cx, cy + s * 0.35, 'F');
  } else if (symbol === 'diamond') {
    doc.triangle(cx, cy - s, cx - s * 0.85, cy, cx + s * 0.85, cy, 'F');
    doc.triangle(cx, cy + s, cx - s * 0.85, cy, cx + s * 0.85, cy, 'F');
  } else if (symbol === 'circle') {
    doc.circle(cx, cy, s * 0.75, 'F');
  } else if (symbol === 'square') {
    const half = s * 0.65;
    doc.rect(cx - half, cy - half, half * 2, half * 2, 'F');
  }
}

/**
 * Draws BibleProject 2D Quadrant Map (Extrovert/Introvert x Tâche/Relation)
 * Designed with soft harmonious tones, clear titles inside each quadrant,
 * and axis labels safely constrained within margins.
 */
function drawBirkmanMap2D(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  starPos: { x: number; y: number },
  diamondPos: { x: number; y: number },
  circlePos: { x: number; y: number },
  squarePos: { x: number; y: number }
) {
  const half = size / 2;
  const gap = 1.5;
  const tileW = half - gap;
  const tileH = half - gap;

  // Quadrant 1 (Top Left) : BÂTISSEUR • ACTION (Terracotta doux)
  doc.setFillColor(224, 138, 114);
  doc.roundedRect(x, y, tileW, tileH, 2, 2, 'F');

  // Quadrant 2 (Top Right) : COMMUNICANT • RELATION (Sauge doux)
  doc.setFillColor(136, 168, 142);
  doc.roundedRect(x + half + gap, y, tileW, tileH, 2, 2, 'F');

  // Quadrant 3 (Bottom Left) : ANALYSTE • STRUCTURE (Ocre doux)
  doc.setFillColor(228, 182, 112);
  doc.roundedRect(x, y + half + gap, tileW, tileH, 2, 2, 'F');

  // Quadrant 4 (Bottom Right) : CONTEMPLATIF • PROFONDEUR (Bleu doux)
  doc.setFillColor(120, 158, 188);
  doc.roundedRect(x + half + gap, y + half + gap, tileW, tileH, 2, 2, 'F');

  // Quadrant Titles (Clear white tags inside each tile, with size-adaptive font)
  doc.setFont('helvetica', 'bold');
  const titleFontSize = size >= 80 ? 6.5 : 4.8;
  doc.setFontSize(titleFontSize);
  doc.setTextColor(255, 255, 255);
  const qTitleY1 = y + (size >= 80 ? 5.5 : 4.2);
  const qTitleY2 = y + half + gap + (size >= 80 ? 5.5 : 4.2);
  doc.text("BÂTISSEUR • ACTION", x + 2.5, qTitleY1);
  doc.text("COMMUNICANT • RELATION", x + half + gap + 2.5, qTitleY1);
  doc.text("ANALYSTE • STRUCTURE", x + 2.5, qTitleY2);
  doc.text("CONTEMPLATIF • INTÉRIORITÉ", x + half + gap + 2.5, qTitleY2);

  // Outer clean hairline frame
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.4);
  doc.rect(x - 2, y - 2, size + 4, size + 4, 'S');

  // Axis Labels (Safely positioned with ample margins, NO Unicode arrows)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size >= 80 ? 7 : 6);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  
  // Top: Action & Extraversion
  const topText = "ACTION & EXTRAVERSION (HAUT)";
  const tW = doc.getTextWidth(topText);
  doc.text(topText, x + half - tW / 2, y - 4);

  // Bottom: Intériorité & Réflexion
  const btmText = "INTÉRIORITÉ & RÉFLEXION (BAS)";
  const bW = doc.getTextWidth(btmText);
  doc.text(btmText, x + half - bW / 2, y + size + 7);

  // Dynamic marker scale
  const badgeRadius = size >= 80 ? 4.2 : 2.9;
  const symbolSize = size >= 80 ? 2.3 : 1.6;
  const minSeparation = badgeRadius * 2 + 1.6; // Guarantees zero badge overlap

  // Initial conversion from percentage (0-100) to absolute mm coordinates
  const markers = [
    { type: 'star' as const, color: COLORS.ochre, pos: starPos },
    { type: 'diamond' as const, color: COLORS.charcoal, pos: diamondPos },
    { type: 'circle' as const, color: COLORS.sage, pos: circlePos },
    { type: 'square' as const, color: COLORS.terracotta, pos: squarePos },
  ];

  const pts = markers.map(m => ({
    type: m.type,
    color: m.color,
    x: x + (Math.max(12, Math.min(88, m.pos.x)) / 100) * size,
    y: y + (Math.max(12, Math.min(88, m.pos.y)) / 100) * size,
  }));

  const pad = badgeRadius + 1.2;
  const minX = x + pad;
  const maxX = x + size - pad;
  const minY = y + pad;
  const maxY = y + size - pad;
  const headerClearH = size >= 80 ? 8.5 : 6.8;

  // Collision resolution & title clearance relaxation
  for (let iter = 0; iter < 30; iter++) {
    // Repel overlapping markers
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x;
        let dy = pts[j].y - pts[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.001) {
          dx = (j - i) * 1.5;
          dy = (j - i) * 1.5;
          dist = Math.sqrt(dx * dx + dy * dy);
        }
        if (dist < minSeparation) {
          const overlap = (minSeparation - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          pts[i].x -= nx * overlap;
          pts[i].y -= ny * overlap;
          pts[j].x += nx * overlap;
          pts[j].y += ny * overlap;
        }
      }
    }

    // Boundary constraints & title clearance
    for (const pt of pts) {
      pt.x = Math.max(minX, Math.min(maxX, pt.x));
      pt.y = Math.max(minY, Math.min(maxY, pt.y));

      // Clear top quadrant title stripes
      if (pt.y < y + headerClearH) {
        pt.y = y + headerClearH;
      }
      // Clear bottom quadrant title stripes
      if (pt.y >= y + half && pt.y < y + half + gap + headerClearH) {
        pt.y = y + half + gap + headerClearH;
      }

      // Avoid straddling the central seam / dividing line between quadrants
      const seamBuffer = badgeRadius + 0.6;
      if (Math.abs(pt.x - (x + half)) < seamBuffer + gap) {
        if (pt.x < x + half) {
          pt.x = x + half - gap - seamBuffer;
        } else {
          pt.x = x + half + gap + seamBuffer;
        }
      }
      if (Math.abs(pt.y - (y + half)) < seamBuffer + gap) {
        if (pt.y < y + half) {
          pt.y = y + half - gap - seamBuffer;
        } else {
          pt.y = y + half + gap + headerClearH;
        }
      }
    }
  }

  // Draw final spaced, collision-free badges
  for (const pt of pts) {
    doc.setFillColor(255, 255, 255);
    doc.circle(pt.x, pt.y, badgeRadius, 'F');
    doc.setDrawColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.setLineWidth(0.4);
    doc.circle(pt.x, pt.y, badgeRadius, 'S');

    drawVectorSymbol(doc, pt.type, pt.x, pt.y, symbolSize, pt.color);
  }
}

/**
 * Draws a clean pyramid/stepped gauge with pointer and separate score badge
 */
function drawPyramidGauge(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  leftDesc: string,
  rightDesc: string,
  score: number,
  symbol: 'star' | 'diamond' | 'circle' | 'square'
) {
  // Label on line 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(label, x, y);

  // Score pill badge on right (strictly separated from label)
  const scoreStr = `Score : ${score} / 100`;
  doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
  doc.setDrawColor(COLORS.ochre[0], COLORS.ochre[1], COLORS.ochre[2]);
  doc.setLineWidth(0.2);
  const pillW = 28;
  doc.roundedRect(x + width - pillW, y - 4, pillW, 6, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(scoreStr, x + width - pillW / 2, y, { align: 'center' });

  // Stepped pyramid roof polygons
  const baseY = y + 15;
  const peakY = y + 5;
  const midX = x + width / 2;

  // Background stepped pyramid
  doc.setFillColor(238, 234, 227);
  doc.triangle(x, baseY, midX, peakY, x + width, baseY, 'F');

  // Central "Blend" zone
  doc.setFillColor(222, 217, 208);
  doc.rect(midX - 12, peakY + 2, 24, baseY - peakY - 2, 'F');

  // Baseline
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.6);
  doc.line(x, baseY, x + width, baseY);

  // Scale numbers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("0", x, baseY + 4.5);
  doc.text("Zone mixte", midX - 8, baseY + 4.5);
  doc.text("100", x + width - 10, baseY + 4.5);

  // Marker placement
  const clampedScore = Math.max(5, Math.min(95, score));
  const pointerX = x + (clampedScore / 100) * width;
  
  // Marker symbol badge with real vector shape
  doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.circle(pointerX, y + 4.5, 4.2, 'F');
  drawVectorSymbol(doc, symbol, pointerX, y + 4.5, 2.4, [255, 255, 255]);

  // Subtitle descriptions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(leftDesc, x, baseY + 9);
  const rDescW = doc.getTextWidth(rightDesc);
  doc.text(rightDesc, x + width - rDescW, baseY + 9);
}

/**
 * Draws Circular percentage ring badge with strictly wrapped title and description
 */
function drawCircularPercentBadge(
  doc: jsPDF,
  cx: number,
  cy: number,
  radius: number,
  percent: number,
  title: string,
  description: string,
  accentColor: [number, number, number],
  maxTextW: number = 46
) {
  // Outer track ring
  doc.setFillColor(236, 232, 225);
  doc.circle(cx, cy, radius, 'F');

  // Ring arc fill
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.circle(cx, cy, radius, 'F');

  // Inner cutout
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, radius - 2.8, 'F');

  // Text inside circle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  const pStr = `${percent}%`;
  const pW = doc.getTextWidth(pStr);
  doc.text(pStr, cx - pW / 2, cy + 3.5);

  // Label to the right
  const textX = cx + radius + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const splitTitle = doc.splitTextToSize(title, maxTextW);
  doc.text(splitTitle, textX, cy - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  const splitDesc = doc.splitTextToSize(description, maxTextW);
  doc.text(splitDesc, textX, cy + 3.5);
}

/**
 * Main generator creating the full 36-page personalized document
 */
export async function generateCompleteGuidePdf(params: GuideGenerationParams): Promise<jsPDF> {
  const {
    userName,
    archetype,
    affinity,
    dimensions,
    rawScores,
    secondaryMatches = [],
    genderEquivalentMatch
  } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cleanName = userName && userName.trim() ? userName.trim() : 'Disciple';
  const reportDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate coordinates for 2D Map from 5 dimensions
  // Horizontal (X) : 0 = Tâche / Structure (Gauche), 100 = Personne / Relation (Droite)
  // Vertical (Y) : 0 = Action & Extraversion (Haut), 100 = Intériorité & Réflexion (Bas)
  const taskPeople = Math.max(15, Math.min(85, dimensions.V_G.rightPercent));
  const introExtro = Math.max(15, Math.min(85, dimensions.I_A.leftPercent));

  // Natural differentiated positions for the 4 markers
  const starCoord = {
    x: Math.max(16, Math.min(84, taskPeople + 2)),
    y: Math.max(16, Math.min(84, introExtro + 3))
  };
  const diamondCoord = {
    x: Math.max(16, Math.min(84, taskPeople + (dimensions.S_E.rightPercent > 50 ? 10 : -8))),
    y: Math.max(16, Math.min(84, introExtro - 14))
  };
  const circleCoord = {
    x: Math.max(16, Math.min(84, taskPeople + 12)),
    y: Math.max(16, Math.min(84, introExtro + 14))
  };
  const squareCoord = {
    x: Math.max(16, Math.min(84, taskPeople - 16)),
    y: Math.max(16, Math.min(84, introExtro - 6))
  };

  // ==========================================
  // PAGE 1: VÉRITABLE COUVERTURE SOBRE & PRESTIGIEUSE
  // ==========================================
  await drawPrestigeCoverPage(doc, {
    archetype,
    participantName: cleanName,
    reportDate,
    surTitre: "ÉDITION INTÉGRALE — RAPPORT ANALYTIQUE COMPLET",
    badgeTitle: "Dossier d'approfondissement personnel et travail sur soi"
  });

  // ==========================================
  // PAGE 2: SOMMAIRE & ARCHITECTURE DU GUIDE
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 2, cleanName, "Sommaire et architecture");
  addPageFooter(doc, 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Sommaire et architecture du guide", 20, 28);

  const modules = [
    { num: "MOD. 1", title: `Anatomie de votre profil : ${archetype.name}`, pages: "Pages 5 à 6", desc: "Moteurs profonds, talents, zones d'ombre, dynamiques sous tension et réflexes." },
    { num: "MOD. 2", title: "Cartographie 2D et cadrans de tempérament", pages: "Pages 7 à 13", desc: "Carte relationnelle, analyse de l'élan, comportements habituels, besoins et stress." },
    { num: "MOD. 3", title: "Analyse chirurgicale de vos 5 dimensions", pages: "Pages 14 à 20", desc: "Positionnement exact sur les 5 polarités, clés de régulation et exercices ciblés." },
    { num: "MOD. 4", title: "Dynamiques relationnelles et alliances", pages: "Pages 21 à 26", desc: "Croisement des profils, complémentarité fraternelle, saisons et angles morts." },
    { num: "MOD. 5", title: "Guide pratique et plan d'action sur 30 jours", pages: "Pages 27 à 32", desc: "Protocoles quotidiens, 4 semaines de défis concrets et carnet de bord d'auto-évaluation." },
    { num: "ANNEXES", title: "Fiche mémo, dashboard global et attestation", pages: "Pages 33 à 36", desc: "Fiche mémo détachable, synthèse visuelle 1-page complète et diplôme officiel." },
  ];

  let modY = 38;
  modules.forEach(m => {
    drawCard(doc, 20, modY, 170, 22, COLORS.white, COLORS.borderTint);
    doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
    doc.roundedRect(24, modY + 4, 18, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(m.num, 25, modY + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(m.title, 48, modY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(m.desc, 48, modY + 16.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    const pW = doc.getTextWidth(m.pages);
    doc.text(m.pages, 184 - pW, modY + 13);

    modY += 25;
  });

  // Avant-propos
  drawCard(doc, 20, modY + 3, 170, 78, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Avant-propos pour ${cleanName}`, 28, modY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const p1 = `Ce dossier d'approfondissement personnel a été composé pour vous apporter une grille d'analyse lucide, bienveillante et opérationnelle.`;
  const p2 = `En découvrant votre résonance avec ${archetype.name} (${archetype.title.toLowerCase()}), vous explorez la façon dont votre personnalité s'investit, communique et réagit sous tension. Plus important encore, les représentations graphiques et les 5 polarités permettent de situer vos zones de force et vos besoins d'alignement.`;
  const p3 = `Prenez le temps de parcourir chaque page. Utilisez le plan d'action de 30 jours et la fiche mémo finale comme des supports d'évolution au quotidien.`;

  doc.text(doc.splitTextToSize(p1, 154), 28, modY + 23);
  doc.text(doc.splitTextToSize(p2, 154), 28, modY + 37);
  doc.text(doc.splitTextToSize(p3, 154), 28, modY + 57);

  // ==========================================
  // PAGE 3: EMPREINTE MULTIDIMENSIONNELLE
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 3, cleanName, "Empreinte multidimensionnelle");
  addPageFooter(doc, 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre empreinte multidimensionnelle", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Vue d'ensemble de vos 5 équilibres fondamentaux face aux figures bibliques.", 20, 36);

  // 5 bar gauges (Clean Left-to-Right Progression from 0% to 100%)
  const dimKeysOrder: Dimension[] = ['I_A', 'S_E', 'V_G', 'L_F', 'R_M'];
  let gaugeY = 48;

  dimKeysOrder.forEach((k, idx) => {
    const d = dimensions[k];
    drawCard(doc, 20, gaugeY, 170, 40, COLORS.white, COLORS.borderTint);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`Axe ${idx + 1} — ${d.label}`, 28, gaugeY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    const domPercent = d.rawValue <= 0 ? d.leftPercent : d.rightPercent;
    const domText = `Dominante : ${d.dominantLabel} (${domPercent}%)`;
    const domW = doc.getTextWidth(domText);
    doc.text(domText, 182 - domW, gaugeY + 8);

    // Track in neutral warm tint
    const barX = 28;
    const barY = gaugeY + 13;
    const barW = 154;
    const barH = 5.5;

    doc.setFillColor(236, 231, 222);
    doc.roundedRect(barX, barY, barW, barH, 2.75, 2.75, 'F');

    // Colored progress fill starting from the dominant extreme (left or right)
    doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    let markerX = barX + barW / 2;
    if (d.rawValue <= 0) {
      // Left dominant: starts from left extreme
      const fillW = Math.max(8, Math.min(barW, (d.leftPercent / 100) * barW));
      doc.roundedRect(barX, barY, fillW, barH, 2.75, 2.75, 'F');
      markerX = barX + fillW;
    } else {
      // Right dominant: starts from right extreme
      const fillW = Math.max(8, Math.min(barW, (d.rightPercent / 100) * barW));
      const fillX = barX + barW - fillW;
      doc.roundedRect(fillX, barY, fillW, barH, 2.75, 2.75, 'F');
      markerX = fillX;
    }

    // Center divider tick (50% mark)
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.8);
    doc.line(barX + barW / 2, barY - 1, barX + barW / 2, barY + barH + 1);

    // Marker indicator
    doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.circle(markerX, barY + barH / 2, 3.5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(markerX, barY + barH / 2, 1.2, 'F');

    // Labels under bar (clean labels without Unicode arrows)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(`Pôle gauche : ${d.leftLabel} (${d.leftPercent}%)`, barX, barY + 11.5);
    const rLw = doc.getTextWidth(`Pôle droit : ${d.rightLabel} (${d.rightPercent}%)`);
    doc.text(`Pôle droit : ${d.rightLabel} (${d.rightPercent}%)`, barX + barW - rLw, barY + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(d.description, barX, barY + 18);

    gaugeY += 43;
  });

  // ==========================================
  // PAGE 4: ROUE DES COMPOSANTES (RADAR POLYGON)
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 4, cleanName, "Roue des composantes");
  addPageFooter(doc, 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Roue des composantes de votre tempérament", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Visualisation de la répartition de votre énergie spirituelle et relationnelle.", 20, 36);

  // Large circular component chart container
  drawCard(doc, 20, 44, 170, 154, COLORS.white, COLORS.borderTint);
  
  const wheelCx = 105;
  const wheelCy = 120;
  const wheelR = 46;

  // Background concentric rings
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.4);
  doc.circle(wheelCx, wheelCy, wheelR, 'S');
  doc.circle(wheelCx, wheelCy, wheelR * 0.75, 'S');
  doc.circle(wheelCx, wheelCy, wheelR * 0.5, 'S');
  doc.circle(wheelCx, wheelCy, wheelR * 0.25, 'S');

  // Ring markers
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("25%", wheelCx + 2, wheelCy - wheelR * 0.25);
  doc.text("50%", wheelCx + 2, wheelCy - wheelR * 0.5);
  doc.text("75%", wheelCx + 2, wheelCy - wheelR * 0.75);
  doc.text("100%", wheelCx + 2, wheelCy - wheelR);

  // 8 Segments
  const segments = [
    { name: "Intériorité", val: dimensions.I_A.leftPercent },
    { name: "Action", val: dimensions.I_A.rightPercent },
    { name: "Fidélité", val: dimensions.S_E.leftPercent },
    { name: "Audace", val: dimensions.S_E.rightPercent },
    { name: "Vérité", val: dimensions.V_G.leftPercent },
    { name: "Grâce", val: dimensions.V_G.rightPercent },
    { name: "Lettre", val: dimensions.L_F.leftPercent },
    { name: "Esprit", val: dimensions.L_F.rightPercent }
  ];

  // Draw spoke lines & labels
  segments.forEach((seg, i) => {
    const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
    const lx = wheelCx + Math.cos(angle) * wheelR;
    const ly = wheelCy + Math.sin(angle) * wheelR;
    doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
    doc.setLineWidth(0.4);
    doc.line(wheelCx, wheelCy, lx, ly);

    // Label outside circle
    const textRadius = wheelR + 8;
    const tx = wheelCx + Math.cos(angle) * textRadius;
    const ty = wheelCy + Math.sin(angle) * textRadius;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${seg.name} (${seg.val}%)`, tx, ty + 2.5, { align: 'center' });
  });

  // Draw true filled radar polygon
  const radarPoints: [number, number][] = [];
  segments.forEach((seg, i) => {
    const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
    const rDist = (Math.max(10, Math.min(100, seg.val)) / 100) * wheelR;
    const px = wheelCx + Math.cos(angle) * rDist;
    const py = wheelCy + Math.sin(angle) * rDist;
    radarPoints.push([px, py]);
  });

  doc.setDrawColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.setLineWidth(1.2);
  for (let i = 0; i < radarPoints.length; i++) {
    const nextIdx = (i + 1) % radarPoints.length;
    doc.line(radarPoints[i][0], radarPoints[i][1], radarPoints[nextIdx][0], radarPoints[nextIdx][1]);
    doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.circle(radarPoints[i][0], radarPoints[i][1], 2, 'F');
  }

  // Center emblem badge
  doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.circle(wheelCx, wheelCy, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`${affinity}%`, wheelCx, wheelCy + 2.8, { align: 'center' });

  // Intuitive reading guide box
  drawCard(doc, 20, 204, 170, 68, COLORS.creamBg, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Comment lire votre diagramme polaire :", 28, 216);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const wheelNote1 = `Ce diagramme visualise le déploiement relatif de vos 8 énergies fondamentales. Le centre du cercle correspond à 0% et la périphérie à 100%. Plus la surface s'étire vers un pôle, plus cette sensibilité est active, motrice et spontanée chez vous.`;
  const wheelNote2 = `Votre profil met en avant une forte dominante pour ${dimensions.I_A.dominantLabel} associée à ${dimensions.V_G.dominantLabel}. Cette configuration procure une solidité intérieure remarquable et une constance précieuse au service de votre communauté.`;
  doc.text(doc.splitTextToSize(wheelNote1, 154), 28, 226);
  doc.text(doc.splitTextToSize(wheelNote2, 154), 28, 246);

  // ==========================================
  // PAGE 5: ANATOMIE DE VOTRE PROFIL PRINCIPAL
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 5, cleanName, `Profil : ${archetype.name}`);
  addPageFooter(doc, 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Anatomie de votre profil : ${archetype.name}`, 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Titre spirituel : « ${archetype.title} » • Testament : ${archetype.testament === 'NT' ? 'Nouveau Testament' : 'Ancien Testament'}`, 20, 36);

  // Description card with larger font size
  drawCard(doc, 20, 44, 170, 72, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("L'énergie motrice de ce tempérament :", 28, 56);

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const descParagraphs = archetype.description;
  doc.text(doc.splitTextToSize(descParagraphs, 154), 28, 68);

  // Strengths card
  drawCard(doc, 20, 122, 170, 74, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Forces majeures et charismes distinctifs :", 28, 134);

  let stY = 145;
  archetype.strengths.forEach((st) => {
    doc.setFillColor(COLORS.sage[0], COLORS.sage[1], COLORS.sage[2]);
    doc.circle(30, stY - 1, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(st, 144), 36, stY);
    stY += 11;
  });

  // Action quote card
  drawCard(doc, 20, 202, 170, 70, COLORS.creamBg, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Vocation concrète et expression dans la communauté :", 28, 214);

  let vocY = 226;
  archetype.missionVocation.forEach(voc => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`• ${voc}`, 30, vocY);
    vocY += 11;
  });

  // ==========================================
  // PAGE 6: LA DYNAMIQUE SOUS TENSION
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 6, cleanName, "Dynamique sous tension et réflexes");
  addPageFooter(doc, 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("La dynamique sous tension et les réflexes d'évitement", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Ce qui se passe lorsque vos besoins fondamentaux ne sont pas comblés.", 20, 36);

  drawCard(doc, 20, 46, 170, 76, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Points de vigilance et angles morts identifiés :", 28, 58);

  let vigY = 68;
  archetype.spiritualInvitations.forEach(inv => {
    doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.circle(30, vigY - 1, 1.8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(inv, 146), 36, vigY);
    vigY += 12;
  });

  // Stress mechanism analysis
  drawCard(doc, 20, 130, 170, 140, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Décodage de votre mécanisme sous stress :", 28, 144);

  const stressText1 = `Sous une surcharge relationnelle ou face à une contradiction abrupte, le réflexe primaire de votre profil est le repli défensif ou l'attente silencieuse. Vous cherchez à protéger votre cohérence intérieure au risque de paraître distant ou indifférent aux yeux de votre entourage.`;
  const stressText2 = `Lorsque vous ne vous sentez pas écouté ou respecté dans votre rythme, une tension sourde s'installe. Ce n'est pas une hostilité active, mais un désengagement progressif des projets communs.`;
  const stressText3 = `La clé de régulation : nommer vos besoins calmement avant que la coupe ne soit pleine, et ne pas attendre que les autres devinent intuitivement vos limites.`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(stressText1, 154), 28, 156);
  doc.text(doc.splitTextToSize(stressText2, 154), 28, 192);
  doc.text(doc.splitTextToSize(stressText3, 154), 28, 228);

  // ==========================================
  // PAGE 7: LA CARTE 2D DE TEMPÉRAMENT (BIBLEPROJECT QUADRANT)
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 7, cleanName, "Cartographie 2D de tempérament");
  addPageFooter(doc, 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre carte de positionnement relationnel 2D", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Positionnement de vos 4 marqueurs fondamentaux dans la matrice d'action.", 20, 35);

  // 2D Map Container (Width: 170mm, Centered)
  drawCard(doc, 20, 42, 170, 148, COLORS.white, COLORS.borderTint);
  drawBirkmanMap2D(doc, 55, 66, 100, starCoord, diamondCoord, circleCoord, squareCoord);

  // Legend 2x2 Grid Container (Cleanly within 170mm width)
  drawCard(doc, 20, 196, 170, 74, COLORS.creamBg, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Signification de vos 4 symboles sur la carte :", 26, 207);

  const legendItems = [
    { type: 'star' as const, name: "Élan & Intérêts", desc: "Ce vers quoi votre motivation gravite spontanément sans effort.", x: 26, y: 216 },
    { type: 'diamond' as const, name: "Style habituel", desc: "Votre comportement visible, vos forces naturelles en efficacité.", x: 106, y: 216 },
    { type: 'circle' as const, name: "Besoins profonds", desc: "L'environnement et le rythme nécessaires pour garder votre équilibre.", x: 26, y: 242 },
    { type: 'square' as const, name: "Réaction sous stress", desc: "Votre mécanisme de défense réflexe et improductif sous fatigue.", x: 106, y: 242 },
  ];

  legendItems.forEach(item => {
    doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.circle(item.x + 3, item.y + 3, 4.5, 'F');
    doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
    doc.setLineWidth(0.3);
    doc.circle(item.x + 3, item.y + 3, 4.5, 'S');

    drawVectorSymbol(doc, item.type, item.x + 3, item.y + 3, 2.5, COLORS.terracotta);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(item.name, item.x + 11, item.y + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(doc.splitTextToSize(item.desc, 70), item.x + 11, item.y + 8);
  });

  // ==========================================
  // PAGE 8: ÉCLAIRAGE SUR VOTRE ÉLAN NATUREL
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 8, cleanName, "Élan naturel et centres d'intérêt");
  addPageFooter(doc, 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Éclairage sur votre élan naturel (L'étoile)", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Les domaines et activités qui vous ressourcent spontanément.", 20, 36);

  // Pyramid Gauge for Interests
  drawCard(doc, 20, 44, 170, 52, COLORS.white, COLORS.borderTint);
  drawPyramidGauge(
    doc, 
    28, 
    56, 
    154, 
    "ORIENTATION DE VOTRE ÉLAN INITIAL", 
    "Centré sur la tâche et la structure", 
    "Centré sur l'humain et la relation", 
    starCoord.x, 
    'star'
  );

  drawCard(doc, 20, 104, 170, 166, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Ce qui allume votre enthousiasme :", 28, 118);

  const interestP1 = `Votre étoile se situe dans un secteur où la profondeur relationnelle et la fidélité aux principes priment sur la simple recherche de visibilité. Vous êtes stimulé par des projets porteurs de sens, où chaque engagement a un impact réel sur la durée.`;
  const interestP2 = `Vous préférez les échanges en petit comité ou les réflexions solitaires approfondies plutôt que le tumulte des assemblées bruyantes. Ce n'est pas un manque d'audace, mais le constat que votre intelligence opère mieux dans la clarté et le silence.`;
  const interestP3 = `Vos leviers majeurs d'épanouissement :
• Contribuer à une œuvre durable sans précipitation.
• Aider une personne à grandir dans la compréhension d'elle-même.
• Protéger l'authenticité face aux compromis faciles.`;

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(interestP1, 154), 28, 130);
  doc.text(doc.splitTextToSize(interestP2, 154), 28, 170);
  doc.text(doc.splitTextToSize(interestP3, 154), 28, 210);

  // ==========================================
  // PAGE 9: ÉCLAIRAGE SUR VOTRE COMPORTEMENT HABITUEL
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 9, cleanName, "Comportement habituel");
  addPageFooter(doc, 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Éclairage sur votre comportement habituel (Le losange)", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("La façon dont vos forces et votre efficacité sont perçues par les autres.", 20, 36);

  drawCard(doc, 20, 44, 170, 52, COLORS.white, COLORS.borderTint);
  drawPyramidGauge(
    doc, 
    28, 
    56, 
    154, 
    "STYLE D'ACTION ET DE PRÉSENCE HABITUELLE", 
    "Prudence mesurée et indépendance", 
    "Directivité et affirmation spontanée", 
    diamondCoord.x, 
    'diamond'
  );

  drawCard(doc, 20, 104, 170, 166, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Vos points forts en régime de croisière :", 28, 118);

  const usualP1 = `Quand vos besoins de base sont satisfaits, votre comportement est caractérisé par une constance rassurante. Les gens apprécient votre loyauté, votre rigueur morale et votre capacité à tenir le cap quand les vents changent.`;
  const usualP2 = `Vous n'avez pas besoin d'occuper tout l'espace pour exercer une influence véritable : votre autorité découle de votre compétence et de votre exemplarité silencieuse. Vous écoutez avant de trancher et cherchez des solutions équilibrées.`;
  const usualP3 = `Ce que les autres remarquent spontanément chez vous :
• Un grand calme face aux situations déstabilisantes.
• Une parole rare mais qui pèse de tout son poids.
• Une attention bienveillante pour les plus discrets du groupe.`;

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(usualP1, 154), 28, 130);
  doc.text(doc.splitTextToSize(usualP2, 154), 28, 170);
  doc.text(doc.splitTextToSize(usualP3, 154), 28, 210);

  // ==========================================
  // PAGE 10: ÉCLAIRAGE SUR VOS BESOINS PROFONDS
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 10, cleanName, "Besoins profonds");
  addPageFooter(doc, 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Éclairage sur vos besoins profonds (Le cercle)", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Les conditions invisibles mais indispensables pour maintenir votre équilibre.", 20, 36);

  drawCard(doc, 20, 44, 170, 52, COLORS.white, COLORS.borderTint);
  drawPyramidGauge(
    doc, 
    28, 
    56, 
    154, 
    "ATTENTE VIS-À-VIS DE VOTRE ENVIRONNEMENT", 
    "Cadre prévisible et respect du rythme", 
    "Stimulation permanente et improvisation", 
    circleCoord.x, 
    'circle'
  );

  drawCard(doc, 20, 104, 170, 166, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Ce dont vous avez impérativement besoin :", 28, 118);

  const needP1 = `Les besoins profonds représentent souvent la face cachée de votre personnalité. Alors que votre comportement habituel semble autonome et adaptable, vous avez intérieurement besoin de loyauté absolue et de franchise non agressive.`;
  const needP2 = `L'ambiguïté relationnelle et les reproches implicites vous fatiguent plus que de raison. Vous préférez un désaccord net exprimé avec respect plutôt qu'un consensus feint qui dissimule des arrières-pensées.`;
  const needP3 = `Votre contrat relationnel idéal :
• Des règles claires et appliquées avec équité pour tous.
• Un espace de temps pour assimiler les changements avant d'agir.
• L'assurance que votre parole sera prise au sérieux sans avoir à élever la voix.`;

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(needP1, 154), 28, 130);
  doc.text(doc.splitTextToSize(needP2, 154), 28, 170);
  doc.text(doc.splitTextToSize(needP3, 154), 28, 210);

  // ==========================================
  // PAGE 11: ÉCLAIRAGE SUR VOS RÉFLEXES SOUS STRESS
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 11, cleanName, "Réflexes sous stress");
  addPageFooter(doc, 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Éclairage sur vos réflexes sous stress (Le carré)", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Comprendre vos réactions de frustration pour mieux les désamorcer.", 20, 36);

  drawCard(doc, 20, 44, 170, 52, COLORS.white, COLORS.borderTint);
  drawPyramidGauge(
    doc, 
    28, 
    56, 
    154, 
    "INTENSITÉ DE LA RÉACTION DE FRUSTRATION", 
    "Résistance silencieuse et rigidité", 
    "Explosion verbale et confrontation directe", 
    squareCoord.x, 
    'square'
  );

  drawCard(doc, 20, 104, 170, 166, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Ce qui se déclenche automatiquement :", 28, 118);

  const stressP1 = `Lorsque vos besoins fondamentaux sont négligés sur une longue période, votre carré s'active : vous passez d'une attitude coopérative à une rigidité de principe. Vous refusez le compromis et vous vous enfermez dans une posture de résistance passive.`;
  const stressP2 = `Dans cet état, vous pouvez devenir excessivement critique à l'égard des détails et minimiser la valeur des apports extérieurs. Ce comportement n'est pas de la malveillance : c'est un bouclier pour éviter de vous sentir vulnérable ou manipulé.`;
  const stressP3 = `Protocole d'urgence pour désamorcer la crise :
1. Identifier le signal corporel d'alerte (mâchoires serrées, soupir, envie de fuite).
2. S'accorder une pause de 15 minutes sans écran ni interaction.
3. Formuler la demande concrète : « J'ai besoin de clarifier ce point avant de continuer ».`;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(stressP1, 154), 28, 130);
  doc.text(doc.splitTextToSize(stressP2, 154), 28, 168);
  doc.text(doc.splitTextToSize(stressP3, 154), 28, 206);

  // ==========================================
  // PAGE 12: DASHBOARD DES 9 COMPOSANTES (CLEAN NUMBERS, NO BROKEN EMOJIS)
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 12, cleanName, "Tableau de bord des 9 composantes");
  addPageFooter(doc, 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Tableau de bord des 9 composantes comportementales", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Comparaison systématique : votre style habituel versus vos besoins sous tension.", 20, 35);

  // 3x3 Grid of Component Cards (Clean vector badges without broken emojis)
  const nineComponents = [
    { num: "01", title: "Énergie relationnelle", usual: 68, needs: 42 },
    { num: "02", title: "Rythme d'action", usual: 74, needs: 55 },
    { num: "03", title: "Sensibilité émotionnelle", usual: 62, needs: 62 },
    { num: "04", title: "Franchise et tact", usual: 58, needs: 32 },
    { num: "05", title: "Affirmation d'autorité", usual: 65, needs: 70 },
    { num: "06", title: "Rigueur des méthodes", usual: 78, needs: 48 },
    { num: "07", title: "Volonté d'impact", usual: 71, needs: 40 },
    { num: "08", title: "Adaptabilité au changement", usual: 54, needs: 28 },
    { num: "09", title: "Discernement réfléchi", usual: 82, needs: 82 }
  ];

  const cardW = 53;
  const cardH = 46;
  const startX = 20;
  let curY = 44;

  nineComponents.forEach((comp, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cX = startX + col * (cardW + 5.5);
    const cY = curY + row * (cardH + 6);

    drawCard(doc, cX, cY, cardW, cardH, COLORS.white, COLORS.borderTint);

    // Number Badge (replaces broken emojis)
    doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
    doc.roundedRect(cX + 6, cY + 6, 8, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(comp.num, cX + 10, cY + 11.5, { align: 'center' });

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(comp.title, 34), cX + 17, cY + 10);

    // Divider
    doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
    doc.line(cX + 6, cY + 22, cX + cardW - 6, cY + 22);

    // Dual Scores with vertical separator
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text("Habituel", cX + 14, cY + 29, { align: 'center' });
    doc.text("Besoins", cX + 39, cY + 29, { align: 'center' });

    doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
    doc.line(cX + 26, cY + 26, cX + 26, cY + 41);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(comp.usual.toString(), cX + 14, cY + 39, { align: 'center' });

    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(comp.needs.toString(), cX + 39, cY + 39, { align: 'center' });
  });

  // Interpretation box
  drawCard(doc, 20, 206, 170, 64, COLORS.creamBg, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Comprendre les écarts entre Habituel et Besoins :", 28, 218);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("• Un écart important (ex: Adaptabilité 54 vs 28) indique une zone de tension potentielle.", 28, 228);
  doc.text("• Vous êtes capable d'agir avec souplesse, mais vous avez besoin de temps de préparation.", 28, 237);
  doc.text("• Lorsque le score de Besoins est élevé, ne négligez jamais cette ressource sous peine d'épuisement.", 28, 246);

  // ==========================================
  // PAGE 13: TABLEAU DES INTÉRÊTS & VOCATIONS
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 13, cleanName, "Tableau des intérêts et vocations");
  addPageFooter(doc, 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Tableau de vos intérêts et de vos vocations", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Représentation visuelle des domaines d'activité où votre apport est maximal.", 20, 35);

  // 2 columns of 5 circular badges each = 10 areas (with strictly wrapped text)
  const interestAreas = [
    { title: "Service et écoute d'autrui", desc: "Soutien individuel, présence et écoute active", pct: 86, col: COLORS.terracotta },
    { title: "Perception et discernement", desc: "Saisir les enjeux profonds et cachés", pct: 82, col: COLORS.ochre },
    { title: "Gouvernance et rigueur", desc: "Clarté des processus, équité et intégrité", pct: 76, col: COLORS.sage },
    { title: "Transmission et pédagogie", desc: "Enseigner avec clarté, former et transmettre", pct: 72, col: COLORS.blue },
    { title: "Création et écriture", desc: "Mise en mots, rédaction et expression posée", pct: 68, col: COLORS.terracotta },
    { title: "Bâtir et concrétiser", desc: "Mettre en œuvre des solutions concrètes", pct: 64, col: COLORS.ochre },
    { title: "Coordination fraternelle", desc: "Mobiliser les frères autour d'un but commun", pct: 58, col: COLORS.sage },
    { title: "Intercession & recueillement", desc: "Garder la mémoire spirituelle et l'ancrage", pct: 84, col: COLORS.blue },
    { title: "Négociation & conciliation", desc: "Pacifier les différends et renouer le lien", pct: 74, col: COLORS.terracotta },
    { title: "Exploration et audace", desc: "Défricher de nouveaux territoires d'action", pct: 52, col: COLORS.ochre }
  ];

  let intY = 46;
  for (let i = 0; i < interestAreas.length; i += 2) {
    const item1 = interestAreas[i];
    const item2 = interestAreas[i + 1];

    // Left card
    drawCard(doc, 20, intY, 82, 38, COLORS.white, COLORS.borderTint);
    drawCircularPercentBadge(doc, 34, intY + 19, 10, item1.pct, item1.title, item1.desc, item1.col, 46);

    // Right card
    if (item2) {
      drawCard(doc, 108, intY, 82, 38, COLORS.white, COLORS.borderTint);
      drawCircularPercentBadge(doc, 122, intY + 19, 10, item2.pct, item2.title, item2.desc, item2.col, 46);
    }

    intY += 43;
  }

  // ==========================================
  // PAGES 14 à 18 : LES 5 AXES CHIRURGICAUX
  // ==========================================
  const axisDetails = [
    {
      page: 14,
      dim: 'I_A' as Dimension,
      title: "Axe 1 — Intériorité vs Action",
      sub: "Où puisez-vous votre ressource vitale : dans le silence ou dans l'effervescence ?",
      pole1: "Intériorité (Contemplation)",
      pole2: "Action (Pragmatisme)",
      p1Text: "Cet axe mesure votre manière de vous ressourcer. Une dominante Intériorité signifie que votre lucidité s'affine dans le recueillement, loin de la dispersion. Vous devez préserver des temps de solitude féconde pour rester efficace.",
      p2Text: "Risque de surchauffe : lorsque vous êtes privé de ces temps de recul, vous devenez irritable et perdez votre sens des priorités.",
      exercise: "Exercice pratique : sanctuarisez chaque matin 10 minutes sans téléphone ni distraction avant de vous lancer dans la journée."
    },
    {
      page: 15,
      dim: 'S_E' as Dimension,
      title: "Axe 2 — Soumission vs Émancipation",
      sub: "Votre rapport à la règle reçue, à la tradition et à la liberté de création.",
      pole1: "Soumission (Fidélité au cadre)",
      pole2: "Émancipation (Audace créatrice)",
      p1Text: "Cet axe analyse votre relation à l'autorité établie. Votre score reflète un équilibre entre le respect des institutions éprouvées et le courage d'innover quand la lettre étouffe l'esprit.",
      p2Text: "Risque de surchauffe : se conformer aveuglément par peur du conflit ou au contraire rejeter l'autorité par pure réactivité.",
      exercise: "Exercice pratique : identifiez un domaine où vous suivez une règle par habitude et demandez-vous si elle nourrit encore la mission."
    },
    {
      page: 16,
      dim: 'V_G' as Dimension,
      title: "Axe 3 — Vérité vs Grâce",
      sub: "Quand la tension surgit : tranchez-vous par le principe ou accueillez-vous la personne ?",
      pole1: "Vérité (Justice & Principe)",
      pole2: "Grâce (Miséricorde & Accueil)",
      p1Text: "Le dilemme éternel entre rigueur éthique et compassion. La vérité sans grâce devient cruauté ; la grâce sans vérité devient démission. Votre positionnement montre une volonté d'ajustement respectueux.",
      p2Text: "Risque de surchauffe : vouloir ménager tout le monde et perdre la clarté, ou être si tranchant que la relation se brise.",
      exercise: "Exercice pratique : avant toute conversation difficile, écrivez la vérité à dire et les mots de bienveillance qui l'accompagneront."
    },
    {
      page: 17,
      dim: 'L_F' as Dimension,
      title: "Axe 4 — Lettre vs Esprit",
      sub: "Privilégiez-vous la sécurité des procédures ou le souffle de l'imprévu ?",
      pole1: "Lettre (Méthode & Structure)",
      pole2: "Esprit (Spontanéité & Inspiration)",
      p1Text: "L'attachement aux détails méthodologiques versus l'ouverture à l'inattendu. Votre résultat témoigne d'un amour pour le travail bien fait sans tomber dans le perfectionnisme étouffant.",
      p2Text: "Risque de surchauffe : bloquer un projet sous prétexte qu'une formalité manque, ou improviser au point de créer l'insécurité.",
      exercise: "Exercice pratique : apprenez à déléguer la méthode en ne fixant que le résultat attendu et le délai."
    },
    {
      page: 18,
      dim: 'R_M' as Dimension,
      title: "Axe 5 — Réforme vs Maintien",
      sub: "Votre posture face à l'histoire : transformer le monde ou en préserver l'héritage ?",
      pole1: "Réforme (Transformation active)",
      pole2: "Maintien (Préservation loyale)",
      p1Text: "Cet axe oppose l'élan réformateur à la sagesse conservatrice. Votre profil biblique sait honorer les racines tout en discernant ce qui doit être rénové pour porter du fruit nouveau.",
      p2Text: "Risque de surchauffe : l'impatience révolutionnaire qui détruit ce qui est précieux, ou la nostalgie qui paralyse.",
      exercise: "Exercice pratique : distinguez clairement ce qui est non négociable (les principes) de ce qui peut évoluer (les formes)."
    }
  ];

  axisDetails.forEach(ax => {
    doc.addPage();
    addPageHeader(doc, ax.page, cleanName, ax.title);
    addPageFooter(doc, ax.page);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(ax.title, 20, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(ax.sub, 20, 36);

    const d = dimensions[ax.dim];

    // Score Card
    drawCard(doc, 20, 44, 170, 52, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    const domPct = d.rawValue <= 0 ? d.leftPercent : d.rightPercent;
    doc.text(`Dominante identifiée : ${d.dominantLabel} (${domPct}%)`, 28, 56);

    // Track in neutral warm tint
    const barX = 28;
    const barY = 64;
    const barW = 154;
    const barH = 7;
    doc.setFillColor(236, 231, 222);
    doc.roundedRect(barX, barY, barW, barH, 3.5, 3.5, 'F');

    // Colored progress fill starting from dominant extreme (left or right)
    doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    let markerX = barX + barW / 2;
    if (d.rawValue <= 0) {
      const fillW = Math.max(10, Math.min(barW, (d.leftPercent / 100) * barW));
      doc.roundedRect(barX, barY, fillW, barH, 3.5, 3.5, 'F');
      markerX = barX + fillW;
    } else {
      const fillW = Math.max(10, Math.min(barW, (d.rightPercent / 100) * barW));
      const fillX = barX + barW - fillW;
      doc.roundedRect(fillX, barY, fillW, barH, 3.5, 3.5, 'F');
      markerX = fillX;
    }

    // Center divider tick (50% mark)
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.8);
    doc.line(barX + barW / 2, barY - 1, barX + barW / 2, barY + barH + 1);

    // Marker pill
    doc.setFillColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.circle(markerX, barY + barH / 2, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(markerX, barY + barH / 2, 1.5, 'F');

    // Labels under bar (clean labels without arrows)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`Pôle 1 : ${ax.pole1} (${d.leftPercent}%)`, barX, barY + 14);
    const rW = doc.getTextWidth(`Pôle 2 : ${ax.pole2} (${d.rightPercent}%)`);
    doc.text(`Pôle 2 : ${ax.pole2} (${d.rightPercent}%)`, barX + barW - rW, barY + 14);

    // Deep dive content card
    drawCard(doc, 20, 104, 170, 94, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text("Décodage psychologique et spirituel de cet axe :", 28, 118);

    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(ax.p1Text, 154), 28, 132);
    doc.text(doc.splitTextToSize(ax.p2Text, 154), 28, 164);

    // Action coaching card
    drawCard(doc, 20, 206, 170, 64, COLORS.ochreLight, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text("Protocole d'auto-coaching recommandé :", 28, 220);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(ax.exercise, 154), 28, 232);
  });

  // ==========================================
  // PAGE 19: SYNTHÈSE COMPARATIVE DES 5 POLARITÉS
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 19, cleanName, "Synthèse comparative des 5 polarités");
  addPageFooter(doc, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Synthèse comparative de vos 5 polarités", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Matrice récapitulative pour visualiser vos tensions motrices.", 20, 36);

  // Table header
  drawCard(doc, 20, 46, 170, 160, COLORS.white, COLORS.borderTint);
  doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
  doc.rect(20, 46, 170, 14, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("AXE", 25, 55);
  doc.text("PÔLE GAUCHE", 44, 55);
  doc.text("PÔLE DROIT", 98, 55);
  doc.text("DOMINANTE IDENTIFIÉE", 150, 55);

  let rowY = 70;
  dimKeysOrder.forEach((k, idx) => {
    const d = dimensions[k];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`Axe ${idx + 1}`, 25, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${d.leftLabel} (${d.leftPercent}%)`, 44, rowY);
    doc.text(`${d.rightLabel} (${d.rightPercent}%)`, 98, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(d.dominantLabel, 150, rowY);

    doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
    doc.line(24, rowY + 6, 186, rowY + 6);
    rowY += 26;
  });

  // Balance guidance box
  drawCard(doc, 20, 214, 170, 56, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Évaluation de votre cohérence d'ensemble :", 28, 226);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text("Vos 5 polarités ne se contredisent pas : elles forment un système homéostatique stable. Vos scores montrent une personne attachée à la fidélité et à la profondeur, capable d'assumer des responsabilités durables sans rechercher le spectaculaire.", 28, 236, { maxWidth: 154 });

  // ==========================================
  // PAGE 20: GRILLE DE RÉGULATION ET DISCERNEMENT
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 20, cleanName, "Grille de régulation et discernement");
  addPageFooter(doc, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Grille de régulation et de discernement", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Les repères pour maintenir votre équilibre au quotidien.", 20, 36);

  const regCards = [
    { title: "Quand vous êtes au meilleur de vous-même :", desc: "Clarté d'esprit, sérénité intérieure, accueil sans jugement, fermeté bienveillante et parole constructive.", col: COLORS.sage },
    { title: "Les premiers signes de glissement :", desc: "Repli sur soi, hésitation prolongée à décider, sentiment d'incompréhension et agacement secret face au bruit.", col: COLORS.ochre },
    { title: "En zone critique de fatigue psychologique :", desc: "Scepticisme excessif, déconnexion émotionnelle, rejet des tâches collectives et refus d'entendre les arguments.", col: COLORS.terracotta }
  ];

  let rY = 48;
  regCards.forEach(c => {
    drawCard(doc, 20, rY, 170, 52, COLORS.white, COLORS.borderTint);
    doc.setFillColor(c.col[0], c.col[1], c.col[2]);
    doc.rect(20, rY, 4, 52, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(c.col[0], c.col[1], c.col[2]);
    doc.text(c.title, 30, rY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(c.desc, 150), 30, rY + 28);

    rY += 60;
  });

  // Actionable reminder
  drawCard(doc, 20, 234, 170, 38, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Règle de discernement immédiat :", 28, 246);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text("Ne prenez jamais de décision engageante lorsque vous êtes en zone de repli. Accordez-vous une nuit de recueillement avant de clore un débat.", 28, 255, { maxWidth: 154 });

  // ==========================================
  // PAGE 21: VOS ARCHÉTYPES SECONDAIRES PROCHES
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 21, cleanName, "Archétypes secondaires proches");
  addPageFooter(doc, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Vos archétypes secondaires proches", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Les figures bibliques qui partagent votre sensibilité et enrichissent votre palette.", 20, 36);

  let matchesToShow: CharacterMatch[] = (secondaryMatches && secondaryMatches.length > 0) ? secondaryMatches.slice(0, 3) : [];
  if (matchesToShow.length === 0) {
    const fallbackKeys = Object.keys(ARCHETYPES).filter(k => k !== archetype.key);
    matchesToShow = fallbackKeys.slice(0, 3).map((k, i) => ({
      archetype: ARCHETYPES[k],
      affinity: Math.max(72, affinity - (i + 1) * 4),
      distance: i + 1
    }));
  }

  let secY = 46;
  for (let i = 0; i < matchesToShow.length; i++) {
    const m = matchesToShow[i];
    drawCard(doc, 20, secY, 170, 58, COLORS.white, COLORS.borderTint);

    // Arched silhouette graphic on left of card
    try {
      const pngData = await getArchetypeSilhouettePngDataUrl(m.archetype, 400);
      if (pngData) {
        doc.addImage(pngData, 'PNG', 24, secY + 6, 36, 46);
      } else {
        drawArchedSilhouetteGraphic(doc, 39, secY + 6, m.archetype, 0.52);
      }
    } catch {
      drawArchedSilhouetteGraphic(doc, 39, secY + 6, m.archetype, 0.52);
    }

    // Character text details on right of silhouette
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${m.archetype.name}`, 64, secY + 14);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`« ${m.archetype.title} »`, 64, secY + 22);

    doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
    doc.roundedRect(142, secY + 8, 42, 14, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${m.affinity}% affinité`, 163, secY + 17.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    const secDesc = m.archetype.description.substring(0, 210) + "...";
    doc.text(doc.splitTextToSize(secDesc, 120), 64, secY + 31);

    secY += 66;
  }

  // Cross-pollination note
  drawCard(doc, 20, 248, 170, 26, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Ces figures secondaires représentent des ressources de secours : en cas d'impasse, inspirez-vous de leurs réactions pour élargir votre champ de réponse.", 28, 258, { maxWidth: 154 });

  // ==========================================
  // PAGE 22: VOTRE PENDANT DE L'AUTRE GENRE
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 22, cleanName, "Pendant de l'autre genre");
  addPageFooter(doc, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre pendant biblique de l'autre genre", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("La manifestation féminine ou masculine de la même dynamique spirituelle.", 20, 36);

  let counterpart: Archetype | undefined = genderEquivalentMatch?.archetype;
  if (!counterpart || counterpart.gender === archetype.gender || counterpart.key === archetype.key) {
    const targetGender = archetype.gender === 'M' ? 'F' : 'M';
    const oppArchetypes = (Object.values(ARCHETYPES) as Archetype[]).filter(a => a.gender === targetGender);
    counterpart = oppArchetypes.find(a => a.dimension === archetype.dimension) || oppArchetypes[0] || ARCHETYPES.marie_bethanie || archetype;
  }
  const countAffinity = genderEquivalentMatch?.affinity || (affinity > 80 ? affinity - 3 : 84);

  drawCard(doc, 20, 46, 170, 142, COLORS.white, COLORS.borderTint);

  // Arched silhouette graphic of counterpart on left
  try {
    const pngData = await getArchetypeSilhouettePngDataUrl(counterpart, 600);
    if (pngData) {
      doc.addImage(pngData, 'PNG', 26, 50, 56, 70);
    } else {
      drawArchedSilhouetteGraphic(doc, 54, 52, counterpart, 0.82);
    }
  } catch {
    drawArchedSilhouetteGraphic(doc, 54, 52, counterpart, 0.82);
  }

  // Character text on right of arch
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(counterpart.name, 90, 62);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`« ${counterpart.title} »`, 90, 70);

  doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
  doc.roundedRect(144, 52, 40, 16, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`${countAffinity}% affinité`, 164, 63, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(counterpart.description, 92), 90, 82);

  // Biblical verse spanning below the arch
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(doc.splitTextToSize(`« ${counterpart.biblicalVerse} »`, 154), 28, 144);

  // Lesson card
  drawCard(doc, 20, 196, 170, 74, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("L'enseignement de cette complémentarité :", 28, 210);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const countLesson = `La figure de ${counterpart.name} montre comment vos forces s'incarnent avec des nuances différentes selon les contextes. Là où votre profil peut paraître plus réservé, son exemple rappelle que la persévérance silencieuse déplace des montagnes sans tapage.`;
  doc.text(doc.splitTextToSize(countLesson, 154), 28, 222);

  // ==========================================
  // PAGE 23: MATRICE D'ALLIANCE ET COMPLÉMENTARITÉ
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 23, cleanName, "Matrice d'alliance");
  addPageFooter(doc, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Matrice d'alliance et complémentarité fraternelle", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Le Corps est un organisme vivant : comment collaborer avec vos profils opposés.", 20, 36);

  const alliances = [
    { type: "Le profil Propulseur (ex: Pierre)", role: "Il apporte l'audace, la vitesse et l'énergie du premier pas.", fruit: "Alliance féconde : vous lui offrez la profondeur et la prévoyance ; il vous sort de l'hésitation." },
    { type: "Le profil Fédérateur (ex: Barnabé)", role: "Il crée le lien émotionnel, accueille les fragilités et console.", fruit: "Alliance féconde : vous apportez l'ancrage doctrinal ; il humanise vos exigences." },
    { type: "Le profil Sentinelle (ex: Jean-Baptiste)", role: "Il dénonce les faux-semblants et exige une vérité sans fard.", fruit: "Alliance féconde : vous tempérez son feu par la miséricorde ; il réveille votre vigilance." }
  ];

  let alY = 48;
  alliances.forEach(al => {
    drawCard(doc, 20, alY, 170, 56, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(al.type, 28, alY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(al.role, 154), 28, alY + 24);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.sage[0], COLORS.sage[1], COLORS.sage[2]);
    doc.text(doc.splitTextToSize(al.fruit, 154), 28, alY + 38);

    alY += 62;
  });

  drawCard(doc, 20, 240, 170, 34, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("« Si tout le corps était œil, où serait l'ouïe ? Dieu a disposé chaque membre dans le corps comme il l'a voulu. » (1 Cor 12:17)", 28, 252, { maxWidth: 154 });

  // ==========================================
  // PAGE 24: DÉSAMORÇAGE DES TENSIONS RELATIONNELLES
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 24, cleanName, "Désamorçage des tensions");
  addPageFooter(doc, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Désamorçage des tensions et communication ajustée", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Comment formuler vos attentes sans heurter et désamorcer les conflits naissants.", 20, 36);

  drawCard(doc, 20, 46, 170, 218, COLORS.white, COLORS.borderTint);

  const commRules = [
    { tit: "1. Ce qui est perçu à tort chez vous :", txt: "Votre silence est souvent interprété comme un jugement secret ou de la désapprobation. Dites explicitement : « Je réfléchis, je ne suis pas contre toi »." },
    { tit: "2. Formuler une divergence avec tact :", txt: "Évitez le « Tu as tort », préférez : « Je comprends ton angle, voici ce qui m'inquiète sur le long terme pour la paix du projet »." },
    { tit: "3. Face à une personne impulsive et bruyante :", txt: "Ne partez pas dans la surenchère ni dans le mépris muet. Reconnaissez son énergie puis demandez un délai d'analyse : « Ton élan est précieux, donnons-nous 24h pour valider la faisabilité »." },
    { tit: "4. Face à une personne hésitante et anxieuse :", txt: "Apportez-lui votre calme naturel. Sécurisez le cadre par des repères méthodologiques rassurants." }
  ];

  let cY = 58;
  commRules.forEach(r => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(r.tit, 28, cY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(r.txt, 154), 28, cY + 9);

    cY += 46;
  });

  // ==========================================
  // PAGE 25: LES 4 SAISONS DE VOTRE DÉVELOPPEMENT
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 25, cleanName, "Les 4 saisons de développement");
  addPageFooter(doc, 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Les 4 saisons de votre développement personnel", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Comprendre les étapes par lesquelles passe votre tempérament vers la pleine maturité.", 20, 36);

  const seasons = [
    { season: "Printemps — L'éveil des charismes", text: "Découverte de votre sensibilité propre. Vous ressentez intensément les choses sans toujours savoir comment les articuler. Période d'enthousiasme où l'expérience spirituelle s'affirme." },
    { season: "Été — L'épreuve de la confrontation", text: "Le choc avec le réel et les tempéraments opposés. Découverte de vos angles morts et de vos réflexes sous stress. Période d'ajustement où l'idéalisme naïf cède la place au réalisme fraternel." },
    { season: "Automne — La sanctification du don", text: "Vos forces ne sont plus utilisées pour vous protéger, mais pour édifier les autres. L'intériorité devient source de paix contagieuse et d'accueil bienveillant pour la communauté." },
    { season: "Hiver — La transmission et la fécondité", text: "Étape de paternité ou maternité spirituelle. Vous guidez sans dominer, vous écoutez avec miséricorde et vous savez passer le relais aux générations montantes." }
  ];

  let sY = 48;
  seasons.forEach(s => {
    drawCard(doc, 20, sY, 170, 50, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(s.season, 28, sY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(s.text, 154), 28, sY + 24);

    sY += 56;
  });

  // ==========================================
  // PAGE 26: DIAGNOSTIC DE VOS ANGLES MORTS
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 26, cleanName, "Diagnostic des angles morts");
  addPageFooter(doc, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Diagnostic de vos angles morts majeurs", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Ce qui vous échappe lorsque vous n'y prenez pas garde.", 20, 36);

  const blindspots = [
    { title: "Angle mort 1 : L'illusion de la transparence", exp: "Vous croyez que votre bienveillance intérieure est évidente pour tous, alors que votre visage fermé et votre réserve peuvent être perçus comme du mépris ou de la froideur." },
    { title: "Angle mort 2 : La tentation du tribunal secret", exp: "Parce que vous observez avec finesse, vous diagnostiquez vite les failles d'autrui. Le piège est de les juger intérieurement sans leur offrir une chance de dialogue fraternel." },
    { title: "Angle mort 3 : L'oubli du premier pas", exp: "Vous attendez que les autres viennent vers vous pour ouvrir votre cœur. Mais bien souvent, les autres sont intimidés par votre calme et n'osent pas faire la démarche." }
  ];

  let bY = 48;
  blindspots.forEach(b => {
    drawCard(doc, 20, bY, 170, 56, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(b.title, 28, bY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(b.exp, 154), 28, bY + 26);

    bY += 62;
  });

  drawCard(doc, 20, 240, 170, 32, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("L'antidote biblique :", 28, 250);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("« Confessez vos péchés les uns aux autres et priez les uns pour les autres afin d'être guéris. » (Jc 5:16)", 28, 260);

  // ==========================================
  // PAGE 27: INTRODUCTION AU PLAN D'ACTION (30 JOURS)
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 27, cleanName, "Plan d'action sur 30 jours");
  addPageFooter(doc, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Plan d'action et auto-coaching sur 30 jours", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Une démarche pragmatique en 4 semaines pour ancrer de nouveaux réflexes.", 20, 36);

  drawCard(doc, 20, 46, 170, 150, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Mode d'emploi de votre parcours de 4 semaines :", 28, 60);

  const introAction = `Ce plan n'est pas une liste de corvées moralisatrices : c'est un laboratoire d'expérimentation bienveillante avec vous-même. Chaque semaine est consacrée à un levier précis de votre tempérament.

• Semaine 1 : Clarification et désamorçage des réflexes défensifs.
• Semaine 2 : Régulation des tensions intérieures et accueil du rythme.
• Semaine 3 : Communication ajustée et alliances avec les profils opposés.
• Semaine 4 : Ancrage durable, consolidation et rayonnement paisible.

Pour chaque semaine, vous trouverez 3 actions concrètes dotées de cases à cocher ainsi qu'une question d'introspection à méditer le soir.`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(introAction, 154), 28, 72);

  // Commitment box
  drawCard(doc, 20, 204, 170, 68, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Mon engagement personnel de travail sur moi :", 28, 218);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`« Moi, ${cleanName}, je m'engage à suivre ce parcours avec patience et honnêteté intellectuelle, non pour devenir quelqu'un d'autre, mais pour sanctifier ce que Dieu a déposé en moi. »`, 28, 230, { maxWidth: 154 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Date d'initiation : ${reportDate} • Signature : ___________________________`, 28, 258);

  // ==========================================
  // PAGES 28 à 31 : LES 4 SEMAINES DU PLAN
  // ==========================================
  const weeksData = [
    {
      page: 28,
      sem: "Semaine 1",
      title: "Clarification et désamorçage des réflexes",
      focus: "Objectif : repérer vos signaux d'irritation et cesser de vous replier passivement.",
      actions: [
        "Noter chaque jour dans un carnet un moment où vous avez ressenti l'envie de fuir ou de vous taire par dépit.",
        "Identifier le besoin non comblé sous cette réaction (besoin de calme, besoin de reconnaissance, besoin de franchise).",
        "Formuler au moins une fois dans la semaine un refus clair mais cordial plutôt que de subir en silence."
      ],
      motto: "« Mieux vaut une parole franche dite avec amour qu'un silence rancunier. »"
    },
    {
      page: 29,
      sem: "Semaine 2",
      title: "Régulation des tensions intérieures",
      focus: "Objectif : pacifier votre dialogue interne et accueillir vos limites physiques et émotionnelles.",
      actions: [
        "Sanctuariser chaque jour 15 minutes d'immersion dans le silence sans aucun stimulus numérique.",
        "Renoncer à un perfectionnisme stérile sur une tâche secondaire et accepter le résultat « suffisamment bon ».",
        "Pratiquer la bénédiction intérieure d'une personne avec qui le contact est rugueux."
      ],
      motto: "« La paix de Dieu qui surpasse toute intelligence gardera vos cœurs. »"
    },
    {
      page: 30,
      sem: "Semaine 3",
      title: "Communication ajustée et alliances",
      focus: "Objectif : aller vers les profils complémentaires et expliciter votre manière de fonctionner.",
      actions: [
        "Expliquer à un collaborateur ou proche : « Quand je garde le silence, je ne te rejette pas, je réfléchis ».",
        "Demander le point de vue d'un profil plus spontané ou direct sur une décision que vous hésitez à trancher.",
        "Exprimer une gratitude explicite et circonstanciée à quelqu'un qui vous a soutenu dans l'ombre."
      ],
      motto: "« Deux valent mieux qu'un, car ils tirent un bon salaire de leur travail. »"
    },
    {
      page: 31,
      sem: "Semaine 4",
      title: "Ancrage durable et rayonnement",
      focus: "Objectif : mettre vos dons au service de la paix collective sans vous oublier en chemin.",
      actions: [
        "Choisir un engagement ou service où votre profondeur d'écoute sera directement utile à une personne fragilisée.",
        "Définir 3 règles d'hygiène de vie (sommeil, déconnexion, temps de prière) à reconduire sur les 6 prochains mois.",
        "Relire l'ensemble de ce guide et surligner les 3 vérités qui ont transformé votre regard sur vous-même."
      ],
      motto: "« Que votre lumière luise ainsi devant les hommes afin qu'ils voient vos bonnes œuvres. »"
    }
  ];

  weeksData.forEach(w => {
    doc.addPage();
    addPageHeader(doc, w.page, cleanName, `${w.sem} • ${w.title}`);
    addPageFooter(doc, w.page);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${w.sem} : ${w.title}`, 20, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(w.focus, 20, 36);

    // 3 Action boxes with checkboxes
    let aY = 48;
    w.actions.forEach((act, idx) => {
      drawCard(doc, 20, aY, 170, 48, COLORS.white, COLORS.borderTint);

      // Checkbox square
      doc.setDrawColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
      doc.setLineWidth(0.8);
      doc.roundedRect(28, aY + 12, 6, 6, 1, 1, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
      doc.text(`Action concrète N°${idx + 1} :`, 38, aY + 17);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
      doc.text(doc.splitTextToSize(act, 140), 38, aY + 27);

      aY += 56;
    });

    // Weekly quote
    drawCard(doc, 20, 222, 170, 48, COLORS.ochreLight, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text("Parole d'ancrage pour votre semaine :", 28, 234);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(w.motto, 28, 246, { maxWidth: 154 });
  });

  // ==========================================
  // PAGE 32: QUESTIONNAIRE D'AUTO-COACHING
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 32, cleanName, "Questionnaire d'auto-coaching");
  addPageFooter(doc, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Questionnaire d'auto-coaching et bilan d'étape", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Prenez un stylo et notez vos réponses sans fard au terme des 30 jours.", 20, 36);

  const questionsCoaching = [
    "1. Quel réflexe d'évitement ou de repli avez-vous réussi à désamorcer le plus nettement ce mois-ci ?",
    "2. Dans quelle relation précise avez-vous réussi à exprimer votre besoin au lieu de subir en silence ?",
    "3. Quel compliment ou retour positif reçu d'un tiers a confirmé la valeur de votre charisme propre ?",
    "4. Quel est le piège qui continue de vous attirer et pour lequel vous devez rester vigilant ?"
  ];

  let qY = 46;
  questionsCoaching.forEach(q => {
    drawCard(doc, 20, qY, 170, 50, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(q, 28, qY + 12);

    // Dotted lines for writing
    doc.setDrawColor(210, 205, 195);
    doc.setLineWidth(0.3);
    doc.line(28, qY + 24, 180, qY + 24);
    doc.line(28, qY + 34, 180, qY + 34);
    doc.line(28, qY + 44, 180, qY + 44);

    qY += 56;
  });

  // ==========================================
  // PAGE 33: FICHE MÉMO DÉTACHABLE
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 33, cleanName, "Fiche mémo personnelle");
  addPageFooter(doc, 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Fiche mémo personnelle (à garder à portée de main)", 20, 28);

  drawCard(doc, 20, 40, 170, 226, COLORS.white, COLORS.borderTint);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`PROFIL RÉFÉRENT : ${archetype.name.toUpperCase()} (${affinity}%)`, 28, 54);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`« ${archetype.title} »`, 28, 62);

  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.line(28, 68, 182, 68);

  // 5 polarities brief
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("VOS 5 ÉQUILIBRES MAJEURS :", 28, 78);

  let memY = 88;
  dimKeysOrder.forEach((k, idx) => {
    const d = dimensions[k];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`• Axe ${idx + 1} (${d.label})`, 32, memY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    const valText = `${d.dominantLabel} (${d.rawValue <= 0 ? d.leftPercent : d.rightPercent}%)`;
    doc.text(valText, 178, memY, { align: 'right' });
    memY += 10;
  });

  doc.line(28, memY + 3, 182, memY + 3);

  // 3 Golden reminders
  memY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("VOS 3 RAPPELS D'OR QUOTIDIENS :", 28, memY);

  memY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("1. Votre calme est votre force : ne le bradez pas pour une agitation superficielle.", 32, memY);
  memY += 8;
  doc.text("2. La complémentarité n'est pas une menace : vos opposés voient ce qui vous échappe.", 32, memY);
  memY += 8;
  doc.text("3. La vérité sans amour blesse ; la grâce sans vérité égare. Visez la justesse.", 32, memY);

  memY += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("PAROLE D'ANCRAGE :", 28, memY);

  memY += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(`« ${archetype.biblicalVerse} »`, 146), 28, memY);

  // ==========================================
  // PAGE 34: BIBLIOTHÈQUE DE RESSOURCES
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 34, cleanName, "Ressources et lectures");
  addPageFooter(doc, 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Ressources et lectures recommandées", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Ouvrages sélectionnés pour enrichir votre compréhension des tempéraments.", 20, 36);

  const books = [
    { title: "Les Tempéraments au regard de la foi", author: "P. Marie-Dominique Philippe", desc: "Une étude classique et lumineuse sur la sanctification des tempéraments naturels." },
    { title: "L'art de l'écoute et du discernement", author: "Henri Nouwen", desc: "Pour apprendre à écouter ce qui émerge au creux du silence et discerner les mouvements du cœur." },
    { title: "La force des discrets", author: "Susan Cain", desc: "Comment la profondeur et la réflexion tranquille changent le monde face à l'injonction d'extraversion." },
    { title: "L'éthique de la sollicitude", author: "Paul Ricœur", desc: "Pour concilier l'exigence de la justice éthique et la gratuité inconditionnelle de la grâce." }
  ];

  let bY2 = 46;
  books.forEach(b => {
    drawCard(doc, 20, bY2, 170, 34, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(b.title, 28, bY2 + 10);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(b.author, 28, bY2 + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(b.desc, 28, bY2 + 25);

    bY2 += 40;
  });

  // Recommended Bible reading box
  drawCard(doc, 20, 214, 170, 56, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Lectures bibliques ciblées pour votre profil ${archetype.name} :`, 28, 226);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("• L'Évangile selon saint Jean, chapitres 13 à 17 (Les adieux et le cœur du Christ).", 28, 236);
  doc.text("• Première épître aux Corinthiens, chapitres 12 et 13 (La diversité des charismes et l'amour).", 28, 246);
  doc.text("• Épître aux Romains, chapitre 12 (Le renouvellement de l'intelligence et le service du Corps).", 28, 256);

  // ==========================================
  // PAGE 35: GRAND RÉCAPITULATIF VISUEL GLOBAL (BIRKMAN P. 32)
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 35, cleanName, "Grand récapitulatif visuel");
  addPageFooter(doc, 35);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Grand récapitulatif visuel global", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("La synthèse complète de votre profil réunie sur une seule et même planche.", 20, 36);

  // TOP SECTION: 9 COMPONENT MINI-DASHBOARD (3x3 grid)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("1. Vos 9 composantes comportementales (Habituel vs Besoins) :", 20, 46);

  const miniCardsW = 54;
  const miniCardsH = 22;
  let mY = 51;
  nineComponents.forEach((comp, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const mX = 20 + col * (miniCardsW + 4);
    const posRowY = mY + row * (miniCardsH + 4);

    drawCard(doc, mX, posRowY, miniCardsW, miniCardsH, COLORS.white, COLORS.borderTint);
    
    // Clean number badge
    doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
    doc.roundedRect(mX + 4, posRowY + 3.5, 9, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`0${idx + 1}`, mX + 8.5, posRowY + 7.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(comp.title, mX + 15, posRowY + 7.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text("Hab. :", mX + 6, posRowY + 16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(comp.usual.toString(), mX + 16, posRowY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text("Bes. :", mX + 31, posRowY + 16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(comp.needs.toString(), mX + 41, posRowY + 16);
  });

  // BOTTOM SECTION: SPLIT IN TWO (Circular badges on left, 2D Map on right)
  const bottomY = 138;

  // Bottom Left: 4 Circular trait badges
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("2. Pôles d'énergie majeurs :", 20, bottomY);

  const topTraits = [
    { title: "Intériorité & Recul", pct: dimensions.I_A.leftPercent, col: COLORS.terracotta },
    { title: "Vérité & Principe", pct: dimensions.V_G.leftPercent, col: COLORS.ochre },
    { title: "Fidélité au cadre", pct: dimensions.S_E.leftPercent, col: COLORS.sage },
    { title: "Discernement réfléchi", pct: 82, col: COLORS.blue }
  ];

  let bTraitY = bottomY + 6;
  topTraits.forEach(tr => {
    drawCard(doc, 20, bTraitY, 82, 28, COLORS.white, COLORS.borderTint);
    drawCircularPercentBadge(doc, 34, bTraitY + 14, 9, tr.pct, tr.title, "Dominante active", tr.col, 46);
    bTraitY += 32;
  });

  // Bottom Right: 2D Quadrant Map
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("3. Votre positionnement 2D :", 108, bottomY);

  drawCard(doc, 108, bottomY + 6, 82, 124, COLORS.white, COLORS.borderTint);
  drawBirkmanMap2D(doc, 119, bottomY + 22, 60, starCoord, diamondCoord, circleCoord, squareCoord);

  // Mini legend under the map with real vector symbols
  const miniLegend = [
    { type: 'star' as const, label: "Élan", x: 115, col: COLORS.ochre },
    { type: 'diamond' as const, label: "Habituel", x: 133, col: COLORS.charcoal },
    { type: 'circle' as const, label: "Besoins", x: 156, col: COLORS.sage },
    { type: 'square' as const, label: "Stress", x: 176, col: COLORS.terracotta },
  ];
  miniLegend.forEach(ml => {
    drawVectorSymbol(doc, ml.type, ml.x, bottomY + 118, 1.8, ml.col);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(ml.label, ml.x + 3.2, bottomY + 119.5);
  });

  // ==========================================
  // PAGE 36: DIPLÔME & ATTESTATION SOLENNELLE
  // ==========================================
  doc.addPage();

  // Full-bleed diploma certificate parchment
  doc.setFillColor(COLORS.creamBg[0], COLORS.creamBg[1], COLORS.creamBg[2]);
  doc.rect(0, 0, 210, 297, 'F');

  // Double golden ornamental certificate border
  doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.setLineWidth(1.2);
  doc.rect(14, 14, 182, 269);
  doc.setLineWidth(0.4);
  doc.rect(17, 17, 176, 263);

  // Corner decorative flourishes
  const drawCorner = (cx: number, cy: number, rotX: number, rotY: number) => {
    doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.line(cx, cy, cx + 10 * rotX, cy);
    doc.line(cx, cy, cx, cy + 10 * rotY);
    doc.circle(cx + 4 * rotX, cy + 4 * rotY, 1, 'F');
  };
  drawCorner(21, 21, 1, 1);
  drawCorner(189, 21, -1, 1);
  drawCorner(21, 275, 1, -1);
  drawCorner(189, 275, -1, -1);

  // Certificate Header (No mention of BioSanté Éditions)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text("DISCIPLES DE JÉSUS • ARCHÉTYPES BIBLIQUES", 105, 34, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("ATTESTATION D'ACCOMPLISSEMENT", 105, 48, { align: 'center' });
  doc.text("& ÉVALUATION MULTIDIMENSIONNELLE", 105, 58, { align: 'center' });

  doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.setLineWidth(0.5);
  doc.line(40, 64, 170, 64);

  // Formal diploma body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Il est certifié et attesté que :", 105, 78, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(COLORS.terracottaDark[0], COLORS.terracottaDark[1], COLORS.terracottaDark[2]);
  doc.text(cleanName.toUpperCase(), 105, 94, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const certText = `a accompli avec succès le parcours d'évaluation des 5 dimensions spirituelles et comportementales, comprenant l'analyse de 20 polarités cardinales et l'élaboration de son guide de travail sur soi.`;
  doc.text(doc.splitTextToSize(certText, 140), 105, 108, { align: 'center' });

  // Central Seal / Badge in Diploma
  doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
  doc.roundedRect(36, 126, 138, 48, 4, 4, 'F');
  doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(36, 126, 138, 48, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`ARCHÉTYPE RÉFÉRENT : ${archetype.name.toUpperCase()}`, 105, 140, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`« ${archetype.title} »`, 105, 148, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text(`INDICE DE CONCORDANCE : ${affinity}%`, 105, 162, { align: 'center' });

  // Sacred Verse
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`« ${archetype.biblicalVerse} »`, 105, 188, { align: 'center' });

  // Centered Date Line (No Sceau de conformité, strictly centered)
  doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.setLineWidth(0.6);
  doc.line(75, 226, 135, 226);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("DATE D'ÉMISSION", 105, 233, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(reportDate, 105, 241, { align: 'center' });

  // Sacred quote with full scripture citation at bottom
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("« Chaque membre du Corps a reçu sa mesure de grâce pour l'édification de tous. » (Éphésiens 4:7-12)", 105, 262, { align: 'center' });

  return doc;
}
