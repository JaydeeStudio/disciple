import React from 'react';
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
  CheckCircle2
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
      <section className="py-16 bg-white border-y border-brand-ochre/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-4xl mb-6 text-brand-charcoal italic leading-snug">
              "Dieu ne t’appelle pas à être une copie d’un autre disciple. Il t’invite à Le suivre avec le cœur qu’Il t’a donné."
            </h2>
            <div className="w-12 h-1 bg-brand-terracotta mx-auto rounded-full" />
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
                    to={`/resultats/${char.key}`}
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

      {/* 5 Dimensions Teaser */}
      <section className="py-20 bg-white border-t border-brand-ochre/10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-terracotta font-bold tracking-[0.2em] uppercase text-xs mb-2 block">
              Algorithme & Psychométrie
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-brand-charcoal mb-4">
              Comment sont calculés vos résultats ?
            </h2>
            <p className="text-brand-charcoal/70 text-sm leading-relaxed">
              Vos réponses à nos 20 questions projettent votre profil sur 5 axes spirituels essentiels. Votre score d'affinité est ensuite mesuré par distance euclidienne avec les 36 signatures bibliques.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {[
              { num: "Axe 1", label: "Intériorité vs Action" },
              { num: "Axe 2", label: "Structure vs Spontanéité" },
              { num: "Axe 3", label: "Vérité vs Grâce" },
              { num: "Axe 4", label: "Fidélité vs Leadership" },
              { num: "Axe 5", label: "Raison vs Révélation" },
            ].map((axe, i) => (
              <div key={i} className="p-4 bg-brand-bg/70 rounded-xl border border-brand-ochre/15 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta block mb-1">
                  {axe.num}
                </span>
                <p className="font-bold text-xs text-brand-charcoal">{axe.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/methodologie"
              className="px-6 py-3 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              Consulter la méthodologie complète
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="py-20 bg-brand-bg/40 border-t border-brand-ochre/10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-12">
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
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-start text-left bg-white p-8 rounded-2xl border border-brand-ochre/15 shadow-sm">
    <div className="mb-6">{icon}</div>
    <h3 className="font-display text-2xl mb-3 text-brand-charcoal">{title}</h3>
    <p className="text-brand-charcoal/70 leading-relaxed font-medium text-sm">{description}</p>
  </div>
);

export default Home;
