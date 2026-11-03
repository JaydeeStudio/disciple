import React, { useState, useMemo } from 'react';
import { ARCHETYPES, Archetype } from '../data/archetypes';
import { 
  Users, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Plus, 
  Trash2, 
  Flame, 
  Heart, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  BookOpen,
  Printer
} from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  archetypeKey: string;
}

// 4 Grand Poles mapping
export type TeamPole = 'action' | 'wisdom' | 'structure' | 'care';

export interface PoleMeta {
  key: TeamPole;
  name: string;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  bgLightClass: string;
  borderColorClass: string;
  textClass: string;
}

export const POLE_CONFIG: Record<TeamPole, PoleMeta> = {
  action: {
    key: 'action',
    name: 'Impulsion & Action',
    label: 'Pionniers, Bâtisseurs & Conquérants',
    icon: <Flame className="w-4 h-4 text-brand-terracotta" />,
    colorClass: 'bg-brand-terracotta',
    bgLightClass: 'bg-brand-terracotta/10',
    borderColorClass: 'border-brand-terracotta/30',
    textClass: 'text-brand-terracotta'
  },
  wisdom: {
    key: 'wisdom',
    name: 'Sagesse & Vérité',
    label: 'Sentinelles, Penseurs & Lucidité',
    icon: <Compass className="w-4 h-4 text-brand-ochre" />,
    colorClass: 'bg-brand-ochre',
    bgLightClass: 'bg-brand-ochre/15',
    borderColorClass: 'border-brand-ochre/30',
    textClass: 'text-brand-ochre'
  },
  structure: {
    key: 'structure',
    name: 'Structure & Fidélité',
    label: 'Piliers, Coordinateurs & Cadre',
    icon: <Layers className="w-4 h-4 text-brand-charcoal" />,
    colorClass: 'bg-brand-charcoal',
    bgLightClass: 'bg-brand-charcoal/10',
    borderColorClass: 'border-brand-charcoal/30',
    textClass: 'text-brand-charcoal'
  },
  care: {
    key: 'care',
    name: 'Soin & Communion',
    label: 'Consolateurs, Pasteurs & Écoute',
    icon: <Heart className="w-4 h-4 text-brand-sage" />,
    colorClass: 'bg-brand-sage',
    bgLightClass: 'bg-brand-sage/15',
    borderColorClass: 'border-brand-sage/30',
    textClass: 'text-brand-sage'
  }
};

// Deterministic Pole classification based on archetype coordinates & dimension
export function getArchetypePole(arch: Archetype): TeamPole {
  const { I_A, S_E, V_G, L_F, R_M } = arch.coordinates;

  // Action: high initiative, leadership, high action
  if (I_A > 2 && L_F > 1) return 'action';
  // Care: high grace, contemplation, loyalty/encouragement
  if (V_G > 2 || arch.dimension === 'encouragement' || (arch.dimension === 'contemplative' && I_A < -3)) return 'care';
  // Structure: high structure (low S_E), loyalty/service/pragmatism
  if (S_E < -1 || arch.dimension === 'service' || arch.dimension === 'loyalty') return 'structure';
  // Wisdom: truth, inquiry, strategy/reason
  if (V_G < 0 || R_M < 0 || arch.dimension === 'truth' || arch.dimension === 'strategy') return 'wisdom';

  // Fallbacks based on action/interiority balance
  if (I_A >= 0) return 'action';
  return 'care';
}

