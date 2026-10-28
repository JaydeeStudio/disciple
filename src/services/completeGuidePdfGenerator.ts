import { jsPDF } from 'jspdf';
import { Archetype } from '../data/archetypes';
import { Dimension } from '../data/questions';
import { CharacterMatch, DimensionResult } from './calculation';

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

// Visual color palette for elegant print styling
const COLORS = {
  charcoal: [45, 41, 38] as [number, number, number],
  textMuted: [95, 90, 85] as [number, number, number],
  terracotta: [184, 115, 51] as [number, number, number],
  ochreLight: [247, 243, 237] as [number, number, number],
  creamBg: [252, 250, 247] as [number, number, number],
  borderTint: [225, 218, 209] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  accentBlue: [70, 95, 120] as [number, number, number],
  accentGreen: [75, 115, 85] as [number, number, number]
};

const TOTAL_PAGES = 35;

/**
 * Adds running header with participant's name
 */
function addPageHeader(doc: jsPDF, pageNum: number, userName: string, title?: string) {
  if (pageNum <= 1) return; // Skip cover

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  
  const headerLeft = `DOSSIER D'APPROFONDISSEMENT PERSONNEL • ${userName.toUpperCase()}`;
  const headerRight = title ? title.toUpperCase() : "DISCIPLE DE JÉSUS";

  doc.text(headerLeft, 20, 14);
  const rightWidth = doc.getTextWidth(headerRight);
  doc.text(headerRight, 190 - rightWidth, 14);

  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.3);
  doc.line(20, 16.5, 190, 16.5);
}

/**
 * Adds running footer with page numbering (Page X sur 35)
 */
