import jsPDF from 'jspdf';
import { TeamMember, TeamPole, POLE_CONFIG, getArchetypePole } from '../components/TeamCrossAnalysis';
import { ARCHETYPES } from '../data/archetypes';

/**
 * Ensures strict French typography rules and removes non-Latin1 / unsupported Unicode glyphs
 * (e.g. ↔, smart quotes, em-dashes) that break kerning in standard jsPDF Helvetica.
 */
function cleanPdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/↔/g, ' avec ')
    .replace(/[—–]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+([?!:;])/g, '\u00A0$1')
    .replace(/«\s*/g, '«\u00A0')
    .replace(/\s*»/g, '\u00A0»');
}

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

/**
 * Draws the official Disciple brand emblem with golden border on dark background
 */
function drawBrandEmblem(doc: jsPDF, x: number, y: number, s: number = 14): void {
  doc.setFillColor(36, 34, 32);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(Math.max(0.4, s * 0.05));
  doc.roundedRect(x, y, s, s, s * 0.25, s * 0.25, 'FD');

  const cx = x + s / 2;
  const cy = y + s / 2;

  // Faint dashed circular halo
  doc.setDrawColor(192, 148, 98);
  doc.setLineWidth(0.25);
  doc.setLineDashPattern([0.6, 0.8], 0);
  doc.circle(cx, cy, s * 0.32, 'S');
  doc.setLineDashPattern([], 0);

  // 4-pointed diamond star
  const rMain = s * 0.36;
  const rMid = s * 0.08;
  doc.setFillColor(212, 163, 115);
  doc.triangle(cx, cy - rMain, cx - rMid, cy, cx + rMid, cy, 'F');
  doc.triangle(cx, cy + rMain, cx - rMid, cy, cx + rMid, cy, 'F');
  doc.triangle(cx + rMain, cy, cx, cy - rMid, cx, cy + rMid, 'F');
  doc.triangle(cx - rMain, cy, cx, cy - rMid, cx, cy + rMid, 'F');

  // Diagonal rays
  doc.setDrawColor(253, 250, 245);
  doc.setLineWidth(0.3);
  const d1 = s * 0.16;
  const d2 = s * 0.26;
  doc.line(cx - d2, cy - d2, cx - d1, cy - d1);
  doc.line(cx + d1, cy + d1, cx + d2, cy + d2);
  doc.line(cx + d2, cy - d2, cx + d1, cy - d1);
  doc.line(cx - d2, cy + d2, cx - d1, cy + d1);

  // Central core
  doc.setFillColor(253, 250, 245);
  doc.circle(cx, cy, s * 0.07, 'F');
}

export interface TeamAnalysisReportData {
  teamName: string;
  members: TeamMember[];
  analysis: {
    total: number;
    memberPoles: Array<TeamMember & { archetype: any; pole: TeamPole }>;
    poleCounts: Record<TeamPole, number>;
    polePcts: Record<TeamPole, number>;
    primaryPole: TeamPole;
    secondaryPole: TeamPole;
    collectiveDna: string;
    dnaDescription: string;
    superpowers: { title: string; desc: string }[];
    blindspots: { title: string; desc: string; riskLevel: 'high' | 'medium' }[];
    frictionAlerts: { duoTitle: string; friction: string; remedy: string }[];
  };
}

/**
 * Generates the official Team Cross-Analysis PDF Report (2 A4 pages)
 * Fully calibrated typography:
 * - Titles: 12pt bold
 * - Sub-items / highlights: 11pt bold
 * - Body text: 9pt
 * - Clean kerning & generous vertical spacing filling the entire page
 */
