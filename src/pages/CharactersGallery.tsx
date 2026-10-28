import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { ARCHETYPES, Archetype, SpiritualDimension } from '../data/archetypes';
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Target, 
  Users, 
  Info,
  Compass,
  Crown,
  Heart,
  Flame,
  Shield,
  Music,
  Scale
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BiblicalSilhouette } from '../components/BiblicalSilhouette';
import { triggerHaptic } from '../lib/haptics';

const DIMENSION_LABELS: Record<SpiritualDimension, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  contemplative: { label: "Contemplation et intériorité", color: "bg-blue-50 text-blue-800 border-blue-200", icon: Sparkles },
  leadership: { label: "Leadership et initiative", color: "bg-amber-50 text-amber-800 border-amber-200", icon: Crown },
  service: { label: "Service et diaconat", color: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: Heart },
  strategy: { label: "Stratégie et sagesse", color: "bg-indigo-50 text-indigo-800 border-indigo-200", icon: Compass },
  encouragement: { label: "Encouragement et grâce", color: "bg-rose-50 text-rose-800 border-rose-200", icon: Heart },
  worship: { label: "Adoration et louange", color: "bg-purple-50 text-purple-800 border-purple-200", icon: Music },
  truth: { label: "Vérité et intégrité", color: "bg-red-50 text-red-800 border-red-200", icon: Flame },
  loyalty: { label: "Loyauté et fidélité", color: "bg-teal-50 text-teal-800 border-teal-200", icon: Shield }
};

