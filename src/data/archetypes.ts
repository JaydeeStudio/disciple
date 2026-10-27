export type SpiritualDimension = 
  | 'contemplative' 
  | 'leadership' 
  | 'service' 
  | 'strategy' 
  | 'encouragement' 
  | 'worship' 
  | 'truth' 
  | 'loyalty';

export interface ArchetypeCoordinates {
  I_A: number; // Intériorité (-) vs Action (+) [-10 à +10]
  S_E: number; // Structure (-) vs Spontanéité (+) [-10 à +10]
  V_G: number; // Vérité (-) vs Grâce (+) [-10 à +10]
  L_F: number; // Fidélité/Ombre (-) vs Leadership/Initiative (+) [-10 à +10]
  R_M: number; // Raison/Pragmatisme (-) vs Révélation/Mystère (+) [-10 à +10]
}

export interface Archetype {
  key: string;
  name: string;
  title: string;
  testament: 'AT' | 'NT';
  description: string;
  strengths: string[];
  weaknesses: string[];
  spiritualInvitations: string[];
  missionVocation: string[];
  compatibility: string[];
  biblicalVerse: string;
  gender: 'M' | 'F' | 'BOTH';
  dimension: SpiritualDimension;
  coordinates: ArchetypeCoordinates;
}

export const ARCHETYPES: Record<string, Archetype> = {
  // === NOUVEAU TESTAMENT ===
  jean: {
    key: "jean",
    name: "Jean",
    gender: 'M',
    testament: 'NT',
    dimension: 'contemplative',
    title: "Le disciple bien-aimé",
    description: "Un disciple de profondeur, d'intimité et de perception spirituelle. Jean ne se contente pas de suivre Jésus ; il repose contre Sa poitrine et demeure en Lui avec une fidélité silencieuse.",
    strengths: [
      "Capacité d'intimité spirituelle et d'écoute du cœur de Dieu",
      "Perception aiguë des mystères et des vérités spirituelles",
      "Fidélité inébranlable dans l'épreuve (au pied de la croix)",
      "Sensibilité prophétique et transmission poétique de la Parole"
    ],
    weaknesses: [
      "Tendance à l'isolement ou au détachement du quotidien matériel",
      "Difficulté à gérer les contingences administratives et logistiques",
      "Passivité apparente face aux urgences du terrain",
      "Élitisme spirituel inconscient par soif d'absolu"
    ],
    spiritualInvitations: [
      "Incarner la contemplation dans les œuvres concrètes du quotidien",
      "Partager ses perceptions avec simplicité sans mystifier les autres",
      "Accepter la confrontation nécessaire lorsque la vérité le requiert"
    ],
    missionVocation: [
      "Accompagnement spirituel et direction d'âmes",
      "Écriture méditative, théologie contemplative et enseignement",
      "Intercession prophétique et discernement pour la communauté"
    ],
    compatibility: ["pierre", "marie", "barnabas"],
    biblicalVerse: "Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit. (Jean 15:5)",
    coordinates: { I_A: -8, S_E: 3, V_G: 5, L_F: -2, R_M: 8 }
  },

  pierre: {
    key: "pierre",
    name: "Pierre",
    gender: 'M',
    testament: 'NT',
    dimension: 'leadership',
    title: "Le pionnier passionné",
    description: "Un leader né, spontané, courageux et prêt à sortir de la barque. Pierre apprend en marchant et en trébuchant. Sa foi brûlante entraîne les foules.",
    strengths: [
      "Leadership audacieux et capacité d'initiative instantanée",
      "Résilience spirituelle remarquable et promptitude à la repentance",
      "Loyauté fervente et amour sans retenue pour Jésus",
      "Force d'entraînement qui donne envie aux autres de se dépasser"
    ],
    weaknesses: [
      "Impulsivité menant parfois à des paroles ou des actes précipités",
      "Besoin de validation externe et peur du regard d'autrui",
      "Impatience face au temps de maturation et au silence",
      "Difficulté avec la nuance et la tempérance"
    ],
    spiritualInvitations: [
      "Ancrer son identité dans la grâce reçue plutôt que dans ses exploits",
      "Apprendre à écouter et prier avant de passer à l'action",
      "Faire de sa vulnérabilité une source de pasteur bienveillant"
    ],
    missionVocation: [
      "Implantation de projets neufs et fondation de communautés",
      "Prédication publique et évangélisation de terrain",
      "Mobilisation des équipes et direction d'initiatives missionnaires"
    ],
    compatibility: ["jean", "barnabas", "deborah"],
    biblicalVerse: "Pais mes brebis. (Jean 21:17)",
    coordinates: { I_A: 7, S_E: 7, V_G: -2, L_F: 9, R_M: 5 }
  },

  marthe: {
    key: "marthe",
    name: "Marthe",
    gender: 'F',
    testament: 'NT',
    dimension: 'service',
    title: "La servante résiliente",
    description: "Pragmatique, attentive et remarquablement hospitalière. Marthe sait repérer les besoins réels avant tout le monde et y répondre avec excellence et dévouement.",
    strengths: [
      "Efficacité organisationnelle et sens aigu des priorités matérielles",
      "Hospitalité généreuse, chaleureuse et structurée",
      "Fiabilité sans faille face aux urgences du service",
      "Confession de foi directe et lucide dans l'épreuve"
    ],
    weaknesses: [
      "Surcharge mentale et agitation intérieure face au désordre",
      "Tendance à l'amertume envers ceux qui ne s'activent pas autant",
      "Difficulté à poser les mains et à savourer le repos intérieur",
      "Désir de contrôler le déroulement des événements"
    ],
    spiritualInvitations: [
      "Choisir la 'meilleure part' : privilégier la Présence avant la performance",
      "Déléguer et accueillir les imperfections des autres avec indulgence",
      "Voir le Christ dans les personnes servies plus que dans la tâche"
    ],
    missionVocation: [
      "Coordination logistique, administration et gestion de projets",
      "Ministère d'hospitalité, accueil des pèlerins et diaconat",
      "Soutien pratique aux personnes vulnérables et événements communautaires"
    ],
    compatibility: ["marie", "barnabas", "luc"],
    biblicalVerse: "Marthe, Marthe, tu t'inquiètes et tu t'agites pour beaucoup de choses ; une seule chose est nécessaire. (Luc 10:41-42)",
    coordinates: { I_A: 9, S_E: -7, V_G: 3, L_F: -5, R_M: -7 }
  },

  marie: {
    key: "marie",
    name: "Marie de Béthanie",
    gender: 'F',
    testament: 'NT',
    dimension: 'contemplative',
    title: "La contemplative du cœur",
    description: "Assise aux pieds de Jésus, elle capte le timing du Saint-Esprit avec une intuition pure. Elle verse son parfum de grand prix sans compter la dépense.",
    strengths: [
      "Sensibilité rare au timing divin et à la présence de Dieu",
      "Générosité d'adoration extravagante et sans calcul",
      "Capacité à s'affranchir du regard des hommes pour honorer le Roi",
      "Paix intérieure et discernement des priorités éternelles"
    ],
    weaknesses: [
      "Apparence de désintérêt ou de nonchalance pour le travail pratique",
      "Sensibilité émotionnelle aiguë pouvant être blessée par le cynisme",
      "Réticence à entrer dans les processus d'organisation formels",
      "Difficulté à expliciter rationnellement ses intuitions spirituelles"
    ],
    spiritualInvitations: [
      "Traduire l'adoration en gestes concrets d'amour envers autrui",
      "Trouver un équilibre d'alliance avec les esprits pragmatiques",
      "Enseigner aux autres la valeur de l'écoute intérieure"
    ],
    missionVocation: [
      "Conduite de l'adoration et louange prophétique",
      "Veille de prière et présence pastorale silencieuse",
      "Création artistique et offrande sacrificielle pour l'Église"
    ],
    compatibility: ["marthe", "jean", "david"],
    biblicalVerse: "Marie a choisi la bonne part, qui ne lui sera point ôtée. (Luc 10:42)",
    coordinates: { I_A: -9, S_E: 6, V_G: 6, L_F: -4, R_M: 7 }
  },

  paul: {
    key: "paul",
    name: "Paul",
    gender: 'M',
    testament: 'NT',
    dimension: 'strategy',
    title: "Le stratège du Royaume",
    description: "Théologien rigoureux, missionnaire intrépide et architecte apostolique. Paul allie la puissance de l'intellect à la ferveur mystique pour bâtir l'Église sur le roc de la doctrine.",
    strengths: [
      "Clarté doctrinale imparable et vision d'ensemble à long terme",
      "Résilience héroïque au cœur des persécutions et des naufrages",
      "Capacité à structurer des communautés et former une nouvelle génération",
      "Intégrité spirituelle intransigeante face aux faux enseignements"
    ],
    weaknesses: [
      "Rigueur pouvant frôler la dureté envers les hésitants",
      "Rythme de travail et exigence épuisants pour ses proches",
      "Risque d'intellectualisation ou de débats théologiques acharnés",
      "Patience limitée avec les défections émotionnelles"
    ],
    spiritualInvitations: [
      "Expérimenter continuellement que la grâce divine s'accomplit dans la faiblesse",
      "Donner une seconde chance aux frères défaillants (comme Marc)",
      "Adoucir la rigueur de la vérité par la tendresse d'une mère"
    ],
    missionVocation: [
      "Enseignement théologique, apologétique et formation des cadres",
      "Stratégie de mission transculturelle et implantation d'églises",
      "Mentorat pastoral et rédaction d'écrits fondateurs"
    ],
    compatibility: ["barnabas", "timothee", "lydie"],
    biblicalVerse: "Ma grâce te suffit, car ma puissance s'accomplit dans la faiblesse. (2 Corinthiens 12:9)",
    coordinates: { I_A: 6, S_E: -9, V_G: -7, L_F: 8, R_M: 4 }
  },

  barnabas: {
    key: "barnabas",
    name: "Barnabas",
    gender: 'M',
    testament: 'NT',
    dimension: 'encouragement',
    title: "Le fils de l'encouragement",
    description: "Généreux, pont relationnel et médiateur de paix. Barnabas repère l'or caché dans les personnes rejetées et sait s'effacer pour les faire briller.",
    strengths: [
      "Don exceptionnel d'encouragement, d'élévation d'autrui et de consolation",
      "Confiance patiente dans le potentiel de renouveau de chaque croyant",
      "Générosité matérielle désintéressée et sens du partage",
      "Capacité à créer des ponts fraternels entre milieux opposés"
    ],
    weaknesses: [
      "Difficulté à prononcer un 'non' ferme ou à trancher un conflit sévère",
      "Vulnérabilité face aux personnes manipulatrices",
      "Peur de blesser qui peut freiner la dénonciation d'une erreur grave",
      "Tendance à sacrifier sa propre santé pour secourir les autres"
    ],
    spiritualInvitations: [
      "Apprendre à manier la vérité qui libère en même temps que la grâce",
      "Poser des limites saines pour préserver ses propres réserves",
      "Faire confiance au Seigneur pour la maturation parfois rude d'autrui"
    ],
    missionVocation: [
      "Ministère de réconciliation, médiation et conseil pastoral",
      "Accueil et intégration des nouveaux croyants et marginaux",
      "Détection et parrainage de nouveaux talents dans le Royaume"
    ],
    compatibility: ["paul", "pierre", "marthe"],
    biblicalVerse: "Il était un homme de bien, plein d'Esprit Saint et de foi. (Actes 11:24)",
    coordinates: { I_A: 4, S_E: 4, V_G: 9, L_F: -3, R_M: 3 }
  },

  thomas: {
    key: "thomas",
    name: "Thomas",
    gender: 'M',
    testament: 'NT',
    dimension: 'truth',
    title: "Le chercheur de vérité",
    description: "Lucide, honnête et assoiffé d'authenticité. Thomas refuse la foi superficielle ou les réponses toutes faites ; lorsqu'il rencontre le Ressuscité, sa foi devient indéracinable.",
    strengths: [
      "Honnêteté intellectuelle remarquable sans faux-semblants",
      "Courage de poser les questions difficiles et de sonder le réel",
      "Fidélité jusqu'au martyre une fois ses convictions acquises",
      "Immunité contre les manipulations émotionnelles et le fanatisme"
    ],
    weaknesses: [
      "Pessimisme instinctif et tendance au scepticisme protecteur",
      "Difficulté à accueillir la foi intuitive ou les prophéties spontanées",
      "Repli dans le doute solitaire au lieu de chercher la communauté",
      "Exigence de preuves matérielles avant de faire confiance"
    ],
    spiritualInvitations: [
      "Expérimenter la béatitude de ceux 'qui ont cru sans avoir vu'",
      "Découvrir que le mystère divin dépasse la logique humaine",
      "Ouvrir son cœur à la communion fraternelle dans les moments d'obscurité"
    ],
    missionVocation: [
      "Apologétique, réfutation des doctrines erronées et défense de la foi",
      "Enseignement des fondements historiques et bibliques",
      "Accompagnement des personnes en crise de foi ou issues de milieux rationalistes"
    ],
    compatibility: ["pierre", "jean", "luc"],
    biblicalVerse: "Mon Seigneur et mon Dieu ! (Jean 20:28)",
    coordinates: { I_A: -4, S_E: -8, V_G: -6, L_F: -3, R_M: -9 }
  },

  timothee: {
    key: "timothee",
    name: "Timothée",
    gender: 'M',
    testament: 'NT',
    dimension: 'loyalty',
    title: "Le témoin fidèle",
    description: "Jeune leader sensible, humble et entièrement dévoué. Timothée garde le dépôt de la saine doctrine avec une fidélité filiale et un esprit de service doux.",
    strengths: [
      "Loyauté sans tache envers les aînés et le mandat reçu",
      "Authenticité, douceur et profondeur relationnelle",
      "Capacité à veiller sur une église avec patience et bienveillance",
      "Soumission joyeuse à l'apprentissage et au mentorat"
    ],
    weaknesses: [
      "Timidité excessive ou sentiment d'illégitimité face aux contradicteurs",
      "Tendance à somatiser le stress ou l'anxiété du combat spirituel",
      "Difficulté à exercer une autorité ferme quand la situation dégénère",
      "Peur de décevoir les figures d'autorité"
    ],
    spiritualInvitations: [
      "Raviver le don de force, d'amour et de sagesse reçu par l'Esprit",
      "Ne pas laisser sa jeunesse ou son tempérament discret freiner l'audace",
      "S'affirmer avec la force tranquille du Christ en temps de crise"
    ],
    missionVocation: [
      "Pastorale de proximité, suivi des familles et des disciples",
      "Transmission de la saine doctrine aux jeunes générations",
      "Garant de la continuité spirituelle et relais fidèle des pères spirituels"
    ],
    compatibility: ["paul", "barnabas", "ruth"],
    biblicalVerse: "Que personne ne méprise ta jeunesse ; mais sois un modèle pour les fidèles, en parole, en conduite, en amour, en foi, en pureté. (1 Timothée 4:12)",
    coordinates: { I_A: -2, S_E: -4, V_G: 7, L_F: -8, R_M: 2 }
  },

  lydie: {
    key: "lydie",
    name: "Lydie",
    gender: 'F',
    testament: 'NT',
    dimension: 'service',
    title: "La femme d'affaires hospitalière",
    description: "Marchande de pourpre, pieuse et audacieuse. Dès que son cœur s'ouvre à la Parole, elle met immédiatement son foyer, son réseau et ses ressources financières au service de l'avancement de l'Évangile.",
    strengths: [
      "Esprit d'entreprise et aisance financière mis au service de la foi",
      "Hospitalité stratégique ouvrant des portes pionnières pour la mission",
      "Capacité décisionnelle rapide et force de persuasion bienveillante",
      "Rayonnement respecté dans le monde civil et commercial"
    ],
    weaknesses: [
      "Risque d'activisme d'affaires empiétant sur la vie intérieure",
      "Tendance à vouloir tout solutionner par les moyens matériels",
      "Difficulté à laisser paraître sa fragilité personnelle",
      "Exigence élevée envers le professionnalisme des bénévoles"
    ],
    spiritualInvitations: [
      "Pratiquer le repos sabbatique comme offrande de confiance à Dieu",
      "Recevoir le ministère des autres sans devoir toujours pourvoir",
      "Unir l'efficacité marchande à l'onction de l'Esprit"
    ],
    missionVocation: [
      "Mécénat chrétien, intendance des ressources et levée de fonds",
      "Implantation de groupes de maison et carrefours d'accueil pour la mission",
      "Témoignage dans le monde professionnel, économique et entrepreneurial"
    ],
    compatibility: ["paul", "marthe", "priscille"],
    biblicalVerse: "Le Seigneur lui ouvrit le cœur, pour qu'elle fût attentive à ce que disait Paul... Elle nous invita en disant : 'Si vous me jugez fidèle au Seigneur, entrez dans ma maison'. (Actes 16:14-15)",
    coordinates: { I_A: 6, S_E: -7, V_G: 5, L_F: 5, R_M: -5 }
  },

  luc: {
    key: "luc",
    name: "Luc",
    gender: 'M',
    testament: 'NT',
    dimension: 'service',
    title: "Le médecin et chroniqueur de grâce",
    description: "Cultivé, observateur attentif et plein de compassion pour les démunis. Luc met sa rigueur d'enquêteur et son cœur de médecin au service d'un récit vibrant de l'Évangile.",
    strengths: [
      "Rigueur méthodologique, précision historique et écoute minutieuse",
      "Sensibilité profonde envers les exclus, les femmes, les pauvres et les malades",
      "Fidélité d'ami inconditionnel (le seul resté avec Paul en prison)",
      "Capacité à rendre la doctrine accessible et humaine à travers des histoires"
    ],
    weaknesses: [
      "Tendance à rester en retrait dans la posture d'observateur",
      "Pudeur excessive limitant l'expression de ses combats intérieurs",
      "Perfectionnisme dans la recherche pouvant retarder l'action",
      "Douleur empathique qui peut l'épuiser face à la souffrance humaine"
    ],
    spiritualInvitations: [
      "Prendre la parole en première ligne sans se cacher derrière les autres",
      "Déposer la souffrance des malades dans la prière de guérison",
      "Se reposer dans la grâce sans s'imposer une rigueur épuisante"
    ],
    missionVocation: [
      "Diaconat médical, soin des personnes âgées et blessées de la vie",
      "Documentation, biographie spirituelle et communication d'Église",
      "Ministère de compassion pour les marginaux de la société"
    ],
    compatibility: ["paul", "thomas", "marthe"],
    biblicalVerse: "Luc seul est avec moi. (2 Timothée 4:11)",
    coordinates: { I_A: 5, S_E: -9, V_G: 8, L_F: -6, R_M: -7 }
  },

  etienne: {
    key: "etienne",
    name: "Étienne",
    gender: 'M',
    testament: 'NT',
    dimension: 'truth',
    title: "Le témoin d'audace et de grâce",
    description: "Plein de grâce et de puissance spirituelle, premier martyr de l'Église. Étienne sert les veuves aux tables avec joie tout en proclamant la vérité devant le Sanhédrin avec un visage d'ange.",
    strengths: [
      "Intrépidité face à l'intimidation et fidélité jusqu'au don suprême de sa vie",
      "Maîtrise inspirée de toute l'histoire du salut et parole prophétique percutante",
      "Esprit de pardon semblable au Christ ('Ne leur impute pas ce péché')",
      "Harmonie parfaite entre service social humble et puissance spirituelle"
    ],
    weaknesses: [
      "Confrontation radicale qui ne laisse aucune place au compromis diplomatique",
      "Exposition volontaire au danger sans calcul de repli stratégique",
      "Intensité intérieure qui peut déconcerter les esprits plus prudents",
      "Patience limitée avec les hypocrisies institutionnelles"
    ],
    spiritualInvitations: [
      "Discerner le moment de la confrontation et celui de la semence patiente",
      "Garder la paix face à l'incompréhension de ses propres frères",
      "Laisser le Seigneur semer les fruits invisibles de ses sacrifices"
    ],
    missionVocation: [
      "Prédication réformatrice et confrontation des compromissions religieuses",
      "Diaconat actif et justice sociale en milieu hostile",
      "Témoignage prophétique et ministère de puissance"
    ],
    compatibility: ["paul", "pierre", "jean_baptiste"],
    biblicalVerse: "Voici, je vois les cieux ouverts, et le Fils de l'homme debout à la droite de Dieu. (Actes 7:56)",
    coordinates: { I_A: 6, S_E: 7, V_G: -5, L_F: 6, R_M: 9 }
  },

  silas: {
    key: "silas",
    name: "Silas",
    gender: 'M',
    testament: 'NT',
    dimension: 'loyalty',
    title: "Le compagnon d'armes et chantre de la nuit",
    description: "Prophète, citoyen respecté et coéquipier solide comme le roc. Enchaîné dans la prison de Philippes aux côtés de Paul, Silas chante des cantiques à minuit jusqu'à ce que la terre tremble.",
    strengths: [
      "Loyauté indéfectible dans les pires épreuves et persécutions",
      "Louange triomphante au milieu des ténèbres et des fers",
      "Dons prophétiques reconnus pour affermir et consoler les églises",
      "Compagnon idéal sachant faire briller le leader principal sans jalousie"
    ],
    weaknesses: [
      "Tendance à se contenter du second rôle même quand Dieu l'appelle à guider",
      "Endurance sacrificielle pouvant mener à l'épuisement silencieux",
      "Résistance à se plaindre même lorsque ses besoins légitimes sont bafoués",
      "Difficulté à faire valoir ses propres idées en désaccord"
    ],
    spiritualInvitations: [
      "Assumer pleinement son autorité prophétique sans dépendre d'un mentor",
      "Exprimer ses fatigues et réclamer le soutien de la communauté",
      "Prendre des initiatives pionnières en nom propre"
    ],
    missionVocation: [
      "Ministère de louange dans l'épreuve et combat spirituel par le chant",
      "Accompagnement de leaders pionniers en zones difficiles",
      "Affermissement et visites des communautés en crise"
    ],
    compatibility: ["paul", "timothee", "pierre"],
    biblicalVerse: "Vers le milieu de la nuit, Paul et Silas priaient et chantaient les louanges de Dieu, et les prisonniers les entendaient. (Actes 16:25)",
    coordinates: { I_A: 5, S_E: 6, V_G: 6, L_F: -8, R_M: 5 }
  },

  jacques: {
    key: "jacques",
    name: "Jacques",
    gender: 'M',
    testament: 'NT',
    dimension: 'service',
    title: "Le pragmatique de la foi en action",
    description: "Pilier de l'Église de Jérusalem, sobre et ancré dans la réalité. Jacques rappelle sans détour qu'une foi sans œuvres concrètes de justice est morte.",
    strengths: [
      "Pragmatisme saint : concrétisation de la foi en actes éthiques mesurables",
      "Défense ferme de la justice sociale contre les privilèges des riches",
      "Sagesse d'arbitre respecté lors des conciles décisionnels",
      "Cohérence absolue entre paroles et mode de vie sobre"
    ],
    weaknesses: [
      "Jugement sévère envers la spiritualité purement théorique ou émotionnelle",
      "Langage direct pouvant paraître accusateur ou rugueux",
      "Méfiance instinctive envers les envolées théologiques spéculatives",
      "Difficulté à valoriser la grâce avant l'exigence morale"
    ],
    spiritualInvitations: [
      "Accueillir la beauté de la contemplation gratuite sans utilité immédiate",
      "Tempérer son franc-parler avec la miséricorde envers les faibles",
      "Se souvenir que la foi salvatrice est un don avant d'être une discipline"
    ],
    missionVocation: [
      "Gouvernance communautaire, pastorale de la cohérence et déontologie",
      "Défense des travailleurs, secours des orphelins et des veuves",
      "Enseignement pratique de la sagesse quotidienne et maîtrise de la langue"
    ],
    compatibility: ["pierre", "thomas", "nehemie"],
    biblicalVerse: "Comme le corps sans âme est mort, de même la foi sans les œuvres est morte. (Jacques 2:26)",
    coordinates: { I_A: 9, S_E: -7, V_G: -8, L_F: 6, R_M: -8 }
  },

  jean_baptiste: {
    key: "jean_baptiste",
    name: "Jean-Baptiste",
    gender: 'M',
    testament: 'NT',
    dimension: 'truth',
    title: "La voix dans le désert",
    description: "Ascète enflammé, prophète sans concession préparant la voie du Seigneur. Sa joie suprême est de voir le Christ grandir tandis que lui-même diminue.",
    strengths: [
      "Intégrité totale ne craignant ni les foules ni les puissants de ce monde",
      "Humilité radieuse capable de s'effacer devant le Messie ('Il faut qu'Il croisse')",
      "Puissance de réveil spirituel et appel percutant à la repentance authentique",
      "Simplicité de vie déracinée de tout matérialisme"
    ],
    weaknesses: [
      "Austerité qui peut repousser les cœurs fragiles en quête de douceur",
      "Difficulté à intégrer la fête, la joie quotidienne et la vie relationnelle ordinaire",
      "Doutes intérieurs dans la prison face à un Messie moins vengeur qu'escompté",
      "Solitude extrême et rupture radicale avec les structures sociales"
    ],
    spiritualInvitations: [
      "Goûter à la joie de la fête des noces et au vin nouveau du Royaume",
      "Reconnaître l'action de Dieu dans la douceur du quotidien comme dans le feu",
      "Recevoir la tendresse fraternelle pour briser l'isolement du désert"
    ],
    missionVocation: [
      "Prédication de réveil, appel à la repentance et dénonciation des injustices",
      "Préparation de terrain pour les ministères apostoliques et pastoraux",
      "Témoin de rupture face aux idoles de la société de consommation"
    ],
    compatibility: ["elie", "etienne", "jean"],
    biblicalVerse: "Il faut qu'il croisse, et que je diminue. (Jean 3:30)",
    coordinates: { I_A: 7, S_E: 5, V_G: -10, L_F: 8, R_M: 8 }
  },

  priscille: {
    key: "priscille",
    name: "Priscille",
    gender: 'F',
    testament: 'NT',
    dimension: 'encouragement',
    title: "La formatrice et collaboratrice éclairée",
    description: "Formatrice doctrinale pointue, artisane fabricante de tentes et partenaire de ministère de Paul. Avec son mari Aquilas, elle instruit Apollos avec tact et offre son foyer pour faire grandir l'Église.",
    strengths: [
      "Maîtrise remarquable des Écritures et pédagogie respectueuse d'autrui",
      "Partenariat d'équipe équilibré et modèle de ministère partagé",
      "Courage héroïque (ayant 'risqué sa tête' pour sauver l'apôtre Paul)",
      "Capacité à repérer et polir des prédicateurs talentueux avec discrétion"
    ],
    weaknesses: [
      "Exigence élevée de perfection doctrinale pouvant intimider les débutants",
      "Multiplication des activités (artisanat, maison, enseignement) créant de la surcharge",
      "Difficulté à faire face à des leaders autocratiques qui refusent le dialogue",
      "Réticence à déléguer l'organisation pédagogique"
    ],
    spiritualInvitations: [
      "Garder des espaces de recueillement pur hors des sessions d'enseignement",
      "Accorder du temps à ceux dont la progression intellectuelle est lente",
      "Célébrer les victoires ordinaires au lieu de courir au projet suivant"
    ],
    missionVocation: [
      "Mentorat théologique et formation approfondie des futurs ministres",
      "Leadership de communautés de maison et implantation missionnaire",
      "Animation de couples dans le service commun pour le Royaume"
    ],
    compatibility: ["paul", "timothee", "lydie"],
    biblicalVerse: "Priscille et Aquilas l'entendirent, le prirent avec eux, et lui exposèrent plus exactement la voie de Dieu. (Actes 18:26)",
    coordinates: { I_A: 6, S_E: -7, V_G: 6, L_F: 6, R_M: -5 }
  },

  marie_magdala: {
    key: "marie_magdala",
    name: "Marie de Magdala",
    gender: 'F',
    testament: 'NT',
    dimension: 'worship',
    title: "L'apôtre des apôtres et adoratrice restaurée",
    description: "Délivrée de sept démons, sa reconnaissance envers Jésus est totale. Première au tombeau au petit matin, elle reçoit l'honneur inouï d'annoncer la Résurrection aux disciples.",
    strengths: [
      "Dévotion et gratitude infinies pour la liberté et la grâce reçues",
      "Courage de rester au tombeau quand tous les autres s'étaient enfuis",
      "Sensibilité immédiate à la voix du Berger qui l'appelle par son nom",
      "Fidélité financière et matérielle pour soutenir le ministère de Jésus"
    ],
    weaknesses: [
      "Douleur déchirante pouvant l'aveugler temporairement dans le deuil",
      "Tendance à vouloir retenir le Christ dans ses formes anciennes ('Ne me retiens pas')",
      "Vulnérabilité face au rejet ou au scepticisme de l'entourage masculin",
      "Charge émotionnelle très vive dans chaque circonstance"
    ],
    spiritualInvitations: [
      "Apprendre à lâcher prise sur le familier pour accueillir la nouveauté de la Résurrection",
      "Transformer l'émotion débordante en message d'autorité et de paix",
      "Ancrer sa sécurité dans son identité de fille bien-aimée de Dieu"
    ],
    missionVocation: [
      "Proclamation de la Bonne Nouvelle et témoignage de la Résurrection",
      "Ministère de restauration pour les personnes brisées et délivrance",
      "Adoration passionnée et intercession matinale"
    ],
    compatibility: ["jean", "marie", "david"],
    biblicalVerse: "Marie de Magdala alla annoncer aux disciples : 'J'ai vu le Seigneur !' (Jean 20:18)",
    coordinates: { I_A: -7, S_E: 8, V_G: 8, L_F: 6, R_M: 9 }
  },

  tabitha: {
    key: "tabitha",
    name: "Tabitha (Dorcas)",
    gender: 'F',
    testament: 'NT',
    dimension: 'service',
    title: "La bienfaitrice des humbles",
    description: "Disciple de Joppé dont toute la vie est tissée d'actes de charité. Les tuniques et manteaux qu'elle cousait pour les veuves étaient le sermon vivant de l'amour de Dieu.",
    strengths: [
      "Charité concrète et infatigable pour les orphelins et les démunis",
      "Créativité manuelle et artisanat mis entièrement au service du bien",
      "Impact communautaire si profond que toute la ville pleure son départ",
      "Humilité radieuse qui ne recherche aucune tribune publique"
    ],
    weaknesses: [
      "Tendance à s'oublier totalement jusqu'à l'épuisement physique",
      "Difficulté à demander de l'aide ou à formuler ses propres manques",
      "Pudeur qui peut la maintenir dans l'ombre au détriment de sa parole",
      "Chagrin intense devant la misère humaine qu'elle ne peut toute soulager"
    ],
    spiritualInvitations: [
      "Apprendre à se laisser servir et soigner par les frères et sœurs",
      "Reconnaître la valeur de son être indépendamment de ce qu'elle produit",
      "Prendre soin de son corps comme temple de l'Esprit"
    ],
    missionVocation: [
      "Diaconat de solidarité, confection et distribution de secours",
      "Pastoral de compassion pour les veuves et les familles en détresse",
      "Initiatives d'entraide communautaire et artisanat solidaire"
    ],
    compatibility: ["marthe", "barnabas", "ruth"],
    biblicalVerse: "Il y avait à Joppé une disciple nommée Tabitha... elle faisait beaucoup de bonnes œuvres et d'aumônes. (Actes 9:36)",
    coordinates: { I_A: 10, S_E: -4, V_G: 9, L_F: -8, R_M: -6 }
  },

  philippe: {
    key: "philippe",
    name: "Philippe",
    gender: 'M',
    testament: 'NT',
    dimension: 'encouragement',
    title: "L'évangéliste hospitalier et pionnier",
    description: "Disponible à l'appel de l'Esprit pour quitter les foules de Samarie et rejoindre un étranger sur un chemin désert. Philippe invite avec simplicité : 'Viens et vois'.",
    strengths: [
      "Disponibilité immédiate à l'Esprit pour des missions imprévues",
      "Sensibilité transculturelle et ouverture aux exclus et étrangers",
      "Approche évangélique naturelle, sans pression ('Viens et vois')",
      "Foyer chaleureux béni de filles prophétesses"
    ],
    weaknesses: [
      "Tendance à calculer rationnellement face aux foules ('Deux cents deniers ne suffiraient pas')",
      "Besoin de preuves tangibles par moments ('Montre-nous le Père')",
      "Difficulté avec les structures trop sédentaires",
      "Risque d'isolement lors de déplacements fréquents"
    ],
    spiritualInvitations: [
      "Dépasser les calculs logiques pour faire confiance à la multiplication divine",
      "Approfondir la contemplation du Père déjà présent dans le Fils",
      "Structurer le suivi des âmes touchées lors des missions"
    ],
    missionVocation: [
      "Évangélisation transculturelle et pionnière",
      "Accompagnement personnalisé des personnes en quête spirituelle",
      "Ministère de guérison et joie communicative dans les villes"
    ],
    compatibility: ["andre", "barnabas", "pierre"],
    biblicalVerse: "Philippe lui dit : 'Viens, et vois.' (Jean 1:46)",
    coordinates: { I_A: 7, S_E: 6, V_G: 8, L_F: 6, R_M: 7 }
  },

  andre: {
    key: "andre",
    name: "André",
    gender: 'M',
    testament: 'NT',
    dimension: 'loyalty',
    title: "Le connecteur discret",
    description: "Premier disciple à suivre Jésus, André a pour génie secret d'amener les autres au Maître : son frère Pierre, le jeune garçon aux pains et poissons, et les Grecs en quête de vérité.",
    strengths: [
      "Don naturel pour connecter les personnes au Christ et créer des liens",
      "Absence totale de rivalité fraternelle malgré la célébrité de son frère Pierre",
      "Sens de la valeur des petites choses (le panier d'un petit garçon)",
      "Écoute patiente et accessibilité bienveillante"
    ],
    weaknesses: [
      "Effacement qui peut le conduire à ne pas exprimer ses propres visions",
      "Hésitation à prendre les rênes lorsque la situation exige un leader fort",
      "Tendance à douter de l'impact général ('Mais qu'est-ce que cela pour tant de gens ?')",
      "Peine à faire entendre sa voix au sein du cercle rapproché"
    ],
    spiritualInvitations: [
      "Croire que sa voix propre porte une autorité spirituelle unique",
      "Oser diriger en première ligne lorsque Dieu l'appelle",
      "Passer de la mise en relation à la conduite proactive de disciples"
    ],
    missionVocation: [
      "Ministère d'accueil, intégration et mise en réseau fraternelle",
      "Évangélisation d'amitié et mentorat individuel",
      "Détection des ressources cachées dans la communauté"
    ],
    compatibility: ["pierre", "philippe", "timothee"],
    biblicalVerse: "André, frère de Simon Pierre, était l'un des deux... La première chose qu'il fit, ce fut de trouver son frère Simon. (Jean 1:40-41)",
    coordinates: { I_A: 6, S_E: -4, V_G: 7, L_F: -8, R_M: 6 }
  },

  // === ANCIEN TESTAMENT ===
  david: {
    key: "david",
    name: "David",
    gender: 'M',
    testament: 'AT',
    dimension: 'worship',
    title: "L'adorateur passionné et berger",
    description: "Un cœur vibrant selon Dieu, poète, guerrier et pénitent sincère. David traverse les hauteurs de la louange et les gouffres de la repentance avec une vérité d'âme sans fard.",
    strengths: [
      "Authenticité absolue et transparence de cœur devant Dieu",
      "Sensibilité artistique, composition musicale et poésie inspirée",
      "Courage héroïque né d'une foi inébranlable en la fidélité de Dieu",
      "Leadership inspirant qui transforme des proscrits en vaillants héros"
    ],
    weaknesses: [
      "Passions affectives et impulsions mal maîtrisées pouvant causer des chutes graves",
      "Difficulté à faire régner la discipline dans son propre cercle familial",
      "Moments de passivité ou d'aveuglement spirituel dans le confort",
      "Sensibilité dramatique qui amplifie les tempêtes intérieures"
    ],
    spiritualInvitations: [
      "Pratiquer la vigilance et la sobriété dans les temps de prospérité",
      "Exercer le courage pastoral au sein de sa propre maison",
      "Trouver son repos dans la paix de Dieu plus que dans l'intensité émotionnelle"
    ],
    missionVocation: [
      "Conduite de la louange, composition et créativité au service de Dieu",
      "Leadership visionnaire et rassemblement de personnes blessées",
      "Ministère de guérison des cœurs brisés par la grâce et la repentance"
    ],
    compatibility: ["nathan", "jean", "marie"],
    biblicalVerse: "J'ai trouvé David, fils d'Isaï, un homme selon mon cœur, qui accomplira toutes mes volontés. (Actes 13:22)",
    coordinates: { I_A: 0, S_E: 9, V_G: 4, L_F: 6, R_M: 9 }
  },

  esther: {
    key: "esther",
    name: "Esther",
    gender: 'F',
    testament: 'AT',
    dimension: 'strategy',
    title: "La stratège courageuse",
    description: "Orpheline devenue reine, discrète et guidée par le jeûne. Esther allie une maîtrise de soi admirable à un sens du timing parfait pour risquer sa vie et délivrer son peuple.",
    strengths: [
      "Sens aigu du timing divin, de la prudence et de la diplomatie",
      "Courage sacrificiel face à la mort ('Si je dois périr, je périrai')",
      "Discipline intérieure et maîtrise admirable des émotions",
      "Respect des conseils des aînés (Mardochée) et appel à la prière collective"
    ],
    weaknesses: [
      "Peur initiale et tentation de rester dans le confort sécuritaire du palais",
      "Isolement émotionnel engendré par le secret et la discrétion",
      "Réticence à s'exposer avant que l'urgence ne devienne absolue",
      "Poids immense porté dans le silence"
    ],
    spiritualInvitations: [
      "Oser prendre la parole avant que la crise ne menace la destruction",
      "Partager ses fardeaux avec des frères et sœurs de confiance",
      "Se souvenir que la Providence a placé ses dons pour une heure précise"
    ],
    missionVocation: [
      "Plaidoyer, justice et défense des personnes opprimées",
      "Intervention diplomatique et médiation en contexte de crise politique",
      "Mobilisation de campagnes de jeûne, prière et délivrance"
    ],
    compatibility: ["ruth", "joseph", "daniel"],
    biblicalVerse: "Et qui sait si ce n'est pas pour un temps comme celui-ci que tu es parvenue à la royauté ? (Esther 4:14)",
    coordinates: { I_A: -4, S_E: -7, V_G: -4, L_F: 8, R_M: 6 }
  },

  deborah: {
    key: "deborah",
    name: "Déborah",
    gender: 'F',
    testament: 'AT',
    dimension: 'leadership',
    title: "La prophétesse et mère en Israël",
    description: "Juge sage sous son palmier, prophétesse et inspiratrice d'armées. Déborah réveille les hommes hésitants et rend justice avec la clarté du Saint-Esprit.",
    strengths: [
      "Autorité spirituelle naturelle reconnue par tout le peuple",
      "Capacité à motiver et équiper les autres leaders sans prendre leur place",
      "Clarté de discernement dans les litiges et sagesse de gouvernement",
      "Louange triomphante après la victoire célébrant la gloire de Dieu seul"
    ],
    weaknesses: [
      "Impatience face à la lâcheté ou au manque de foi des collaborateurs",
      "Exigence qui peut intimider les tempéraments plus hésitants",
      "Risque d'épuisement face aux sollicitations infinies de conseil",
      "Difficulté à trouver des pairs spirituels avec qui échanger d'égal à égal"
    ],
    spiritualInvitations: [
      "Cultiver la patience avec les temps de maturation des autres",
      "Savoir se retirer pour préserver des moments d'intimité avec Dieu",
      "Former des juges pour déléguer les arbitrages secondaires"
    ],
    missionVocation: [
      "Direction stratégique d'organisations et de communautés",
      "Ministère de justice, d'arbitrage et de conseil éthique",
      "Réveil de la conscience collective et encouragement des leaders masculins et féminins"
    ],
    compatibility: ["pierre", "moise", "josue"],
    biblicalVerse: "Les chefs étaient sans force en Israël, sans force, jusqu'à ce que je me sois levée, moi, Déborah, comme une mère en Israël. (Juges 5:7)",
    coordinates: { I_A: 6, S_E: -5, V_G: -8, L_F: 9, R_M: 6 }
  },

  ruth: {
    key: "ruth",
    name: "Ruth",
    gender: 'F',
    testament: 'AT',
    dimension: 'loyalty',
    title: "Le cœur de fidélité inébranlable",
    description: "Étrangère d'origine moabite, son attachement sacrificiel à Naomi et au Dieu d'Israël réécrit son destin. Sa fidélité silencieuse dans le glanage des champs ouvre la lignée du Roi David et du Messie.",
    strengths: [
      "Loyauté sacrificielle et persévérance au cœur de l'adversité",
      "Humilité et ardeur au travail sans revendication",
      "Confiance paisible en la providence divine dans le quotidien ordinaire",
      "Pureté de motivation et respect attentif des anciens"
    ],
    weaknesses: [
      "Tendance à se dévaloriser par rapport aux membres établis de la communauté",
      "Peur inconsciente de l'insécurité matérielle",
      "Effacement excessif risquant de taire ses propres besoins",
      "Vulnérabilité face aux personnes dominatrices"
    ],
    spiritualInvitations: [
      "Prendre conscience de sa haute dignité dans le plan de rédemption de Dieu",
      "S'autoriser à recevoir la bénédiction sans culpabilité",
      "Prendre des initiatives audacieuses quand le moment de la grâce arrive"
    ],
    missionVocation: [
      "Pastoral de l'accompagnement des personnes endeuillées et isolées",
      "Intendance fidèle dans les œuvres de fond sans projecteur",
      "Témoignage de conversion transculturelle et d'alliance"
    ],
    compatibility: ["timothee", "barnabas", "boaz"],
    biblicalVerse: "Où tu iras j'irai, où tu demeureras je demeurerai ; ton peuple sera mon peuple, et ton Dieu sera mon Dieu. (Ruth 1:16)",
    coordinates: { I_A: 5, S_E: -6, V_G: 7, L_F: -9, R_M: -4 }
  },

  moise: {
    key: "moise",
    name: "Moïse",
    gender: 'M',
    testament: 'AT',
    dimension: 'leadership',
    title: "Le berger prophète et législateur",
    description: "L'homme le plus humble de la terre, ami de Dieu parlant face à face avec Lui. Moïse endure l'incrédulité d'un peuple entier et intercède sans cesse pour son salut.",
    strengths: [
      "Intimité prophétique sans pareille : Dieu lui parlait comme un homme parle à son ami",
      "Cœur d'intercesseur prêt à voir son nom effacé du livre de vie pour sauver le peuple",
      "Capacité à recevoir, structurer et transmettre la Loi et les institutions",
      "Humilité exemplaire au sommet d'une autorité extraordinaire"
    ],
    weaknesses: [
      "Frustration accumulée devant la rébellion répétée qui mène à des accès d'irritation",
      "Tendance initiale à vouloir tout porter seul avant les conseils de Jéthro",
      "Doute initial sur ses propres capacités d'élocution",
      "Difficulté à faire entrer sa propre famille dans la vision publique"
    ],
    spiritualInvitations: [
      "Veiller sur sa propre douceur dans les moments de fatigue extrême",
      "Déléguer continuellement le gouvernement aux anciens",
      "Savourer la promesse sans être frustré de ne pas tout voir s'accomplir de son vivant"
    ],
    missionVocation: [
      "Leadership pionnier de libération et fondation d'institutions",
      "Intercession de haut niveau pour les nations et les églises en crise",
      "Enseignement des ordonnances spirituelles et de la sainteté de Dieu"
    ],
    compatibility: ["josue", "aaron", "deborah"],
    biblicalVerse: "L'Éternel parlait avec Moïse face à face, comme un homme parle à son ami. (Exode 33:11)",
    coordinates: { I_A: -7, S_E: -7, V_G: -7, L_F: 9, R_M: 8 }
  },

  elie: {
    key: "elie",
    name: "Élie",
    gender: 'M',
    testament: 'AT',
    dimension: 'truth',
    title: "Le prophète de zèle et de feu",
    description: "Intrépide devant les rois apostats, défiant quatre cent cinquante faux prophètes sur le mont Carmel. Élie rappelle au peuple que l'Éternel seul est Dieu, avant de découvrir Son murmure doux et subtil dans le désert.",
    strengths: [
      "Zèle dévorant pour la gloire de Dieu et rejet de tout syncrétisme religieux",
      "Puissance de prière qui ferme le ciel et fait tomber la pluie ou le feu",
      "Courage solitaire bravant les puissants corrompus",
      "Sensibilité au murmure doux et silencieux de Dieu au-delà du fracas"
    ],
    weaknesses: [
      "Effondrement émotionnel et dépression après les grandes victoires spirituelles",
      "Sentiment aigu d'isolement ('Je suis resté moi seul')",
      "Intransigeance pouvant virer au découragement absolu",
      "Difficulté à collaborer dans la durée au sein d'une équipe"
    ],
    spiritualInvitations: [
      "Comprendre que Dieu n'est pas seulement dans la tempête mais dans le murmure doux",
      "Reconnaître qu'il existe sept mille autres fidèles qui n'ont pas fléchi les genoux",
      "Préparer patiemment son successeur (Élisée) en lui transmettant le manteau"
    ],
    missionVocation: [
      "Ministère prophétique de rupture et dénonciation de l'idolâtrie moderne",
      "Prière d'autorité et combat spirituel en temps d'apostasie",
      "Transmission de manteau et réveil des cœurs avant le retour du Seigneur"
    ],
    compatibility: ["elisee", "jean_baptiste", "etienne"],
    biblicalVerse: "L'Éternel, Dieu d'Israël, est vivant, lui en présence de qui je me tiens ! (1 Rois 17:1)",
    coordinates: { I_A: 5, S_E: 6, V_G: -9, L_F: 6, R_M: 9 }
  },

  joseph: {
    key: "joseph",
    name: "Joseph",
    gender: 'M',
    testament: 'AT',
    dimension: 'strategy',
    title: "L'intendant sage et visionnaire",
    description: "Vendu par ses frères, esclave puis prisonnier innocent, Joseph garde sa foi intacte. Ses dons d'interprétation des songes et sa sagesse administrative le hissent au sommet de l'Égypte pour sauver des nations.",
    strengths: [
      "Vision stratégique et capacité de gestion prévisionnelle en temps de crise",
      "Intégrité morale totale refusant le compromis moral (avec la femme de Potiphar)",
      "Capacité surnaturelle de pardon et de réconciliation avec ses offenseurs",
      "Compréhension prophétique de la souveraineté de Dieu à travers le mal"
    ],
    weaknesses: [
      "Naïveté de jeunesse en partageant ses songes sans ménager ses frères",
      "Isolement dans le luxe et le pouvoir des cours royales",
      "Tentation de tester durement ses proches avant d'accorder sa confiance",
      "Risque d'assimilation culturelle dans un système séculier"
    ],
    spiritualInvitations: [
      "Développer le tact relationnel en accompagnement de ses visions prophétiques",
      "Accorder le pardon sans imposer d'épreuves prolongées",
      "Transmettre l'espérance du retour à la terre promise par-delà le succès d'Égypte"
    ],
    missionVocation: [
      "Direction économique, planification stratégique et gestion de crises majeures",
      "Haute fonction publique et témoignage d'intégrité auprès des gouvernants séculiers",
      "Réconciliation familiale et restauration des liens de fraternité brisés"
    ],
    compatibility: ["daniel", "esther", "nehemie"],
    biblicalVerse: "Vous aviez médité de me faire du mal : Dieu l'a changé en bien, pour sauver la vie à un peuple nombreux. (Genèse 50:20)",
    coordinates: { I_A: 6, S_E: -9, V_G: 7, L_F: 8, R_M: 7 }
  },

  daniel: {
    key: "daniel",
    name: "Daniel",
    gender: 'M',
    testament: 'AT',
    dimension: 'truth',
    title: "Le témoin intègre en exil",
    description: "Déporté à Babylone, Daniel prend la résolution dans son cœur de ne pas se souiller. Trois fois par jour, face à Jérusalem, il s'agenouille en prière et reçoit les clés des temps de la fin.",
    strengths: [
      "Résolution inébranlable de pureté et d'obéissance aux préceptes divins",
      "Discipline de prière constante bravant les décrets de mort",
      "Intelligence supérieure et révélation des mystères de l'histoire humaine",
      "Influence spirituelle durable sur plusieurs empires consécutifs"
    ],
    weaknesses: [
      "Fardeau prophétique accablant causant un épuisement physique régulier",
      "Solitude intellectuelle et spirituelle dans un univers païen",
      "Rigidité qui peut paraître inaccessible aux personnes plus faibles",
      "Austérité de jeûne prolongée"
    ],
    spiritualInvitations: [
      "Recevoir le réconfort des anges et goûter à la paix du Seigneur au milieu des visions",
      "Créer des cercles fraternels d'appui (comme avec Ananias, Azarias et Misaël)",
      "Faire confiance au dénouement de Dieu sans chercher à percer chaque date"
    ],
    missionVocation: [
      "Présence d'influence et d'intégrité au sommet des sphères de décision politique",
      "Intercession de repentance pour la nation et réveil prophétique",
      "Déchiffrement des signes des temps et eschatologie"
    ],
    compatibility: ["joseph", "jean", "esther"],
    biblicalVerse: "Daniel résolut dans son cœur de ne pas se souiller... Trois fois par jour il se mettait à genoux, il priait et il louait son Dieu. (Daniel 1:8, 6:10)",
    coordinates: { I_A: -8, S_E: -8, V_G: -8, L_F: 4, R_M: 9 }
  },

  salomon: {
    key: "salomon",
    name: "Salomon",
    gender: 'M',
    testament: 'AT',
    dimension: 'strategy',
    title: "Le sage et bâtisseur du Temple",
    description: "Ayant demandé à Dieu un cœur intelligent pour gouverner plutôt que la richesse, Salomon reçoit une sagesse prodigieuse. Bâtisseur du Temple, poète et observateur encyclopédique de la création.",
    strengths: [
      "Discernement judiciaire exceptionnel et sagesse pratique inégalée",
      "Capacité à orchestrer des chantiers colossaux avec une perfection architecturale",
      "Curiosité intellectuelle universelle (flore, faune, proverbes, musique)",
      "Rayonnement international attirant les rois et reines de la terre"
    ],
    weaknesses: [
      "Compromis amoureux et alliances politiques conduisant à l'idolâtrie",
      "Désenchantement cynique face aux plaisirs du monde ('Vanité des vanités')",
      "Poids fiscal excessif imposé au peuple à la fin de son règne",
      "Divergence entre une sagesse enseignée et une pratique personnelle défaillante"
    ],
    spiritualInvitations: [
      "Garder son cœur plus que toute autre chose, car de lui jaillissent les sources de la vie",
      "Ne pas remplacer la dévotion intime par la magnificence des édifices",
      "Faire primer la fidélité de l'alliance sur la diplomatie humaine"
    ],
    missionVocation: [
      "Gouvernance, élaboration de cadres juridiques et arbitrage de haute volée",
      "Écriture de maximes de sagesse, pédagogie et transmission intellectuelle",
      "Management de projets d'envergure et rayonnement culturel"
    ],
    compatibility: ["joseph", "thomas", "paul"],
    biblicalVerse: "Donne donc à ton serviteur un cœur intelligent pour juger ton peuple, pour discerner le bien du mal. (1 Rois 3:9)",
    coordinates: { I_A: -4, S_E: -9, V_G: -5, L_F: 7, R_M: -6 }
  },

  josue: {
    key: "josue",
    name: "Josué",
    gender: 'M',
    testament: 'AT',
    dimension: 'leadership',
    title: "Le vaillant conquérant obéissant",
    description: "Successeur de Moïse, soldat courageux et homme de méditation de la Loi. Josué fait tomber les murailles de Jéricho par l'obéissance aux instructions précises de Dieu.",
    strengths: [
      "Courage militaire et foi audacieuse ne reculant devant aucun géant",
      "Méditation jour et nuit du livre de la Loi pour réussir dans ses voies",
      "Obéissance minutieuse aux ordres divins même insolites",
      "Clarté d'alliance familiale : 'Moi et ma maison, nous servirons l'Éternel'"
    ],
    weaknesses: [
      "Tendance à oublier de consulter l'Éternel dans les affaires apparemment simples (Gabaon)",
      "Difficulté avec la diplomatie nuancée face à des ennemis rusés",
      "Rigidité militaire pouvant manquer de souplesse pastorale",
      "Défi immense de former une génération capable de poursuivre sans lui"
    ],
    spiritualInvitations: [
      "Consulter la bouche de l'Éternel dans chaque petite décision du quotidien",
      "Développer le discernement face aux ruses subtiles",
      "Préparer la relève avec la même patience que Moïse a eue pour lui"
    ],
    missionVocation: [
      "Direction d'équipes en phase de conquête et de percée pionnière",
      "Combat spirituel stratégique et reprise de territoires perdus",
      "Affirmation de la souveraineté de Dieu au sein des foyers chrétiens"
    ],
    compatibility: ["moise", "pierre", "deborah"],
    biblicalVerse: "Fortifie-toi et prends courage... Car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras. (Josué 1:9)",
    coordinates: { I_A: 8, S_E: -6, V_G: -6, L_F: 9, R_M: -4 }
  },

  abraham: {
    key: "abraham",
    name: "Abraham",
    gender: 'M',
    testament: 'AT',
    dimension: 'contemplative',
    title: "Le père de la foi et pèlerin confiant",
    description: "Appelé à quitter son pays sans savoir où il allait, Abraham croit contre toute espérance. Ami de Dieu, il dresse des autels partout où il plante sa tente.",
    strengths: [
      "Foi pure capable de tout abandonner sur une seule promesse divine",
      "Hospitalité généreuse accueillant les anges sans le savoir",
      "Cœur d'intercesseur plaidant pour les villes pécheresses",
      "Esprit de paix préférant laisser le choix du meilleur terrain à Lot"
    ],
    weaknesses: [
      "Recours à des compromis par peur humaine en temps de famine (mensonge sur Sara)",
      "Tentative d'accomplir la promesse de Dieu par des moyens charnels (Ismaël)",
      "Passivité parfois face aux tensions de son propre foyer",
      "Attente qui éprouve rudement sa constance"
    ],
    spiritualInvitations: [
      "Laisser Dieu accomplir Ses promesses selon Son calendrier souverain",
      "Dire la vérité en toute circonstance sans craindre les rois de la terre",
      "Garder l'esprit de pèlerin même au sein de l'abondance"
    ],
    missionVocation: [
      "Paternité spirituelle, mentorat de foi et bénédiction des générations",
      "Intercession pour le salut des villes et hospitalité sacrée",
      "Pionnier de foi ouvrant des voies inconnues pour le Royaume"
    ],
    compatibility: ["sara", "jean", "barnabas"],
    biblicalVerse: "Abraham crut à Dieu, et cela lui fut imputé à justice ; et il fut appelé ami de Dieu. (Jacques 2:23)",
    coordinates: { I_A: -5, S_E: 4, V_G: 5, L_F: 7, R_M: 10 }
  },

  samuel: {
    key: "samuel",
    name: "Samuel",
    gender: 'M',
    testament: 'AT',
    dimension: 'contemplative',
    title: "La sentinelle à l'écoute de Dieu",
    description: "Consacré dès le sein maternel, enfant apprenant à dire 'Parle, Éternel, car ton serviteur écoute'. Prophète dont pas une seule des paroles ne tomba à terre, il oint les rois selon le cœur de Dieu.",
    strengths: [
      "Écoute prophétique d'une précision absolue sans laisser tomber une parole",
      "Intégrité financière et morale exemplaire reconnue publiquement par tout le peuple",
      "Persévérance d'intercession inlassable pour une nation rebelle",
      "Capacité à discerner l'onction divine au-delà des apparences physiques"
    ],
    weaknesses: [
      "Difficulté à transmettre la piété à ses propres fils qui dévièrent du droit chemin",
      "Chagrin prolongé face au rejet de Saül jusqu'à ce que Dieu l'en relève",
      "Douleur personnelle lorsque le peuple réclama un roi à la place de Dieu",
      "Sévérité sans concession face aux échecs moraux des dirigeants"
    ],
    spiritualInvitations: [
      "Dépasser le deuil des leaders défaillants pour aller oindre l'avenir",
      "Équilibrer le ministère public avec la présence auprès des siens",
      "Se souvenir que le rejet de son autorité est d'abord un rejet de Dieu"
    ],
    missionVocation: [
      "Direction d'écoles de prophètes et discernement de vocations",
      "Onction et accompagnement spirituel de dirigeants d'État ou d'Église",
      "Garde du sanctuaire et intercession continue pour le renouveau"
    ],
    compatibility: ["david", "daniel", "anne"],
    biblicalVerse: "Samuel grandissait. L'Éternel était avec lui, et il ne laissa tomber à terre aucune de ses paroles. (1 Samuel 3:19)",
    coordinates: { I_A: -8, S_E: -6, V_G: -8, L_F: 4, R_M: 9 }
  },

  nehemie: {
    key: "nehemie",
    name: "Néhémie",
    gender: 'M',
    testament: 'AT',
    dimension: 'leadership',
    title: "Le bâtisseur réformateur et homme d'action",
    description: "Échanson du roi pleurant sur les ruines de Jérusalem, Néhémie mobilise tout un peuple pour rebâtir les murailles en cinquante-deux jours, une truelle dans une main et une épée dans l'autre.",
    strengths: [
      "Capacité extraordinaire de mobilisation collective et de gestion de chantier",
      "Combinaison rare d'intense prière intérieure et d'organisation tactique brillante",
      "Courage face aux menaces extérieures et aux conspirations ennemies",
      "Défense intraitable de la justice sociale contre l'usure imposée aux pauvres"
    ],
    weaknesses: [
      "Colère vive et réactions physiques directes devant la profanation de la Loi",
      "Tendance à contrôler chaque détail logistique",
      "Exigence pouvant paraître écrasante pour les travailleurs épuisés",
      "Sensibilité au sentiment d'être incompris malgré ses immenses sacrifices"
    ],
    spiritualInvitations: [
      "Modérer ses accès d'indignation par la douceur du Saint-Esprit",
      "Prendre du recul pour célébrer les victoires sans anticiper la prochaine crise",
      "Confier la pérennité de la réforme à la grâce divine plutôt qu'à la contrainte"
    ],
    missionVocation: [
      "Reconstruction d'œuvres en ruines, assainissement et réformes structurelles",
      "Direction exécutive, gestion de crise et coordination logistique",
      "Protection communautaire contre les attaques et dérives"
    ],
    compatibility: ["jacques", "esdras", "pierre"],
    biblicalVerse: "La joie de l'Éternel sera votre force... C'est ainsi que nous rebâtîmes la muraille en 52 jours. (Néhémie 8:10, 6:15)",
    coordinates: { I_A: 9, S_E: -8, V_G: -7, L_F: 8, R_M: -6 }
  },

  anne: {
    key: "anne",
    name: "Anne",
    gender: 'F',
    testament: 'AT',
    dimension: 'contemplative',
    title: "La prophétesse de la prière persévérante",
    description: "Stérile et affligée, Anne déverse son âme devant l'Éternel dans le sanctuaire de Silo. Sa prière silencieuse des lèvres, née de l'épreuve, donne naissance à un prophète et à l'un des plus sublimes cantiques de victoire.",
    strengths: [
      "Persévérance inébranlable dans l'intercession au milieu des larmes",
      "Capacité à consacrer à Dieu ce qu'elle a de plus cher sans le retenir",
      "Profondeur mystique et prophétique de louange (le Cantique d'Anne)",
      "Foi qui transforme une dépression stérile en fécondité nationale"
    ],
    weaknesses: [
      "Vulnérabilité profonde aux provocations blessantes de son entourage (Peninna)",
      "Repli dans la tristesse avant la libération de la promesse",
      "Difficulté à communiquer sa douleur à ceux qui ne la comprennent pas (Éli)",
      "Sensibilité à fleur de peau"
    ],
    spiritualInvitations: [
      "Garder son cœur dans la paix avant même de voir le miracle s'accomplir",
      "Faire confiance au Seigneur pour la protection de ce qu'elle a consacré",
      "Enseigner aux autres le secret de la prière silencieuse et efficace"
    ],
    missionVocation: [
      "Ministère d'intercession pour les causes impossibles et la fécondité spirituelle",
      "Accompagnement des personnes en souffrance secrète ou dépression",
      "Louange prophétique annonçant le relèvement des humbles"
    ],
    compatibility: ["samuel", "marie", "jean"],
    biblicalVerse: "Je suis une femme qui souffre en son cœur... Je répandais mon âme devant l'Éternel. (1 Samuel 1:15)",
    coordinates: { I_A: -10, S_E: 6, V_G: 7, L_F: -9, R_M: 8 }
  },

  myriam: {
    key: "myriam",
    name: "Myriam",
    gender: 'F',
    testament: 'AT',
    dimension: 'worship',
    title: "La conductrice de louange et sœur protectrice",
    description: "Veillant sur son petit frère Moïse dans son berceau sur le Nil, Myriam devient la prophétesse qui prend son tambourin et entraîne toutes les femmes dans une danse triomphante après la traversée de la mer Rouge.",
    strengths: [
      "Courage et ingéniosité dès l'enfance pour protéger la vie des siens",
      "Don d'entraînement festif dans la louange et l'expression corporelle de la victoire",
      "Voix prophétique inspirante reconnue au sein du leadership national",
      "Fidélité au travers de quarante années de pérégrinations dans le désert"
    ],
    weaknesses: [
      "Jalousie et rivalité envers l'autorité prééminente de son frère Moïse",
      "Critique ouverte des choix personnels d'autrui entraînant le jugement divin",
      "Sentiment de n'être pas assez valorisée proportionnellement à ses mérites",
      "Difficulté à accepter un rôle secondaire"
    ],
    spiritualInvitations: [
      "Trouver sa joie dans la louange pure sans rechercher de position politique",
      "Veiller sur sa langue et fuir le murmure contre les autorités établies",
      "Guérir des blessures d'orgueil par l'humilité et la repentance rapide"
    ],
    missionVocation: [
      "Conduite de la louange vivante, danse sacrée et célébration communautaire",
      "Leadership féminin et mobilisation des mères et des sœurs",
      "Combat spirituel festif proclamant la défaite des oppresseurs"
    ],
    compatibility: ["david", "moise", "deborah"],
    biblicalVerse: "Myriam, la prophétesse, sœur d'Aaron, prit à la main un tambourin, et toutes les femmes sortirent après elle, avec des tambourins et en dansant. (Exode 15:20)",
    coordinates: { I_A: 6, S_E: 9, V_G: -4, L_F: 7, R_M: 7 }
  },

  abigail: {
    key: "abigail",
    name: "Abigail",
    gender: 'F',
    testament: 'AT',
    dimension: 'strategy',
    title: "La médiatrice avisée et apaisante",
    description: "Femme d'un grand bon sens et d'une remarquable beauté spirituelle, mariée à un homme insensé (Nabal). Par son initiative courageuse et son discours diplomatique inspiré, elle désamorce la vengeance sanglante de David.",
    strengths: [
      "Intelligence diplomatique et discernement immédiat pour désamorcer les conflits",
      "Courage de prendre des décisions réparatrices sans attendre l'autorisation d'un fou",
      "Capacité d'intercession prophétique rappelant à David sa haute destinée royale",
      "Générosité d'hospitalité offerte aux hommes rejetés"
    ],
    weaknesses: [
      "Poids immense de porter seule la réputation et la sécurité de sa maison",
      "Résignation prolongée au côté d'un conjoint toxique avant l'intervention divine",
      "Risque de s'épuiser à réparer continuellement les fautes des autres",
      "Solitude dans la prise de responsabilités"
    ],
    spiritualInvitations: [
      "Recevoir pour elle-même la paix et la protection qu'elle offre aux autres",
      "Ne pas se culpabiliser pour les choix insensés de son entourage",
      "Faire confiance au jugement souverain de Dieu sans tout vouloir anticiper"
    ],
    missionVocation: [
      "Médiation de crise et désamorçage de guerres fratricides",
      "Conseil stratégique auprès de leaders influents et fougueux",
      "Ministère de réconciliation et de sagesse relationnelle"
    ],
    compatibility: ["david", "barnabas", "esther"],
    biblicalVerse: "Béni soit ton bon sens, et bénie sois-tu, toi qui m'as empêché en ce jour de verser le sang ! (1 Samuel 25:33)",
    coordinates: { I_A: 7, S_E: -8, V_G: 9, L_F: 7, R_M: -7 }
  },

  sara: {
    key: "sara",
    name: "Sara",
    gender: 'F',
    testament: 'AT',
    dimension: 'loyalty',
    title: "La mère de la promesse et foi éprouvée",
    description: "Compagne de pèlerinage d'Abraham, traversant des décennies de promesse en attente. Bien qu'ayant ri de doute sous la tente, sa foi est renouvelée et elle donne naissance au fils du rire divin, Isaac.",
    strengths: [
      "Fidélité durable à travers tous les déplacements et déracinements nomades",
      "Capacité à recevoir la force de concevoir malgré un âge très avancé",
      "Protection jalouse de l'héritier de la promesse contre les usurpations",
      "Femme citée comme modèle de foi et d'espérance sainte dans le Nouveau Testament"
    ],
    weaknesses: [
      "Doute et rire incrédule face à l'annonce de l'impossible de Dieu",
      "Impatience ayant provoqué le recours malheureux à Agar",
      "Dureté envers sa servante une fois le conflit enclenché",
      "Tendance à laisser la peur guider certaines décisions en terre étrangère"
    ],
    spiritualInvitations: [
      "Croire que rien n'est impossible à Dieu, même après des années de silence",
      "Transformer le rire du doute en rire de joie sainte devant l'accomplissement",
      "Pardonner et bénir au lieu de rivaliser"
    ],
    missionVocation: [
      "Paternité et maternité spirituelle des croyants",
      "Accompagnement des personnes vivant des attentes apparemment désespérées",
      "Témoignage de la fidélité de Dieu qui accomplit Sa promesse au-delà des limites humaines"
    ],
    compatibility: ["abraham", "ruth", "anne"],
    biblicalVerse: "C'est par la foi que Sara elle-même, malgré son âge avancé, fut rendue capable d'avoir une postérité, parce qu'elle crut à la fidélité de celui qui avait fait la promesse. (Hébreux 11:11)",
    coordinates: { I_A: -3, S_E: -6, V_G: 4, L_F: 5, R_M: 6 }
  }
};
