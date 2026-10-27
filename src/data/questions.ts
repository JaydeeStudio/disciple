export type Dimension = 'I_A' | 'S_E' | 'V_G' | 'L_F' | 'R_M';

export interface DimensionMeta {
  key: Dimension;
  label: string;
  negativePole: {
    label: string;
    description: string;
    biblicalArchetypes: string;
  };
  positivePole: {
    label: string;
    description: string;
    biblicalArchetypes: string;
  };
}

export const DIMENSIONS_INFO: Record<Dimension, DimensionMeta> = {
  I_A: {
    key: 'I_A',
    label: "Intériorité vs Action",
    negativePole: {
      label: "Intériorité & Contemplation",
      description: "Prière silencieuse, écoute du cœur de Dieu, recueillement, présence attentive et profondeur mystique.",
      biblicalArchetypes: "Jean, Marie de Béthanie, Anne, Daniel"
    },
    positivePole: {
      label: "Action & Service Concret",
      description: "Engagement pratique de terrain, réalisations tangibles, logistique et secours actif aux besoins réels.",
      biblicalArchetypes: "Marthe, Néhémie, Luc, Tabitha"
    }
  },
  S_E: {
    key: 'S_E',
    label: "Structure vs Spontanéité",
    negativePole: {
      label: "Structure & Doctrine",
      description: "Rigueur intellectuelle, vision à long terme, organisation méthodique et fidélité doctrinale.",
      biblicalArchetypes: "Paul, Thomas, Salomon, Joseph"
    },
    positivePole: {
      label: "Spontanéité & Cœur",
      description: "Louange expressive, sensibilité artistique, flexibilité relationnelle et intuition immédiate.",
      biblicalArchetypes: "David, Myriam, Pierre, Barnabas"
    }
  },
  V_G: {
    key: 'V_G',
    label: "Vérité / Justice vs Grâce / Compassion",
    negativePole: {
      label: "Vérité & Intégrité Morale",
      description: "Confrontation directe du mensonge, exigence éthique, zèle prophétique et refus du compromis.",
      biblicalArchetypes: "Élie, Jean-Baptiste, Déborah, Étienne"
    },
    positivePole: {
      label: "Grâce & Réconciliation",
      description: "Accueil inconditionnel, douceur, patience envers les personnes brisées et esprit de paix.",
      biblicalArchetypes: "Barnabas, Abigail, Ruth, Philippe"
    }
  },
  L_F: {
    key: 'L_F',
    label: "Fidélité dans l'Ombre vs Leadership Pionnier",
    negativePole: {
      label: "Fidélité & Accompagnement",
      description: "Loyauté constante, soutien dévoué d'un leader, humilité du second rôle et persévérance discrète.",
      biblicalArchetypes: "Timothée, Silas, André, Ruth"
    },
    positivePole: {
      label: "Leadership & Initiative",
      description: "Vision pionnière, audace d'entraînement, autorité spirituelle et courage d'ouvrir de nouvelles voies.",
      biblicalArchetypes: "Pierre, Moïse, Déborah, Josué"
    }
  },
  R_M: {
    key: 'R_M',
    label: "Raison / Pragmatisme vs Révélation / Mystère",
    negativePole: {
      label: "Raison & Bon Sens Éprouvé",
      description: "Pragmatisme, sens critique sain, recherche de faits vérifiables et enracinement dans le quotidien.",
      biblicalArchetypes: "Thomas, Jacques, Luc, Abigail"
    },
    positivePole: {
      label: "Révélation & Foi Mystique",
      description: "Sensibilité prophétique, confiance audacieuse dans le surnaturel et discernement spirituel.",
      biblicalArchetypes: "Abraham, David, Élie, Marie de Magdala"
    }
  }
};

