import jsPDF from 'jspdf';

/**
  * Draws the official Disciple brand emblem in vector format
  */
function drawBrandEmblem(doc: jsPDF, x: number, y: number, s: number = 16): void {
  // Dark rounded square #242220
  doc.setFillColor(36, 34, 32);
  doc.roundedRect(x, y, s, s, s * 0.25, s * 0.25, 'F');

  const cx = x + s / 2;
  const cy = y + s / 2;

  // Faint dashed circular halo #c09462
  doc.setDrawColor(192, 148, 98);
  doc.setLineWidth(0.35);
  doc.setLineDashPattern([0.8, 1], 0);
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
  doc.setLineWidth(0.4);
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
 * Generates the Printable Wall Matrix for Teams and Fraternities
 * Orientation: Landscape A3 (420 x 297 mm)
 * Typography: Large >=12pt text for collective legibility from a distance.
 */
export function generateWallMatrixPdf(): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [420, 297]
  });

  const width = 420;
  const height = 297;

  // Background warm beige tint #FAF7F2
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, width, height, 'F');

  // Outer decorative double frame
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, width - 20, height - 20);
  doc.setDrawColor(230, 220, 205);
  doc.setLineWidth(0.4);
  doc.rect(12, 12, width - 24, height - 24);

  // Top header banner
  doc.setFillColor(36, 32, 29); // #24201D
  doc.rect(14, 14, width - 28, 26, 'F');

  // Official Brand emblem in header
  drawBrandEmblem(doc, 20, 18, 18);

  // Header brand & main title (Large & readable)
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DISCIPLE • ARCHÉTYPES BIBLIQUES & GOUVERNANCE FRATERNELLE', 44, 25);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('MATRICE DE CARTOGRAPHIE VISUELLE DES TEMPÉRAMENTS', 44, 34);

  // Discreet A3 print recommendation badge on top right
  doc.setFillColor(55, 50, 45);
  doc.roundedRect(width - 160, 18, 142, 18, 2, 2, 'F');
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('SUPPORT D\'AFFICHAGE MURAL POUR LE GROUPE', width - 89, 25, { align: 'center' });
  doc.setTextColor(235, 235, 235);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Recommandé : impression au format A3 pour affichage mural', width - 89, 31.5, { align: 'center' });

  // Instructions strip below header (Generous height, no text overflow)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 212, 200);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 43, width - 28, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(194, 94, 66);
  doc.text('CONSIGNE D\'ANIMATION :', 20, 52.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 48, 45);
  const guideText = 'Après la passation du test sur discipledejesus.netlify.app/test, chaque participant écrit son prénom sur un post-it et vient le coller dans le pôle correspondant à son profil dominant. Observez l\'équilibre global de votre équipe, les forces abondantes et les zones vides à fortifier.';
  // Wrap cleanly over 2 lines inside the 392mm wide banner
  const splitGuide = doc.splitTextToSize(guideText, width - 28 - 95);
  doc.text(splitGuide, 85, 49.5);

  // Grid dimensions
  const gridX = 14;
  const gridY = 62;
  const gridW = width - 28; // 392 mm
  const gridH = height - gridY - 18; // ~217 mm
  const halfW = gridW / 2; // 196 mm
  const halfH = gridH / 2; // 108.5 mm

  const quadrants = [
    {
      title: 'PÔLE IMPULSION & ACTION (Pionniers, audacieux et réformateurs)',
      subtitle: 'Dynamique : Vocation à démarrer, défricher, motiver et trancher sous l\'épreuve.',
      colorHeader: [194, 94, 66] as [number, number, number], // Terracotta
      colorBg: [255, 251, 249] as [number, number, number],
      x: gridX,
      y: gridY,
      archetypes: [
        '• Simon-Pierre (Le Pionnier instinctif)',
        '• Paul de Tarse (Le Bâtisseur théologique)',
        '• Déborah (La Stratège inspirée)',
        '• Josué (Le Conquérant courageux)',
        '• Élie (Le Prophète de feu)',
        '• Néhémie (Le Réformateur engagé)'
      ],
      warning: 'Angle mort : Risque d\'avancer trop vite sans consulter ni vérifier.'
    },
    {
      title: 'PÔLE SAGESSE & VÉRITÉ (Analystes, sentinelles et chercheurs)',
      subtitle: 'Dynamique : Vocation au discernement critique, à la justesse doctrinale et au recul.',
      colorHeader: [200, 145, 50] as [number, number, number], // Ochre gold
      colorBg: [255, 253, 247] as [number, number, number],
      x: gridX + halfW + 4,
      y: gridY,
      archetypes: [
        '• Thomas (Le Chercheur de vérité lucide)',
        '• Nathan (Le Prophète de conscience)',
        '• Salomon (Le Sage observateur)',
        '• Nicodème (Le Penseur sincère)',
        '• Gamaliel (Le Modérateur avisé)',
        '• Daniel (Le Témoin intègre)'
      ],
      warning: 'Angle mort : Risque de sur-analyser, scepticisme et lenteur à l\'action.'
    },
    {
      title: 'PÔLE STRUCTURE & FIDÉLITÉ (Piliers, coordinateurs et gardiens)',
      subtitle: 'Dynamique : Vocation à sécuriser le cadre, fiabiliser la logistique et maintenir l\'ordre.',
      colorHeader: [45, 55, 72] as [number, number, number], // Deep slate
      colorBg: [249, 251, 254] as [number, number, number],
      x: gridX,
      y: gridY + halfH + 4,
      archetypes: [
        '• Matthieu (Le Gestionnaire méticuleux)',
        '• Joseph d\'Arimathie (Le Mécène discret)',
        '• Boaz (Le Protecteur fidèle)',
        '• Marthe de Béthanie (La Servante attentive)',
        '• Esther (La Sentinelle courageuse)',
        '• Esdras (L\'Enseignant rigoureux)'
      ],
      warning: 'Angle mort : Rigidité face à l\'imprévu, surcharge mentale du détail.'
    },
    {
      title: 'PÔLE SOIN & COMMUNION (Consolateurs, pasteurs et humbles serviteurs)',
      subtitle: 'Dynamique : Vocation à écouter, consoler, pacifier les tensions et veiller sur les faibles.',
      colorHeader: [85, 115, 90] as [number, number, number], // Sage green
      colorBg: [249, 253, 250] as [number, number, number],
      x: gridX + halfW + 4,
      y: gridY + halfH + 4,
      archetypes: [
        '• Barnabas (Le Fils de consolation)',
        '• Jean l\'Évangéliste (Le Disciple bien-aimé)',
        '• Ruth (La Compagne dévouée)',
        '• Marie de Béthanie (La Contemplative)',
        '• Timothée (Le Serviteur fidèle)',
        '• Dorcas (La Bienfaitrice généreuse)'
      ],
      warning: 'Angle mort : Peur de la confrontation, difficulté à dire non.'
    }
  ];

  const quadW = halfW - 2;
  const quadH = halfH - 2;

  quadrants.forEach((q) => {
    // Quadrant Card Background
    doc.setFillColor(q.colorBg[0], q.colorBg[1], q.colorBg[2]);
    doc.setDrawColor(220, 210, 195);
    doc.setLineWidth(0.4);
    doc.roundedRect(q.x, q.y, quadW, quadH, 3, 3, 'FD');

    // Quadrant Top Accent Header
    doc.setFillColor(q.colorHeader[0], q.colorHeader[1], q.colorHeader[2]);
    doc.roundedRect(q.x, q.y, quadW, 16, 3, 3, 'F');
    doc.rect(q.x, q.y + 8, quadW, 8, 'F'); // Square bottom corners of header

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(q.title, q.x + 8, q.y + 11);

    // Subtitle below header (11pt)
    doc.setTextColor(70, 65, 60);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.text(q.subtitle, q.x + 8, q.y + 23);

    // Archetype list left column
    doc.setTextColor(40, 38, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Figures de référence :', q.x + 8, q.y + 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(55, 50, 45);
    q.archetypes.forEach((arch, idx) => {
      doc.text(arch, q.x + 8, q.y + 40 + idx * 6.5);
    });

    // Warning / Angle mort
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(q.colorHeader[0], q.colorHeader[1], q.colorHeader[2]);
    const splitWarn = doc.splitTextToSize(q.warning, 76);
    doc.text(splitWarn, q.x + 8, q.y + 83);

    // Post-It / Member Placement Sticky Zone (Clean, open space without cluttering sub-boxes)
    const stickyX = q.x + 88;
    const stickyY = q.y + 26;
    const stickyW = quadW - 96;
    const stickyH = quadH - 32;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 190, 175);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([2.5, 2.5], 0);
    doc.roundedRect(stickyX, stickyY, stickyW, stickyH, 2.5, 2.5, 'FD');
    doc.setLineDashPattern([], 0); // Reset dash

    // Sticky Zone Prompt (Clean and prominent)
    doc.setTextColor(150, 140, 130);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('ESPACE POST-IT & PRÉNOMS DES MEMBRES', stickyX + stickyW / 2, stickyY + 14, { align: 'center' });
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10.5);
    doc.text('(Collez ici les post-its des prénoms ou écrivez librement au marqueur)', stickyX + stickyW / 2, stickyY + 22, { align: 'center' });
  });

  // ===============================================================
  // ENLARGED & UNIFYING CENTRAL DISC ("PASTILLE CENTRALE")
  // Visually unites the 4 poles into the One Body (1 Cor 12)
  // ===============================================================
  const cx = width / 2;
  const cy = gridY + halfH;
  const outerR = 25; // 50mm diameter

  // Outer convergence ring with the 4 quadrant pole colors
  // Top-left: Terracotta
  doc.setFillColor(194, 94, 66);
  doc.circle(cx, cy, outerR, 'F');

  // Top-right slice: Ochre gold
  doc.setFillColor(200, 145, 50);
  doc.rect(cx, cy - outerR, outerR, outerR, 'F');

  // Bottom-right slice: Sage green
  doc.setFillColor(85, 115, 90);
  doc.rect(cx, cy, outerR, outerR, 'F');

  // Bottom-left slice: Deep slate
  doc.setFillColor(45, 55, 72);
  doc.rect(cx - outerR, cy, outerR, outerR, 'F');

  // Re-clip by circular mask / central inner dark disc (radius 21mm)
  doc.setFillColor(36, 32, 29); // #24201D
  doc.circle(cx, cy, 21, 'F');

  // Double golden border
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, 21, 'S');
  doc.setDrawColor(160, 125, 85);
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, 19.5, 'S');

  // Central unifying typography (Legible & prominent)
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('1 CORINTHIENS 12', cx, cy - 6, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('UN SEUL', cx, cy);
  doc.text('CORPS', cx, cy + 6.5, { align: 'center' });

  doc.setTextColor(215, 205, 190);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Diversité des dons', cx, cy + 12.5, { align: 'center' });

  // Bottom footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 105, 100);
  doc.text('Matrice murale d\'animation • Disciple — Archétypes bibliques • Test gratuit sur smartphone, tablette & ordinateur : discipledejesus.netlify.app', width / 2, height - 12, { align: 'center' });

  return doc;
}
