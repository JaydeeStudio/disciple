import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Heart, 
  Shield, 
  BookOpen, 
  Users, 
  Calculator, 
  ArrowRight, 
  Sparkles,
  Sliders,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  FileText,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { ARCHETYPES } from '../data/archetypes';

const PREVIEW_KEYS = ['jean', 'deborah', 'pierre', 'esther', 'david', 'ruth'];

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-terracotta/10 text-brand-terracotta font-bold text-xs uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test et référentiel des 36 archétypes bibliques</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl mb-6 leading-[1.08] text-brand-charcoal">
                Quel disciple <br />
                <span className="italic font-normal">suis-je ?</span>
              </h1>
              <p className="text-xl text-brand-sage max-w-lg mb-8 font-medium leading-relaxed">
                Découvrez comment votre tempérament naturel est un don façonné par Dieu pour le Corps de Christ.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Link
                  to="/test"
                  className="px-8 py-4 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 text-base"
                >
                  <Compass className="w-5 h-5" />
                  Commencer le test
                </Link>
                <Link
                  to="/personnages"
                  className="px-8 py-4 bg-white border-2 border-brand-charcoal/20 text-brand-charcoal hover:border-brand-charcoal hover:bg-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-sm"
                >
                  <BookOpen className="w-5 h-5 text-brand-ochre" />
                  Les 36 personnages
                </Link>
              </div>

              <Link
                to="/methodologie"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-charcoal/60 hover:text-brand-terracotta transition-colors pt-2"
              >
                <Calculator className="w-3.5 h-3.5 text-brand-sage" />
                Découvrir comment sont calculés les résultats
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex-1 hidden md:flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square bg-[#f5f1e8] rounded-3xl border-2 border-brand-ochre/15 flex flex-col items-center justify-center p-10 text-center shadow-lg">
                <div className="w-20 h-20 bg-brand-ochre/10 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-brand-ochre" />
                </div>
                <h3 className="font-display text-2xl text-brand-charcoal mb-2">36 figures bibliques</h3>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed max-w-xs mb-6">
                  De Moïse à l'Apôtre Jean, de Déborah à Marie de Béthanie. Découvrez votre famille spirituelle.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-white rounded-full border border-brand-ochre/20 text-brand-charcoal">
                    5 dimensions
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-white rounded-full border border-brand-ochre/20 text-brand-charcoal">
                    Ancien & Nouveau Testament
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-white rounded-full border border-brand-ochre/20 text-brand-charcoal">
                    Mesure de ressemblance
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-14 bg-white border-y border-brand-ochre/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <blockquote className="font-display text-lg md:text-xl mb-3 text-brand-charcoal italic leading-relaxed">
              « Tu es unique. Personne d'autre n'a ton visage, tes yeux, tes mains, ton histoire ou ton cœur. Dieu t’a façonné d'une manière unique pour que tu puisses l'aimer d'une manière que personne d'autre ne peut faire. »
            </blockquote>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-terracotta mb-4">
              — Henri Nouwen
            </p>
            <div className="w-10 h-0.5 bg-brand-terracotta mx-auto rounded-full" />
          </div>
        </div>
      </section>

      {/* Features : Identité, Lucidité, Complémentarité */}
      <section id="about" className="py-16 bg-brand-bg/40 border-b border-brand-ochre/10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Heart className="w-8 h-8 text-brand-terracotta" />}
              title="Identité"
              description="Arrêtez de vouloir être David quand Dieu vous a façonné davantage comme Nathan ou Barnabas. Embrassez votre tempérament."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-brand-sage" />}
              title="Lucidité"
              description="Identifiez vos forces et vos zones de vigilance pour marcher avec plus de lucidité et de dépendance à la grâce divine."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-brand-ochre" />}
              title="Complémentarité"
              description="Comprenez comment vous collaborez avec les autres archétypes pour bâtir ensemble le Corps de Christ harmonieusement."
            />
          </div>
        </div>
      </section>

      {/* Character Preview Grid */}
      <section className="py-20 bg-[#fdfaf5]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-brand-terracotta font-bold tracking-[0.2em] uppercase text-xs mb-2 block">
                Panorama
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-brand-charcoal">
                Quelques-uns des 36 archétypes bibliques
              </h2>
            </div>
            <Link 
              to="/personnages" 
              className="mt-4 md:mt-0 text-sm font-bold text-brand-charcoal hover:text-brand-terracotta flex items-center gap-1.5 transition-colors"
            >
              Voir la galerie complète des 36 personnages
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREVIEW_KEYS.map((key) => {
              const char = ARCHETYPES[key];
              if (!char) return null;
              return (
                <div 
                  key={key} 
                  className="bg-white p-6 rounded-2xl border border-brand-ochre/15 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-bg text-brand-charcoal/70">
                        {char.testament === 'NT' ? 'Nouv. Test.' : 'Ancien Test.'}
                      </span>
                      <span className="text-xs font-semibold text-brand-terracotta">
                        {char.gender === 'M' ? 'Homme' : 'Femme'}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-brand-charcoal mb-1">{char.name}</h3>
                    <p className="text-xs text-brand-sage italic mb-4 font-display">{char.title}</p>
                    <p className="text-xs text-brand-charcoal/70 leading-relaxed line-clamp-3 mb-4">
                      {char.description}
                    </p>
                  </div>
                  <Link
                    to={`/personnages?profil=${char.key}`}
                    className="text-xs font-bold text-brand-charcoal hover:text-brand-terracotta flex items-center gap-1 pt-4 border-t border-brand-ochre/10"
                  >
                    Découvrir ce profil
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community & Church Group Kit - Placé au cœur de l'accueil */}
      <section className="py-20 bg-white border-t border-brand-ochre/15">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-gradient-to-br from-[#fcfaf7] to-white rounded-3xl border border-brand-ochre/25 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-charcoal text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Users className="w-8 h-8 text-brand-ochre" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-ochre/15 text-brand-terracotta text-[10px] font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ressource offerte • Groupes & Équipes</span>
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-brand-charcoal mb-3 leading-tight">
                  Vous animez un groupe de maison ou une équipe pastorale&nbsp;?
                </h3>
                <p className="text-sm text-brand-charcoal/75 leading-relaxed max-w-xl">
                  Utilisez ce test pour votre groupe de maison, votre équipe de service ou votre conseil d'église. C'est un outil puissant pour révéler les forces de chacun, désamorcer les jugements de tempérament et aborder la question de l'identité en Dieu sans culpabilité.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <Link
                to="/kit-communaute"
                className="w-full sm:w-auto px-8 py-4 bg-brand-terracotta hover:bg-[#a0522f] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2.5 text-center group"
              >
                <span>Découvrir le Kit d'animation gratuit</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser Card - En dernière position */}
      <section className="py-16 bg-[#fdfaf5] border-t border-brand-ochre/15">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-brand-ochre/25 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-ochre/15 text-brand-charcoal text-[11px] font-bold uppercase tracking-wider mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-brand-terracotta" />
                <span>Centre d'aide & Questions</span>
              </span>
              <h3 className="font-display text-2xl text-brand-charcoal">
                Une question sur le test ou vos résultats ?
              </h3>
              <p className="text-xs sm:text-sm text-brand-charcoal/70 max-w-lg leading-relaxed">
                Consultez notre Foire Aux Questions complète : méthode de calcul, dossier de 36 pages, kit pour groupes et confidentialité.
              </p>
            </div>
            <Link
              to="/faq"
              className="px-6 py-3.5 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm shrink-0 flex items-center gap-2"
            >
              <span>Consulter la FAQ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-start text-left bg-white p-8 rounded-2xl border border-brand-ochre/15 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-brand-terracotta/40 cursor-default group">
    <div className="mb-6 transition-transform duration-300 group-hover:scale-110">{icon}</div>
    <h3 className="font-display text-2xl mb-3 text-brand-charcoal group-hover:text-brand-terracotta transition-colors">{title}</h3>
    <p className="text-brand-charcoal/70 leading-relaxed font-medium text-sm">{description}</p>
  </div>
);

export default Home;
