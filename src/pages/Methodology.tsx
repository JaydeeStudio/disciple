import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { DIMENSIONS_INFO } from '../data/questions';
import { 
  Compass, 
  BookOpen, 
  Heart, 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  Calculator, 
  Sliders, 
  Layers, 
  HelpCircle,
  ChevronDown,
  MessageCircleQuestion,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: "Ce test a-t-il une valeur dogmatique ou prophétique ?",
    answer: "Non. Ce test est un instrument d'introspection et de discernement pastoral, à l'image des tests de personnalité (MBTI, Ennéagramme), mais réancré dans les récits des Écritures et la théologie paulinienne des dons (1 Corinthiens 12). Il ne prétend en aucun cas remplacer l'écoute de la Parole de Dieu, la prière personnelle ni le discernement au sein de votre communauté locale."
  },
  {
    question: "Comment les 36 personnages ont-ils été sélectionnés et étalonnés ?",
    answer: "Les 36 figures ont été rigoureusement choisies pour représenter la diversité du peuple de Dieu : 18 hommes et 18 femmes, répartis équitablement entre l'Ancien et le Nouveau Testament. Chaque profil a été modélisé à partir de ses réactions documentées dans la Bible face au conflit, à la mission, à l'injustice, au doute et à la prière."
  },
  {
    question: "Mon profil spirituel peut-il évoluer avec les années ?",
    answer: "Oui, absolument. Même si notre tempérament naturel comporte un socle stable, les saisons de vie, les épreuves et surtout l'action sanctifiante de l'Esprit Saint transforment notre cœur. Un disciple impulsif comme Pierre mûrit avec le temps en un pasteur plein de patience et de douceur. Vous pouvez tout à fait refaire le test au fil de votre parcours."
  },
  {
    question: "Pourquoi mesurer 5 dimensions plutôt que les 4 tempéraments traditionnels (sanguin, colérique...) ?",
    answer: "Les quatre tempéraments de l'Antiquité (colérique, sanguin, flegmatique, mélancolique) réduisent souvent l'être humain à des stéréotypes réducteurs. Notre modèle s'inspire de la psychométrie contemporaine (modèle des cinq grands facteurs) adaptée aux dynamiques de la foi : équilibre entre action et prière, vérité et grâce, ordre et inspiration, audace et fidélité discrète."
  },
  {
    question: "Que faire si je ne me reconnais pas totalement dans mon archétype dominant ?",
    answer: "C'est naturel et fréquent : aucun être humain ne se résume à une seule étiquette. Nous vous invitons à consulter vos archétypes secondaires et vos 5 jauges de dimensions. Très souvent, un croyant est une alliance féconde de deux sensibilités (par exemple 60 % l'audace de Pierre et 40 % la bienveillance consolatrice de Barnabas)."
  },
  {
    question: "Comment utiliser ces résultats dans un groupe de maison ou une équipe de service ?",
    answer: "C'est un support remarquable pour désamorcer les incompréhensions fraternelles. Il aide à comprendre pourquoi une personne portée sur la vérité et les principes peut involontairement blesser un profil centré sur l'accueil et la grâce, et montre comment ces deux frères ou sœurs ont besoin l'un de l'autre pour construire une communauté équilibrée."
  }
];

