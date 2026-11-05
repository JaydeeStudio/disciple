import jsPDF from 'jspdf';

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
 * Draws the official Disciple brand emblem with the golden border on dark background
 * matching the icone_sur_fonce.svg design.
 */
function drawBrandEmblem(doc: jsPDF, x: number, y: number, s: number = 14): void {
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
 * Generates the "Guide des binômes et des frictions fraternelles"
 * 4-page PDF with high-end cover matching the complete dossier design.
 * Typography: >= 10pt body text, official BrandEmblem, clean & crisp layout.
 */
export async function generateBinomesGuidePdf(): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = 210;
  const pageH = 297;

  // Preload the 3 preview images for the upsell section on page 4
  const [imgCouv, imgRadar, imgSynthese] = await Promise.all([
    loadImageAsDataUrl('/images/guide-preview/couverture.jpg'),
    loadImageAsDataUrl('/images/guide-preview/page-radar.jpg'),
    loadImageAsDataUrl('/images/guide-preview/page-synthese.jpg')
  ]);

  // ==========================================
  // PAGE 1 : COUVERTURE HAUT DE GAMME NOIR & OR
  // ==========================================
  doc.setFillColor(36, 32, 29); // #24201D
  doc.rect(0, 0, pageW, pageH, 'F');

  // Double golden decorative frame
  doc.setDrawColor(212, 163, 115); // Ochre gold
  doc.setLineWidth(0.8);
  doc.rect(14, 14, pageW - 28, pageH - 28);
  doc.setDrawColor(160, 125, 85);
  doc.setLineWidth(0.3);
  doc.rect(17, 17, pageW - 34, pageH - 34);

  // Official Brand Emblem centered on cover with gold border
  const coverEmblemSize = 28;
  drawBrandEmblem(doc, (pageW - coverEmblemSize) / 2, 54, coverEmblemSize);

  // Brand tag
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DISCIPLE • ARCHÉTYPES BIBLIQUES', pageW / 2, 94, { align: 'center' });

  // Main Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GUIDE DES BINÔMES', pageW / 2, 114, { align: 'center' });
  doc.text('& DES FRICTIONS FRATERNELLES', pageW / 2, 125, { align: 'center' });

  // Thin separator
  doc.setDrawColor(194, 94, 66);
  doc.setLineWidth(1.2);
  doc.line(pageW / 2 - 25, 134, pageW / 2 + 25, 134);

  // Subtitle
  doc.setTextColor(230, 220, 205);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  const subText = 'Comment transformer les incompréhensions de tempéraments en leviers d\'édification, de complémentarité et de paix durable.';
  const splitSub = doc.splitTextToSize(subText, 142);
  doc.text(splitSub, pageW / 2, 146, { align: 'center' });

  // Central quote box
  doc.setFillColor(48, 43, 39);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.4);
  doc.roundedRect(28, 185, 154, 40, 3, 3, 'FD');

  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  const quote = '« L\'œil ne peut pas dire à la main\u00A0: «\u00A0Je n\'ai pas besoin de toi\u00A0»\u00A0; ni la tête dire aux pieds\u00A0:\n«\u00A0Je n\'ai pas besoin de vous\u00A0». Bien plus, les membres du corps qui paraissent être les plus faibles sont nécessaires. »';
  const splitQuote = doc.splitTextToSize(quote, 140);
  doc.text(splitQuote, pageW / 2, 196, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('1 Corinthiens 12, 21-22', pageW / 2, 217, { align: 'center' });

  // Bottom footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(170, 160, 150);
  doc.text('Kit d\'accompagnement pour responsables, pasteurs et équipes de service', pageW / 2, 260, { align: 'center' });
  doc.text('discipledejesus.netlify.app', pageW / 2, 266, { align: 'center' });

  // ==========================================
  // PAGE 2 : INTRODUCTION PASTORALE & PSYCHOLOGIE BIBLIQUE
  // ==========================================
  doc.addPage();
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Page header with Brand Emblem
  doc.setFillColor(36, 32, 29);
  doc.rect(14, 12, 182, 18, 'F');
  drawBrandEmblem(doc, 18, 14.5, 13);
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DISCIPLE • FONDEMENTS THÉOLOGIQUES ET RELATIONNELS', 36, 23);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('PAGE 2 / 4', 190, 23, { align: 'right' });

  doc.setTextColor(36, 32, 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Pourquoi les contraires s\'attirent... puis s\'agacent ?', 14, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(55, 50, 45);

  const introP1 = 'Dans la Bible comme dans nos églises, nos conseils et nos équipes de service, Dieu n\'a jamais constitué un collège homogène. Jésus n\'a pas choisi douze clones de Pierre ou douze copies de Jean. Il a délibérément réuni des hommes aux tempéraments diamétralement opposés : un zélote exalté (Simon), un percepteur d\'impôts méthodique (Matthieu), un intuitif prompt à l\'action (Pierre), et un sceptique prudent exigeant des faits vérifiables (Thomas).';
  const splitP1 = doc.splitTextToSize(introP1, 182);
  doc.text(splitP1, 14, 49);

  const introP2 = 'Cette asymétrie voulue est le lieu même de la grâce : là où un tempérament voit un risque, l\'autre voit une opportunité. Mais cette fécondité a un prix : livrés à nos réflexes charnels, nous interprétons spontanément la différence de l\'autre comme une menace ou un défaut moral.';
  const splitP2 = doc.splitTextToSize(introP2, 182);
  doc.text(splitP2, 14, 71);

  // 3 Clarifications fondamentales
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(194, 94, 66);
  doc.text('Les 3 pièges classiques du jugement de tempérament', 14, 96);

  const traps = [
    {
      num: 'A',
      title: 'Confondre le besoin de vérification avec un manque de foi',
      desc: 'Quand un profil analytique (comme Thomas ou Nathan) pose des questions précises sur un budget ou un calendrier, il n\'attaque pas la vision : il exerce son don de prudence pour éviter au groupe de trébucher dans le ravin.'
    },
    {
      num: 'B',
      title: 'Confondre l\'élan d\'action avec de la brusquerie ou de l\'orgueil',
      desc: 'Quand un profil pionnier (comme Pierre ou Déborah) bouscule les lenteurs d\'une réunion, il ne cherche pas à écraser autrui : il ressent une urgence missionnaire qui refuse de laisser le projet s\'enliser dans l\'inertie.'
    },
    {
      num: 'C',
      title: 'Confondre la recherche d\'apaisement et d\'harmonie avec un manque de courage',
      desc: 'Quand un profil de consolation et d\'écoute (comme Barnabas ou Jean) temporise avant de trancher un conflit, il ne fuit pas : il protège les cœurs blessés et veille à ce que personne ne soit abandonné sur le bord du chemin.'
    }
  ];

  let ty = 103;
  traps.forEach((t) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 212, 200);
    doc.setLineWidth(0.3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitDesc = doc.splitTextToSize(t.desc, 158);
    const trapHeight = 14 + splitDesc.length * 4.6;

    doc.roundedRect(14, ty, 182, trapHeight, 2.5, 2.5, 'FD');

    doc.setFillColor(194, 94, 66);
    doc.circle(23, ty + 7.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(t.num, 23, ty + 8.7, { align: 'center' });

    doc.setTextColor(36, 32, 29);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(t.title, 31, ty + 8.5);

    doc.setTextColor(60, 55, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(splitDesc, 23, ty + 15);

    ty += trapHeight + 4;
  });

  // Framework box for leaders - clean wrapping without orphaned quote
  doc.setFillColor(242, 235, 224);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, ty + 4, 182, 48, 3, 3, 'FD');

  doc.setTextColor(194, 94, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('POSTURE PASTORALE DE L\'ANIMATEUR', 22, ty + 12);

  doc.setTextColor(50, 45, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const advice = 'Votre rôle n\'est pas d\'éliminer les tensions, mais de leur donner un sens. Une équipe sans tension est souvent une équipe où la sincérité a disparu. Dès qu\'une divergence éclate, ramenez l\'équipe à la question suivante :\n\n« Quelle facette du Royaume de Dieu ce frère ou cette sœur\nest-il en train de protéger à cet instant précis ? »\n\nCette seule question désamorce l\'ego et replace chaque membre dans la gratitude pour son vis-à-vis.';
  const splitAdv = doc.splitTextToSize(advice, 166);
  doc.text(splitAdv, 22, ty + 19);

  // Page 2 footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 125, 120);
  doc.text('Guide des binômes • Disciple — Archétypes bibliques • discipledejesus.netlify.app', 105, 290, { align: 'center' });

  // ==========================================
  // PAGE 3 : LES 6 BINÔMES CANONIQUES & LEURS TENSIONS
  // ==========================================
  doc.addPage();
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Page header with Brand Emblem
  doc.setFillColor(36, 32, 29);
  doc.rect(14, 12, 182, 18, 'F');
  drawBrandEmblem(doc, 18, 14.5, 13);
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DISCIPLE • CARTOGRAPHIE DES SYNERGIES & FRICTIONS', 36, 23);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('PAGE 3 / 4', 190, 23, { align: 'right' });

  doc.setTextColor(36, 32, 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15.5);
  doc.text('Les 6 binômes bibliques clés et leurs tensions fécondes', 14, 38);

  // Binomes titles replaced with "avec"
  const binomes = [
    {
      duo: '1. Pierre (Action & Impulsion) avec Thomas (Vérification & Sagesse)',
      friction: 'Pierre juge Thomas trop craintif et paralysant ; Thomas juge Pierre imprudent et naïf.',
      tresor: 'L\'audace de Pierre franchit les portes ; la rigueur de Thomas consolide les fondations.',
      regle: 'Pierre lance l\'idée sans exiger de consensus immédiat ; Thomas challenge la faisabilité sans dénigrer la vision.'
    },
    {
      duo: '2. Paul (Vision pionnière & Percée) avec Barnabas (Consolation & Réconciliation)',
      friction: 'Paul privilégie l\'efficacité de la mission ; Barnabas refuse d\'abandonner les personnes fragiles (ex: Marc).',
      tresor: 'Paul garantit l\'impact apostolique ; Barnabas garantit l\'intégrité de l\'amour fraternel.',
      regle: 'Toujours confier la stratégie à Paul et l\'accueil des nouveaux convertis à Barnabas.'
    },
    {
      duo: '3. Marthe (Logistique & Organisation) avec Marie de Béthanie (Écoute & Présence)',
      friction: 'Marthe ressent de l\'injustice face à la passivité de Marie ; Marie se sent jugée dans son intimité spirituelle.',
      tresor: 'Sans Marthe, la communauté ne peut subsister ; sans Marie, la communauté oublie son Sauveur.',
      regle: 'Ne jamais culpabiliser Marie sur le temps de service, et soulager concrètement Marthe sans attendre qu\'elle craque.'
    },
    {
      duo: '4. David (Louange & Intuition vive) avec Nathan (Lucidité morale & Discernement)',
      friction: 'L\'enthousiasme charismatique de David peut flirter avec l\'aveuglement ; Nathan apporte la contradiction.',
      tresor: 'Le charisme sans vérité engendre la dérive ; la vérité sans charisme engendre la sécheresse.',
      regle: 'Instituer un temps régulier où Nathan a l\'autorisation explicite de poser un miroir sans représailles.'
    },
    {
      duo: '5. Néhémie (Bâtisseur d\'ouvrages & Concret) avec Esdras (Gardien de la Loi & Prière)',
      friction: 'Néhémie s\'agace des discours théoriques ; Esdras s\'inquiète de voir le faire prendre le pas sur l\'être.',
      tresor: 'Les murailles de Néhémie protègent le temple ; la prière d\'Esdras justifie les murailles.',
      regle: 'Valider tout grand jalon matériel par un temps d\'écoute spirituelle partagé.'
    },
    {
      duo: '6. Timothée (Douceur & Sensibilité) avec Silas (Courage sous les coups & Endurance)',
      friction: 'Timothée est vite intimidé par l\'hostilité ; Silas peut mépriser la vulnérabilité émotionnelle.',
      tresor: 'Timothée apporte le baume pastoral ; Silas transmet la fermeté dans la tempête.',
      regle: 'Toujours associer un profil sensible à un profil ancré pour les missions à haute exposition.'
    }
  ];

  let by = 44;
  binomes.forEach((b) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(215, 205, 190);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, by, 182, 37, 2, 2, 'FD');

    // Duo title banner
    doc.setFillColor(45, 40, 35);
    doc.roundedRect(14, by, 182, 7.5, 2, 2, 'F');
    doc.rect(14, by + 3.5, 182, 4, 'F');
    doc.setTextColor(212, 163, 115);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(b.duo, 19, by + 5.2);

    // Friction
    doc.setTextColor(194, 94, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('• Friction :', 19, by + 12.8);
    doc.setTextColor(55, 50, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const splitF = doc.splitTextToSize(b.friction, 144);
    doc.text(splitF, 36, by + 12.8);

    // Trésor
    doc.setTextColor(85, 115, 90);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('• Trésor :', 19, by + 20);
    doc.setTextColor(55, 50, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const splitT = doc.splitTextToSize(b.tresor, 144);
    doc.text(splitT, 36, by + 20);

    // Règle d'or
    doc.setTextColor(200, 145, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('• Règle d\'or :', 19, by + 27.2);
    doc.setTextColor(35, 30, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const splitR = doc.splitTextToSize(b.regle, 142);
    doc.text(splitR, 38, by + 27.2);

    by += 40;
  });

  // Page 3 footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 125, 120);
  doc.text('Guide des binômes • Disciple — Archétypes bibliques • discipledejesus.netlify.app', 105, 290, { align: 'center' });

  // ==========================================
  // PAGE 4 : PROTOCOLE DE RÉSOLUTION & PRIÈRE D'UNITÉ + UPSELL 3 IMAGES
  // ==========================================
  doc.addPage();
  doc.setFillColor(250, 247, 242);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Page header with Brand Emblem
  doc.setFillColor(36, 32, 29);
  doc.rect(14, 12, 182, 18, 'F');
  drawBrandEmblem(doc, 18, 14.5, 13);
  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DISCIPLE • PROTOCOLE D\'APAISEMENT & PRIÈRE D\'ÉQUIPE', 36, 23);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('PAGE 4 / 4', 190, 23, { align: 'right' });

  doc.setTextColor(36, 32, 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Protocole en 4 étapes face à un blocage relationnel', 14, 38);

  const steps = [
    {
      num: '1',
      title: 'Dépersonnaliser immédiatement le désaccord',
      desc: 'Formulez le problème en termes de profil : « Ce n\'est pas toi contre moi, c\'est un profil d\'action qui échange avec un profil de prévoyance. Nous regardons la même montagne avec des lunettes différentes. »'
    },
    {
      num: '2',
      title: 'Nommer le besoin sous-jacent avant de débattre des solutions',
      desc: 'Invitez chaque personne à clarifier son besoin vital : l\'un a besoin de sécurité et de clarté chiffrée, l\'autre a besoin de liberté de mouvement et de rapidité d\'exécution. Les deux besoins sont légitimes.'
    },
    {
      num: '3',
      title: 'Séparer l\'intention profonde de la forme maladroite',
      desc: 'Sous stress, chacun amplifie son angle mort : l\'un devient tranchant, l\'autre se mure dans le silence. Reconnaître : « Je sais que ton intention est de bien faire, même si la manière m\'a heurté. »'
    },
    {
      num: '4',
      title: 'Répartir les missions selon les dons naturels plutôt que le hasard',
      desc: 'Arrêtez d\'attendre d\'un profil qu\'il excelle dans ce que Dieu ne lui a pas confié. Réarticulez les tâches de manière à ce que chacun opère depuis sa zone d\'épanouissement et de don.'
    }
  ];

  let sy = 43.5;
  steps.forEach((s) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(215, 205, 190);
    doc.setLineWidth(0.3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    const splitStep = doc.splitTextToSize(s.desc, 158);
    const stepBoxH = 10 + splitStep.length * 4.2;

    doc.roundedRect(14, sy, 182, stepBoxH, 2.5, 2.5, 'FD');

    doc.setFillColor(194, 94, 66);
    doc.circle(23, sy + 6.5, 3.2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(s.num, 23, sy + 7.6, { align: 'center' });

    doc.setTextColor(36, 32, 29);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.8);
    doc.text(s.title, 31, sy + 7.5);

    doc.setTextColor(60, 55, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    doc.text(splitStep, 23, sy + 13.5);

    sy += stepBoxH + 4.2;
  });

  // Prayer section (Compact, elegant, proportional to text)
  sy += 2;
  const prayerBoxH = 28;
  doc.setFillColor(36, 32, 29);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.6);
  doc.roundedRect(14, sy, 182, prayerBoxH, 3, 3, 'FD');

  doc.setTextColor(212, 163, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.text('PRIÈRE COMMUNE POUR L\'UNITÉ FRATERNELLE', pageW / 2, sy + 6.5, { align: 'center' });

  doc.setTextColor(245, 240, 235);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.8);

  const prayer = '« Seigneur Jésus, Tu as rassemblé Pierre, Jean, Matthieu et Thomas au sein d\'un même collège, non pour qu\'ils se jugent, mais pour qu\'ils témoignent ensemble de la plénitude de Ton amour. Bénis la diversité des tempéraments qui composent notre équipe. Délivre-nous du piège de la comparaison et donne-nous la sagesse de discerner Ton œuvre dans le style de notre frère et de notre sœur. Fais de nous des serviteurs fidèles et unis. Amen. »';
  const splitPrayer = doc.splitTextToSize(prayer, 168);
  doc.text(splitPrayer, pageW / 2, sy + 12.8, { align: 'center' });

  // ===============================================================
  // RICH UPSELL BLOCK WITH 3 VISUAL BOOK PREVIEW IMAGES
  // ===============================================================
  const upsellY = sy + prayerBoxH + 6;
  const upsellH = 78;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, upsellY, 182, upsellH, 3, 3, 'FD');

  // Upsell Header Tag
  doc.setFillColor(194, 94, 66);
  doc.roundedRect(20, upsellY + 4, 170, 6.5, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('POUR ALLER PLUS LOIN ENSEMBLE : DÉCOUVREZ LE DOSSIER COMPLET (36 PAGES)', 105, upsellY + 8.5, { align: 'center' });

  // Subtitle
  doc.setTextColor(60, 55, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  const upDesc = 'Chaque membre peut débloquer son dossier individuel complet de 36 pages (19 €) à l\'issue du test gratuit.';
  doc.text(upDesc, 105, upsellY + 14.5, { align: 'center' });

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
        // Fallback card
        doc.setFillColor(245, 240, 235);
        doc.rect(cx, imgY, imgW, imgH, 'F');
      }
    } else {
      doc.setFillColor(245, 240, 235);
      doc.rect(cx, imgY, imgW, imgH, 'F');
    }

    // Gold frame around image
    doc.setDrawColor(212, 163, 115);
    doc.setLineWidth(0.4);
    doc.rect(cx, imgY, imgW, imgH, 'S');

    // Caption below
    doc.setTextColor(194, 94, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(c.label, cx + imgW / 2, imgY + imgH + 3.5, { align: 'center' });

    doc.setTextColor(120, 115, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(c.sub, cx + imgW / 2, imgY + imgH + 6.8, { align: 'center' });
  });

  // CTA Link note below images
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(36, 34, 32);
  doc.text('Tarif : 19 € (accès immédiat PDF) • Test et commande sur discipledejesus.netlify.app', 105, upsellY + 76, { align: 'center' });

  // Page 4 footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 125, 120);
  doc.text('Guide des binômes • Disciple — Archétypes bibliques • discipledejesus.netlify.app', 105, 291, { align: 'center' });

  return doc;
}