export interface Option {
  text: string;
  weights: Partial<Record<Dimension, number>>;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Face à un nouveau projet dans votre communauté, quelle est votre première réaction ?",
    options: [
      { text: "Je demande tout de suite comment je peux aider concrètement.", weights: { I_A: 2, L_F: -1 } },
      { text: "Je prends du temps pour prier et ressentir si c'est la volonté de Dieu.", weights: { I_A: -2, R_M: 2 } },
      { text: "Je commence à réfléchir à la stratégie, au calendrier et à l'organisation.", weights: { S_E: -2, L_F: 1 } },
      { text: "J'encourage ceux qui ont eu l'idée et je leur propose mon soutien moral.", weights: { V_G: 2, L_F: -1 } }
    ]
  },
  {
    id: "q2",
    text: "Dans votre relation avec Dieu, qu'est-ce qui vous ressource le plus profondément ?",
    options: [
      { text: "Le silence, la contemplation et le sentiment intime de Sa présence.", weights: { I_A: -2, R_M: 2 } },
      { text: "L'étude approfondie des Écritures et la compréhension de la doctrine.", weights: { S_E: -2, R_M: -1 } },
      { text: "Servir activement les autres et voir Son amour en action concrète.", weights: { I_A: 2, L_F: -1 } },
      { text: "Exprimer mes émotions par le chant, la louange vivante ou la créativité.", weights: { S_E: 2, R_M: 2 } }
    ]
  },
  {
    id: "q3",
    text: "Si vous voyez une injustice flagrante dans votre entourage :",
    options: [
      { text: "Je dénonce fermement la situation, quitte à être confrontant pour la vérité.", weights: { V_G: -2, L_F: 2 } },
      { text: "J'essaie de comprendre toutes les parties pour restaurer la paix avec douceur.", weights: { V_G: 2, L_F: -1 } },
      { text: "Je cherche une solution pratique et efficace pour réparer immédiatement le mal.", weights: { I_A: 2, S_E: -1 } },
      { text: "Je pleure avec ceux qui souffrent et je prie pour eux en secret.", weights: { I_A: -2, V_G: 2 } }
    ]
  },
  {
    id: "q4",
    text: "Comment gérez-vous l'incertitude concernant votre avenir ?",
    options: [
      { text: "Je fais confiance à mon intuition et aux signes intérieurs que Dieu m'envoie.", weights: { S_E: 2, R_M: 2 } },
      { text: "Je planifie plusieurs scénarios rationnels et j'évalue les risques.", weights: { S_E: -2, R_M: -2 } },
      { text: "Je reste fidèle à mon poste actuel en attendant que Dieu ouvre clairement une porte.", weights: { L_F: -2, V_G: 1 } },
      { text: "Je prends les devants et je provoque les opportunités avec audace.", weights: { L_F: 2, I_A: 1 } }
    ]
  },
  {
    id: "q5",
    text: "Quel rôle préférez-vous occuper au sein d'une équipe ?",
    options: [
      { text: "Celui qui donne la vision, tranche et prend les décisions audacieuses.", weights: { L_F: 2 } },
      { text: "Celui qui veille à ce que chacun se sente aimé, valorisé et inclus.", weights: { V_G: 2, L_F: -1 } },
      { text: "Celui qui analyse les détails, structure les plans et garantit l'ordre.", weights: { S_E: -2, R_M: -1 } },
      { text: "Celui qui apporte de l'inspiration, de la louange et de la ferveur spontanée.", weights: { S_E: 2, R_M: 2 } }
    ]
  },
  {
    id: "q6",
    text: "Qu'est-ce qui vous fatigue ou vous épuise le plus spirituellement ?",
    options: [
      { text: "Le bruit constant et l'activisme effréné sans temps de retraite calme.", weights: { I_A: -2 } },
      { text: "Le manque d'action concrète et les discussions théoriques sans lendemain.", weights: { I_A: 2 } },
      { text: "La confusion doctrinale, le manque de rigueur et l'arbitraire.", weights: { S_E: -2, R_M: -1 } },
      { text: "Les querelles mesquines, le manque d'amour et la division.", weights: { V_G: 2 } }
    ]
  },
  {
    id: "q7",
    text: "Comment partagez-vous naturellement votre foi avec autrui ?",
    options: [
      { text: "Par des arguments logiques solides et des repères historiques clairs.", weights: { S_E: -2, R_M: -2 } },
      { text: "En rendant service avec amour et discrétion dans le quotidien.", weights: { I_A: 2, L_F: -1 } },
      { text: "En partageant mon témoignage personnel et la joie de mon cœur.", weights: { S_E: 2, R_M: 1 } },
      { text: "En invitant les gens à vivre une expérience de prière et de Présence.", weights: { I_A: -2, R_M: 2 } }
    ]
  },
  {
    id: "q8",
    text: "Face à une erreur ou un écart commis par un frère ou une sœur :",
    options: [
      { text: "Je le/la reprends avec franchise pour protéger la vérité et son salut.", weights: { V_G: -2 } },
      { text: "Je l'accueille avec infiniment de compassion pour qu'il/elle ne soit pas découragé(e).", weights: { V_G: 2 } },
      { text: "Je prie en secret pour que le Saint-Esprit accomplisse Son œuvre dans son cœur.", weights: { I_A: -2, L_F: -1 } },
      { text: "Je l'aide immédiatement à réparer les conséquences concrètes de son erreur.", weights: { I_A: 2 } }
    ]
  },
  {
    id: "q9",
    text: "Quelle image de Dieu résonne le plus profondément en vous ?",
    options: [
      { text: "Le Bon Berger tendre qui porte Sa brebis blessée sur Ses épaules.", weights: { V_G: 2 } },
      { text: "Le Roi Souverain et Juste qui établit la droiture et le jugement.", weights: { V_G: -2, L_F: 1 } },
      { text: "Le Maître sage et prévoyant qui structure toute la création avec ordre.", weights: { S_E: -2, R_M: -1 } },
      { text: "Le Feu d'Amour dévorant qui consume et enflamme le cœur d'adoration.", weights: { S_E: 2, R_M: 2 } }
    ]
  },
  {
    id: "q10",
    text: "Dans vos lectures bibliques personnelles, vous êtes attiré(e) par :",
    options: [
      { text: "L'Évangile de Jean et les écrits contemplatifs sur l'intimité divine.", weights: { I_A: -2, R_M: 2 } },
      { text: "Les Épîtres de Paul pour la profondeur théologique et l'architecture de la foi.", weights: { S_E: -2, R_M: -1 } },
      { text: "Les Psaumes de David pour la vérité des émotions et le cri d'adoration.", weights: { S_E: 2, R_M: 2 } },
      { text: "Les récits des Actes et de Néhémie pour le souffle de la mission et des chantiers.", weights: { I_A: 2, L_F: 2 } }
    ]
  },
  {
    id: "q11",
    text: "Face à un changement imprévu ou une rupture de routine :",
    options: [
      { text: "Je l'embrasse avec enthousiasme comme une nouvelle aventure de l'Esprit.", weights: { S_E: 2, L_F: 1 } },
      { text: "Je prends le temps d'analyser les implications et de réorganiser les plans.", weights: { S_E: -2, R_M: -1 } },
      { text: "Je m'adapte patiemment pour veiller au bien-être de mes compagnons.", weights: { L_F: -2, V_G: 1 } },
      { text: "Je me retire pour discerner ce que Dieu dit au travers de cette saison.", weights: { I_A: -2, R_M: 2 } }
    ]
  },
  {
    id: "q12",
    text: "Quel est votre plus grand désir dans votre marche chrétienne ?",
    options: [
      { text: "Être utile, bâtir des œuvres solides et voir du fruit durable.", weights: { I_A: 2, L_F: 1 } },
      { text: "Connaître le Seigneur intimement et demeurer en Sa présence sacrée.", weights: { I_A: -2, R_M: 1 } },
      { text: "Bâtir des relations fraternelles sincères où règne la grâce et la paix.", weights: { V_G: 2, L_F: -1 } },
      { text: "Défendre l'intégrité de la vérité biblique sans faiblir.", weights: { V_G: -2, S_E: -1 } }
    ]
  },
  {
    id: "q13",
    text: "En période de crise collective, quelle ressource apportez-vous ?",
    options: [
      { text: "Mon sang-froid, ma méthode et ma capacité d'organisation lucide.", weights: { S_E: -2, R_M: -2 } },
      { text: "Mon endurance fidèle et ma présence réconfortante auprès des fragiles.", weights: { L_F: -2, V_G: 2 } },
      { text: "Mon autorité naturelle pour mobiliser les troupes et sonner la charge.", weights: { L_F: 2, I_A: 1 } },
      { text: "Ma vision prophétique rappelant les promesses de Dieu dans l'obscurité.", weights: { R_M: 2, I_A: -1 } }
    ]
  },
  {
    id: "q14",
    text: "Comment témoignez-vous le plus naturellement votre amour à un proche ?",
    options: [
      { text: "Par des paroles bienveillantes, des lettres et des encouragements chaleureux.", weights: { V_G: 2 } },
      { text: "Par une écoute silencieuse, du temps de qualité et une présence attentive.", weights: { I_A: -2 } },
      { text: "Par des coups de main concrets, de la cuisine, du bricolage ou un secours matériel.", weights: { I_A: 2 } },
      { text: "Par un cadeau spontané, une célébration festive ou un chant.", weights: { S_E: 2 } }
    ]
  },
  {
    id: "q15",
    text: "Quel type de prière ressemble le plus à votre battement de cœur ?",
    options: [
      { text: "Une prière méthodique, ordonnée avec une liste de requêtes ciblées.", weights: { S_E: -2 } },
      { text: "Le silence contemplatif : le simple regard d'amour posé sur le Christ.", weights: { I_A: -2, R_M: 2 } },
      { text: "Le cri du cœur spontané, les larmes, les soupirs et l'adoration vibrante.", weights: { S_E: 2, R_M: 2 } },
      { text: "Le combat spirituel, la prise d'autorité et la prière de foi audacieuse.", weights: { L_F: 2, I_A: 1 } }
    ]
  },
  {
    id: "q16",
    text: "Quand vous êtes seul(e) avec Dieu dans le secret, vous Lui parlez surtout :",
    options: [
      { text: "De vos projets concrets, de vos tâches et de votre soif d'efficacité sainte.", weights: { I_A: 2 } },
      { text: "De vos questions existentielles, de vos doutes et de vos quêtes de sens.", weights: { S_E: 1, R_M: 1 } },
      { text: "De Son adoration, de Sa majesté et de Sa beauté transcendante.", weights: { I_A: -2, R_M: 2 } },
      { text: "De la mission, de la conquête spirituelle et des personnes à conduire à Dieu.", weights: { L_F: 2 } }
    ]
  },
  {
    id: "q17",
    text: "Quel est votre rapport aux traditions et liturgies éprouvées ?",
    options: [
      { text: "J'y trouve une sécurité doctrinale, de la solennité et des racines profondes.", weights: { S_E: -2, R_M: -1 } },
      { text: "Je préfère la liberté de l'Esprit, la fraîcheur et la spontanéité créative.", weights: { S_E: 2, R_M: 2 } },
      { text: "La tradition est bonne si elle engendre des actes concrets de charité.", weights: { I_A: 2 } },
      { text: "Elle m'aide à m'effacer humblement pour m'unir au Corps universel de Christ.", weights: { L_F: -2 } }
    ]
  },
  {
    id: "q18",
    text: "Après avoir traversé un échec ou une défaite personnelle :",
    options: [
      { text: "Je me relève rapidement, je me repens devant Dieu et je repars de l'avant.", weights: { L_F: 2, S_E: 1 } },
      { text: "Je me retire dans le silence pour méditer et comprendre le sens spirituel.", weights: { I_A: -2 } },
      { text: "Je cherche à réparer la relation avec les personnes que j'ai pu affecter.", weights: { V_G: 2 } },
      { text: "J'analyse méthodiquement les causes rationnelles pour corriger la stratégie.", weights: { S_E: -2, R_M: -1 } }
    ]
  },
  {
    id: "q19",
    text: "Quel héritage spirituel rêvez-vous de laisser derrière vous ?",
    options: [
      { text: "Des œuvres tangibles, des institutions durables et des besoins comblés.", weights: { I_A: 2 } },
      { text: "Une odeur de sainteté, une vie de prière cachée et d'intimité avec Dieu.", weights: { I_A: -2, R_M: 1 } },
      { text: "Des cœurs réconciliés, consolés et guéris par l'amour inconditionnel.", weights: { V_G: 2, L_F: -1 } },
      { text: "Une transmission rigoureuse et intransigeante de la sainte doctrine.", weights: { V_G: -2, S_E: -2 } }
    ]
  },
  {
    id: "q20",
    text: "Quelle est votre vigilance intérieure principale (zone de faiblesse) ?",
    options: [
      { text: "L'orgueil de l'action, l'autosuffisance et la tentation de dominer.", weights: { L_F: 2 } },
      { text: "Le repli mystique sur soi et la fuite des réalités rugueuses du monde.", weights: { I_A: -2 } },
      { text: "L'agitation excessive et le besoin de tout contrôler par mes forces.", weights: { I_A: 2, S_E: -1 } },
      { text: "Le compromis mou ou la lâcheté par peur du conflit et soif d'approbation.", weights: { V_G: 2, L_F: -1 } }
    ]
  }
];