const PRESETS: { title: string; desc: string; members: { name: string; archetypeKey: string }[] }[] = [
  {
    title: 'Équipe pastorale & animation',
    desc: 'Un collège type de paroisse ou d\'aumônerie',
    members: [
      { name: 'Frédéric', archetypeKey: 'pierre' },
      { name: 'Sophie', archetypeKey: 'marthe' },
      { name: 'Éric', archetypeKey: 'thomas' },
      { name: 'Claire', archetypeKey: 'barnabas' },
      { name: 'Marc', archetypeKey: 'jean' }
    ]
  },
  {
    title: 'Groupe de maison & prière',
    desc: 'Petite cellule de partage et d\'enracinement',
    members: [
      { name: 'Marie', archetypeKey: 'marie_bethanie' },
      { name: 'David', archetypeKey: 'david' },
      { name: 'Nathalie', archetypeKey: 'ruth' },
      { name: 'Julien', archetypeKey: 'timothee' },
      { name: 'Déborah', archetypeKey: 'deborah' }
    ]
  },
  {
    title: 'Équipe missionnaire & pionnière',
    desc: 'Projet d\'implantation ou évangélisation de terrain',
    members: [
      { name: 'Alexandre', archetypeKey: 'paul' },
      { name: 'Romain', archetypeKey: 'silas' },
      { name: 'Béatrice', archetypeKey: 'matthieu' },
      { name: 'Antoine', archetypeKey: 'nicodeme' }
    ]
  }
];

