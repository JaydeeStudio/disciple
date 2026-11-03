import jsPDF from 'jspdf';

/**
 * Draws the official Disciple brand emblem in vector format
 */
function drawBrandEmblem(doc: jsPDF, x: number, y: number, s: number = 10): void {
  // Dark rounded square #242220
  doc.setFillColor(36, 34, 32);
  doc.roundedRect(x, y, s, s, s * 0.25, s * 0.25, 'F');

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
  doc.rect(14, 12, 182, 24, 'F');

  // Official Brand Emblem in header
  drawBrandEmblem(doc, 19, 16, 16);

  // Header brand & title
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DISCIPLE • ARCHÉTYPES BIBLIQUES', 40, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13.5);
  doc.text('Fiche d\'animation de rencontre (45 minutes)', 40, 31);

  doc.setFontSize(8.5);
  doc.setTextColor(215, 210, 200);
  doc.text('discipledejesus.netlify.app', 190, 31, { align: 'right' });

  // Framework box (Intro)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 40, 182, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(194, 94, 66);
  doc.text('CADRE & RECOMMANDATIONS POUR L\'ANIMATEUR', 20, 46.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 45, 45);
  const introTxt1 = '• Découverte initiale : Le questionnaire gratuit en ligne (20 questions, 5 min) identifie le disciple dominant et suffit amplement pour animer cette rencontre d\'initiation de 45 minutes.';
  const introTxt2 = '• Cycle approfondi : Pour aller plus loin sur plusieurs semaines (4 à 6 séances en groupe de maison ou séminaire), chaque membre peut acquérir son dossier complet de 36 pages (19 € par personne).';
  const splitIntro1 = doc.splitTextToSize(introTxt1, 170);
  const splitIntro2 = doc.splitTextToSize(introTxt2, 170);
  doc.text(splitIntro1, 20, 53);
  doc.text(splitIntro2, 20, 60.5);

  // Steps
  let currentY = 70;
  const steps = [
    {
      num: '1',
      title: 'Passation du questionnaire en ligne (7 min)',
      color: [194, 94, 66] as [number, number, number],
      desc: 'Chaque participant ouvre discipledejesus.netlify.app/test sur son smartphone, sa tablette ou son ordinateur. Consigne : répondre avec sincérité et spontanéité aux 20 questions, sans chercher de réponse « pieuse » ou théorique. Chacun découvre son profil dominant, son pourcentage de correspondance et son verset inspirant.'
    },
    {
      num: '2',
      title: 'Tour de table et cartographie du groupe (15 min)',
      color: [200, 145, 50] as [number, number, number],
      desc: 'Chacun annonce son disciple dominant (ex : Pierre, Jean, Thomas, Marthe...) et lit à voix haute son verset inspirant. L\'animateur note les prénoms au tableau ou sur la matrice murale pour faire apparaître l\'écosystème du groupe : quels tempéraments dominent ? Quels profils manquent ?'
    },
    {
      num: '3',
      title: 'Questions clés de résonance fraternelle (15 min)',
      color: [95, 115, 99] as [number, number, number],
      desc: 'L\'animateur propose d\'échanger autour des 4 questions suivantes :\n• Résonance : Qu\'est-ce qui vous a le plus parlé ou surpris dans la description de votre profil ?\n• Force : Quelle est la force principale de ce tempérament dans votre vie quotidienne ?\n• Tension : Quel est votre angle mort sous tension ou dans la fatigue ?\n• Complémentarité : Quel autre disciple présent dans le groupe compense le mieux vos fragilités ?'
    },
    {
      num: '4',
      title: 'Prière d\'action de grâce et d\'unité (8 min)',
      color: [45, 45, 45] as [number, number, number],
      desc: 'Lecture de 1 Corinthiens 12, 12-27 (Le corps est un, mais il a plusieurs membres). Prière commune pour bénir la diversité des tempéraments et rendre grâce pour la complémentarité de chacun au service de l\'édification mutuelle.'
    }
  ];

  steps.forEach((st) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitDesc = doc.splitTextToSize(st.desc, 160);
    const boxHeight = 12 + splitDesc.length * 4.7;

    doc.roundedRect(14, currentY, 182, boxHeight, 2.5, 2.5, 'FD');

    // Number badge
    doc.setFillColor(st.color[0], st.color[1], st.color[2]);
    doc.circle(22, currentY + 7, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(st.num, 22, currentY + 8.2, { align: 'center' });

    // Title
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(st.title, 29, currentY + 8.3);

    // Description (minimum 10pt)
    doc.setTextColor(50, 48, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(splitDesc, 22, currentY + 14.5);

    currentY += boxHeight + 4;
  });

  // 3 Golden rules
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 45, 45);
  doc.text('LES 3 RÈGLES D\'OR DE L\'ANIMATEUR', 14, currentY);

  currentY += 4;
  const colWidth = 58;
  const rules = [
    { title: '1. Aucune hiérarchie', text: 'Tous les tempéraments sont voulus par Dieu. Un profil d\'action ne vaut pas mieux qu\'un profil contemplatif.' },
    { title: '2. Bienveillance absolue', text: 'Le profil n\'est pas une étiquette pour enfermer, mais une clé d\'encouragement mutuel et d\'écoute.' },
    { title: '3. Confidentialité & liberté', text: 'Chacun reste pleinement libre de ce qu\'il souhaite partager, sans pression de conformité.' }
  ];

  rules.forEach((r, idx) => {
    const rx = 14 + idx * (colWidth + 4);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(212, 163, 115);
    doc.setLineWidth(0.3);
    doc.roundedRect(rx, currentY, colWidth, 23, 2, 2, 'FD');

    doc.setTextColor(194, 94, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.text(r.title, rx + 4, currentY + 6);

    doc.setTextColor(65, 60, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitRule = doc.splitTextToSize(r.text, colWidth - 8);
    doc.text(splitRule, rx + 4, currentY + 11.5);
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 115, 110);
  doc.text('Fiche d\'animation imprimable • Disciple — Archétypes bibliques • discipledejesus.netlify.app', 105, 290, { align: 'center' });

  return doc;
}
