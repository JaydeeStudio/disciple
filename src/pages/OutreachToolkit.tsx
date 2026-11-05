import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Video, 
  FileText, 
  Mail, 
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react';

interface ScriptItem {
  id: string;
  category: 'whatsapp' | 'social' | 'church' | 'video';
  title: string;
  subtitle: string;
  content: string;
  tip?: string;
}

export const OutreachToolkit: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'whatsapp' | 'social' | 'church' | 'video'>('all');

  const scripts: ScriptItem[] = [
    {
      id: 'wa-perso',
      category: 'whatsapp',
      title: 'WhatsApp personnel (amis & famille)',
      subtitle: 'Partage spontané et bienveillant après avoir fait le test',
      content: `Hello ! Je viens de tester un truc chrétien super bien fait : « Quel disciple suis-je ? ». C'est gratuit, sans inscription pénible, et ça analyse ton tempérament spirituel par rapport aux 36 figures de la Bible (moi je suis tombé sur Jean le disciple bien-aimé à 94% !).
Fais-le en 4 minutes, je suis curieux de voir qui tu es : https://discipledejesus.netlify.app/test`,
      tip: 'Remplacez par votre vrai résultat pour donner encore plus envie à votre proche de comparer !'
    },
    {
      id: 'wa-couple',
      category: 'whatsapp',
      title: 'WhatsApp défi de couple ou binôme',
      subtitle: 'L\'accroche "Complémentarité et contraste"',
      content: `Dis, tu prends 4 minutes pour faire ce test biblique ? J'aimerais qu'on compare nos profils de disciples pour voir nos complémentarités dans notre foi : https://discipledejesus.netlify.app/test`,
      tip: 'Idéal pour susciter une discussion intime et profonde en soirée.'
    },
    {
      id: 'wa-groupe',
      category: 'whatsapp',
      title: 'Groupe WhatsApp de prière / jeunes',
      subtitle: 'Proposition d\'activité conviviale pour le groupe',
      content: `Salut à tous ! 👋 Je vous partage cette pépite : un test de discernement biblique gratuit qui calcule notre affinité avec les disciples et figures de l'Évangile.
Ça prend 4 minutes sur smartphone : https://discipledejesus.netlify.app/test
On pourrait chacun poster son disciple ici et en parler à notre prochaine réunion ?`,
      tip: 'Idéal le dimanche soir ou la veille d\'un rassemblement.'
    },
    {
      id: 'insta-carrousel',
      category: 'social',
      title: 'Post Instagram / Facebook : « Pierre vs Thomas »',
      subtitle: 'Accroche réflexive sur la comparaison spirituelle',
      content: `Et si Dieu n'attendait pas de vous que vous soyez quelqu'un d'autre ?

Dans les Évangiles, Pierre agit avec fougue avant de réfléchir.
Thomas doute, questionne et veut comprendre avant d'adhérer.
Jean médite et demeure dans le silence.
Marthe sert avec efficacité pendant que Marie écoute aux pieds du Maître.

Aucun d'entre eux n'a été appelé à devenir la copie conforme de son voisin. Chacun incarne une facette unique de l'amour divin.

👉 Quel est votre tempérament spirituel dominant ?
Un test gratuit de 20 questions a été développé pour discerner votre résonance avec 36 figures de la Bible :
Lien dans la bio ou sur https://discipledejesus.netlify.app

#VieChretienne #Foi #Bible #Disciples #Discernement #Prière #Jesus`,
      tip: 'À poster avec une image épurée ou un carrousel comparant 2 ou 3 disciples.'
    },
    {
      id: 'insta-story',
      category: 'social',
      title: 'Story Instagram avec sticker sondage',
      subtitle: 'Format rapide pour engager vos abonnés en story',
      content: `Sticker Sondage : « Si vous deviez deviner votre profil de disciple : »
Option 1 : Plus Pierre (l'action & le zèle) ⚡
Option 2 : Plus Jean (l'intériorité & l'amour) 🕊️

(J'ai fait le test complet de 4 min sur discipledejesus.netlify.app et les résultats sont bluffants de précision ! Swipe up / Lien en sticker)`,
      tip: 'Utilisez le sticker « Lien » d\'Instagram pointant vers https://discipledejesus.netlify.app'
    },
    {
      id: 'fb-groupes',
      category: 'social',
      title: 'Groupes Facebook chrétiens & d\'entraide',
      subtitle: 'Post humble sollicitant l\'avis bienveillant de la communauté',
      content: `Bonjour à tous chers frères et sœurs,
Avec une petite équipe passionnée par les Écritures, nous avons développé un outil 100% gratuit, sans publicité et respectueux des données : « Quel disciple suis-je ? ».
À partir de 20 questions sur nos réactions intérieures et relationnelles, il calcule l'affinité avec 36 personnages de l'Ancien et du Nouveau Testament pour encourager chacun dans sa vocation unique.

Le test est accessible ici : https://discipledejesus.netlify.app
Nous serions infiniment reconnaissants d'avoir vos retours fraternels et vos impressions ! Que le Seigneur vous bénisse.`,
      tip: 'Ne postez pas comme un publicitaire, mais comme un serviteur demandant un retour fraternel.'
    },
    {
      id: 'bulletin-eglise',
      category: 'church',
      title: 'Encart pour feuille d\'annonces paroissiale',
      subtitle: 'Format court et officiel pour les bulletins d\'église locaux',
      content: `INITIATIVE / DISCERNEMENT : « Quel disciple suis-je ? »
Découvrez votre profil biblique dominant parmi 36 figures des Écritures grâce à un questionnaire gratuit de 4 minutes, pensé pour valoriser la diversité des dons dans l'Église.
Rendez-vous sur : https://discipledejesus.netlify.app`,
      tip: 'À transmettre au secrétariat paroissial le mardi pour la feuille du dimanche.'
    },
    {
      id: 'video-tiktok-1',
      category: 'video',
      title: 'Idée Vidéo 1 (Reels / TikTok) : Le test miroir',
      subtitle: 'Format face-caméra de 30 secondes (0 € de matériel)',
      content: `[Face caméra, ton calme et complice]
« Tu t'es déjà senti coupable de ne pas prier comme les autres ?
De ne pas avoir la fougue d'un évangéliste de rue, ou au contraire d'avoir trop de doutes pour te sentir "légitime" ?
Dans les Évangiles, Jésus a choisi un zélote, un collecteur d'impôts, un intellectuel sceptique et des pêcheurs impulsifs.
Il y a un test gratuit en ligne qui s'appelle "Quel disciple suis-je ?" qui compare ta façon de fonctionner avec 36 figures de la Bible.
J'ai fait le test et mon résultat m'a tellement apaisé. Le lien est sur discipledejesus.netlify.app, teste-le et dis-moi en commentaire quel disciple tu es ! »`,
      tip: 'Filmez à la lumière naturelle avec vos écouteurs pour un bon son.'
    },
    {
      id: 'video-tiktok-2',
      category: 'video',
      title: 'Idée Vidéo 2 : Le quiz express en 3 questions',
      subtitle: 'Format interactif qui pousse l\'utilisateur à commenter',
      content: `[Visuel dynamique ou face cam]
« 3 questions pour savoir si tu es plutôt Pierre, Thomas ou Jean :
1. Face à une injustice, tu agis immédiatement ou tu prends du recul pour analyser ?
2. Face à un doute de foi, tu as besoin de preuves concrètes ou tu t'en remets au silence ?
3. Ton langage de l'amour chrétien : le service concret ou l'écoute au pied de la croix ?
Si tu veux le résultat mathématique exact parmi 36 personnages bibliques, le test est 100% gratuit sur discipledejesus.netlify.app. »`,
      tip: 'Mettez le texte en sous-titres animés au centre de la vidéo.'
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredScripts = activeTab === 'all' 
    ? scripts 
    : scripts.filter(s => s.category === activeTab);

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-charcoal/70 hover:text-brand-terracotta transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-ochre/20 shadow-sm mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-ochre/15 text-brand-terracotta text-xs font-bold uppercase tracking-wider mb-5">
            <Share2 className="w-4 h-4 text-brand-terracotta" />
            <span>Boîte à Outils de Croissance Gratuite</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-brand-charcoal mb-4">
            Scripts & Modèles de Diffusion
          </h1>
          <p className="text-base sm:text-lg text-brand-charcoal/70 max-w-2xl mx-auto leading-relaxed mb-6">
            Tous les textes prêts à copier-coller pour faire connaître la plateforme à coût zéro : messages WhatsApp personnels, posts Instagram, annonces d'églises et idées de vidéos.
          </p>
        </div>

        {/* Onglets Filtres */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-brand-charcoal text-white shadow-sm' 
                : 'bg-white text-brand-charcoal/70 hover:bg-brand-bg border border-brand-ochre/20'
            }`}
          >
            Tous les formats ({scripts.length})
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'whatsapp' 
                ? 'bg-[#25D366] text-white shadow-sm' 
                : 'bg-white text-brand-charcoal/70 hover:bg-brand-bg border border-brand-ochre/20'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp & SMS</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'social' 
                ? 'bg-brand-terracotta text-white shadow-sm' 
                : 'bg-white text-brand-charcoal/70 hover:bg-brand-bg border border-brand-ochre/20'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Réseaux sociaux</span>
          </button>
          <button
            onClick={() => setActiveTab('church')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'church' 
                ? 'bg-brand-sage text-white shadow-sm' 
                : 'bg-white text-brand-charcoal/70 hover:bg-brand-bg border border-brand-ochre/20'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Feuilles d'annonces & Églises</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'video' 
                ? 'bg-brand-ochre text-white shadow-sm' 
                : 'bg-white text-brand-charcoal/70 hover:bg-brand-bg border border-brand-ochre/20'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Idées vidéos (TikTok/Reels)</span>
          </button>
        </div>

        {/* Liste des Scripts */}
        <div className="space-y-6 mb-12">
          {filteredScripts.map((script) => (
            <div 
              key={script.id}
              className="bg-white rounded-2xl border border-brand-ochre/20 p-6 sm:p-7 shadow-sm transition-all hover:border-brand-ochre/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display text-xl text-brand-charcoal mb-1">
                    {script.title}
                  </h3>
                  <p className="text-xs text-brand-charcoal/60">
                    {script.subtitle}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(script.id, script.content)}
                  className="px-4 py-2 bg-brand-charcoal hover:bg-brand-terracotta text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-center cursor-pointer shrink-0"
                >
                  {copiedId === script.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copié dans le presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le texte</span>
                    </>
                  )}
                </button>
              </div>

              {/* Contenu du texte à copier */}
              <div className="bg-brand-bg/60 rounded-xl p-4 sm:p-5 border border-brand-ochre/15 text-xs sm:text-sm text-brand-charcoal leading-relaxed whitespace-pre-line font-mono mb-3">
                {script.content}
              </div>

              {/* Conseil d'utilisation */}
              {script.tip && (
                <div className="flex items-center gap-2 text-[11px] text-brand-sage font-medium italic">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-brand-ochre" />
                  <span>Conseil d'impact : {script.tip}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Lien vers Kit Groupes */}
        <div className="bg-[#fdfaf5] border border-brand-ochre/30 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="font-display text-2xl text-brand-charcoal mb-2">
              Vous animez une communauté ou un groupe ?
            </h3>
            <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed max-w-xl">
              Découvrez notre déroulé complet de 45 minutes pour faire vivre cette expérience en groupe de prière, aumônerie ou catéchèse d'adultes.
            </p>
          </div>
          <Link
            to="/kit-communaute"
            className="px-5 py-3 bg-brand-terracotta hover:bg-[#a0522f] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 shadow-sm"
          >
            <span>Consulter le Kit Groupe</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OutreachToolkit;