const CharactersGallery: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [selectedTestament, setSelectedTestament] = useState<'ALL' | 'NT' | 'AT'>('ALL');
  const [selectedDimension, setSelectedDimension] = useState<string>('ALL');
  const [activeModalArchetype, setActiveModalArchetype] = useState<Archetype | null>(null);

  const archetypesList = useMemo(() => Object.values(ARCHETYPES), []);

  // Open modal if profil param is present in URL (e.g. /personnages?profil=jean)
  useEffect(() => {
    const profilParam = searchParams.get('profil');
    if (profilParam && ARCHETYPES[profilParam.toLowerCase()]) {
      setActiveModalArchetype(ARCHETYPES[profilParam.toLowerCase()]);
    }
  }, [searchParams]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setActiveModalArchetype(null);
        triggerHaptic('light');
      }
    };

    if (activeModalArchetype) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeModalArchetype]);

  const filteredArchetypes = useMemo(() => {
    return archetypesList.filter(char => {
      // Search by name, title, or description
      const matchesSearch = 
        char.name.toLowerCase().includes(search.toLowerCase()) ||
        char.title.toLowerCase().includes(search.toLowerCase()) ||
        char.description.toLowerCase().includes(search.toLowerCase());

      // Gender filter
      const matchesGender = 
        selectedGender === 'ALL' || 
        char.gender === selectedGender || 
        char.gender === 'BOTH';

      // Testament filter
      const matchesTestament = 
        selectedTestament === 'ALL' || 
        char.testament === selectedTestament;

      // Dimension filter
      const matchesDimension = 
        selectedDimension === 'ALL' || 
        char.dimension === selectedDimension;

      return matchesSearch && matchesGender && matchesTestament && matchesDimension;
    });
  }, [archetypesList, search, selectedGender, selectedTestament, selectedDimension]);

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-24">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-terracotta font-bold tracking-[0.2em] uppercase text-xs mb-3 block">
            Référentiel des archétypes bibliques
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-brand-charcoal mb-4">
            Galerie des 36 personnages bibliques
          </h1>
          <p className="text-brand-sage text-lg font-medium leading-relaxed">
            Découvrez les 36 tempéraments spirituels de l'Ancien et du Nouveau Testament. Chaque personnage incarne un don unique et une facette vivante de l'action de Dieu.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-ochre/15 mb-10 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-brand-charcoal/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom (ex: David, Déborah, Jean...), titre ou thème..."
              className="w-full pl-12 pr-4 py-3.5 bg-brand-bg/70 border border-brand-ochre/15 rounded-xl text-brand-charcoal placeholder:text-brand-charcoal/40 focus:outline-none focus:border-brand-terracotta transition-colors"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-brand-ochre/10">
            {/* Testament */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-charcoal/60 uppercase tracking-wider mr-1">Testament :</span>
              <button
                onClick={() => setSelectedTestament('ALL')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  selectedTestament === 'ALL' 
                    ? "bg-brand-charcoal text-white" 
                    : "bg-brand-bg text-brand-charcoal/70 hover:bg-brand-ochre/15"
                )}
              >
                Tous ({archetypesList.length})
              </button>
              <button
                onClick={() => setSelectedTestament('NT')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  selectedTestament === 'NT' 
                    ? "bg-brand-charcoal text-white" 
                    : "bg-brand-bg text-brand-charcoal/70 hover:bg-brand-ochre/15"
                )}
              >
                Nouveau ({archetypesList.filter(c => c.testament === 'NT').length})
              </button>
              <button
                onClick={() => setSelectedTestament('AT')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  selectedTestament === 'AT' 
                    ? "bg-brand-charcoal text-white" 
                    : "bg-brand-bg text-brand-charcoal/70 hover:bg-brand-ochre/15"
                )}
              >
                Ancien ({archetypesList.filter(c => c.testament === 'AT').length})
              </button>
            </div>

            {/* Gender */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-charcoal/60 uppercase tracking-wider mr-1">Profil :</span>
              <button
                onClick={() => setSelectedGender('ALL')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  selectedGender === 'ALL' 
                    ? "bg-brand-terracotta text-white" 
                    : "bg-brand-bg text-brand-charcoal/70 hover:bg-brand-ochre/15"
                )}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedGender('M')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  selectedGender === 'M' 
                    ? "bg-brand-terracotta text-white" 
                    : "bg-brand-bg text-brand-charcoal/70 hover:bg-brand-ochre/15"
                )}
              >
                Hommes ({archetypesList.filter(c => c.gender === 'M').length})
              </button>
              <button
                onClick={() => setSelectedGender('F')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  selectedGender === 'F' 
                    ? "bg-brand-terracotta text-white" 
                    : "bg-brand-bg text-brand-charcoal/70 hover:bg-brand-ochre/15"
                )}
              >
                Femmes ({archetypesList.filter(c => c.gender === 'F').length})
              </button>
            </div>

            {/* Dimension Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-charcoal/60 uppercase tracking-wider mr-1">Élan dominant :</span>
              <select
                value={selectedDimension}
                onChange={(e) => setSelectedDimension(e.target.value)}
                className="bg-brand-bg border border-brand-ochre/20 rounded-lg px-3 py-1.5 text-xs font-bold text-brand-charcoal focus:outline-none focus:border-brand-terracotta"
              >
                <option value="ALL">Toutes les dimensions</option>
                <option value="contemplative">Contemplation et intériorité</option>
                <option value="leadership">Leadership et initiative</option>
                <option value="service">Service et diaconat</option>
                <option value="strategy">Stratégie et sagesse</option>
                <option value="encouragement">Encouragement et grâce</option>
                <option value="worship">Adoration et louange</option>
                <option value="truth">Vérité et intégrité</option>
                <option value="loyalty">Loyauté et fidélité</option>
              </select>
            </div>
          </div>
        </div>

        {/* Characters Count and CTA */}
        <div className="mb-8 flex justify-between items-center text-sm font-semibold text-brand-charcoal/60">
          <span>{filteredArchetypes.length} personnage{filteredArchetypes.length > 1 ? 's' : ''} trouvé{filteredArchetypes.length > 1 ? 's' : ''}</span>
          <Link to="/test" className="text-brand-terracotta hover:underline font-bold flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Découvrir lequel vous ressemble
          </Link>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArchetypes.map((char) => {
            const dimMeta = DIMENSION_LABELS[char.dimension];
            const IconComponent = dimMeta?.icon || Sparkles;

            return (
              <motion.div
                key={char.key}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-brand-ochre/15 p-6 hover:shadow-xl hover:border-brand-terracotta/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Badges & Category Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5", dimMeta?.color)}>
                      <IconComponent className="w-3 h-3" />
                      <span>{dimMeta?.label}</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-bg text-brand-charcoal/60 uppercase">
                      {char.testament === 'NT' ? 'Nouv. Test.' : 'Ancien Test.'}
                    </span>
                  </div>

                  {/* Character Visual / Avatar Header */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="shrink-0 group-hover:scale-105 transition-transform">
                      <BiblicalSilhouette 
                        characterKey={char.key}
                        dimension={char.dimension}
                        gender={char.gender}
                        name={char.name}
                        size="sm"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-2xl text-brand-charcoal mb-0.5 group-hover:text-brand-terracotta transition-colors truncate">
                        {char.name}
                      </h3>
                      <p className="text-xs font-medium text-brand-sage italic font-display line-clamp-1">
                        {char.title}
                      </p>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-brand-charcoal/70 text-xs leading-relaxed mb-5 line-clamp-3">
                    {char.description}
                  </p>

                  {/* Strengths preview */}
                  <div className="space-y-2 mb-6 pt-3 border-t border-brand-ochre/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/50 block">
                      Points forts clés :
                    </span>
                    {char.strengths.slice(0, 2).map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-medium text-brand-charcoal/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-sage shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Card */}
                <div className="pt-4 border-t border-brand-ochre/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      setActiveModalArchetype(char);
                    }}
                    className="text-xs font-bold text-brand-charcoal hover:text-brand-terracotta transition-colors flex items-center gap-1.5 cursor-pointer group-hover:translate-x-0.5 duration-200"
                  >
                    <span>Voir le profil en détails</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-ochre" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredArchetypes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-brand-ochre/15 p-8">
            <BookOpen className="w-12 h-12 text-brand-ochre/40 mx-auto mb-4" />
            <h3 className="text-xl font-display text-brand-charcoal mb-2">Aucun personnage ne correspond à vos critères</h3>
            <p className="text-brand-charcoal/60 text-sm mb-6">Essayez de réinitialiser vos filtres ou de modifier votre terme de recherche.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedGender('ALL');
                setSelectedTestament('ALL');
                setSelectedDimension('ALL');
              }}
              className="px-6 py-2.5 bg-brand-charcoal text-white text-xs font-bold rounded-xl hover:bg-brand-terracotta transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Modal for full character profile */}
      <AnimatePresence>
        {activeModalArchetype && (
          <div 
            onClick={() => {
              triggerHaptic('light');
              setActiveModalArchetype(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/50 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-ochre/20 p-8 md:p-10 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setActiveModalArchetype(null);
                }}
                className="absolute top-6 right-6 p-2 text-brand-charcoal/50 hover:text-brand-charcoal hover:bg-brand-bg rounded-full transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-start gap-5 mb-6">
                <div className="shrink-0">
                  <BiblicalSilhouette 
                    characterKey={activeModalArchetype.key}
                    dimension={activeModalArchetype.dimension}
                    gender={activeModalArchetype.gender}
                    name={activeModalArchetype.name}
                    size="md"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("text-xs font-bold px-3 py-0.5 rounded-full border", DIMENSION_LABELS[activeModalArchetype.dimension]?.color)}>
                      {DIMENSION_LABELS[activeModalArchetype.dimension]?.label}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-bg text-brand-charcoal/60">
                      {activeModalArchetype.testament === 'NT' ? 'Nouveau Testament' : 'Ancien Testament'}
                    </span>
                  </div>
                  <h2 className="font-display text-4xl text-brand-charcoal mb-0.5">
                    {activeModalArchetype.name}
                  </h2>
                  <p className="text-base font-display italic text-brand-sage">
                    {activeModalArchetype.title}
                  </p>
                </div>
              </div>

              {/* Biblical Verse */}
              <blockquote className="p-4 bg-brand-bg rounded-2xl border-l-4 border-brand-terracotta italic text-brand-charcoal/80 mb-6 text-sm">
                « {activeModalArchetype.biblicalVerse} »
              </blockquote>

              <p className="text-brand-charcoal/80 leading-relaxed mb-8 text-sm">
                {activeModalArchetype.description}
              </p>

              {/* Strengths & Growth Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-brand-ochre/15">
                  <h4 className="font-bold text-brand-charcoal text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-ochre" />
                    Forces motrices
                  </h4>
                  <ul className="space-y-2">
                    {activeModalArchetype.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-brand-charcoal/80 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-sage shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-brand-ochre/15">
                  <h4 className="font-bold text-brand-charcoal text-sm mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-terracotta" />
                    Axes de vigilance et de travail sur soi
                  </h4>
                  <ul className="space-y-2">
                    {activeModalArchetype.spiritualInvitations.map((w, i) => (
                      <li key={i} className="text-xs text-brand-charcoal/80 flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-brand-terracotta shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Vocation & Compatibility */}
              <div className="space-y-4 pt-6 border-t border-brand-ochre/15">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60 mb-2 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-brand-sage" />
                    Champs d'action et d'engagement :
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeModalArchetype.missionVocation.map((v, i) => (
                      <li key={i} className="text-xs bg-brand-bg px-3 py-2 rounded-lg text-brand-charcoal/80 font-medium">
                        • {v}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-ochre" />
                    Complémentarités relationnelles :
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalArchetype.compatibility.map((key) => {
                      const comp = ARCHETYPES[key];
                      return (
                        <span key={key} className="text-xs font-semibold px-3 py-1 bg-brand-bg text-brand-charcoal rounded-full border border-brand-ochre/20">
                          {comp ? comp.name : key}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t border-brand-ochre/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <p className="text-xs font-semibold text-brand-charcoal">
                    Vous vous reconnaissez dans le tempérament de {activeModalArchetype.name} ?
                  </p>
                  <p className="text-[11px] text-brand-charcoal/60">
                    Faites le test gratuit (3 minutes) pour évaluer votre affinité personnelle.
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setActiveModalArchetype(null)}
                    className="px-4 py-2.5 text-xs font-bold text-brand-charcoal/70 hover:text-brand-charcoal transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                  <Link
                    to="/test"
                    className="px-5 py-2.5 bg-brand-charcoal hover:bg-brand-terracotta text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0"
                  >
                    <Compass className="w-3.5 h-3.5 text-brand-ochre" />
                    <span>Faire le test gratuit</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharactersGallery;
