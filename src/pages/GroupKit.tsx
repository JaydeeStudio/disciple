import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Sparkles, 
  Printer, 
  Download,
  Copy, 
  Check, 
  Heart, 
  Compass, 
  ShieldCheck, 
  Flame, 
  FileText, 
  X, 
  Eye, 
  Clock,
  Archive,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateFacilitationSheetPdf } from '../services/facilitationSheetPdfGenerator';
import { generateWallMatrixPdf } from '../services/groupMatrixPdfGenerator';
import { generateBinomesGuidePdf } from '../services/groupBinomesPdfGenerator';
import { downloadGroupKitZip } from '../services/groupKitZipService';
import { TeamCrossAnalysis } from '../components/TeamCrossAnalysis';

export const GroupKit: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [previewSampleImg, setPreviewSampleImg] = useState<{ src: string; title: string; subtitle: string } | null>(null);

  const toolUrl = 'https://discipledejesus.netlify.app/test';

  const copyDirectLink = () => {
    navigator.clipboard.writeText(toolUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadSheet = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      try {
        const doc = generateFacilitationSheetPdf();
        doc.save('01_Fiche-Animation-Rencontre-45min.pdf');
      } catch (e) {
        console.error("Erreur téléchargement fiche :", e);
      } finally {
        setIsExportingPdf(false);
      }
    }, 150);
  };

  const handleDownloadMatrix = () => {
    try {
      const doc = generateWallMatrixPdf();
      doc.save('02_Matrice-Murale-Cartographie-A3.pdf');
    } catch (e) {
      console.error("Erreur téléchargement matrice :", e);
    }
  };

  const handleDownloadBinomes = () => {
    try {
      const doc = generateBinomesGuidePdf();
      doc.save('03_Guide-Binomes-Frictions-Fraternelles.pdf');
    } catch (e) {
      console.error("Erreur téléchargement guide :", e);
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadGroupKitZip();
    } catch (e) {
      console.error("Erreur téléchargement ZIP kit :", e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handlePrintOrDownload = () => {
    setIsExportingPdf(true);
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn("Impression directe indisponible :", e);
    }

    setTimeout(() => {
      handleDownloadSheet();
    }, 200);
  };

  const samplePages = [
    {
      src: '/images/guide-preview/couverture.jpg',
      title: 'Couverture du dossier',
      subtitle: 'Dossier personnel relié (Page 1)'
    },
    {
      src: '/images/guide-preview/page-radar.jpg',
      title: 'Roue polaire des 8 énergies',
      subtitle: 'Graphique analytique de tempérament (Page 4)'
    },
    {
      src: '/images/guide-preview/page-synthese.jpg',
      title: 'Cartographie relationnelle 2D',
      subtitle: 'Planche de synthèse et complémentarités (Page 35)'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Hero de présentation */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-ochre/20 shadow-sm mb-12 text-center relative overflow-hidden no-print">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-ochre/15 text-brand-terracotta text-xs font-bold tracking-wide mb-5">
            <Users className="w-4 h-4 text-brand-terracotta" />
            <span>Ressource offerte pour animateurs, responsables et pasteurs</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-brand-charcoal mb-4">
            Kit d'animation pour groupes
          </h1>
          <p className="text-base sm:text-lg text-brand-charcoal/70 max-w-2xl mx-auto leading-relaxed mb-8">
            Une démarche vivante et structurée pour révéler les forces de chacun, désamorcer les jugements de tempérament et aborder la question de l'identité en Dieu sans culpabilité.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-brand-ochre" />
              <span>Consulter la fiche d'animation (45 min)</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-terracotta hover:bg-[#a0522f] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Archive className="w-4 h-4 text-brand-ochre" />
              <span>{isDownloadingZip ? 'Génération du ZIP...' : 'Télécharger le kit complet (ZIP)'}</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-brand-ochre/15 flex flex-wrap items-center justify-center gap-3 text-xs text-brand-charcoal/70">
            <span>Adresse directe de l'outil à communiquer :</span>
            <button
              onClick={copyDirectLink}
              className="inline-flex items-center gap-1.5 font-mono text-brand-terracotta hover:underline font-semibold cursor-pointer bg-brand-bg px-2.5 py-1 rounded-md border border-brand-ochre/20"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-brand-sage" />
                  <span className="text-brand-sage font-sans">Lien copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>discipledejesus.netlify.app/test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 grands bénéfices pour le groupe - avec animation fluide au survol */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12 no-print">
          <div className="bg-white p-6 rounded-2xl border border-brand-ochre/15 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-brand-ochre/40 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-display text-lg text-brand-charcoal mb-2 group-hover:text-brand-terracotta transition-colors">
              Brise-glace instantané
            </h2>
            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
              Même les personnes les plus réservées s'expriment spontanément lorsqu'il s'agit de découvrir leur résonance avec un disciple ou un apôtre.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-ochre/15 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-brand-sage/40 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-brand-sage/10 text-brand-sage flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="font-display text-lg text-brand-charcoal mb-2 group-hover:text-brand-sage transition-colors">
              Désamorce les jugements
            </h2>
            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
              Comprendre que le doute de Thomas ou la fougue de Pierre ont chacun leur place permet d'accueillir et d'aimer les différences au lieu de les juger.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-ochre/15 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-brand-ochre/40 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-brand-ochre/15 text-brand-ochre flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="font-display text-lg text-brand-charcoal mb-2 group-hover:text-brand-ochre transition-colors">
              Mobilise les vocations
            </h2>
            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
              Aide chacun à discerner sa contribution naturelle : enseignement, logistique, compassion, prière ou impulsion missionnaire.
            </p>
          </div>
        </div>

        {/* Section Pourquoi : Utilité concrète pour chaque contexte */}
        <div className="space-y-8 mb-14 no-print">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl text-brand-charcoal mb-3">
              Pourquoi proposer cet outil à votre groupe ?
            </h2>
            <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed">
              Cet outil n'est pas un simple divertissement : c'est un levier d'unité, de maturité collective et de discernement spirituel adapté à chaque typologie de rassemblement.
            </p>
          </div>

          {/* Cas 1 : Équipe engagée ou pôle d'action */}
          <div className="bg-white rounded-3xl p-8 border border-brand-ochre/20 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracotta">
                  Équipes engagées, conseils & pôles d'action
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-brand-charcoal mt-0.5">
                  Faire émerger la complémentarité des dons et tempéraments
                </h3>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-6 pt-5 border-t border-brand-ochre/15 text-xs text-brand-charcoal/75 leading-relaxed">
              <div className="space-y-1.5">
                <h4 className="font-bold text-brand-charcoal text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-terracotta shrink-0" />
                  Cartographier les dons réels
                </h4>
                <p>
                  Visualisez d'un coup d'œil si votre équipe est équilibrée entre bâtisseurs (Pierre), contemplatifs (Jean), analystes vigilants (Thomas) et coordinateurs précis (Matthieu).
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-brand-charcoal text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-sage shrink-0" />
                  Désamorcer les incompréhensions
                </h4>
                <p>
                  On comprend enfin les réactions de chacun : le besoin de vérifier de l'un n'est pas un manque de foi, et la rapidité de l'autre n'est pas un manque d'écoute. Chacun découvre la valeur du regard des autres.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-brand-charcoal text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-ochre shrink-0" />
                  Éviter l'épuisement des bénévoles
                </h4>
                <p>
                  Arrêtez de demander à un profil relationnel de gérer des tableaux de bord administratifs, ou à un profil discret d'animer la tribune. Alignez les responsabilités sur les dons naturels.
                </p>
              </div>
            </div>
          </div>

          {/* Cas 2 : Groupe de maison, fraternité ou cellule de prière */}
          <div className="bg-white rounded-3xl p-8 border border-brand-ochre/20 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-sage/15 text-brand-sage flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-sage">
                  Groupes de maison, fraternités & cellules de prière
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-brand-charcoal mt-0.5">
                  Aborder l'identité en Dieu et briser le piège de la comparaison
                </h3>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-6 pt-5 border-t border-brand-ochre/15 text-xs text-brand-charcoal/75 leading-relaxed">
              <div className="space-y-1.5">
                <h4 className="font-bold text-brand-charcoal text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-sage shrink-0" />
                  Se libérer de la fausse conformité
                </h4>
                <p>
                  Dieu n'a jamais cherché à cloner les disciples : le Christ a appelé des personnalités radicalement diverses. Les participants cessent de culpabiliser de ne pas ressembler au modèle stéréotypé du « chrétien parfait ».
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-brand-charcoal text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-terracotta shrink-0" />
                  Créer un climat de saine vulnérabilité
                </h4>
                <p>
                  Parler de son profil permet d'aborder naturellement ses forces et ses zones de fragilité sous stress, créant en une seule heure une profondeur de communion fraternelle rare.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-brand-charcoal text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-ochre shrink-0" />
                  Dépasser le bavardage superficiel
                </h4>
                <p>
                  Le partage autour des 20 questions et du résultat biblique offre un support concret pour renouveler les temps d'échange parfois répétitifs des réunions de maison.
                </p>
              </div>
            </div>
          </div>

          {/* Cas 3 : Jeunes adultes et discernement personnel */}
          <div className="bg-white rounded-3xl p-8 border border-brand-ochre/20 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-ochre/15 text-brand-ochre flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-ochre">
                  Jeunes adultes, étudiants & discernement personnel
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-brand-charcoal mt-0.5">
                  Encourager le discernement personnel et la vocation
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed mt-4">
              À l'âge des grands choix d'orientation, de vie affective et de premiers engagements paroissiaux, la démarche permet à chacun de relire son parcours avec bienveillance : comprendre comment sa sensibilité intellectuelle, émotionnelle ou pratique est voulue et bénie par Dieu.
            </p>
          </div>
        </div>

        {/* SECTION LES 3 RESSOURCES DU KIT À TÉLÉCHARGER (Avec ZIP) */}
        <div className="bg-gradient-to-br from-white to-[#fbf8f2] rounded-3xl p-8 sm:p-10 border border-brand-ochre/25 shadow-sm mb-14 no-print">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-ochre/15">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
                Pack complet pour animateurs & pasteurs
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-brand-charcoal mt-1">
                Les 3 ressources imprimables du kit
              </h2>
              <p className="text-xs sm:text-sm text-brand-charcoal/70 mt-1 max-w-xl">
                Téléchargez les documents individuellement ou récupérez l'archive ZIP complète regroupant les 3 supports prêts à l'emploi.
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="px-6 py-3 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
            >
              <Archive className="w-4 h-4 text-brand-ochre" />
              <span>{isDownloadingZip ? 'Génération de l\'archive...' : 'Télécharger le kit complet (ZIP)'}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Ressource 1 : Fiche d'animation */}
            <div className="bg-white p-6 rounded-2xl border border-brand-ochre/20 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-9 h-9 rounded-xl bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta">
                  Support animateur • 45 min
                </span>
                <h3 className="font-display font-bold text-base text-brand-charcoal mt-1 mb-2">
                  Fiche d'animation de rencontre
                </h3>
                <p className="text-xs text-brand-charcoal/70 leading-relaxed mb-4">
                  Le conducteur minuté étape par étape, avec les 4 questions de résonance fraternelle et les 3 règles d'or de l'animateur.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-brand-ochre/15">
                <button
                  onClick={() => setIsSheetModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-brand-bg hover:bg-brand-ochre/15 text-brand-charcoal font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-brand-ochre/20 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Consulter en ligne</span>
                </button>
                <button
                  onClick={handleDownloadSheet}
                  disabled={isExportingPdf}
                  className="w-full py-2.5 px-3 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5 text-brand-ochre" />
                  <span>Télécharger le PDF</span>
                </button>
              </div>
            </div>

            {/* Ressource 2 : Matrice de cartographie murale */}
            <div className="bg-white p-6 rounded-2xl border border-brand-ochre/20 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-9 h-9 rounded-xl bg-brand-ochre/15 text-brand-ochre flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-ochre">
                  Support mural • Format étendu
                </span>
                <h3 className="font-display font-bold text-base text-brand-charcoal mt-1 mb-2">
                  Matrice de cartographie visuelle
                </h3>
                <p className="text-xs text-brand-charcoal/70 leading-relaxed mb-2">
                  Grand poster à 4 quadrants (Action, Sagesse, Structure, Soin) avec zones dédiées pour coller les post-its des prénoms du groupe.
                </p>
                <p className="text-[11px] text-brand-terracotta font-semibold mb-4 italic">
                  Recommandé : impression au format A3 pour affichage mural.
                </p>
              </div>

              <div className="pt-4 border-t border-brand-ochre/15">
                <button
                  onClick={handleDownloadMatrix}
                  className="w-full py-2.5 px-3 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-brand-ochre" />
                  <span>Télécharger la matrice murale</span>
                </button>
              </div>
            </div>

            {/* Ressource 3 : Guide des binômes */}
            <div className="bg-white p-6 rounded-2xl border border-brand-ochre/20 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-9 h-9 rounded-xl bg-brand-sage/15 text-brand-sage flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sage">
                  Livret pastoral • 4 pages
                </span>
                <h3 className="font-display font-bold text-base text-brand-charcoal mt-1 mb-2">
                  Guide des binômes & frictions
                </h3>
                <p className="text-xs text-brand-charcoal/70 leading-relaxed mb-4">
                  Analyse des 6 duos canoniques (Pierre/Thomas, Marthe/Marie, Paul/Barnabas...), protocole d'apaisement en 4 étapes et prière d'unité.
                </p>
              </div>

              <div className="pt-4 border-t border-brand-ochre/15">
                <button
                  onClick={handleDownloadBinomes}
                  className="w-full py-2.5 px-3 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-brand-ochre" />
                  <span>Télécharger le guide (PDF)</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION DIAGNOSTIC CROISÉ D'ÉQUIPE INTERACTIF (En ligne sur la page) */}
        <div id="diagnostic-equipe" className="mb-14 no-print scroll-mt-24">
          <TeamCrossAnalysis />
        </div>

        {/* Articulation : Un seul test, deux résultats possibles */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-ochre/20 shadow-sm mb-12 no-print">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
              Un questionnaire identique • Deux niveaux de restitution
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-brand-charcoal mt-1 mb-3">
              Un seul test, deux résultats possibles
            </h2>
            <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed">
              Tous les participants répondent aux mêmes 20 questions en ligne. Vous choisissez ensuite la profondeur du rapport remis à chacun selon vos objectifs d'animation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Format 1 : Restitution essentielle gratuite */}
            <div className="p-6 sm:p-7 rounded-2xl bg-brand-bg/60 border border-brand-ochre/25 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-brand-ochre/15 text-brand-charcoal border border-brand-ochre/30 text-[11px] font-bold uppercase tracking-wider">
                    Restitution essentielle • 100% gratuite
                  </span>
                  <span className="text-xs font-semibold text-brand-charcoal/60">
                    1 séance (45 min)
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-brand-charcoal mb-2">
                  Résultats immédiats en ligne (smartphone, tablette, ordinateur)
                </h3>
                <p className="text-xs text-brand-charcoal/70 leading-relaxed mb-4">
                  À la fin des 20 questions, chaque participant découvre immédiatement sur son écran son disciple dominant, son pourcentage de résonance et son verset inspirant.
                </p>
                <div className="space-y-2 text-xs text-brand-charcoal/80 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-sage shrink-0" />
                    <span>Accessible sur smartphone, tablette ou ordinateur portable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-sage shrink-0" />
                    <span>Suffisant pour vivre l'intégralité du tour de table (45 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-sage shrink-0" />
                    <span>Sans création de compte préalable ni carte bancaire</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-ochre/20 space-y-2 text-center">
                <Link
                  to="/test"
                  className="w-full py-3 px-4 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Compass className="w-4 h-4 text-brand-ochre" />
                  <span>Lancer le test gratuit (5 min)</span>
                </Link>
                <p className="text-[10px] text-brand-charcoal/50">
                  Lien direct à communiquer à vos membres lors de la rencontre
                </p>
              </div>
            </div>

            {/* Format 2 : Dossier complet 36 pages avec 3 pages d'exemple */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-brand-ochre/40 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-ochre text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                19 € par personne
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-brand-ochre/20 text-brand-terracotta border border-brand-ochre/35 text-[11px] font-bold uppercase tracking-wider">
                    Cycle approfondi • Dossier 36 pages (PDF)
                  </span>
                  <span className="text-xs font-semibold text-brand-charcoal/60">
                    4 à 6 séances
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-brand-charcoal mb-2">
                  Dossier d'approfondissement personnel
                </h3>
                <p className="text-xs text-brand-charcoal/70 leading-relaxed mb-3">
                  Après avoir complété le test gratuit en 5 minutes, chaque participant peut débloquer son dossier complet de 36 pages pour travailler en profondeur.
                </p>

                {/* 3 Pages d'exemple interactives */}
                <div className="mb-4 pt-3 border-t border-brand-ochre/15">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/60 block mb-2">
                    Aperçu des 36 pages (cliquez pour agrandir) :
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {samplePages.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewSampleImg(sample)}
                        className="group text-left cursor-pointer"
                        title="Agrandir cette page"
                      >
                        <div className="rounded-lg overflow-hidden border border-brand-ochre/25 bg-brand-bg group-hover:border-brand-terracotta transition-all aspect-[3/4]">
                          <img 
                            src={sample.src} 
                            alt={sample.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-brand-charcoal block truncate mt-1 group-hover:text-brand-terracotta">
                          {sample.title.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-brand-charcoal/80 mb-5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-ochre shrink-0" />
                    <span>Roue polaire des 8 composantes comportementales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-ochre shrink-0" />
                    <span>Angles morts, réactions sous pression et signaux de fatigue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-ochre shrink-0" />
                    <span>Matrice de complémentarité et plan d'action personnalisé</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-ochre/20 space-y-2 text-center">
                <Link
                  to="/test"
                  className="w-full py-3 px-4 bg-brand-ochre hover:bg-[#b07d3b] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Compass className="w-4 h-4 text-white" />
                  <span>Faire le test & accéder au dossier (5 min)</span>
                </Link>
                <p className="text-[10px] text-brand-charcoal/50">
                  Débloquable individuellement à la fin du test gratuit
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL LIGHTBOX POUR AGRANDIR LES PAGES D'EXEMPLE */}
      <AnimatePresence>
        {previewSampleImg && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-brand-ochre/30 flex flex-col"
            >
              <div className="p-4 sm:px-6 border-b border-brand-ochre/20 flex items-center justify-between bg-white">
                <div>
                  <h3 className="font-display font-bold text-brand-charcoal text-base">
                    {previewSampleImg.title}
                  </h3>
                  <p className="text-xs text-brand-charcoal/60">{previewSampleImg.subtitle}</p>
                </div>
                <button
                  onClick={() => setPreviewSampleImg(null)}
                  className="p-1.5 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-bg rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 bg-[#f7f4ed] flex items-center justify-center">
                <img
                  src={previewSampleImg.src}
                  alt={previewSampleImg.title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg border border-brand-ochre/20"
                />
              </div>

              <div className="p-4 border-t border-brand-ochre/20 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-brand-charcoal/70">Extrait du dossier complet d'approfondissement (36 pages)</span>
                <Link
                  to="/test"
                  onClick={() => setPreviewSampleImg(null)}
                  className="px-4 py-2 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>Passer le test en 5 min</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-ochre" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL / FEUILLE D'ANIMATION CONSULTABLE & IMPRIMABLE */}
      <AnimatePresence>
        {isSheetModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center print:p-0 print:bg-white print:static">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-brand-ochre/30 flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none print-clean"
            >
              {/* Header de la modal (masqué à l'impression) */}
              <div className="p-5 sm:px-8 border-b border-brand-ochre/20 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-ochre/20 text-brand-charcoal flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-brand-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-brand-charcoal text-base">
                      Fiche d'animation de rencontre
                    </h3>
                    <p className="text-xs text-brand-charcoal/60">Temps estimé : 45 minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintOrDownload}
                    disabled={isExportingPdf}
                    className="px-4 py-2 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
                  >
                    <Printer className="w-4 h-4 text-brand-ochre" />
                    <Download className="w-3.5 h-3.5 text-brand-ochre" />
                    <span>{isExportingPdf ? 'Génération du PDF...' : 'Imprimer / Télécharger en PDF'}</span>
                  </button>

                  <button
                    onClick={() => setIsSheetModalOpen(false)}
                    className="p-2 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-bg rounded-lg cursor-pointer ml-1"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Corps de la fiche imprimable : aéré, respirant, typographie soignée */}
              <div className="p-8 sm:p-12 text-brand-charcoal leading-relaxed space-y-8 print:p-0 print:space-y-6">
                
                {/* En-tête de la fiche avec logo & adresse web */}
                <div className="border-b-2 border-brand-charcoal pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-brand-terracotta">
                      <Compass className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        DISCIPLE • Profils & Tempéraments Bibliques
                      </span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal">
                      Fiche d'animation de rencontre
                    </h2>
                    <p className="text-sm text-brand-charcoal/70">
                      Session de 45 minutes : révéler les forces, désamorcer les jugements et valoriser chaque membre.
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs text-brand-charcoal/70 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <p className="font-bold text-brand-charcoal text-sm">discipledejesus.netlify.app</p>
                    <p className="text-[11px] text-brand-charcoal/60">Temps estimé : 45 minutes</p>
                  </div>
                </div>

                {/* Note préalable pour l'animateur */}
                <div className="p-5 bg-brand-bg rounded-2xl border border-brand-ochre/30 space-y-2">
                  <h3 className="font-bold text-brand-charcoal text-xs uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-terracotta shrink-0" />
                    <span>Cadre & recommandation pour l'animateur</span>
                  </h3>
                  <div className="text-xs sm:text-sm text-brand-charcoal/80 space-y-2 leading-relaxed">
                    <p>
                      <strong>1. Niveau découverte :</strong> Le questionnaire gratuit en ligne (20 questions, 5 minutes) identifie le disciple dominant et suffit amplement pour animer cette rencontre d'initiation de 45 minutes.
                    </p>
                    <p>
                      <strong>2. Travail approfondi sur la durée :</strong> Si votre équipe ou groupe de maison souhaite travailler en profondeur sur plusieurs rencontres (par exemple un cycle régulier de 4 à 6 séances), chaque participant peut acquérir son <em>dossier d'approfondissement personnel de 36 pages</em> (19 € par personne : analyse des 8 composantes du tempérament, réactions sous pression, complémentarités relationnelles et plan de croissance sur mesure).
                    </p>
                  </div>
                </div>

                {/* Déroulé étape par étape (45 minutes) */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-brand-ochre/25 pb-2">
                    <h3 className="font-display text-lg font-bold text-brand-charcoal">
                      Déroulé pas à pas de la rencontre
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-brand-charcoal/70 font-semibold">
                      <Clock className="w-4 h-4 text-brand-ochre" />
                      <span>45 minutes au total</span>
                    </div>
                  </div>

                  {/* Étape 1 - All devices */}
                  <div className="p-4 rounded-xl bg-white border border-brand-ochre/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm sm:text-base text-brand-charcoal flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-terracotta text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                        Passation du questionnaire en ligne
                      </h4>
                      <span className="text-xs font-bold text-brand-terracotta bg-brand-terracotta/10 px-2.5 py-0.5 rounded-full">
                        7 min
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-charcoal/80 pl-8">
                      Chaque participant ouvre <strong>discipledejesus.netlify.app/test</strong> sur son smartphone, sa tablette ou son ordinateur. Consigne : répondre avec spontanéité et franchise aux 20 questions, sans chercher de réponse idéale ou théorique. Chacun découvre son profil dominant et son verset inspirant.
                    </p>
                  </div>

                  {/* Étape 2 */}
                  <div className="p-4 rounded-xl bg-white border border-brand-ochre/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm sm:text-base text-brand-charcoal flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-ochre text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                        Tour de table et cartographie du groupe
                      </h4>
                      <span className="text-xs font-bold text-brand-ochre bg-brand-ochre/15 px-2.5 py-0.5 rounded-full">
                        15 min
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-charcoal/80 pl-8">
                      Chacun annonce son disciple dominant (ex : Pierre, Jean, Thomas, Marthe...) et lit son verset inspirant. L'animateur note les prénoms au tableau ou sur la matrice murale pour faire apparaître l'écosystème du groupe : quels tempéraments dominent ? Quels profils manquent ?
                    </p>
                  </div>

                  {/* Étape 3 */}
                  <div className="p-4 rounded-xl bg-white border border-brand-ochre/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm sm:text-base text-brand-charcoal flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-sage text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                        Questions clés de résonance fraternelle
                      </h4>
                      <span className="text-xs font-bold text-brand-sage bg-brand-sage/15 px-2.5 py-0.5 rounded-full">
                        15 min
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-brand-charcoal/80 pl-8 space-y-2">
                      <p>L'animateur invite chacun à répondre à une ou deux des 4 questions suivantes :</p>
                      <ul className="space-y-1.5 list-disc pl-4 text-brand-charcoal/90">
                        <li><strong>Résonance :</strong> <em>Qu'est-ce qui vous a le plus parlé ou surpris dans la description de votre profil ?</em></li>
                        <li><strong>Force quotidienne :</strong> <em>Quelle est la force principale de ce tempérament dans votre vie ?</em></li>
                        <li><strong>Zone de tension :</strong> <em>Quel est votre angle mort sous tension ou dans la fatigue ?</em></li>
                        <li><strong>Complémentarité :</strong> <em>Quel autre disciple présent dans ce groupe compense le mieux vos fragilités ?</em></li>
                      </ul>
                    </div>
                  </div>

                  {/* Étape 4 */}
                  <div className="p-4 rounded-xl bg-white border border-brand-ochre/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm sm:text-base text-brand-charcoal flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-charcoal text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                        Prière d'action de grâce et d'unité
                      </h4>
                      <span className="text-xs font-bold text-brand-charcoal bg-brand-charcoal/10 px-2.5 py-0.5 rounded-full">
                        8 min
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-charcoal/80 pl-8">
                      Lecture de <strong>1 Corinthiens 12, 12-27</strong> (Le corps est un, mais il a plusieurs membres). Prière commune pour bénir la diversité des tempéraments et rendre grâce pour la complémentarité de chacun au service de l'édification mutuelle.
                    </p>
                  </div>
                </div>

                {/* 3 règles d'or de l'animateur */}
                <div className="pt-4 border-t border-brand-ochre/25">
                  <h3 className="font-bold text-brand-charcoal text-xs uppercase tracking-wider mb-3">
                    Les 3 règles d'or de l'animation
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs text-brand-charcoal/85">
                    <div className="p-3 bg-brand-bg rounded-xl border border-brand-ochre/15">
                      <p className="font-bold text-brand-charcoal mb-1">1. Aucune hiérarchie</p>
                      <p className="text-[11px] leading-relaxed">Tous les tempéraments sont voulus par Dieu. Un profil d'action ne vaut pas mieux qu'un profil contemplatif.</p>
                    </div>
                    <div className="p-3 bg-brand-bg rounded-xl border border-brand-ochre/15">
                      <p className="font-bold text-brand-charcoal mb-1">2. Bienveillance absolue</p>
                      <p className="text-[11px] leading-relaxed">Le profil n'est pas une étiquette pour enfermer, mais une clé d'encouragement mutuel et d'écoute.</p>
                    </div>
                    <div className="p-3 bg-brand-bg rounded-xl border border-brand-ochre/15">
                      <p className="font-bold text-brand-charcoal mb-1">3. Confidentialité & liberté</p>
                      <p className="text-[11px] leading-relaxed">Chacun reste pleinement libre de ce qu'il souhaite partager, sans pression de conformité.</p>
                    </div>
                  </div>
                </div>

                {/* Pied de page du document imprimé */}
                <div className="pt-6 border-t border-brand-ochre/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-brand-charcoal/60">
                  <span>DISCIPLE • Démarche de tempéraments bibliques pour groupes et équipes</span>
                  <span className="font-mono font-semibold text-brand-charcoal">discipledejesus.netlify.app</span>
                </div>

              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GroupKit;