const Methodology: React.FC = () => {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-terracotta font-bold tracking-[0.2em] uppercase text-xs mb-3 block">
            Transparence et discernement
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-brand-charcoal mb-6">
            Comment sont calculés vos résultats ?
          </h1>
          <p className="text-brand-sage text-lg font-medium leading-relaxed">
            Une approche transparente alliant fidélité aux Écritures, psychométrie des tempéraments et mesure bienveillante de votre sensibilité spirituelle.
          </p>
        </div>

        {/* 3 Pillars Overview - No numbers, warm titles, popularized phrasing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-brand-ochre/15 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl text-brand-charcoal mb-3">
              Ancrage scripturaire
            </h3>
            <p className="text-brand-charcoal/70 text-sm leading-relaxed">
              Inspiré de l'enseignement biblique sur le Corps de Christ (1 Corinthiens 12, Romains 12) : Dieu n'a pas créé des croyants identiques, mais une diversité de dons et de sensibilités indispensables les uns aux autres.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-ochre/15 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 mb-6">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl text-brand-charcoal mb-3">
              5 équilibres de tempérament
            </h3>
            <p className="text-brand-charcoal/70 text-sm leading-relaxed">
              Le test ne vous enferme pas dans une case rigide : il évalue avec nuance où se situe votre cœur entre 5 grandes polarités complémentaires observées dans la Bible.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-ochre/15 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mb-6">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl text-brand-charcoal mb-3">
              Calcul de votre ressemblance
            </h3>
            <p className="text-brand-charcoal/70 text-sm leading-relaxed">
              À partir de vos 20 choix concrets, nous mesurons à quel point votre sensibilité naturelle s'aligne avec les 36 figures bibliques répertoriées, pour révéler celle qui partage votre élan spirituel le plus profond.
            </p>
          </div>
        </div>

        {/* Section 1: The 5 Dimensions - Standard French sentence case */}
        <section className="bg-white rounded-3xl border border-brand-ochre/15 p-8 md:p-12 mb-16 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-6 h-6 text-brand-terracotta" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
              Le modèle des tempéraments
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-brand-charcoal mb-4">
            Les 5 dimensions spirituelles évaluées
          </h2>
          <p className="text-brand-charcoal/70 text-base mb-10 leading-relaxed">
            Chaque question du test vous place face à une situation concrète (prière, service, réaction face à l'injustice, prise de décision). Vos choix nuancent votre positionnement sur cinq équilibres spirituels majeurs :
          </p>

          <div className="space-y-8">
            {Object.values(DIMENSIONS_INFO).map((dim, idx) => (
              <div key={dim.key} className="p-6 rounded-2xl bg-brand-bg/60 border border-brand-ochre/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 bg-brand-charcoal text-white rounded-full">
                    Axe {idx + 1}
                  </span>
                  <h3 className="font-display text-xl text-brand-charcoal">{dim.label}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Left Pole */}
                  <div className="bg-white p-5 rounded-xl border border-brand-ochre/15">
                    <span className="text-xs font-bold text-brand-terracotta uppercase tracking-wider block mb-1">
                      Pôle gauche
                    </span>
                    <h4 className="font-bold text-brand-charcoal mb-2">{dim.negativePole.label}</h4>
                    <p className="text-xs text-brand-charcoal/70 leading-relaxed mb-3">
                      {dim.negativePole.description}
                    </p>
                    <div className="text-[11px] font-semibold text-brand-sage bg-brand-bg px-2.5 py-1 rounded inline-block">
                      Exemples bibliques : {dim.negativePole.biblicalArchetypes}
                    </div>
                  </div>

                  {/* Right Pole */}
                  <div className="bg-white p-5 rounded-xl border border-brand-ochre/15">
                    <span className="text-xs font-bold text-brand-sage uppercase tracking-wider block mb-1">
                      Pôle droit
                    </span>
                    <h4 className="font-bold text-brand-charcoal mb-2">{dim.positivePole.label}</h4>
                    <p className="text-xs text-brand-charcoal/70 leading-relaxed mb-3">
                      {dim.positivePole.description}
                    </p>
                    <div className="text-[11px] font-semibold text-brand-sage bg-brand-bg px-2.5 py-1 rounded inline-block">
                      Exemples bibliques : {dim.positivePole.biblicalArchetypes}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Popularized Explanation of the Calculation */}
        <section className="bg-white rounded-3xl border border-brand-ochre/15 p-8 md:p-12 mb-16 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-brand-sage" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-sage">
              Comment fonctionne le calcul
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-brand-charcoal mb-4">
            De vos réponses à votre archétype : en 4 étapes simples
          </h2>
          
          <div className="p-6 bg-[#fcfaf7] rounded-2xl border border-brand-ochre/20 mb-8">
            <h3 className="font-bold text-brand-charcoal text-base mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-terracotta" />
              Pourquoi ce calcul existe-t-il ?
            </h3>
            <p className="text-brand-charcoal/80 text-sm leading-relaxed">
              Ce calcul a un rôle très précis : <strong>éviter de vous coller une étiquette arbitraire</strong> ou de vous enfermer dans un stéréotype. Plutôt que de dire « vous êtes ceci et pas cela », l'algorithme respecte la complexité de votre cœur en mesurant vos élans spontanés sur 5 dimensions, puis en cherchant le personnage biblique dont la trajectoire dans les Écritures est la plus proche de la vôtre.
            </p>
          </div>

          <div className="space-y-6 text-brand-charcoal/80 leading-relaxed">
            <div className="flex gap-5 items-start bg-brand-bg/40 p-5 rounded-2xl border border-brand-ochre/10">
              <div className="w-10 h-10 rounded-xl bg-brand-charcoal text-white font-display font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-base text-brand-charcoal mb-1">
                  20 situations concrètes du quotidien
                </h4>
                <p className="text-sm">
                  Chaque question met en scène un dilemme chrétien réel (comment vous priez spontanément, comment vous réagissez face à une injustice ou une crise d'équipe). Aucune réponse n'est « meilleure » qu'une autre : chacune exprime un don légitime.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start bg-brand-bg/40 p-5 rounded-2xl border border-brand-ochre/10">
              <div className="w-10 h-10 rounded-xl bg-brand-charcoal text-white font-display font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-base text-brand-charcoal mb-1">
                  Le dessin de vos 5 équilibres spirituels
                </h4>
                <p className="text-sm">
                  À la fin du questionnaire, vos réponses composent votre empreinte spirituelle unique : êtes-vous davantage tourné vers l'action ou la prière silencieuse ? Porté par la droiture de la vérité ou l'accueil inconditionnel de la grâce ? Structuré ou intuitif ?
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start bg-brand-bg/40 p-5 rounded-2xl border border-brand-ochre/10">
              <div className="w-10 h-10 rounded-xl bg-brand-charcoal text-white font-display font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-base text-brand-charcoal mb-1">
                  La comparaison avec les 36 figures bibliques
                </h4>
                <p className="text-sm">
                  Votre profil est comparé aux profils types des 36 personnages de l'Ancien et du Nouveau Testament, modélisés d'après leurs récits bibliques. Le système identifie mathématiquement le personnage dont le cœur résonne le plus fidèlement avec le vôtre.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start bg-brand-bg/40 p-5 rounded-2xl border border-brand-ochre/10">
              <div className="w-10 h-10 rounded-xl bg-brand-charcoal text-white font-display font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold text-base text-brand-charcoal mb-1">
                  Votre archétype principal, votre pendant biblique et vos alliés
                </h4>
                <p className="text-sm">
                  Vous obtenez votre disciple dominant avec son taux de ressemblance (ex: 92%), mais aussi votre alter ego biblique de l'autre sexe (ex: Déborah pour Pierre, ou Marie de Béthanie pour Jean), ainsi que les tempéraments avec lesquels vous formez une équipe féconde.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Ethical & Pastoral Guidance - French sentence case */}
        <section className="bg-[#fcfaf7] rounded-3xl border border-brand-ochre/20 p-8 md:p-12 mb-16 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-brand-terracotta" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
              Éthique et discernement pastoral
            </span>
          </div>
          <h2 className="font-display text-3xl text-brand-charcoal mb-4">
            Ce que ce test est — et ce qu'il n'est pas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-brand-charcoal/80 leading-relaxed mt-6">
            <div className="bg-white p-6 rounded-2xl border border-brand-ochre/15">
              <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Ce que ce test est :
              </h4>
              <ul className="space-y-2 text-xs">
                <li>• Un miroir bienveillant pour apprécier votre sensibilité naturelle.</li>
                <li>• Un outil d'humilité pour reconnaître vos zones de vigilance et de fatigue.</li>
                <li>• Une invitation à admirer la richesse et la complémentarité du Corps de Christ.</li>
                <li>• Un tremplin pour la prière et la croissance dans la sainteté.</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-ochre/15">
              <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-rose-600 shrink-0" />
                Ce que ce test n'est pas :
              </h4>
              <ul className="space-y-2 text-xs">
                <li>• Une astrologie chrétienne ou un horoscope spirituel figé.</li>
                <li>• Une excuse pour justifier des péchés ou des manquements (« C'est mon tempérament »).</li>
                <li>• Un classement de supériorité spirituelle (aucun apôtre n'est supérieur à un autre).</li>
                <li>• Une barrière empêchant le Saint-Esprit de vous transformer au-delà de vos limites.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Interactive FAQ Section */}
        <section className="bg-white rounded-3xl border border-brand-ochre/15 p-8 md:p-12 mb-16 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircleQuestion className="w-6 h-6 text-brand-ochre" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-ochre">
              Foire aux questions
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-brand-charcoal mb-4">
            Questions fréquentes sur la méthode et la fiabilité
          </h2>
          <p className="text-brand-charcoal/70 text-base mb-8 leading-relaxed">
            Tout ce que vous souhaitez savoir sur la construction du test, l'utilisation pastorale et l'interprétation des résultats.
          </p>

          <div className="space-y-4">
            {FAQ_LIST.map((faq, index) => {
              const isOpen = openFAQIndex === index;
              return (
                <div 
                  key={index} 
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    isOpen ? "border-brand-terracotta/40 bg-[#fdfaf5]" : "border-brand-ochre/15 bg-white hover:border-brand-ochre/30"
                  )}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-medium text-lg text-brand-charcoal"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={cn("w-5 h-5 text-brand-terracotta shrink-0 transition-transform duration-300", isOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-sm text-brand-charcoal/75 leading-relaxed border-t border-brand-ochre/10">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center bg-white border border-brand-ochre/15 p-12 rounded-[2.5rem] shadow-sm">
          <h3 className="font-display text-3xl text-brand-charcoal mb-4">
            Prêt(e) à découvrir votre tempérament spirituel ?
          </h3>
          <p className="text-brand-charcoal/70 max-w-xl mx-auto mb-8 font-medium">
            20 questions immersives pour révéler quel disciple ou figure biblique résonne le plus avec votre cœur.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/test"
              className="px-8 py-4 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5" />
              Commencer le test maintenant
            </Link>
            <Link
              to="/personnages"
              className="px-8 py-4 bg-brand-bg hover:bg-brand-ochre/20 text-brand-charcoal font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Explorer les 36 personnages
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Methodology;
