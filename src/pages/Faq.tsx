import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  X, 
  ChevronDown, 
  HelpCircle, 
  FileText, 
  Smartphone, 
  ShieldCheck, 
  Shield, 
  BookOpen, 
  Calculator, 
  Users, 
  Sparkles,
  ArrowRight,
  Compass
} from 'lucide-react';

export type FaqCategory = 'all' | 'test' | 'guide' | 'group' | 'privacy';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string | React.ReactNode;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'valeur-dogmatique',
    category: 'test',
    question: "Ce test a-t-il une valeur dogmatique ou prophétique ?",
    answer: "Non. Ce test est un instrument d'introspection et de discernement pastoral, à l'image des tests de personnalité (MBTI, Ennéagramme), mais réancré dans les récits des Écritures et la théologie paulinienne des dons (1 Corinthiens 12). Il ne prétend en aucun cas remplacer l'écoute de la Parole de Dieu, la prière personnelle ni le discernement au sein de votre communauté locale."
  },
  {
    id: 'selection-36-figures',
    category: 'test',
    question: "Comment les 36 personnages ont-ils été sélectionnés et étalonnés ?",
    answer: "Les 36 figures ont été rigoureusement choisies pour représenter la diversité du peuple de Dieu : 18 hommes et 18 femmes, répartis équitablement entre l'Ancien et le Nouveau Testament. Chaque profil a été modélisé à partir de ses réactions documentées dans la Bible face au conflit, à la mission, à l'injustice, au doute et à la prière."
  },
  {
    id: 'evolution-profil',
    category: 'test',
    question: "Mon profil de disciple peut-il évoluer avec les années ?",
    answer: "Oui, absolument. Même si notre tempérament naturel comporte un socle stable, les saisons de vie, les épreuves et surtout l'action sanctifiante de l'Esprit Saint transforment notre cœur. Un disciple impulsif comme Pierre mûrit avec le temps en un pasteur plein de patience et de douceur. Vous pouvez tout à fait refaire le test au fil de votre parcours."
  },
  {
    id: 'cinq-dimensions',
    category: 'test',
    question: "Pourquoi mesurer 5 dimensions plutôt que les 4 tempéraments traditionnels (sanguin, colérique...) ?",
    answer: "Les quatre tempéraments de l'Antiquité réduisent souvent l'être humain à des stéréotypes simplistes. Notre modèle s'inspire de la psychométrie contemporaine (modèle des cinq grands facteurs) adaptée aux dynamiques de la foi : équilibre entre action et intériorité, vérité et grâce, ordre et inspiration, audace et fidélité discrète."
  },
  {
    id: 'archetype-secondaire',
    category: 'test',
    question: "Que faire si je ne me reconnais pas totalement dans mon archétype dominant ?",
    answer: "C'est naturel et fréquent : aucun être humain ne se résume à une seule étiquette. Nous vous invitons à consulter vos archétypes secondaires et vos 5 jauges de dimensions. Très souvent, un croyant est une alliance féconde de deux sensibilités (par exemple 60 % l'audace de Pierre et 40 % la bienveillance consolatrice de Barnabas)."
  },
  {
    id: 'kit-groupes-usage',
    category: 'group',
    question: "Comment utiliser ces résultats dans un groupe de maison ou une équipe d'église ?",
    answer: "C'est un support remarquable pour désamorcer les jugements et valoriser la complémentarité des charismes. Notre Kit d'animation complet de 45 minutes fournit : la Fiche d'animation clé en main, la Matrice murale A3 imprimable, le Guide des binômes & frictions et le Diagnostic croisé d'équipe interactif pour révéler l'ADN collectif et les angles morts de votre communauté."
  },
  {
    id: 'kit-groupes-cout',
    category: 'group',
    question: "Le Kit d'animation de groupe est-il gratuit ?",
    answer: "Oui ! Tous les documents d'animation (Fiche 45 min, Matrice murale A3, Guide des binômes, outil de diagnostic croisé en ligne et synthèse d'équipe) sont mis à disposition gratuitement pour tous les responsables d'église, pasteurs et animateurs de groupes."
  },
  {
    id: 'commande-differee',
    category: 'guide',
    question: "Après avoir obtenu ma synthèse gratuite, comment acquérir le dossier complet même plusieurs semaines après ?",
    answer: "C'est très simple et immédiat : ouvrez le document PDF de votre synthèse gratuite téléchargée lors du test, puis cliquez sur le bouton « Commander le dossier complet » situé en 3e page (ou sur le lien de partage personnalisé que vous vous êtes envoyé). Ce lien contient mathématiquement vos 5 coordonnées de profil : notre système reconstitue instantanément votre analyse complète et calibre fidèlement votre dossier personnel de 36 pages, sans obliger à créer un compte ni mot de passe."
  },
  {
    id: 'multi-appareils',
    category: 'guide',
    question: "Puis-je commander mon dossier complet depuis un autre appareil (ordinateur, tablette) que celui où j'ai passé le test ?",
    answer: "Oui, parfaitement ! Grâce à notre technologie d'URL intelligente encodée, vos résultats ne sont pas prisonniers de la mémoire d'un seul téléphone. Si vous avez passé le test sur smartphone pendant une rencontre et préférez commander votre dossier de 36 pages confortablement depuis votre ordinateur, transférez simplement votre synthèse PDF ou votre lien de partage personnel (par e-mail ou WhatsApp) : en un clic sur le lien, vos scores exacts sont réinjectés et votre dossier sur mesure est prêt."
  },
  {
    id: 'securite-etalonnage',
    category: 'guide',
    question: "Pourquoi le paiement est-il suspendu si j'accède directement à une page sans avoir passé le test ?",
    answer: "Pour protéger votre démarche et vous garantir un document 100% personnalisé. Le Dossier d'approfondissement de 36 pages n'est pas un livret générique vendu au hasard : il est calculé de manière unique à partir de vos réponses (roue polaire des 8 énergies, matrice d'évitement, binômes fraternels et cartographie). Si vous arrivez directement sur une page sans étalonnage, le paiement est bloqué afin de ne jamais vous faire payer un document non calibré. Passez simplement le test gratuit en 5 minutes pour étalonner votre profil."
  },
  {
    id: 'contenu-dossier-36',
    category: 'guide',
    question: "Que contient exactement le Dossier d'approfondissement personnel de 36 pages (19 €) ?",
    answer: "Ce livret exhaustif haute définition est entièrement personnalisé à partir de vos 30 réponses. Il comprend : votre roue radar polaire des 8 énergies spirituelles, votre dynamique sous stress et vos évitements instinctifs, l'analyse approfondie de vos archétypes secondaires, vos 3 binômes d'alliance fraternelle (avec qui vous vous complétez le mieux et comment désamorcer les frictions), votre feuille de route spirituelle sur mesure et votre planche bilan cartographique."
  },
  {
    id: 'confidentialite-rgpd',
    category: 'privacy',
    question: "Mes réponses et mes données sont-elles conservées ou revendues ?",
    answer: "Non, jamais. Le test peut être réalisé de façon 100% anonyme sans aucune création de compte obligatoire. Vos scores sont calculés côté client et encodés dans vos propres liens et synthèses PDF pour vous garantir une totale confidentialité. Le site ne contient aucun traceur publicitaire."
  }
];

