import jsPDF from 'jspdf';

/**
 * Ensures strict French typography rules:
 * - Non-breaking space before ?, !, :, ;
 * - Non-breaking space after opening quote «
 * - Non-breaking space before closing quote »
 */
function cleanFrenchTypography(text: string): string {
  return text
    .replace(/\s+([?!:;])/g, '\u00A0$1')
    .replace(/«\s*/g, '«\u00A0')
    .replace(/\s*»/g, '\u00A0»');
}

/**
 * Draws the official Disciple brand emblem with the golden border on dark background
 * matching the icone_sur_fonce.svg design.
 */
export function drawBrandEmblem(doc: jsPDF, x: number, y: number, s: number = 16): void {
  // Dark rounded square #242220 with golden border #D4A373
  doc.setFillColor(36, 34, 32);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(Math.max(0.4, s * 0.05));
  doc.roundedRect(x, y, s, s, s * 0.25, s * 0.25, 'FD');

  const cx = x + s / 2;
  const cy = y + s / 2;

  // Faint dashed circular halo #c09462
  doc.setDrawColor(192, 148, 98);
  doc.setLineWidth(0.25);
  doc.setLineDashPattern([0.6, 0.8], 0);
  doc.circle(cx, cy, s * 0.32, 'S');
  doc.setLineDashPattern([], 0);

  // 4-pointed diamond star #d4a373
  const rMain = s * 0.36;
  const rMid = s * 0.08;
  doc.setFillColor(212, 163, 115);
  doc.triangle(cx, cy - rMain, cx - rMid, cy, cx + rMid, cy, 'F');
  doc.triangle(cx, cy + rMain, cx - rMid, cy, cx + rMid, cy, 'F');
  doc.triangle(cx + rMain, cy, cx, cy - rMid, cx, cy + rMid, 'F');
  doc.triangle(cx - rMain, cy, cx, cy - rMid, cx, cy + rMid, 'F');

  // Diagonal rays #fdfaf5
  doc.setDrawColor(253, 250, 245);
  doc.setLineWidth(0.3);
  const d1 = s * 0.16;
  const d2 = s * 0.26;
  doc.line(cx - d2, cy - d2, cx - d1, cy - d1);
  doc.line(cx + d1, cy + d1, cx + d2, cy + d2);
  doc.line(cx + d2, cy - d2, cx + d1, cy - d1);
  doc.line(cx - d2, cy + d2, cx - d1, cy + d1);

  // Central core #fdfaf5
  doc.setFillColor(253, 250, 245);
  doc.circle(cx, cy, s * 0.07, 'F');
}

/**
 * Generates the Facilitation Sheet PDF (45-minute session)
 * Clean, elegant vector layout, generous vertical spacing, body text >= 10pt.
 * Vertically distributed to fill the entire A4 page gracefully.
 */