function addPageFooter(doc: jsPDF, pageNum: number) {
  if (pageNum <= 1) return;

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
 * Helper to draw an interactive-style horizontal score gauge
 */
function drawGauge(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  leftLabel: string,
  rightLabel: string,
  leftPercent: number,
  rightPercent: number,
  isLeftDominant: boolean
) {
  // Label row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  
  if (isLeftDominant) {
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`${leftLabel} (${leftPercent}%)`, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const rW = doc.getTextWidth(`${rightLabel} (${rightPercent}%)`);
    doc.text(`${rightLabel} (${rightPercent}%)`, x + width - rW, y);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(`${leftLabel} (${leftPercent}%)`, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    const rW = doc.getTextWidth(`${rightLabel} (${rightPercent}%)`);
    doc.text(`${rightLabel} (${rightPercent}%)`, x + width - rW, y);
  }

  // Bar background
  const barY = y + 2.5;
  const barH = 5;
  doc.setFillColor(235, 230, 222);
  doc.roundedRect(x, barY, width, barH, 2, 2, 'F');

  // Center tick
  doc.setDrawColor(200, 190, 180);
  doc.line(x + width / 2, barY - 1, x + width / 2, barY + barH + 1);

  // Active fill from center
  const center = x + width / 2;
  const halfWidth = width / 2;
  
  doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  if (isLeftDominant) {
    const fillWidth = (leftPercent / 100) * halfWidth;
    doc.rect(center - fillWidth, barY, fillWidth, barH, 'F');
  } else {
    const fillWidth = (rightPercent / 100) * halfWidth;
    doc.rect(center, barY, fillWidth, barH, 'F');
  }
}

/**
 * Main generator creating the full 35-page personalized document
 */
export function generateCompleteGuidePdf(params: GuideGenerationParams): jsPDF {
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
  const fileReference = `DJ-${new Date().getFullYear()}-${archetype.key.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // ==========================================
  // PAGE 1: COUVERTURE HAUTE DISTINCTION
  // ==========================================
  doc.setFillColor(COLORS.creamBg[0], COLORS.creamBg[1], COLORS.creamBg[2]);
  doc.rect(0, 0, 210, 297, 'F');

  // Decorative border
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.6);
  doc.rect(14, 14, 182, 269);

  // Vertical terracotta ribbon
  doc.setFillColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.rect(22, 28, 4, 38, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("ÉDITION INTÉGRALE — 35 PAGES D'ANALYSE ET D'ACTION", 30, 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("DOSSIER D'APPROFONDISSEMENT", 30, 48);
  doc.text("PERSONNEL & TRAVAIL SUR SOI", 30, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Comprendre vos équilibres intérieurs et déployer vos charismes singuliers", 30, 68);

  // Central Seal / Emblem Box
  drawCard(doc, 22, 85, 166, 115, COLORS.white, COLORS.borderTint);
  
  // Arch profile summary on cover
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("PROFIL PRINCIPAL IDENTIFIÉ", 32, 102);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(archetype.name, 32, 115);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`« ${archetype.title} »`, 32, 124);

  // Affinity badge
  doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
  doc.roundedRect(32, 134, 146, 26, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`${affinity}%`, 40, 151);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("de concordance avec la signature biblique de référence", 62, 147);
  doc.text("Calculé selon les 5 dimensions et 20 polarités comportementales", 62, 153);

  // Verse on cover
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  const splitVerse = doc.splitTextToSize(`« ${archetype.biblicalVerse} »`, 146);
  doc.text(splitVerse, 32, 175);

  // Bottom personalized card
  drawCard(doc, 22, 212, 166, 58, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("DOCUMENT CONFIDENTIEL ÉTABLI POUR :", 32, 224);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(cleanName, 32, 234);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Date de génération : ${reportDate}`, 32, 245);
  doc.text(`Identifiant de dossier : ${fileReference}`, 32, 252);
  doc.text(`Méthode : Évaluation multidimensionnelle vectorielle (36 disciples bibliques)`, 32, 259);

  // ==========================================
  // PAGE 2: SOMMAIRE & AVANT-PROPOS
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 2, cleanName, "Sommaire & Avant-Propos");
  addPageFooter(doc, 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Sommaire & Architecture du Guide", 20, 28);

  // 4 Modules overview table
  const modules = [
    { num: "MOD. 1", title: `Anatomie de votre profil : ${archetype.name}`, pages: "Pages 5 à 10", desc: "Moteurs profonds, talents, zones d'ombre, dynamiques relationnelles et polarité miroir." },
    { num: "MOD. 2", title: "Analyse chirurgicale de vos 5 dimensions", pages: "Pages 11 à 20", desc: "Positionnement exact sur les 5 axes bipolaires, clés de régulation et exercices ciblés." },
    { num: "MOD. 3", title: "Matrice d'interaction & Combinaison unique", pages: "Pages 21 à 26", desc: "Croisement des axes, boussole de stress, stades de maturité et vocation naturelle." },
    { num: "MOD. 4", title: "Guide pratique & Plan d'action sur 30 jours", pages: "Pages 27 à 32", desc: "Protocoles quotidiens, 4 semaines de défis concrets et carnet de bord d'auto-évaluation." },
    { num: "ANNEXES", title: "Outils de suivi & Attestation personnelle", pages: "Pages 33 à 35", desc: "Fiche mémo 1-page détachable, ressources recommandées et attestation nominative." },
  ];

  let modY = 38;
  modules.forEach(m => {
    drawCard(doc, 20, modY, 170, 22, COLORS.white, COLORS.borderTint);
    doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
    doc.roundedRect(24, modY + 4, 18, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(m.num, 26, modY + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(m.title, 48, modY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(m.desc, 48, modY + 17);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    const pW = doc.getTextWidth(m.pages);
    doc.text(m.pages, 184 - pW, modY + 13);

    modY += 26;
  });

  // Avant-propos box
  drawCard(doc, 20, modY + 4, 170, 88, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Avant-propos personnel pour ${cleanName}`, 28, modY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const introPara1 = `Ce dossier n'a pas été conçu pour vous enfermer dans une étiquette rigide, mais pour vous fournir une boussole d'introspection lucide et bienveillante.`;
  const introPara2 = `En découvrant votre résonance avec ${archetype.name} (${archetype.title.toLowerCase()}), vous observez les mécanismes par lesquels votre tempérament s'exprime dans le monde. Plus important encore, les 5 polarités évaluées révèlent où se situent vos zones d'équilibre et vos tiraillements intérieurs.`;
  const introPara3 = `Prenez le temps d'explorer chaque module à votre rythme. Marquez ce qui résonne en vous, confrontez ce qui vous dérange avec curiosité, et utilisez le plan de 30 jours comme un laboratoire d'expérimentation personnelle.`;

  doc.text(doc.splitTextToSize(introPara1, 154), 28, modY + 26);
  doc.text(doc.splitTextToSize(introPara2, 154), 28, modY + 42);
  doc.text(doc.splitTextToSize(introPara3, 154), 28, modY + 62);

  // ==========================================
  // PAGE 3: SYNTHÈSE MULTIDIMENSIONNELLE
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 3, cleanName, "Cartographie des 5 dimensions");
  addPageFooter(doc, 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre Empreinte Multidimensionnelle", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Voici le relevé exact de vos 5 équilibres intérieurs, issu de vos réponses au questionnaire.`, 20, 36);

  // Gauge stack for all 5 dimensions
  let gaugeY = 46;
  const dimKeys: Dimension[] = ['I_A', 'S_E', 'V_G', 'L_F', 'R_M'];
  dimKeys.forEach((key, idx) => {
    const dim = dimensions[key];
    drawCard(doc, 20, gaugeY, 170, 38, COLORS.white, COLORS.borderTint);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`Axe ${idx + 1} : ${dim.label}`, 26, gaugeY + 9);

    const isLeftDom = dim.rawValue <= 0;
    drawGauge(doc, 26, gaugeY + 16, 158, dim.leftLabel, dim.rightLabel, dim.leftPercent, dim.rightPercent, isLeftDom);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const comment = `Dominante : ${dim.dominantLabel} (Score brut : ${dim.rawValue > 0 ? '+' : ''}${dim.rawValue}). ${dim.description.slice(0, 110)}...`;
    doc.text(doc.splitTextToSize(comment, 158), 26, gaugeY + 30);

    gaugeY += 43;
  });

  // Note at bottom of page 3
  drawCard(doc, 20, 262, 170, 15, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Note méthodologique : Ce profil à 5 axes garantit une lecture unique qui vous distingue de tout autre profil ${archetype.name}.`, 26, 271);

  // ==========================================
  // PAGE 4: CONSTELLATION D'ARCHÉTYPES
  // ==========================================
  doc.addPage();
  addPageHeader(doc, 4, cleanName, "Constellation d'archétypes");
  addPageFooter(doc, 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre Constellation de Tempéraments", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Vous n'êtes pas réductible à un seul personnage : voici vos résonances secondaires et complémentaires.`, 20, 36);

  // Main archetype card
  drawCard(doc, 20, 44, 170, 48, COLORS.ochreLight, COLORS.terracotta);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("ARCHÉTYPE MAJEUR (LE CŒUR DE VOTRE FONCTIONNEMENT)", 28, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`${archetype.name} — ${archetype.title}`, 28, 64);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`${affinity}%`, 160, 64);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const archDesc = doc.splitTextToSize(archetype.description, 154);
  doc.text(archDesc, 28, 73);

  // Secondaries
  const sec1 = secondaryMatches[0];
  const sec2 = secondaryMatches[1];

  let secY = 98;
  if (sec1) {
    drawCard(doc, 20, secY, 170, 42, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text("RÉSONANCE SECONDAIRE (VOTRE NUANCE VÉCUE)", 28, secY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${sec1.archetype.name} — ${sec1.archetype.title}`, 28, secY + 18);
    doc.text(`${sec1.affinity}%`, 160, secY + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const sec1Desc = doc.splitTextToSize(sec1.archetype.description, 154);
    doc.text(sec1Desc, 28, secY + 25);
    secY += 48;
  }

  if (sec2) {
    drawCard(doc, 20, secY, 170, 42, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text("RÉSONANCE TERTIAIRE (RESSOURCE EN CAS DE BESOIN)", 28, secY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${sec2.archetype.name} — ${sec2.archetype.title}`, 28, secY + 18);
    doc.text(`${sec2.affinity}%`, 160, secY + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const sec2Desc = doc.splitTextToSize(sec2.archetype.description, 154);
    doc.text(sec2Desc, 28, secY + 25);
    secY += 48;
  }

  // Complementary archetype
  if (genderEquivalentMatch) {
    drawCard(doc, 20, secY, 170, 38, COLORS.ochreLight, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text("ÉQUIVALENT DE COMPLÉMENTARITÉ", 28, secY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${genderEquivalentMatch.archetype.name} (${genderEquivalentMatch.affinity}%)`, 28, secY + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(doc.splitTextToSize(`Ce profil partage des polarités proches dans une autre sensibilité d'expression.`, 154), 28, secY + 26);
  }

  // =========================================================================
  // PAGES 5 À 10 : MODULE 1 — ANATOMIE DE VOTRE PROFIL DOMINANT
  // =========================================================================
  
  // PAGE 5: Portrait fondamental de [Archetype]
  doc.addPage();
  addPageHeader(doc, 5, cleanName, `Module 1 • Portrait de ${archetype.name}`);
  addPageFooter(doc, 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("MODULE 1 — ANATOMIE DE VOTRE PROFIL", 20, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Portrait Fondamental : ${archetype.name}`, 20, 36);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`« ${archetype.title} »`, 20, 44);

  drawCard(doc, 20, 52, 170, 60, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Contexte historique et profil spirituel", 28, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const p5Text1 = `${archetype.name} incarne dans les Écritures une sensibilité particulière et une manière singulière de répondre à l'appel. Sa trajectoire n'est pas celle d'une perfection lisse, mais celle d'une fidélité éprouvée au creux des paradoxes humains.`;
  const p5Text2 = `${archetype.description}`;
  const p5Text3 = `Pour vous, ${cleanName}, cette résonance à ${affinity}% indique que vos réflexes profonds et votre manière de discerner le monde s'alignent avec cette posture d'existence.`;

  doc.text(doc.splitTextToSize(p5Text1, 154), 28, 70);
  doc.text(doc.splitTextToSize(p5Text2, 154), 28, 86);
  doc.text(doc.splitTextToSize(p5Text3, 154), 28, 102);

  // Anchor quote box
  drawCard(doc, 20, 118, 170, 34, COLORS.ochreLight, COLORS.terracotta);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("VERSET CLEF D'ANCRAGE", 28, 128);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(`« ${archetype.biblicalVerse} »`, 154), 28, 137);

  // Deep questions box
  drawCard(doc, 20, 158, 170, 115, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Ce que cette présence biblique révèle de vous :", 28, 170);

  const p5Points = [
    { label: "Votre posture face à l'autorité :", desc: "Un rapport fondé sur la légitimité du cœur plutôt que sur la contrainte hiérarchique." },
    { label: "Votre rythme d'assimilation :", desc: "Besoin de faire décanter les événements avant de formuler un jugement définitif." },
    { label: "Votre sensibilité aux non-dits :", desc: "Une capacité innée à ressentir ce qui n'est pas explicitement formulé dans une pièce." },
    { label: "Votre fidélité dans l'adversité :", desc: "Là où d'autres se dispersent par calcul, vous tenez fermement par attachement affectif ou moral." }
  ];

  let p5Y = 180;
  p5Points.forEach(p => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(p.label, 28, p5Y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(p.desc, 154), 28, p5Y + 5.5);
    p5Y += 18;
  });

  // PAGE 6: Vos 4 moteurs profonds
  doc.addPage();
  addPageHeader(doc, 6, cleanName, "Module 1 • Vos 4 moteurs intérieurs");
  addPageFooter(doc, 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Les 4 Moteurs Profonds de ${cleanName}`, 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Ce qui réveille votre énergie vitale et ce qui la paralyse au quotidien.`, 20, 36);

  const motors = [
    { title: "1. La quête de sens authentique", desc: `Vous ne pouvez pas fonctionner par simple conformisme ou automatisme. Vous devez comprendre le « pourquoi » profond derrière chaque démarche pour vous engager pleinement.` },
    { title: "2. Le besoin d'alignement intérieur", desc: `Tout décalage entre ce que vous ressentez au fond de vous et ce que l'on vous demande de faire engendre chez vous une friction immédiatement perceptible.` },
    { title: "3. La fécondité du silence et de la clarté", desc: `Le bruit continu et la précipitation vous vident de votre lucidité. Vos meilleures intuitions émergent toujours dans des temps de pause préservés.` },
    { title: "4. L'impact par la qualité plutôt que par le volume", desc: `Vous préférez toucher durablement une seule vie ou accomplir une œuvre soignée plutôt que d'agiter superficiellement une multitude.` }
  ];

  let mY = 46;
  motors.forEach(m => {
    drawCard(doc, 20, mY, 170, 34, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(m.title, 28, mY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(doc.splitTextToSize(m.desc, 154), 28, mY + 18);
    mY += 39;
  });

  // Diagnostic box
  drawCard(doc, 20, 208, 170, 68, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Exercice d'auto-évaluation pour ${cleanName} :`, 28, 220);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("• Quelle activité de votre semaine actuelle nourrit le plus directement ces 4 moteurs ?", 28, 230);
  doc.text("• Quelle contrainte ou environnement draine aujourd'hui le plus fortement votre clarté ?", 28, 240);
  doc.text("• Notez sur une échelle de 1 à 10 votre niveau d'alignement intérieur actuel : [   / 10 ]", 28, 252);

  // PAGE 7: Vos forces majeures
  doc.addPage();
  addPageHeader(doc, 7, cleanName, "Module 1 • Vos forces majeures");
  addPageFooter(doc, 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Vos Forces Majeures & Charismes Clés", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Ces compétences naturelles sont vos plus précieux leviers de fécondité.`, 20, 36);

  let fY = 46;
  archetype.strengths.forEach((str, i) => {
    drawCard(doc, 20, fY, 170, 36, COLORS.white, COLORS.borderTint);
    doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
    doc.roundedRect(26, fY + 6, 8, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`${i + 1}`, 29, fY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(str, 40, fY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const detailedStr = `Dans votre quotidien, cette disposition se traduit par une constance remarquable : votre entourage perçoit chez vous une présence rassurante, capable d'apporter stabilité et profondeur là où d'autres réagissent dans l'urgence.`;
    doc.text(doc.splitTextToSize(detailedStr, 148), 40, fY + 20);

    fY += 42;
  });

  // Callout box on how to deploy them
  drawCard(doc, 20, 222, 170, 52, COLORS.ochreLight, COLORS.terracotta);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Conseil d'ancrage pour ${cleanName} :`, 28, 234);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(`Ne considérez jamais ces forces comme des évidences banales : ce qui est naturel et fluide pour vous représente souvent un effort immense pour les autres. Mettez-les au service sans orgueil, mais avec pleine conscience de leur valeur.`, 154), 28, 244);

  // PAGE 8: Vos angles morts & pièges récurrents
  doc.addPage();
  addPageHeader(doc, 8, cleanName, "Module 1 • Angles morts & Vigilances");
  addPageFooter(doc, 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Vos Angles Morts & Zones de Vigilance", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Toute force poussée à l'extrême devient une vulnérabilité. Voici vos zones d'ombre types.`, 20, 36);

  let wY = 46;
  archetype.weaknesses.forEach((weak, i) => {
    drawCard(doc, 20, wY, 170, 36, COLORS.white, COLORS.borderTint);
    doc.setFillColor(250, 235, 235);
    doc.roundedRect(26, wY + 6, 8, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 60, 60);
    doc.text(`!`, 29.5, wY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(weak, 40, wY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    const detailedWeak = `Ce schéma survient le plus souvent sous stress ou sentiment d'incompréhension. Votre réflexe défensif vous pousse alors à accentuer ce comportement, créant précisément la situation que vous redoutez.`;
    doc.text(doc.splitTextToSize(detailedWeak, 148), 40, wY + 20);

    wY += 42;
  });

  // Antidote Box
  drawCard(doc, 20, 222, 170, 52, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`L'antidote immédiat pour ${cleanName} :`, 28, 234);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(`Lorsque vous sentez poindre l'un de ces 4 pièges, ne vous jugez pas sévèrement : respirez profondément, nommez la vulnérabilité intérieurement (« je suis en train de me retirer » ou « je cherche à trop contrôler ») et autorisez-vous 10 minutes de recul avant de poser un acte.`, 154), 28, 244);

  // PAGE 9: Dynamiques relationnelles & communication
  doc.addPage();
  addPageHeader(doc, 9, cleanName, "Module 1 • Dynamiques relationnelles");
  addPageFooter(doc, 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Vos Dynamiques Relationnelles en Équipe`, 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Comment votre profil interagit avec son écosystème humain et gère les frictions.`, 20, 36);

  // Communication style card
  drawCard(doc, 20, 46, 170, 48, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre style de communication naturel :", 28, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  const commText = `Vous privilégiez la sincérité et le fond plutôt que les effets de manche. Vous écoutez avec attention mais pouvez sembler distant si le sujet vous paraît superficiel. Lorsque vous prenez la parole, vos propos sont généralement pesés et porteurs de sens.`;
  doc.text(doc.splitTextToSize(commText, 154), 28, 65);

  // Synergies & Friction table
  drawCard(doc, 20, 102, 170, 80, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Synergies naturelles & points de tension :", 28, 114);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Avec qui l'alliance est immédiate :", 28, 126);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const compatList = archetype.compatibility.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
  doc.text(`Les profils réceptifs et bienveillants (${compatList}). Partage fluide de visions et respect mutuel du rythme.`, 28, 134);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 60, 60);
  doc.text("Là où les frictions apparaissent :", 28, 148);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const frictionDesc = `Avec les personnalités purement procédurales ou ultra-activistes qui exigent des réponses immédiates sans laisser le temps de la réflexion.`;
  doc.text(doc.splitTextToSize(frictionDesc, 154), 28, 156);

  // Golden rule box
  drawCard(doc, 20, 190, 170, 84, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Les 3 règles d'or relationnelles pour ${cleanName} :`, 28, 202);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("1. Explicitez vos besoins de temps : prévenez simplement (« Je réfléchis à ta proposition et je te réponds demain »).", 28, 214);
  doc.text("2. Ne présumez pas du manque d'écoute : les tempéraments d'action ont souvent besoin de gestes concrets.", 28, 226);
  doc.text("3. Validez l'effort de l'autre avant de pointer les failles conceptuelles d'un projet.", 28, 238);

  // PAGE 10: La polarité miroir & complémentarité
  doc.addPage();
  addPageHeader(doc, 10, cleanName, "Module 1 • Polarité miroir");
  addPageFooter(doc, 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre Polarité Miroir Indispensable", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Pourquoi la solitude de votre profil est stérile et comment grandir par la complémentarité.`, 20, 36);

  drawCard(doc, 20, 46, 170, 68, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("La loi biblique du Corps et de la Diversité", 28, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const p10Text = `Comme Paul le rappelle dans sa métaphore des membres du corps (1 Corinthiens 12), aucun œil ne peut dire à la main : « Je n'ai pas besoin de toi ». Votre tempérament ${archetype.name} excelle dans certains domaines précisément parce qu'il renonce à d'autres. C'est votre polarité opposée qui comble vos manques sans que vous n'ayez à vous épuiser à devenir ce que vous n'êtes pas.`;
  doc.text(doc.splitTextToSize(p10Text, 154), 28, 68);

  // Case study
  drawCard(doc, 20, 122, 170, 80, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Étude de cas biblique : Le binôme fondateur", 28, 134);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const caseStudy = `Regardez Pierre et Jean au matin de la Résurrection : Jean, plus contemplatif et rapide, arrive le premier au tombeau mais s'arrête respectueusement à l'entrée. Pierre, homme d'impulsion et d'action brute, arrive après lui mais entre directement dans le tombeau pour inspecter les linges. L'un apporte la vision et l'intuition, l'autre franchit le seuil physique. Ensemble, ils témoignent de la plénitude de la foi.`;
  doc.text(doc.splitTextToSize(caseStudy, 154), 28, 144);

  // Takeaway box
  drawCard(doc, 20, 210, 170, 64, COLORS.white, COLORS.terracotta);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Votre défi personnel de maturité :`, 28, 222);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  const p10Action = `Identifiez dans votre entourage professionnel ou familial la personne qui incarne l'opposé exact de votre profil ${archetype.name}. Au lieu de vous agacer de ses manières différentes, invitez-la à relire vos projets avant lancement : elle verra exactement ce qui vous échappe.`;
  doc.text(doc.splitTextToSize(p10Action, 154), 28, 232);

  // =========================================================================
  // PAGES 11 À 20 : MODULE 2 — ANALYSE CHIRURGICALE DES 5 DIMENSIONS
  // =========================================================================

  const dimensionPairs: {
    key: Dimension;
    p1Title: string;
    p2Title: string;
    p1Focus: string;
    p2Focus: string;
  }[] = [
    {
      key: 'I_A',
      p1Title: "Axe 1 — Intériorité vs Action : Votre Positionnement",
      p2Title: "Axe 1 — Clés de Régulation & Exercices de Rééquilibrage",
      p1Focus: "Cet axe mesure comment vous rechargez votre énergie et votre rapport entre la vie contemplative et l'engagement opérationnel sur le terrain.",
      p2Focus: "Comment éviter l'enfermement dans une bulle ou l'épuisement dans un activisme sans racine."
    },
    {
      key: 'S_E',
      p1Title: "Axe 2 — Structure vs Spontanéité : Votre Positionnement",
      p2Title: "Axe 2 — Clés de Régulation & Exercices de Rééquilibrage",
      p1Focus: "Cet axe analyse votre rapport aux règles, à la planification, aux cadres établis face à l'improvisation et à l'intuition vivante du moment.",
      p2Focus: "Comment trouver la juste articulation entre discipline prévisible et adaptabilité créative."
    },
    {
      key: 'V_G',
      p1Title: "Axe 3 — Vérité vs Grâce : Votre Positionnement",
      p2Title: "Axe 3 — Clés de Régulation & Exercices de Rééquilibrage",
      p1Focus: "Cet axe évalue votre réflexe premier lors d'un conflit ou d'un choix : la rigueur des principes immuables ou l'accueil inconditionnel de la personne.",
      p2Focus: "Comment conjuguer la fermeté sans dureté et la bienveillance sans compromission de la vérité."
    },
    {
      key: 'L_F',
      p1Title: "Axe 4 — Fidélité vs Leadership : Votre Positionnement",
      p2Title: "Axe 4 — Clés de Régulation & Exercices de Rééquilibrage",
      p1Focus: "Cet axe examine votre confort entre le service discret dans l'ombre et la prise d'initiative visible qui entraîne un groupe en avant.",
      p2Focus: "Comment assumer son autorité naturelle sans écraser, ou servir dans l'ombre sans s'effacer stérilement."
    },
    {
      key: 'R_M',
      p1Title: "Axe 5 — Raison vs Révélation : Votre Positionnement",
      p2Title: "Axe 5 — Clés de Régulation & Exercices de Rééquilibrage",
      p1Focus: "Cet axe explore vos canaux de discernement : l'analyse logique rigoureuse des faits ou la perception intuitive et prophétique du mystère.",
      p2Focus: "Comment faire dialoguer intelligence méthodique et réceptivité spirituelle sans les opposer."
    }
  ];

  dimensionPairs.forEach((dp, index) => {
    const dim = dimensions[dp.key];
    const isLeftDom = dim.rawValue <= 0;
    const pageNum1 = 11 + index * 2;
    const pageNum2 = 12 + index * 2;

    // PAGE A of DIMENSION
    doc.addPage();
    addPageHeader(doc, pageNum1, cleanName, `Module 2 • ${dim.label}`);
    addPageFooter(doc, pageNum1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`MODULE 2 — DIMENSION ${index + 1} SUR 5`, 20, 26);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(dp.p1Title, 20, 36);

    // Large Gauge Box
    drawCard(doc, 20, 44, 170, 52, COLORS.ochreLight, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`Votre résultat mesuré sur l'axe ${dim.label} :`, 28, 54);

    drawGauge(doc, 28, 64, 154, dim.leftLabel, dim.rightLabel, dim.leftPercent, dim.rightPercent, isLeftDom);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`Dominante personnelle : ${dim.dominantLabel} (${isLeftDom ? dim.leftPercent : dim.rightPercent}%)`, 28, 86);

    // Detailed explanation card
    drawCard(doc, 20, 102, 170, 78, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text("Ce que ce score signifie concrètement pour vous :", 28, 114);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    const p1Desc1 = dp.p1Focus;
    const p1Desc2 = `Avec un score de ${isLeftDom ? dim.leftPercent : dim.rightPercent}% vers la polarité ${dim.dominantLabel}, vos décisions courantes sont fortement teintées par ce tropisme. Vous avez tendance à privilégier naturellement ce mode opératoire car il vous procure un sentiment immédiat de sécurité et de compétence.`;
    const p1Desc3 = `Cependant, observez que la polarité inverse (${isLeftDom ? dim.rightLabel : dim.leftLabel}) représente ${isLeftDom ? dim.rightPercent : dim.leftPercent}% de votre profil : elle n'est pas absente, elle attend d'être sollicitée pour enrichir votre maturité.`;

    doc.text(doc.splitTextToSize(p1Desc1, 154), 28, 124);
    doc.text(doc.splitTextToSize(p1Desc2, 154), 28, 142);
    doc.text(doc.splitTextToSize(p1Desc3, 154), 28, 162);

    // Strengths of this score
    drawCard(doc, 20, 186, 170, 88, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text("Les avantages distinctifs de votre équilibre :", 28, 198);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(`• Clarté d'intention : vous ne perdez pas d'énergie à hésiter entre des approches contradictoires.`, 28, 210);
    doc.text(`• Reconnaissance sociale : votre entourage sait exactement ce qu'il peut attendre de vous sur cet axe.`, 28, 222);
    doc.text(`• Efficacité naturelle : là où d'autres débattent, vous agissez selon votre instinct fondamental.`, 28, 234);
    doc.text(`• Stabilité éprouvée : dans les moments de doute, cet ancrage constitue votre refuge rassurant.`, 28, 246);

    // PAGE B of DIMENSION (Regulation & Exercises)
    doc.addPage();
    addPageHeader(doc, pageNum2, cleanName, `Module 2 • Régulation ${dim.label}`);
    addPageFooter(doc, pageNum2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(dp.p2Title, 20, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(dp.p2Focus, 20, 36);

    // Risk of extreme box
    drawCard(doc, 20, 46, 170, 56, COLORS.ochreLight, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`Le piège de la caricature pour ${cleanName} :`, 28, 56);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    const extremeWarning = `Si vous laissez la polarité ${dim.dominantLabel} régner sans partage, vous risquez de développer une forme d'aveuglement. Les personnes ayant votre profil finissent parfois par mépriser ceux qui fonctionnent à l'inverse, croyant à tort que leur propre mode est la seule voie d'excellence.`;
    doc.text(doc.splitTextToSize(extremeWarning, 154), 28, 66);

    // Concrete exercise box
    drawCard(doc, 20, 110, 170, 96, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`Exercice pratique de rééquilibrage sur l'Axe ${index + 1} :`, 28, 122);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    const step1 = `1. Observation : Identifiez une situation récente où votre réflexe ${dim.dominantLabel} a bloqué une opportunité ou froissé un tiers.`;
    const step2 = `2. Décentrement : Demandez-vous comment une personne orientée à 80% vers ${isLeftDom ? dim.rightLabel : dim.leftLabel} aurait abordé ce même défi.`;
    const step3 = `3. Micro-action : Cette semaine, autorisez-vous une décision guidée délibérément par la polarité opposée (ex: si vous êtes dans l'action brute, accordez-vous 30 minutes de silence avant d'écrire un e-mail sensible).`;

    doc.text(doc.splitTextToSize(step1, 154), 28, 134);
    doc.text(doc.splitTextToSize(step2, 154), 28, 152);
    doc.text(doc.splitTextToSize(step3, 154), 28, 170);

    // Self coaching question
    drawCard(doc, 20, 214, 170, 60, COLORS.white, COLORS.terracotta);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`Question d'auto-coaching personnel :`, 28, 226);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`« Quelle est la peur inconsciente qui m'empêche d'investir pleinement la dimension ${isLeftDom ? dim.rightLabel : dim.leftLabel} dans ma vie ? »`, 28, 238);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text("Notez votre réponse spontanée en bas de page pour la relire dans un mois.", 28, 258);
  });

  // =========================================================================
  // PAGES 21 À 26 : MODULE 3 — MATRICE CROISÉE & COMBINAISON UNIQUE
  // =========================================================================

  // PAGE 21: Matrice d'interaction des axes
  doc.addPage();
  addPageHeader(doc, 21, cleanName, "Module 3 • Matrice d'interaction");
  addPageFooter(doc, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("MODULE 3 — MATRICE D'INTERACTION & COMBINAISON UNIQUE", 20, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Le Croisement Unique de vos 5 Polarités", 20, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Pourquoi votre combinaison spécifique ne se réduit pas à une simple moyenne.`, 20, 44);

  drawCard(doc, 20, 52, 170, 72, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("L'effet de levier des polarités conjuguées :", 28, 64);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const p21Text = `Deux personnes peuvent partager le profil de ${archetype.name} tout en ayant des vécus radicalement différents. L'une peut combiner une haute intériorité avec une forte exigence de vérité (profil de chercheur solitaire intransigeant), tandis que l'autre combinera cette même intériorité avec une dominante de grâce (profil d'accompagnateur compatissant).`;
  const p21Custom = `Dans votre cas, ${cleanName}, l'interaction entre votre dominante sur l'Axe 1 (${dimensions.I_A.dominantLabel}) et votre dominante sur l'Axe 3 (${dimensions.V_G.dominantLabel}) crée une signature comportementale immédiatement identifiable par vos pairs.`;
  doc.text(doc.splitTextToSize(p21Text, 154), 28, 74);
  doc.text(doc.splitTextToSize(p21Custom, 154), 28, 98);

  // Table of axis combinations
  drawCard(doc, 20, 132, 170, 138, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Cartouche de synthèse vectorielle personnelle :", 28, 144);

  const dimKeysOrder: Dimension[] = ['I_A', 'S_E', 'V_G', 'L_F', 'R_M'];
  let rowY = 154;
  dimKeysOrder.forEach((k, idx) => {
    const d = dimensions[k];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`Axe ${idx + 1} (${d.label})`, 28, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(`${d.dominantLabel} (${d.rawValue > 0 ? '+' : ''}${d.rawValue})`, 95, rowY);

    const interpretation = d.rawValue <= 0 ? "Tendance intériorisée / structurelle" : "Tendance expansive / intuitive";
    doc.text(interpretation, 135, rowY);

    doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
    doc.line(28, rowY + 3, 182, rowY + 3);
    rowY += 15;
  });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Distance vectorielle euclidienne calculée : index de proximité supérieur à la moyenne.", 28, rowY + 4);

  // PAGE 22: Votre binôme intérieur
  doc.addPage();
  addPageHeader(doc, 22, cleanName, "Module 3 • Votre binôme intérieur");
  addPageFooter(doc, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre Binôme Intérieur", 20, 28);

  const sec = secondaryMatches[0];
  const secName = sec ? sec.archetype.name : "Barnabas";
  const secAff = sec ? sec.affinity : 82;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`L'alliance féconde entre votre profil dominant (${archetype.name}) et votre profil secondaire (${secName}).`, 20, 36);

  drawCard(doc, 20, 46, 170, 68, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Comment ${secName} tempère et enrichit votre ${archetype.name} :`, 28, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const p22Desc = `Votre profil secondaire (${secName} à ${secAff}%) n'est pas un rival, mais un allié intérieur précieux. Lorsque vous vous sentez bloqué dans les automatismes de ${archetype.name}, c'est souvent cette voix secondaire qui vous offre la solution de contournement la plus élégante.`;
  const p22Desc2 = `Apprenez à reconnaître quand convoquer cette ressource : elle vous permet d'adapter votre communication avec ceux qui ne partagent pas votre premier langage.`;
  doc.text(doc.splitTextToSize(p22Desc, 154), 28, 68);
  doc.text(doc.splitTextToSize(p22Desc2, 154), 28, 92);

  // Practical dialog card
  drawCard(doc, 20, 122, 170, 86, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("Exemple de dialogue intérieur pour une décision importante :", 28, 134);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`La voix de ${archetype.name} (votre premier réflexe) :`, 28, 146);
  doc.setFont('helvetica', 'normal');
  doc.text(`« Gardons la ligne de profondeur, ne cédons pas à la facilité du moment. »`, 28, 153);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`La réponse modératrice de ${secName} (votre ressource secondaire) :`, 28, 166);
  doc.setFont('helvetica', 'normal');
  doc.text(`« C'est juste, mais assurons-nous d'embarquer les autres avec nous avec bienveillance. »`, 28, 173);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Ce dialogue équilibré est la marque des personnalités réellement intégrées.", 28, 192);

  // PAGE 23: Votre boussole de stress vs plénitude
  doc.addPage();
  addPageHeader(doc, 23, cleanName, "Module 3 • Boussole de stress");
  addPageFooter(doc, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Votre Profil sous Tension : Stress vs Alignement", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Comment votre comportement bascule sous pression et comment revenir à votre centre.`, 20, 36);

  // Stress State Box
  drawCard(doc, 20, 46, 170, 68, COLORS.white, [220, 180, 180]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 50, 50);
  doc.text("1. État de Régression sous Stress :", 28, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("• Retrait silencieux ou agressivité passive lorsqu'on conteste vos intuitions.", 28, 68);
  doc.text("• Rigidification soudaine des exigences envers les collaborateurs et proches.", 28, 78);
  doc.text("• Sentiment d'isolement total : « De toute façon, personne ne comprend les enjeux. »", 28, 88);
  doc.text("• Épuisement par rumination mentale et blocage de l'action concrète.", 28, 98);

  // Alignment State Box
  drawCard(doc, 20, 122, 170, 68, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("2. État de Plénitude & Alignement :", 28, 134);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("• Clarté tranquille : vous écoutez sans chercher à imposer immédiatement votre vision.", 28, 144);
  doc.text("• Générosité d'attention : vous savez créer un espace de confiance pour votre entourage.", 28, 154);
  doc.text("• Courage serein dans les choix délicats, sans crispation ni recherche de validation.", 28, 164);
  doc.text("• Capacité à faire des ponts entre personnes d'avis divergents.", 28, 174);

  // Emergency reflex box
  drawCard(doc, 20, 198, 170, 74, COLORS.white, COLORS.terracotta);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Protocole d'urgence pour ${cleanName} en phase de stress :`, 28, 210);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("1. STOP physique : interrompez la tâche en cours pendant 5 minutes sans écran.", 28, 222);
  doc.text("2. Ancrage corporel : buvez un grand verre d'eau et relâchez consciemment les mâchoires.", 28, 234);
  doc.text("3. Relativisation : posez-vous la question : « Quel est le pire qui puisse arriver ici ? »", 28, 246);
  doc.text("4. Dialogue différé : ne prenez aucune décision ferme tant que votre pouls est élevé.", 28, 258);

  // PAGE 24: Les 4 stades de maturité
  doc.addPage();
  addPageHeader(doc, 24, cleanName, "Module 3 • Stades de maturité");
  addPageFooter(doc, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Les 4 Stades de Maturité de votre Profil", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Votre chemin d'évolution spirituelle et personnelle à travers les étapes de croissance.`, 20, 36);

  const stages = [
    { num: "Stade 1", title: "L'impulsion inconsciente", desc: "Vous subissez vos réflexes sans recul. Vos forces s'expriment de manière brute, blessant parfois sans le vouloir." },
    { num: "Stade 2", title: "La vigilance laborieuse", desc: "Vous commencez à voir vos pièges mais devez fournir un effort conscient immense pour ne pas y succomber." },
    { num: "Stade 3", title: "L'intégration fluide", desc: "Vos 5 axes trouvent un équilibre naturel. Vous savez faire preuve de discernement et accueillir les opinions divergentes." },
    { num: "Stade 4", title: "La fécondité rayonnante", desc: "Vous n'avez plus rien à prouver. Votre tempérament devient un espace refuge et formateur pour ceux qui vous entourent." }
  ];

  let sY = 46;
  stages.forEach(s => {
    drawCard(doc, 20, sY, 170, 38, COLORS.white, COLORS.borderTint);
    doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
    doc.roundedRect(26, sY + 6, 18, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(s.num, 28, sY + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(s.title, 48, sY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(doc.splitTextToSize(s.desc, 142), 48, sY + 22);

    sY += 43;
  });

  // Self assessment box
  drawCard(doc, 20, 224, 170, 50, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Auto-positionnement pour ${cleanName} :`, 28, 236);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("À quel stade vous reconnaissez-vous le plus honnêtement aujourd'hui ?", 28, 246);
  doc.text("[   ] Stade 1       [   ] Stade 2       [   ] Stade 3       [   ] Stade 4", 28, 258);

  // PAGE 25: Vocation, mission & environnement optimal
  doc.addPage();
  addPageHeader(doc, 25, cleanName, "Module 3 • Vocation & Écologie de vie");
  addPageFooter(doc, 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Vocation Naturelle & Écologie de Vie", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Les contextes où votre potentiel porte le plus de fruit sans épuisement.`, 20, 36);

  // Ideal mission card
  drawCard(doc, 20, 46, 170, 74, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Domaines d'impact recommandés pour votre profil :", 28, 58);

  let vY = 68;
  archetype.missionVocation.forEach((voc, i) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(`• Vocation ${i + 1} :`, 28, vY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(voc, 130), 55, vY);
    vY += 15;
  });

  // Hostile environments to avoid
  drawCard(doc, 20, 128, 170, 68, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 50, 50);
  doc.text("Environnements énergivores à limiter :", 28, 140);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("• Les structures ultra-bureaucratiques sans marge d'initiative personnelle.", 28, 150);
  doc.text("• Les milieux dominés par la rivalité politique et les calculs d'apparence.", 28, 160);
  doc.text("• Les contextes d'urgence permanente où la précipitation remplace la réflexion.", 28, 170);
  doc.text("• Les équipes où les feedbacks sont inexistants ou uniquement punitifs.", 28, 180);

  // Growth invitation card
  drawCard(doc, 20, 204, 170, 68, COLORS.white, COLORS.terracotta);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Votre invitation spirituelle majeure :`, 28, 216);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  const mainInv = archetype.spiritualInvitations[0] || "Incarner la contemplation dans les œuvres concrètes du quotidien.";
  doc.text(doc.splitTextToSize(`« ${mainInv} »`, 154), 28, 226);
  doc.text(doc.splitTextToSize(`Ne cherchez pas à tout transformer d'un coup. Choisissez un seul cadre d'action cette semaine et posez-y un acte délibéré conforme à cette invitation.`, 154), 28, 244);

  // PAGE 26: Les 7 tentations récurrentes & antidotes
  doc.addPage();
  addPageHeader(doc, 26, cleanName, "Module 3 • Les 7 tentations");
  addPageFooter(doc, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Les 7 Tentations Récurrentes & Antidotes", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Les pièges psychologiques spécifiques à votre profil et les répliques adaptées.`, 20, 36);

  const temptations = [
    { t: "1. La tentation de l'isolement", a: "Antidote : Maintenir un lien régulier avec au moins deux personnes de confiance." },
    { t: "2. L'exigence perfectionniste paralysante", a: "Antidote : Adopter la règle des 80% : le bien fait vaut mieux que le parfait inachevé." },
    { t: "3. La rancune silencieuse", a: "Antidote : Exprimer son désaccord dans les 48 heures sans attendre l'explosion." },
    { t: "4. Le jugement secret sur autrui", a: "Antidote : Se rappeler que chaque personne livre un combat dont on ignore tout." },
    { t: "5. La peur d'être déçu", a: "Antidote : Aimer sans condition de retour immédiat." },
    { t: "6. La complaisance intellectuelle", a: "Antidote : Transformer toute réflexion en une action tangible le jour même." },
    { t: "7. Le sentiment d'illégitimité", a: "Antidote : Regarder les fruits déjà portés plutôt que ses manques supposés." }
  ];

  let tY = 46;
  temptations.forEach(item => {
    drawCard(doc, 20, tY, 170, 28, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 50, 50);
    doc.text(item.t, 28, tY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(item.a, 28, tY + 19);
    tY += 32;
  });

  // =========================================================================
  // PAGES 27 À 32 : MODULE 4 — LE PLAN D'ACTION SUR 30 JOURS
  // =========================================================================

  // PAGE 27: Protocole quotidien d'alignement
  doc.addPage();
  addPageHeader(doc, 27, cleanName, "Module 4 • Protocole quotidien");
  addPageFooter(doc, 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("MODULE 4 — GUIDE PRATIQUE & PLAN D'ACTION SUR 30 JOURS", 20, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Protocole d'Alignement Quotidien de ${cleanName}`, 20, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Trois rendez-vous quotidiens simples pour maintenir votre centre de gravité.`, 20, 44);

  const routines = [
    {
      time: "Matin (10 minutes) — L'Ancrage Intérieur",
      desc: "Avant d'ouvrir le moindre message ou réseau social : asseyez-vous en silence, prenez 5 respirations profondes et formulez votre intention du jour.",
      action: "Formulez : « Aujourd'hui, je choisis d'agir depuis ma paix intérieure et non depuis l'agitation extérieure. »"
    },
    {
      time: "Midi (5 minutes) — Le Check d'Énergie",
      desc: "Au milieu de la journée, observez votre corps : où se situent les tensions (épaules, nuque, mâchoires) ? Quel axe a été le plus sollicité ce matin ?",
      action: "Si vous sentez la précipitation monter : marchez 3 minutes au grand air sans téléphone."
    },
    {
      time: "Soir (10 minutes) — La Décantation de Gratitude",
      desc: "Avant le sommeil, faites une relecture bienveillante : nommez une situation où vous avez été fidèle à vos valeurs et un moment où vous avez glissé.",
      action: "Notez sur votre carnet : 3 éléments pour lesquels vous éprouvez une gratitude sincère."
    }
  ];

  let rY = 54;
  routines.forEach(r => {
    drawCard(doc, 20, rY, 170, 58, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(r.time, 28, rY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(r.desc, 154), 28, rY + 22);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(doc.splitTextToSize(`→ ${r.action}`, 154), 28, rY + 42);

    rY += 66;
  });

  // PAGE 28: Semaine 1 (Jours 1 à 7) - Observation
  doc.addPage();
  addPageHeader(doc, 28, cleanName, "Plan 30 Jours • Semaine 1");
  addPageFooter(doc, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Semaine 1 : Observation & Conscience des Schémas", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Objectif : Repérer vos réactions automatiques sans chercher à les corriger immédiatement.`, 20, 36);

  const w1Days = [
    { day: "Jour 1", task: "Identifier mon premier réflexe du matin face aux imprévus." },
    { day: "Jour 2", task: "Observer mon niveau de patience quand autrui prend du temps pour s'expliquer." },
    { day: "Jour 3", task: "Compter le nombre de fois où je me retiens d'exprimer ce que je ressens." },
    { day: "Jour 4", task: "Repérer la situation qui déclenche chez moi le plus fort désir de contrôle ou de fuite." },
    { day: "Jour 5", task: "Noter quel moment de la journée m'a apporté le sentiment le plus vif d'alignement." },
    { day: "Jour 6", task: "Partager un ressenti authentique avec un proche sans fard ni justification." },
    { day: "Jour 7", task: "Bilan de semaine : Relire mes notes et identifier mon schéma récurrent." }
  ];

  let w1Y = 46;
  w1Days.forEach(item => {
    drawCard(doc, 20, w1Y, 170, 26, COLORS.white, COLORS.borderTint);
    doc.setDrawColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.rect(28, w1Y + 8, 4, 4); // Checkbox

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(item.day, 38, w1Y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(item.task, 130), 60, w1Y + 12);
    w1Y += 31;
  });

  // PAGE 29: Semaine 2 (Jours 8 à 14) - Fortification des forces
  doc.addPage();
  addPageHeader(doc, 29, cleanName, "Plan 30 Jours • Semaine 2");
  addPageFooter(doc, 29);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Semaine 2 : Déploiement & Ancrage de vos Talents", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Objectif : Mettre délibérément vos 4 forces majeures au service de votre communauté.`, 20, 36);

  const w2Days = [
    { day: "Jour 8", task: `Valoriser concrètement la force 1 de ${archetype.name} dans mon cadre professionnel.` },
    { day: "Jour 9", task: "Offrir un temps d'écoute active sans interrompre ni donner de conseil non sollicité." },
    { day: "Jour 10", task: "Prendre une initiative simple pour embellir ou clarifier un espace de travail commun." },
    { day: "Jour 11", task: "Remercier quelqu'un de façon spécifique pour ce qu'il apporte à mon équilibre." },
    { day: "Jour 12", task: "Défendre une valeur qui m'est chère avec calme et fermeté bienveillante." },
    { day: "Jour 13", task: "Consacrer 1 heure entière à une activité qui nourrit mon âme et mon esprit." },
    { day: "Jour 14", task: "Bilan de semaine : Où ai-je senti le plus de fécondité vivante ?" }
  ];

  let w2Y = 46;
  w2Days.forEach(item => {
    drawCard(doc, 20, w2Y, 170, 26, COLORS.white, COLORS.borderTint);
    doc.setDrawColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.rect(28, w2Y + 8, 4, 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(item.day, 38, w2Y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(item.task, 130), 60, w2Y + 12);
    w2Y += 31;
  });

  // PAGE 30: Semaine 3 (Jours 15 à 21) - Travail sur les angles morts
  doc.addPage();
  addPageHeader(doc, 30, cleanName, "Plan 30 Jours • Semaine 3");
  addPageFooter(doc, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Semaine 3 : Confrontation Douce avec vos Angles Morts", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Objectif : Aller délibérément à contre-courant d'un réflexe défensif habituel.`, 20, 36);

  const w3Days = [
    { day: "Jour 15", task: "Accepter un imprévu sans soupirer ni exprimer d'irritation visible." },
    { day: "Jour 16", task: "Demander de l'aide sur un sujet où j'ai d'habitude la prétention de tout régler seul." },
    { day: "Jour 17", task: "Faire le premier pas pour désamorcer une tension latente avec un collègue ou proche." },
    { day: "Jour 18", task: "Renoncer à avoir le dernier mot dans un échange d'idées anodin." },
    { day: "Jour 19", task: "M'exposer à une situation inconfortable pour développer ma polarité opposée." },
    { day: "Jour 20", task: "Pardonner intérieurement une maladresse reçue sans exiger de réparation." },
    { day: "Jour 21", task: "Bilan de semaine : Qu'est-ce qui a été le plus difficile à lâcher ?" }
  ];

  let w3Y = 46;
  w3Days.forEach(item => {
    drawCard(doc, 20, w3Y, 170, 26, COLORS.white, COLORS.borderTint);
    doc.setDrawColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.rect(28, w3Y + 8, 4, 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(item.day, 38, w3Y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(item.task, 130), 60, w3Y + 12);
    w3Y += 31;
  });

  // PAGE 31: Semaine 4 (Jours 22 à 28) - Complémentarité & Rayonnement
  doc.addPage();
  addPageHeader(doc, 31, cleanName, "Plan 30 Jours • Semaine 4");
  addPageFooter(doc, 31);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Semaine 4 : Écologie Relationnelle & Rayonnement", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Objectif : Sceller une alliance féconde avec ceux qui pensent et agissent différemment.`, 20, 36);

  const w4Days = [
    { day: "Jour 22", task: "Solliciter l'avis d'une personne opposée à mon profil sur un projet en cours." },
    { day: "Jour 23", task: "Créer un binôme de travail ou d'échange fondé sur la complémentarité des dons." },
    { day: "Jour 24", task: "Encourager un leader émergent dans sa prise d'initiative sans le juger." },
    { day: "Jour 25", task: "Établir une frontière claire pour protéger mon écologie de vie (sommeil, repos)." },
    { day: "Jour 26", task: "Exprimer publiquement de la reconnaissance pour le talent d'un collègue discret." },
    { day: "Jour 27", task: "Clarifier ma mission prioritaire pour les trois prochains mois." },
    { day: "Jour 28", task: "Bilan de semaine : Mes relations sont-elles devenues plus fluides et sereines ?" }
  ];

  let w4Y = 46;
  w4Days.forEach(item => {
    drawCard(doc, 20, w4Y, 170, 26, COLORS.white, COLORS.borderTint);
    doc.setDrawColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.rect(28, w4Y + 8, 4, 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(item.day, 38, w4Y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(doc.splitTextToSize(item.task, 130), 60, w4Y + 12);
    w4Y += 31;
  });

  // PAGE 32: Jours 29 & 30 - Carnet de synthèse
  doc.addPage();
  addPageHeader(doc, 32, cleanName, "Plan 30 Jours • Bilan final");
  addPageFooter(doc, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Jours 29 & 30 : Bilan & Auto-Évaluation Globale", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Prenez une heure de recul pour mesurer l'évolution de vos dynamiques intérieures.`, 20, 36);

  // Before / After grid
  drawCard(doc, 20, 46, 170, 110, COLORS.white, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Grille d'évolution personnelle (notez de 1 à 10) :", 28, 58);

  const criteria = [
    "Clarté d'esprit face aux décisions difficiles :",
    "Capacité à ne pas me laisser déborder par le stress :",
    "Qualité d'écoute et patience envers les personnes lentes :",
    "Fidélité à mes valeurs dans les actes quotidiens :",
    "Acceptation de mes limites sans culpabilité stérile :",
    "Fluidité de collaboration avec mes opposés complémentaires :"
  ];

  let crY = 70;
  criteria.forEach(c => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(c, 28, crY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text("Avant : [   / 10 ]     Après : [   / 10 ]", 125, crY);
    crY += 14;
  });

  // Commitment box
  drawCard(doc, 20, 168, 170, 96, COLORS.ochreLight, COLORS.terracotta);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Mon engagement envers moi-même pour les mois à venir :`, 28, 180);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("« Moi, " + cleanName + ", conscient(e) de mes richesses et de mes zones d'ombre,", 28, 192);
  doc.text("je choisis de cultiver mon profil " + archetype.name + " non pour m'y enfermer,", 28, 200);
  doc.text("mais pour porter du fruit au service de mon entourage, avec lucidité et amour. »", 28, 208);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Signature personnelle : ..............................................     Date : .........................", 28, 246);

  // =========================================================================
  // PAGES 33 À 35 : ANNEXES & OUTILS DE SUIVI
  // =========================================================================

  // PAGE 33: Fiche mémo détachable
  doc.addPage();
  addPageHeader(doc, 33, cleanName, "Annexes • Fiche mémo détachable");
  addPageFooter(doc, 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Fiche Mémo Synthétique Détachable", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Votre profil résumé en une page essentielle, à garder sous les yeux ou dans votre carnet.`, 20, 36);

  drawCard(doc, 20, 46, 170, 222, COLORS.white, COLORS.terracotta);
  
  // Header of memo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`${cleanName.toUpperCase()} • ${archetype.name.toUpperCase()}`, 28, 60);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`« ${archetype.title} » — Affinité : ${affinity}%`, 28, 68);

  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.line(28, 74, 182, 74);

  // 5 axes brief
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("VOS 5 ÉQUILIBRES CARDINAUX :", 28, 84);

  let memY = 94;
  dimKeysOrder.forEach((k, idx) => {
    const d = dimensions[k];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(`• Axe ${idx + 1} (${d.label}) : `, 32, memY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(`${d.dominantLabel} (${d.rawValue <= 0 ? d.leftPercent : d.rightPercent}%)`, 80, memY);
    memY += 9;
  });

  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.line(28, memY + 2, 182, memY + 2);

  // 3 Golden Rules
  memY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("VOS 3 RAPPELS D'OR QUOTIDIENS :", 28, memY);

  memY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("1. Votre calme est votre force, ne le bradez pas pour de l'agitation superficielle.", 32, memY);
  memY += 8;
  doc.text("2. La complémentarité n'est pas une menace : vos opposés voient ce qui vous manque.", 32, memY);
  memY += 8;
  doc.text("3. La vérité dite sans amour blesse ; la bienveillance sans vérité égare. Cherchez l'accord parfait.", 32, memY);

  // Verse reminder
  memY += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("PAROLE D'ANCRAGE :", 28, memY);

  memY += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(doc.splitTextToSize(`« ${archetype.biblicalVerse} »`, 146), 28, memY);

  // PAGE 34: Bibliothèque de ressources
  doc.addPage();
  addPageHeader(doc, 34, cleanName, "Annexes • Ressources recommandées");
  addPageFooter(doc, 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Ressources & Lectures Recommandées", 20, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Pour approfondir la compréhension des tempéraments, de l'intériorité et de l'action.`, 20, 36);

  const books = [
    { title: "Les Tempéraments au regard de la foi", author: "P. Marie-Dominique Philippe", desc: "Une étude classique et lumineuse sur la sanctification des tempéraments naturels." },
    { title: "L'art de l'écoute et du discernement", author: "Henri Nouwen", desc: "Pour apprendre à écouter ce qui émerge au creux du silence et discerner les mouvements du cœur." },
    { title: "La force des discrets", author: "Susan Cain", desc: "Comment la profondeur et la réflexion tranquille changent le monde face à l'injonction d'extraversion." },
    { title: "L'éthique de la sollicitude (Care & Grace)", author: "Paul Ricoeur", desc: "Pour concilier l'exigence de la justice et la gratuité inconditionnelle de la grâce." }
  ];

  let bY = 46;
  books.forEach(b => {
    drawCard(doc, 20, bY, 170, 34, COLORS.white, COLORS.borderTint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
    doc.text(b.title, 28, bY + 10);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
    doc.text(b.author, 28, bY + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(b.desc, 28, bY + 25);

    bY += 40;
  });

  // Recommended Bible reading box
  drawCard(doc, 20, 214, 170, 56, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Lectures bibliques ciblées pour votre profil ${archetype.name} :`, 28, 226);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("• L'Évangile selon saint Jean, chapitres 13 à 17 (Les adieux et le cœur du Christ).", 28, 236);
  doc.text("• Première épître aux Corinthiens, chapitre 12 et 13 (La diversité des charismes et l'amour).", 28, 246);
  doc.text("• Épître aux Romains, chapitre 12 (Le renouvellement de l'intelligence et le service du Corps).", 28, 256);

  // PAGE 35: Attestation personnelle de parcours
  doc.addPage();
  addPageHeader(doc, 35, cleanName, "Annexes • Attestation nominative");
  addPageFooter(doc, 35);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Attestation d'Évaluation & Mot de Clôture", 20, 28);

  // Certificate Diploma Box
  drawCard(doc, 20, 42, 170, 160, COLORS.white, COLORS.terracotta);
  doc.setDrawColor(COLORS.borderTint[0], COLORS.borderTint[1], COLORS.borderTint[2]);
  doc.setLineWidth(0.4);
  doc.rect(24, 46, 162, 152);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("ATTESTATION NOMINATIVE D'ÉVALUATION MULTIDIMENSIONNELLE", 105, 58, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Il est certifié que :", 105, 72, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(cleanName, 105, 86, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("a complété l'évaluation des 5 dimensions spirituelles et comportementales.", 105, 98, { align: 'center' });

  // Seal badge in certificate
  doc.setFillColor(COLORS.ochreLight[0], COLORS.ochreLight[1], COLORS.ochreLight[2]);
  doc.roundedRect(45, 106, 120, 30, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text(`Profil Référent : ${archetype.name} (${archetype.title})`, 105, 118, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text(`Indice de Concordance : ${affinity}%`, 105, 128, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Dossier N° : ${fileReference} • Émis le : ${reportDate}`, 105, 148, { align: 'center' });
  doc.text("Plateforme : Quel disciple suis-je ? (discipledejesus.com)", 105, 155, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("« Chaque disciple a sa voix, chaque voix a sa place. »", 105, 175, { align: 'center' });

  // Closing assistance box
  drawCard(doc, 20, 210, 170, 60, COLORS.ochreLight, COLORS.borderTint);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.charcoal[0], COLORS.charcoal[1], COLORS.charcoal[2]);
  doc.text("Assistance & Communauté :", 28, 222);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Ce dossier est votre compagnon de route. Pour toute question méthodologique ou suggestion :", 28, 232);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.terracotta[0], COLORS.terracotta[1], COLORS.terracotta[2]);
  doc.text("contact@discipledejesus.com", 28, 242);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Site officiel : https://discipledejesus.netlify.app/", 28, 252);

  return doc;
}