export const TeamCrossAnalysis: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Pierre-Alain', archetypeKey: 'pierre' },
    { id: '2', name: 'Hélène', archetypeKey: 'marthe' },
    { id: '3', name: 'Thomas', archetypeKey: 'thomas' },
    { id: '4', name: 'Chantal', archetypeKey: 'barnabas' }
  ]);

  const [newName, setNewName] = useState('');
  const [newArchetype, setNewArchetype] = useState('jean');

  const addMember = () => {
    if (!newName.trim()) return;
    const newId = Date.now().toString();
    setMembers(prev => [...prev, { id: newId, name: newName.trim(), archetypeKey: newArchetype }]);
    setNewName('');
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const loadPreset = (presetMembers: { name: string; archetypeKey: string }[]) => {
    setMembers(presetMembers.map((m, idx) => ({ id: `${idx + 1}-${Date.now()}`, ...m })));
  };

  // Cross-analysis computation
  const analysis = useMemo(() => {
    const total = members.length;
    if (total === 0) {
      return null;
    }

    const poleCounts: Record<TeamPole, number> = {
      action: 0,
      wisdom: 0,
      structure: 0,
      care: 0
    };

    const memberPoles = members.map(m => {
      const arch = ARCHETYPES[m.archetypeKey] || ARCHETYPES.jean;
      const pole = getArchetypePole(arch);
      poleCounts[pole] = (poleCounts[pole] || 0) + 1;
      return { ...m, archetype: arch, pole };
    });

    const polePcts = {
      action: Math.round((poleCounts.action / total) * 100),
      wisdom: Math.round((poleCounts.wisdom / total) * 100),
      structure: Math.round((poleCounts.structure / total) * 100),
      care: Math.round((poleCounts.care / total) * 100)
    };

    // Dominant Pole
    const sortedPoles = (Object.keys(poleCounts) as TeamPole[]).sort((a, b) => poleCounts[b] - poleCounts[a]);
    const primaryPole = sortedPoles[0];
    const secondaryPole = sortedPoles[1];

    // Collective DNA title & explanation
    let collectiveDna = 'Collectif Équilibré & Harmonieux';
    let dnaDescription = 'Votre groupe présente une saine répartition entre action, sagesse, cadre logistique et sollicitude fraternelle.';

    if (polePcts.action >= 40) {
      collectiveDna = 'Collectif Pionnier & Conquérant';
      dnaDescription = 'Une forte propension à entreprendre, lancer de nouvelles initiatives et bousculer le statu quo. Vous avancez vite et inspirez.';
    } else if (polePcts.care >= 40) {
      collectiveDna = 'Collectif de Communion Fraternelle & Enracinement';
      dnaDescription = 'L\'écoute, la bienveillance et la préservation de la paix relationnelle sont au cœur du groupe. Climat chaleureux et rassurant.';
    } else if (polePcts.wisdom >= 40) {
      collectiveDna = 'Collectif Sentinelle de Vérité & Lucidité';
      dnaDescription = 'Un goût prononcé pour la justesse intellectuelle, l\'observation approfondie et le discernement avant toute prise de décision.';
    } else if (polePcts.structure >= 40) {
      collectiveDna = 'Collectif Pilier de Fidélité & Gouvernance';
      dnaDescription = 'Une fiabilité organisationnelle exceptionnelle. Les projets sont tenus dans le temps, sécurisés et respectueux des engagements.';
    } else if (polePcts.action + polePcts.care >= 65) {
      collectiveDna = 'Collectif Cœur & Impulsion';
      dnaDescription = 'Une synergie enthousiaste où la vision d\'action est portée avec une vive chaleur humaine.';
    }

    // Strengths / Superpowers
    const superpowers: { title: string; desc: string }[] = [];
    if (poleCounts.action > 0) {
      superpowers.push({
        title: 'Capacité de démarrage rapide',
        desc: `Grâce aux profils d'action (${members.filter(m => getArchetypePole(ARCHETYPES[m.archetypeKey] || ARCHETYPES.jean) === 'action').map(m => m.name).join(', ')}), le groupe sait trancher et éviter l'immobilisme.`
      });
    }
    if (poleCounts.care > 0) {
      superpowers.push({
        title: 'Atmosphère de confiance et d\'écoute',
        desc: `Les profils de soin (${members.filter(m => getArchetypePole(ARCHETYPES[m.archetypeKey] || ARCHETYPES.jean) === 'care').map(m => m.name).join(', ')}), garantissent que les plus réservés sont accueillis et que les blessures relationnelles sont soignées.`
      });
    }
    if (poleCounts.wisdom > 0) {
      superpowers.push({
        title: 'Garde-fou critique et discernement',
        desc: `La présence de sentinelles de sagesse (${members.filter(m => getArchetypePole(ARCHETYPES[m.archetypeKey] || ARCHETYPES.jean) === 'wisdom').map(m => m.name).join(', ')}), protège l'équipe contre l'aveuglement et les emballements imprudents.`
      });
    }
    if (poleCounts.structure > 0) {
      superpowers.push({
        title: 'Fiabilité logistique et tenue des engagements',
        desc: `Les profils de structure (${members.filter(m => getArchetypePole(ARCHETYPES[m.archetypeKey] || ARCHETYPES.jean) === 'structure').map(m => m.name).join(', ')}), transforment les idées en réalités concrètes et bien ordonnées.`
      });
    }

    // Missing profiles / Blind spots
    const blindspots: { title: string; desc: string; riskLevel: 'high' | 'medium' }[] = [];
    if (poleCounts.wisdom === 0) {
      blindspots.push({
        title: 'Angle mort : Absence de profils de Sagesse & Vérification',
        desc: 'Attention à ne pas vous précipiter dans des projets sans analyse préalable. Désignez explicitement un participant pour jouer le rôle bienveillant d\'avocat du discernement.',
        riskLevel: 'high'
      });
    }
    if (poleCounts.structure === 0) {
      blindspots.push({
        title: 'Angle mort : Absence de profils de Structure & Logistique',
        desc: 'Risque de dispersion : beaucoup d\'idées et d\'élan spirituel, mais des comptes-rendus ou des détails d\'organisation qui risquent d\'être oubliés.',
        riskLevel: 'high'
      });
    }
    if (poleCounts.care === 0) {
      blindspots.push({
        title: 'Angle mort : Faible présence de profils de Soin & Pacification',
        desc: 'Risque que l\'efficacité ou le débat d\'idées prenne le pas sur la vulnérabilité humaine. Veillez à préserver des temps informels de nouvelles personnelles.',
        riskLevel: 'medium'
      });
    }
    if (poleCounts.action === 0) {
      blindspots.push({
        title: 'Angle mort : Absence de profils d\'Impulsion & Déclic',
        desc: 'Risque d\'échanges profonds et agréables mais d\'inertie pour passer aux actes ou porter de nouvelles charges missionnaires.',
        riskLevel: 'medium'
      });
    }

    // Known Friction Duos present in the team
    const keysPresent = new Set(members.map(m => m.archetypeKey));
    const frictionAlerts: { duoTitle: string; friction: string; remedy: string }[] = [];

    if (keysPresent.has('pierre') && keysPresent.has('thomas')) {
      const p = members.find(m => m.archetypeKey === 'pierre')?.name;
      const t = members.find(m => m.archetypeKey === 'thomas')?.name;
      frictionAlerts.push({
        duoTitle: `Duo Pierre & Thomas (${p} ↔ ${t})`,
        friction: `${p} peut percevoir les doutes de ${t} comme un frein pessimiste ; ${t} peut percevoir l'enthousiasme de ${p} comme une précipitation imprudente.`,
        remedy: `Faire valider la faisabilité par ${t} avant le vote final, tout en laissant à ${p} la paternité de l'élan initial.`
      });
    }

    if (keysPresent.has('marthe') && keysPresent.has('marie_bethanie')) {
      const ma = members.find(m => m.archetypeKey === 'marthe')?.name;
      const mb = members.find(m => m.archetypeKey === 'marie_bethanie')?.name;
      frictionAlerts.push({
        duoTitle: `Duo Marthe & Marie (${ma} ↔ ${mb})`,
        friction: `${ma} peut ressentir de l'injustice face au temps passé par ${mb} en écoute passive ; ${mb} peut se sentir étouffée par l'agitation logistique de ${ma}.`,
        remedy: `Valoriser explicitement le service invisible de ${ma} et accorder à ${mb} un rôle d'intercession et de recueillement sans culpabilité.`
      });
    }

    if (keysPresent.has('paul') && keysPresent.has('barnabas')) {
      const pa = members.find(m => m.archetypeKey === 'paul')?.name;
      const ba = members.find(m => m.archetypeKey === 'barnabas')?.name;
      frictionAlerts.push({
        duoTitle: `Duo Paul & Barnabas (${pa} ↔ ${ba})`,
        friction: `${pa} place la mission et le standard d'exigence au-dessus de tout ; ${ba} privilégie le relèvement individuel des personnes fragiles.`,
        remedy: `Distinguer la gouvernance du projet (confiée à ${pa}) et l'accompagnement pastoral des équipiers (confié à ${ba}).`
      });
    }

    if (keysPresent.has('david') && keysPresent.has('nathan')) {
      const da = members.find(m => m.archetypeKey === 'david')?.name;
      const na = members.find(m => m.archetypeKey === 'nathan')?.name;
      frictionAlerts.push({
        duoTitle: `Duo David & Nathan (${da} ↔ ${na})`,
        friction: `L'enthousiasme charismatique de ${da} peut balayer les détails moraux ou la rigueur ; ${na} apporte le rappel à la vérité.`,
        remedy: `Créer un espace régulier où ${na} peut débriefer en tête-à-tête avec ${da} en toute loyauté.`
      });
    }

    return {
      total,
      memberPoles,
      poleCounts,
      polePcts,
      primaryPole,
      secondaryPole,
      collectiveDna,
      dnaDescription,
      superpowers,
      blindspots,
      frictionAlerts
    };
  }, [members]);

  const sortedArchetypeOptions = useMemo(() => {
    return Object.values(ARCHETYPES).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <div className="bg-white rounded-3xl border-2 border-brand-ochre/25 p-6 sm:p-10 shadow-sm relative overflow-hidden">
      
      {/* Header of Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-ochre/15 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-ochre/15 text-brand-charcoal text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
            <span>Outil en ligne pour l'animateur</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-brand-charcoal">
            Diagnostic croisé d'équipe interactif
          </h2>
          <p className="text-xs sm:text-sm text-brand-charcoal/70 max-w-2xl mt-1 leading-relaxed">
            Saisissez les profils des membres de votre groupe pour révéler immédiatement l'ADN collectif, les super-pouvoirs, les angles morts critiques et les alertes de friction.
          </p>
        </div>

        {/* Quick Presets for Instant Testing */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-brand-charcoal/60 uppercase">Exemples types :</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p.members)}
                className="text-[11px] font-semibold px-2.5 py-1 bg-brand-bg hover:bg-brand-ochre/15 text-brand-charcoal rounded-lg border border-brand-ochre/20 transition-colors cursor-pointer"
                title={p.desc}
              >
                {p.title.split(' ')[0]} {p.title.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout : Left = Member Input / Right = Live Cross-Analysis */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Member Roster (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-bg/60 p-5 rounded-2xl border border-brand-ochre/20">
            <h3 className="font-display font-bold text-base text-brand-charcoal mb-3 flex items-center justify-between">
              <span>Membres du groupe ({members.length})</span>
              <span className="text-xs font-sans font-normal text-brand-charcoal/60">Ajout immédiat</span>
            </h3>

            {/* Quick Add Form */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-bold text-brand-charcoal/70 uppercase mb-1">
                  Prénom du membre
                </label>
                <input
                  type="text"
                  placeholder="Ex : Matthieu, Sarah, David..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMember()}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-brand-ochre/25 text-xs text-brand-charcoal focus:outline-none focus:border-brand-terracotta"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-charcoal/70 uppercase mb-1">
                  Profil biblique dominant obtenu au test
                </label>
                <div className="flex gap-2">
                  <select
                    value={newArchetype}
                    onChange={(e) => setNewArchetype(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border border-brand-ochre/25 text-xs text-brand-charcoal focus:outline-none focus:border-brand-terracotta cursor-pointer"
                  >
                    {sortedArchetypeOptions.map(arch => (
                      <option key={arch.key} value={arch.key}>
                        {arch.name} — {arch.title} ({arch.testament})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addMember}
                    className="px-3.5 py-2 bg-brand-charcoal hover:bg-brand-terracotta text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Ajouter ce membre"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {members.map(member => {
                const arch = ARCHETYPES[member.archetypeKey] || ARCHETYPES.jean;
                const pole = getArchetypePole(arch);
                const poleInfo = POLE_CONFIG[pole];

                return (
                  <div
                    key={member.id}
                    className="p-3 bg-white rounded-xl border border-brand-ochre/15 flex items-center justify-between gap-3 shadow-xs hover:border-brand-ochre/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg ${poleInfo.bgLightClass} flex items-center justify-center shrink-0`}>
                        {poleInfo.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-brand-charcoal truncate">{member.name}</p>
                        <p className="text-[11px] text-brand-charcoal/60 truncate">
                          {arch.name} • <span className={poleInfo.textClass}>{poleInfo.name.split(' ')[0]}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-1 text-brand-charcoal/40 hover:text-brand-terracotta transition-colors cursor-pointer rounded"
                      title="Retirer ce membre"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {members.length === 0 && (
                <div className="text-center py-8 text-xs text-brand-charcoal/50 italic">
                  Aucun membre saisi. Ajoutez un prénom ci-dessus ou cliquez sur un exemple type.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Diagnostic Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {analysis ? (
            <div className="space-y-6">
              
              {/* 1. Collective DNA Banner */}
              <div className="bg-brand-charcoal text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-ochre/10 rounded-full blur-2xl pointer-events-none" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-ochre block mb-1">
                  ADN & Climat Dominant du Groupe
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-white mb-2">
                  {analysis.collectiveDna}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {analysis.dnaDescription}
                </p>
              </div>

              {/* 2. Balance of the 4 Pillars */}
              <div className="bg-white p-5 rounded-2xl border border-brand-ochre/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-brand-charcoal">
                    Répartition des 4 pôles spirituels
                  </h4>
                  <span className="text-[11px] text-brand-charcoal/60">
                    {analysis.total} membre{analysis.total > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {(['action', 'wisdom', 'structure', 'care'] as TeamPole[]).map(poleKey => {
                    const info = POLE_CONFIG[poleKey];
                    const pct = analysis.polePcts[poleKey];
                    const count = analysis.poleCounts[poleKey];

                    return (
                      <div key={poleKey} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-brand-charcoal flex items-center gap-1.5">
                            {info.icon}
                            {info.name}
                          </span>
                          <span className="text-[11px] font-mono text-brand-charcoal/70">
                            {count} pers. ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-brand-bg rounded-full overflow-hidden border border-brand-ochre/15">
                          <div 
                            className={`h-full ${info.colorClass} transition-all duration-500 rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Strengths and Blindspots Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Superpowers */}
                <div className="bg-brand-sage/10 p-5 rounded-2xl border border-brand-sage/25 space-y-3">
                  <h4 className="font-display font-bold text-sm text-brand-charcoal flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-sage" />
                    <span>Forces & Atouts majeurs</span>
                  </h4>
                  <div className="space-y-2.5 text-xs text-brand-charcoal/80 leading-relaxed">
                    {analysis.superpowers.map((sp, idx) => (
                      <div key={idx}>
                        <p className="font-bold text-brand-charcoal">{sp.title}</p>
                        <p className="text-[11px] text-brand-charcoal/75">{sp.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blindspots & Warnings */}
                <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/25 space-y-3">
                  <h4 className="font-display font-bold text-sm text-brand-charcoal flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Angles morts & Profils manquants</span>
                  </h4>
                  <div className="space-y-2.5 text-xs text-brand-charcoal/80 leading-relaxed">
                    {analysis.blindspots.map((bs, idx) => (
                      <div key={idx}>
                        <p className="font-bold text-amber-950">{bs.title}</p>
                        <p className="text-[11px] text-brand-charcoal/75">{bs.desc}</p>
                      </div>
                    ))}
                    {analysis.blindspots.length === 0 && (
                      <p className="text-[11px] text-brand-charcoal/70 italic">
                        Équilibre remarquable : les 4 pôles sont tous représentés dans votre effectif actuel.
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* 4. Friction Duos present in team */}
              {analysis.frictionAlerts.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border-2 border-brand-terracotta/25 space-y-3">
                  <h4 className="font-display font-bold text-sm text-brand-charcoal flex items-center gap-2">
                    <Flame className="w-4 h-4 text-brand-terracotta" />
                    <span>Binômes sensibles identifiés dans l'équipe</span>
                  </h4>
                  <div className="space-y-3">
                    {analysis.frictionAlerts.map((fa, idx) => (
                      <div key={idx} className="p-3 bg-brand-bg/60 rounded-xl border border-brand-ochre/15 text-xs space-y-1">
                        <p className="font-bold text-brand-charcoal text-xs">{fa.duoTitle}</p>
                        <p className="text-[11px] text-brand-charcoal/70">
                          <strong className="text-brand-terracotta">Tension type :</strong> {fa.friction}
                        </p>
                        <p className="text-[11px] text-brand-charcoal/80">
                          <strong className="text-brand-sage">Conseil de collaboration :</strong> {fa.remedy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pastoral Conclusion for Animateur */}
              <div className="p-4 bg-brand-bg rounded-xl border border-brand-ochre/25 flex items-start gap-3 text-xs text-brand-charcoal/80">
                <ShieldCheck className="w-5 h-5 text-brand-terracotta shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-brand-charcoal block">Conseil pour l'animateur :</span>
                  <p className="leading-relaxed">
                    Partagez ces équilibres avec votre équipe en rappelant 1 Corinthiens 12 : aucun profil n'est supérieur, et les lacunes du groupe sont une invitation explicite à s'appuyer mutuellement et à prier pour le don manquant.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 bg-brand-bg/40 rounded-2xl border border-dashed border-brand-ochre/30 text-brand-charcoal/60 text-sm">
              Ajoutez des membres à gauche pour générer le diagnostic en direct.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