const CATEGORIES: { key: FaqCategory; label: string }[] = [
  { key: 'all', label: 'Toutes les questions' },
  { key: 'test', label: 'Le Test & Résultats' },
  { key: 'group', label: 'Kit Groupes & Églises' },
  { key: 'guide', label: 'Dossier 36 pages & Commande' },
  { key: 'privacy', label: 'Confidentialité' }
];

const Faq: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  // Initial state: no question open by default as requested
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQ_DATA.filter(item => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      const questionMatch = item.question.toLowerCase().includes(q);
      const answerMatch = typeof item.answer === 'string' && item.answer.toLowerCase().includes(q);
      return questionMatch || answerMatch;
    });
  }, [search, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Simple & Classic Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-ochre/15 text-brand-charcoal text-[11px] font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-brand-terracotta" />
            <span>Centre d'aide & Informations</span>
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-brand-charcoal mb-4">
            Foire Aux Questions
          </h1>
          <p className="text-sm sm:text-base text-brand-charcoal/70 leading-relaxed">
            Toutes les réponses à vos questions sur le test des archétypes bibliques, la démarche, le dossier complet et l'animation de groupe.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-ochre/25 shadow-sm mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-brand-charcoal/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une question ou un mot-clé (ex : PDF, commande, groupe, méthode...)"
              className="w-full pl-12 pr-10 py-3 bg-brand-bg/60 border border-brand-ochre/20 rounded-xl text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:outline-none focus:border-brand-terracotta transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal p-1 cursor-pointer"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-ochre/10">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-brand-charcoal text-white shadow-xs'
                    : 'bg-brand-bg text-brand-charcoal/70 hover:bg-brand-ochre/15'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {search && (
            <div className="text-xs text-brand-charcoal/60 pt-1">
              {filteredFaqs.length} résultat{filteredFaqs.length > 1 ? 's' : ''} pour « {search} »
            </div>
          )}
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-brand-ochre/20 bg-white transition-all overflow-hidden shadow-2xs hover:border-brand-ochre/40"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-brand-bg/40 transition-colors"
                  >
                    <span className="font-display font-bold text-base sm:text-lg text-brand-charcoal pr-2">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-brand-charcoal/50 shrink-0 transition-transform duration-300 mt-1 sm:mt-0 ${
                        isOpen ? 'rotate-180 text-brand-terracotta' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-brand-charcoal/80 leading-relaxed border-t border-brand-ochre/10 bg-brand-bg/20">
                      {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-brand-ochre/30 p-8 space-y-3">
              <p className="text-brand-charcoal/70 text-sm">
                Aucune question ne correspond à votre recherche « <strong>{search}</strong> ».
              </p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                className="px-4 py-2 bg-brand-charcoal text-white rounded-xl text-xs font-bold hover:bg-brand-terracotta transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Footer Support Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-white border border-brand-ochre/25 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-lg text-brand-charcoal">
              Vous n'avez pas encore passé le test ?
            </h3>
            <p className="text-xs sm:text-sm text-brand-charcoal/70 max-w-md">
              Découvrez votre profil dominant parmi les 36 disciples bibliques en seulement 5 minutes (20 questions rapides).
            </p>
          </div>
          <Link
            to="/test"
            className="w-full sm:w-auto px-6 py-3.5 bg-brand-terracotta hover:bg-[#a0522f] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 text-center"
          >
            <Compass className="w-4 h-4 text-brand-ochre" />
            <span>Passer le test gratuit</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Faq;