export function generateFacilitationSheetPdf(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background cream tint #FAF7F2
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, 210, 297, 'F');

  // Header band
  doc.setFillColor(36, 32, 29);
  doc.rect(14, 11, 182, 25, 'F');

  // Official Brand Emblem in header with golden contour
  drawBrandEmblem(doc, 19, 15, 17);

  // Header brand & title
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(cleanFrenchTypography('DISCIPLE • ARCHÉTYPES BIBLIQUES'), 42, 21.5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14.5);
  doc.text(cleanFrenchTypography("Fiche d'animation de rencontre (45 minutes)"), 42, 30.5);

  doc.setFontSize(8.5);
  doc.setTextColor(215, 210, 200);
  doc.text('discipledejesus.netlify.app', 190, 30.5, { align: 'right' });

  // Framework box (Intro) - slightly taller for breathing room
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 40, 182, 27, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(194, 94, 66);
  doc.text(cleanFrenchTypography("CADRE & RECOMMANDATIONS POUR L'ANIMATEUR"), 20, 46.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 45, 45);
  const introTxt1 = cleanFrenchTypography("• Découverte initiale\u00A0: Le questionnaire gratuit en ligne (20 questions, 5 min) identifie le disciple dominant et suffit amplement pour animer cette rencontre d'initiation de 45 minutes.");
  const introTxt2 = cleanFrenchTypography("• Cycle approfondi\u00A0: Pour aller plus loin sur plusieurs semaines (4 à 6 séances en groupe de maison ou séminaire), chaque membre peut acquérir son dossier complet de 36 pages (19 € par personne).");
  const splitIntro1 = doc.splitTextToSize(introTxt1, 168);
  const splitIntro2 = doc.splitTextToSize(introTxt2, 168);
  doc.text(splitIntro1, 20, 53);
  doc.text(splitIntro2, 20, 60.5);

  // 4 Steps distributed with generous vertical spacing (taking full page height)
  let currentY = 73;
  const steps = [
    {
      num: '1',
      title: cleanFrenchTypography('Passation du questionnaire en ligne (7 min)'),
      color: [194, 94, 66] as [number, number, number],
      desc: cleanFrenchTypography('Chaque participant ouvre discipledejesus.netlify.app/test sur son smartphone, sa tablette ou son ordinateur. Consigne\u00A0: répondre avec sincérité et spontanéité aux 20 questions, sans chercher de réponse «\u00A0pieuse\u00A0» ou théorique. Chacun découvre son profil dominant, son pourcentage de correspondance et son verset inspirant.')
    },
    {
      num: '2',
      title: cleanFrenchTypography('Tour de table et cartographie du groupe (15 min)'),
      color: [200, 145, 50] as [number, number, number],
      desc: cleanFrenchTypography("Chacun annonce son disciple dominant (ex\u00A0: Pierre, Jean, Thomas, Marthe...) et lit à voix haute son verset inspirant. L'animateur note les prénoms au tableau ou sur la matrice murale pour faire apparaître l'écosystème du groupe\u00A0: quels tempéraments dominent\u00A0? Quels profils manquent\u00A0?")
    },
    {
      num: '3',
      title: cleanFrenchTypography('Questions clés de résonance fraternelle (15 min)'),
      color: [95, 115, 99] as [number, number, number],
      desc: cleanFrenchTypography("L'animateur propose d'échanger autour des 4 questions suivantes\u00A0:\n• Résonance\u00A0: Qu'est-ce qui vous a le plus parlé ou surpris dans la description de votre profil\u00A0?\n• Force\u00A0: Quelle est la force principale de ce tempérament dans votre vie quotidienne\u00A0?\n• Tension\u00A0: Quel est votre angle mort sous tension ou dans la fatigue\u00A0?\n• Complémentarité\u00A0: Quel autre disciple présent dans le groupe compense le mieux vos fragilités\u00A0?")
    },
    {
      num: '4',
      title: cleanFrenchTypography("Prière d'action de grâce et d'unité (8 min)"),
      color: [45, 45, 45] as [number, number, number],
      desc: cleanFrenchTypography("Lecture de 1 Corinthiens 12, 12-27 (Le corps est un, mais il a plusieurs membres). Prière commune pour bénir la diversité des tempéraments et rendre grâce pour la complémentarité de chacun au service de l'édification mutuelle.")
    }
  ];

  steps.forEach((st) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.35);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.2);
    // Limit width to 154mm (starts at 24mm, leaving 14mm safe margin from right edge 196mm)
    const splitDesc = doc.splitTextToSize(st.desc, 154);
    const boxHeight = 15 + splitDesc.length * 5.1;

    doc.roundedRect(14, currentY, 182, boxHeight, 3, 3, 'FD');

    // Number badge
    doc.setFillColor(st.color[0], st.color[1], st.color[2]);
    doc.circle(23, currentY + 8, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(st.num, 23, currentY + 9.3, { align: 'center' });

    // Step Title
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(st.title, 31, currentY + 9.2);

    // Step Description (10.2pt with line spacing 5.1mm)
    doc.setTextColor(45, 42, 38);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.2);
    doc.text(splitDesc, 23, currentY + 16.5);

    // Generous vertical gap between boxes
    currentY += boxHeight + 6.5;
  });

  // 3 Golden rules section - fills lower portion of A4
  currentY += 1.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(45, 45, 45);
  doc.text(cleanFrenchTypography("LES 3 RÈGLES D'OR DE L'ANIMATEUR"), 14, currentY);

  currentY += 4;
  const colWidth = 58;
  const rules = [
    { 
      title: cleanFrenchTypography('1. Aucune hiérarchie'), 
      text: cleanFrenchTypography("Tous les tempéraments sont voulus par Dieu. Un profil d'action ne vaut pas mieux qu'un profil contemplatif.") 
    },
    { 
      title: cleanFrenchTypography('2. Bienveillance absolue'), 
      text: cleanFrenchTypography("Le profil n'est pas une étiquette pour enfermer, mais une clé d'encouragement mutuel et d'écoute.") 
    },
    { 
      title: cleanFrenchTypography('3. Confidentialité & liberté'), 
      text: cleanFrenchTypography("Chacun reste pleinement libre de ce qu'il souhaite partager, sans pression de conformité.") 
    }
  ];

  rules.forEach((r, idx) => {
    const rx = 14 + idx * (colWidth + 4);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(212, 163, 115);
    doc.setLineWidth(0.35);
    doc.roundedRect(rx, currentY, colWidth, 25, 2.5, 2.5, 'FD');

    doc.setTextColor(194, 94, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(r.title, rx + 4, currentY + 6.5);

    doc.setTextColor(60, 55, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.4);
    const splitRule = doc.splitTextToSize(r.text, colWidth - 8);
    doc.text(splitRule, rx + 4, currentY + 12.2);
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 115, 110);
  doc.text(cleanFrenchTypography("Fiche d'animation imprimable • Disciple — Archétypes bibliques • discipledejesus.netlify.app"), 105, 291, { align: 'center' });

  return doc;
}