export async function generateTeamCrossAnalysisPdf(data: TeamAnalysisReportData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2; // 182mm

  // Preload preview images for Page 2 upsell block
  const [imgCouv, imgRadar, imgSynthese] = await Promise.all([
    loadImageAsDataUrl('/images/guide-preview/couverture.jpg'),
    loadImageAsDataUrl('/images/guide-preview/page-radar.jpg'),
    loadImageAsDataUrl('/images/guide-preview/page-synthese.jpg')
  ]);

  const { teamName, members, analysis } = data;
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // ==========================================
  // PAGE 1 : CARTOGRAPHIE & DYNAMIQUE D'ÉQUIPE
  // ==========================================
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Header Bar
  drawBrandEmblem(doc, margin, 12, 16);

  doc.setTextColor(194, 94, 66); // Terracotta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(cleanPdfText("KIT D'ANIMATION DE GROUPE • RAPPORT OFFICIEL"), margin + 21, 17.5);

  doc.setTextColor(36, 32, 29); // Charcoal
  doc.setFontSize(16.5);
  doc.text(cleanPdfText("DIAGNOSTIC CROISÉ D'ÉQUIPE"), margin + 21, 24.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 95, 90);
  doc.text(cleanPdfText("Cartographie collective des 4 grands pôles & complémentarités fraternelles"), margin + 21, 29);

  // Team Banner
  const bannerY = 33;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, bannerY, contentW, 17, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(36, 32, 29);
  doc.text(cleanPdfText(teamName || 'Notre Équipe'), margin + 5, bannerY + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(115, 105, 95);
  doc.text(cleanPdfText(`Effectif analysé\u00A0: ${analysis.total} membre${analysis.total > 1 ? 's' : ''}  •  Généré le ${dateStr}`), margin + 5, bannerY + 13.5);

  // Collective DNA Box (Aéré et lisible)
  const dnaY = 54;
  const dnaH = 29;
  doc.setFillColor(36, 34, 32);
  doc.roundedRect(margin, dnaY, contentW, dnaH, 3, 3, 'F');

  doc.setFillColor(212, 163, 115);
  doc.rect(margin + 4, dnaY + 4, 3, dnaH - 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(212, 163, 115);
  doc.text(cleanPdfText("ADN COLLECTIF DOMINANT DE L'ÉQUIPE"), margin + 12, dnaY + 8.5);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(cleanPdfText(analysis.collectiveDna), margin + 12, dnaY + 15.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 225, 220);
  const splitDnaDesc = doc.splitTextToSize(cleanPdfText(analysis.dnaDescription), contentW - 18);
  doc.text(splitDnaDesc, margin + 12, dnaY + 21.5);

  // 4 Grand Poles Breakdown Section (12pt titles, 12pt percentages, 9pt member texts)
  const polesY = dnaY + dnaH + 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(36, 32, 29);
  doc.text(cleanPdfText("RÉPARTITION COLLECTIVE DES 4 GRANDS PÔLES"), margin, polesY);

  const poleList: { pole: TeamPole; name: string; rgb: [number, number, number] }[] = [
    { pole: 'action', name: 'Impulsion & Action (Pionniers, Conquérants)', rgb: [194, 94, 66] },
    { pole: 'wisdom', name: 'Sagesse & Vérité (Sentinelles, Penseurs)', rgb: [200, 145, 50] },
    { pole: 'structure', name: 'Structure & Fidélité (Piliers, Coordinateurs)', rgb: [50, 48, 46] },
    { pole: 'care', name: 'Soin & Communion (Consolateurs, Pasteurs)', rgb: [95, 115, 99] }
  ];

  let pY = polesY + 4.5;
  const poleBoxH = 20.5;

  poleList.forEach(p => {
    const count = analysis.poleCounts[p.pole] || 0;
    const pct = analysis.polePcts[p.pole] || 0;
    const pMembers = members.filter(m => getArchetypePole(ARCHETYPES[m.archetypeKey] || ARCHETYPES.jean) === p.pole);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, pY, contentW, poleBoxH, 2.5, 2.5, 'FD');

    // Color dot
    doc.setFillColor(p.rgb[0], p.rgb[1], p.rgb[2]);
    doc.circle(margin + 5.5, pY + 6.5, 2.5, 'F');

    // Titre de pôle : 12pt
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(36, 32, 29);
    doc.text(cleanPdfText(p.name), margin + 11, pY + 7.8);

    // Chiffres : 12pt
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(p.rgb[0], p.rgb[1], p.rgb[2]);
    doc.text(cleanPdfText(`${pct}% (${count} membre${count > 1 ? 's' : ''})`), pageW - margin - 5, pY + 7.8, { align: 'right' });

    // Progress bar
    const barX = margin + 11;
    const barY = pY + 10.5;
    const barMaxW = contentW - 17;
    const barW = Math.max(3, (pct / 100) * barMaxW);

    doc.setFillColor(235, 230, 222);
    doc.roundedRect(barX, barY, barMaxW, 2.8, 1.2, 1.2, 'F');
    if (pct > 0) {
      doc.setFillColor(p.rgb[0], p.rgb[1], p.rgb[2]);
      doc.roundedRect(barX, barY, barW, 2.8, 1.2, 1.2, 'F');
    }

    // Noms de membres : 9pt
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 95, 90);
    const mNames = pMembers.length > 0 ? pMembers.map(m => m.name).join(', ') : 'Aucun membre dans ce pôle';
    doc.text(cleanPdfText(`Membres\u00A0: ${mNames}`), margin + 11, pY + 17.5);

    pY += poleBoxH + 4.5;
  });

  // Table of Members Section : Title 12pt
  const rosterY = pY + 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(36, 32, 29);
  doc.text(cleanPdfText("COMPOSITION DÉTAILLÉE DU GROUPE"), margin, rosterY);

  const tableY = rosterY + 4;
  doc.setFillColor(235, 230, 222);
  doc.roundedRect(margin, tableY, contentW, 7, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 65, 60);
  doc.text(cleanPdfText('PRÉNOM DU MEMBRE'), margin + 5, tableY + 5);
  doc.text(cleanPdfText('ARCHÉTYPE BIBLIQUE'), margin + 58, tableY + 5);
  doc.text(cleanPdfText('TESTAMENT & RÔLE'), margin + 112, tableY + 5);
  doc.text(cleanPdfText('PÔLE'), pageW - margin - 5, tableY + 5, { align: 'right' });

  let rY = tableY + 8;
  const maxRosterItems = Math.min(members.length, 10);

  for (let i = 0; i < maxRosterItems; i++) {
    const m = members[i];
    const arch = ARCHETYPES[m.archetypeKey] || ARCHETYPES.jean;
    const pole = getArchetypePole(arch);
    const poleConfig = POLE_CONFIG[pole];

    doc.setFillColor(i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 244);
    doc.rect(margin, rY, contentW, 6.8, 'F');

    // Nom : 9pt bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(36, 32, 29);
    doc.text(cleanPdfText(m.name), margin + 5, rY + 4.8);

    // Archétype : 9pt normal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 50, 45);
    doc.text(cleanPdfText(arch.name), margin + 58, rY + 4.8);

    doc.setFontSize(8);
    doc.setTextColor(110, 105, 100);
    doc.text(cleanPdfText(`${arch.title} (${arch.testament})`), margin + 112, rY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    if (pole === 'action') doc.setTextColor(194, 94, 66);
    else if (pole === 'care') doc.setTextColor(95, 115, 99);
    else if (pole === 'wisdom') doc.setTextColor(200, 145, 50);
    else doc.setTextColor(50, 48, 46);
    doc.text(cleanPdfText(poleConfig.name.split(' ')[0]), pageW - margin - 5, rY + 4.8, { align: 'right' });

    rY += 7.2;
  }

  // Footer Page 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 125, 120);
  doc.text(cleanPdfText("Diagnostic croisé d'équipe • Page 1/2 • Disciple — Archétypes bibliques"), pageW / 2, 291, { align: 'center' });

  // ==========================================
  // PAGE 2 : SUPER-POUVOIRS, ANGLES MORTS & UPSELL
  // ==========================================
  doc.addPage();
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Header Page 2
  drawBrandEmblem(doc, margin, 12, 15);

  doc.setTextColor(194, 94, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(cleanPdfText("ANALYSE QUALITATIVE DE GROUPE"), margin + 20, 17.5);

  doc.setTextColor(36, 32, 29);
  doc.setFontSize(15);
  doc.text(cleanPdfText("FORCES, ANGLES MORTS & CONSEILS DE MINISTÈRE"), margin + 20, 24);

  // Section 1: Superpowers (Titre 12pt, + texte 11pt, corps 9pt)
  let currY = 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(95, 115, 99);
  doc.text(cleanPdfText("1. SUPER-POUVOIRS COLLECTIFS DE VOTRE ÉQUIPE"), margin, currY);

  currY += 5;
  if (analysis.superpowers.length > 0) {
    analysis.superpowers.slice(0, 2).forEach(sp => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(95, 115, 99);
      doc.setLineWidth(0.35);

      const spDesc = doc.splitTextToSize(cleanPdfText(sp.desc), contentW - 10);
      const spBoxH = 12 + spDesc.length * 4.6;

      doc.roundedRect(margin, currY, contentW, spBoxH, 2.5, 2.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(36, 32, 29);
      doc.text(cleanPdfText(`+ ${sp.title}`), margin + 5, currY + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 55, 50);
      doc.text(spDesc, margin + 5, currY + 12.2);

      currY += spBoxH + 4.5;
    });
  } else {
    currY += 12;
  }

  // Section 2: Blind spots (Titre 12pt, ! texte 11pt, corps 9pt)
  currY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(194, 94, 66);
  doc.text(cleanPdfText("2. ANGLES MORTS & VIGILANCES PRIORITAIRES"), margin, currY);

  currY += 5;
  if (analysis.blindspots.length > 0) {
    analysis.blindspots.slice(0, 2).forEach(bs => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(194, 94, 66);
      doc.setLineWidth(0.35);

      const bsDesc = doc.splitTextToSize(cleanPdfText(bs.desc), contentW - 10);
      const bsBoxH = 12 + bsDesc.length * 4.6;

      doc.roundedRect(margin, currY, contentW, bsBoxH, 2.5, 2.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(194, 94, 66);
      doc.text(cleanPdfText(`! ${bs.title}`), margin + 5, currY + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 55, 50);
      doc.text(bsDesc, margin + 5, currY + 12.2);

      currY += bsBoxH + 4.5;
    });
  } else {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, currY, contentW, 14, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(95, 115, 99);
    doc.text(cleanPdfText("Aucun angle mort critique\u00A0: les 4 grands pôles sont équitablement représentés au sein de l'équipe."), margin + 5, currY + 8.5);
    currY += 18;
  }

  // Section 3: Friction Alert or Pastoral Peace (Titre 12pt, 11pt alert title, 9pt body)
  currY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(36, 32, 29);
  doc.text(cleanPdfText("3. CLIMAT RELATIONNEL & BINÔMES SENSIBLES"), margin, currY);

  currY += 4.5;
  if (analysis.frictionAlerts.length > 0) {
    const fa = analysis.frictionAlerts[0];
    const sanitizedTitle = cleanPdfText(fa.duoTitle);
    const sanitizedFriction = cleanPdfText(fa.friction);
    const sanitizedRemedy = cleanPdfText(fa.remedy);

    const fullAlertText = `Tension type\u00A0: ${sanitizedFriction}\nConseil de collaboration\u00A0: ${sanitizedRemedy}`;
    const splitAlert = doc.splitTextToSize(fullAlertText, contentW - 10);
    const alertBoxH = 13 + splitAlert.length * 4.6;

    doc.setFillColor(253, 248, 245);
    doc.setDrawColor(212, 163, 115);
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, currY, contentW, alertBoxH, 2.5, 2.5, 'FD');

    // Title: 11pt bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(194, 94, 66);
    doc.text(sanitizedTitle, margin + 5, currY + 6.8);

    // Body: 9pt normal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 45, 40);
    doc.text(splitAlert, margin + 5, currY + 12.8);

    currY += alertBoxH + 4.5;
  } else {
    doc.setFillColor(242, 246, 243);
    doc.setDrawColor(95, 115, 99);
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, currY, contentW, 14, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(95, 115, 99);
    doc.text(cleanPdfText("Climat relationnel fraternel"), margin + 5, currY + 6.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 60, 55);
    doc.text(cleanPdfText("Aucune friction archétypale polarisante directe n'est identifiée parmi vos membres actuels."), margin + 5, currY + 11.2);
    currY += 18.5;
  }

  // Pastoral verse quote : 9pt
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.35);
  const verseText = cleanPdfText("«\u00A0Il y a diversité de dons, mais le même Esprit; diversité de ministères, mais le même Seigneur... Le corps n'est pas un seul membre, mais plusieurs.\u00A0» — 1 Corinthiens 12, 4.14");
  const splitVerse = doc.splitTextToSize(verseText, contentW - 10);
  const verseH = 8 + splitVerse.length * 4.6;

  doc.roundedRect(margin, currY, contentW, verseH, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(70, 65, 60);
  doc.text(splitVerse, margin + 5, currY + 6);

  currY += verseH + 5.5;

  // ===============================================================
  // RICH UPSELL BLOCK WITH 3 VISUAL BOOK PREVIEW IMAGES
  // ===============================================================
  const upsellY = currY;
  const upsellH = 78;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, upsellY, contentW, upsellH, 3, 3, 'FD');

  // Upsell Header Tag
  doc.setFillColor(194, 94, 66);
  doc.roundedRect(margin + 6, upsellY + 3.8, contentW - 12, 6.5, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(cleanPdfText('POUR ALLER PLUS LOIN ENSEMBLE\u00A0: DÉCOUVREZ LE DOSSIER COMPLET (36 PAGES)'), pageW / 2, upsellY + 8.2, { align: 'center' });

  // Subtitle
  doc.setTextColor(60, 55, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  const upDesc = cleanPdfText("Chaque membre peut débloquer son dossier individuel complet de 36 pages (19 €) à l'issue du test gratuit.");
  doc.text(upDesc, pageW / 2, upsellY + 14.5, { align: 'center' });

  // 3 Images row
  const imgY = upsellY + 18;
  const imgW = 32;
  const imgH = 43;
  const imgSpacing = 22;
  const startX = 35;

  const previewCards = [
    { data: imgCouv, label: 'Couverture reliée', sub: 'Dossier individuel (Page 1)' },
    { data: imgRadar, label: 'Roue polaire radar', sub: '8 énergies (Page 4)' },
    { data: imgSynthese, label: 'Cartographie 2D', sub: 'Planche bilan (Page 35)' }
  ];

  previewCards.forEach((c, idx) => {
    const cx = startX + idx * (imgW + imgSpacing);

    if (c.data) {
      try {
        doc.addImage(c.data, 'JPEG', cx, imgY, imgW, imgH);
      } catch {
        doc.setFillColor(245, 240, 235);
        doc.rect(cx, imgY, imgW, imgH, 'F');
      }
    } else {
      doc.setFillColor(245, 240, 235);
      doc.rect(cx, imgY, imgW, imgH, 'F');
    }

    doc.setDrawColor(212, 163, 115);
    doc.setLineWidth(0.4);
    doc.rect(cx, imgY, imgW, imgH, 'S');

    doc.setTextColor(194, 94, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(cleanPdfText(c.label), cx + imgW / 2, imgY + imgH + 3.5, { align: 'center' });

    doc.setTextColor(120, 115, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(cleanPdfText(c.sub), cx + imgW / 2, imgY + imgH + 6.8, { align: 'center' });
  });

  // CTA Link note below images
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(36, 34, 32);
  doc.text(cleanPdfText('Tarif\u00A0: 19 € (accès immédiat PDF) • Test et commande sur discipledejesus.netlify.app'), pageW / 2, upsellY + 74.5, { align: 'center' });

  // Page 2 footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 125, 120);
  doc.text(cleanPdfText("Diagnostic croisé d'équipe • Page 2/2 • Disciple — Archétypes bibliques"), pageW / 2, 291, { align: 'center' });

  return doc;
}
