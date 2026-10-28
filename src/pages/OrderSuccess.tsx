import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  Download, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  BookOpen, 
  Sparkles,
  Edit3,
  Gift,
  AlertTriangle,
  Lock,
  Key
} from 'lucide-react';
import { ARCHETYPES } from '../data/archetypes';
import { Dimension } from '../data/questions';
import { computeDimensionResults, performFullCalculation } from '../services/calculation';
import { generateCompleteGuidePdf } from '../services/completeGuidePdfGenerator';
import { triggerHaptic } from '../lib/haptics';
import { verifyVipToken, redeemVipToken, VipTokenData } from '../services/vipService';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id') || searchParams.get('order_id');
  const queryName = searchParams.get('nom');
  const queryArchetype = searchParams.get('archetype') || searchParams.get('disciple');
  const vipParam = searchParams.get('vip') || searchParams.get('token');

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Customization state
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string>('jean');
  const [storedData, setStoredData] = useState<any>(null);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  // VIP Magic Link state
  const [vipLoading, setVipLoading] = useState<boolean>(!!vipParam);
  const [vipData, setVipData] = useState<VipTokenData | null>(null);
  const [vipError, setVipError] = useState<string | null>(null);
  const [vipRedeemed, setVipRedeemed] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    // 1. Verify VIP Magic Link if present in URL
    if (vipParam) {
      setVipLoading(true);
      verifyVipToken(vipParam).then((res) => {
        setVipLoading(false);
        if (res.valid && !res.used && res.data) {
          setVipData(res.data);
          setParticipantName(res.data.recipientName);
          if (res.data.archetypeKey && ARCHETYPES[res.data.archetypeKey]) {
            setSelectedArchetypeKey(res.data.archetypeKey);
          }
          triggerHaptic('success');
        } else if (res.used) {
          setVipData(res.data || null);
          setVipError(res.error || 'Ce lien d\'invitation VIP à usage unique a déjà été utilisé.');
          triggerHaptic('warning');
        } else {
          setVipError(res.error || 'Lien d\'invitation VIP invalide ou introuvable.');
          triggerHaptic('warning');
        }
      });
      return;
    }

    // 2. Try to load recent test results from localStorage
    try {
      const raw = localStorage.getItem('disciple_latest_result');
      if (raw) {
        const parsed = JSON.parse(raw);
        setStoredData(parsed);
        if (parsed.userData?.name) {
          setParticipantName(parsed.userData.name);
        }
        if (parsed.archetypeKey && ARCHETYPES[parsed.archetypeKey]) {
          setSelectedArchetypeKey(parsed.archetypeKey);
        }
      }
    } catch (e) {
      console.warn("Erreur lecture localStorage :", e);
    }

    // 3. Query parameters take precedence if provided
    if (queryName) {
      setParticipantName(decodeURIComponent(queryName));
    }
    if (queryArchetype && ARCHETYPES[queryArchetype.toLowerCase()]) {
      setSelectedArchetypeKey(queryArchetype.toLowerCase());
    }
  }, [vipParam, queryName, queryArchetype]);

  const activeArchetype = ARCHETYPES[selectedArchetypeKey] || ARCHETYPES.jean;

  // Compute or reuse dimensions and scores
  const getCalculationParams = () => {
    if (storedData?.calculation && storedData.archetypeKey === selectedArchetypeKey) {
      return {
        dimensions: storedData.calculation.dimensions,
        rawScores: storedData.calculation.rawScores,
        affinity: storedData.calculation.primaryMatch?.affinity || 94,
        secondaryMatches: storedData.calculation.secondaryMatches || [],
        genderEquivalentMatch: storedData.calculation.genderEquivalentMatch
      };
    }

    // Synthesize based on archetype coordinates if not coming directly from the live test
    const rawScores = activeArchetype.coordinates;
    const dimensions = computeDimensionResults(rawScores);
    
    // Find closest secondary archetypes
    const allMatches = Object.values(ARCHETYPES)
      .filter(a => a.key !== activeArchetype.key)
      .map(a => {
        const d_IA = rawScores.I_A - a.coordinates.I_A;
        const d_SE = rawScores.S_E - a.coordinates.S_E;
        const d_VG = rawScores.V_G - a.coordinates.V_G;
        const d_LF = rawScores.L_F - a.coordinates.L_F;
        const d_RM = rawScores.R_M - a.coordinates.R_M;
        const dist = Math.sqrt(d_IA*d_IA + d_SE*d_SE + d_VG*d_VG + d_LF*d_LF + d_RM*d_RM);
        const aff = Math.max(30, Math.min(99, Math.round(100 - (dist / 44.72) * 100)));
        return { archetype: a, affinity: aff, distance: dist };
      })
      .sort((a, b) => b.affinity - a.affinity);

    return {
      dimensions,
      rawScores,
      affinity: 94,
      secondaryMatches: allMatches.slice(0, 3),
      genderEquivalentMatch: allMatches.find(m => m.archetype.gender !== activeArchetype.gender)
    };
  };

  // Generates and downloads the official 35-page self-work guide document
  const handleDownloadGuide = async () => {
    triggerHaptic('medium');
    setDownloading(true);

    try {
      // If this is a VIP link and not yet consumed, redeem it now in Firestore (single-use lock)
      if (vipParam && vipData && !vipData.used && !vipRedeemed) {
        await redeemVipToken(vipParam);
        setVipRedeemed(true);
      }

      // In production, if an external pre-rendered PDF URL is configured, we can link directly
      const customPdfUrl = import.meta.env.VITE_GUIDE_PDF_DOWNLOAD_URL;
      if (customPdfUrl) {
        window.open(customPdfUrl, '_blank');
        setDownloading(false);
        setDownloadSuccess(true);
        return;
      }

      const calcParams = getCalculationParams();

      // Generate the 35-page customized document
      const doc = generateCompleteGuidePdf({
        userName: participantName.trim() || 'Disciple',
        archetype: activeArchetype,
        affinity: calcParams.affinity,
        dimensions: calcParams.dimensions,
        rawScores: calcParams.rawScores,
        secondaryMatches: calcParams.secondaryMatches,
        genderEquivalentMatch: calcParams.genderEquivalentMatch
      });

      // Save file with personalized name
      const safeName = participantName.trim() ? participantName.trim().replace(/\s+/g, '_') : 'Personnel';
      doc.save(`Dossier_Approfondissement_35_Pages_${activeArchetype.name}_${safeName}.pdf`);
      setDownloading(false);
      setDownloadSuccess(true);
      triggerHaptic('success');
    } catch (err) {
      console.error("Erreur de génération du guide 35 pages :", err);
      setDownloading(false);
    }
  };

  const isVipLocked = !!vipParam && (vipError !== null || (vipData?.used && !vipRedeemed));

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-ochre/20 shadow-xl text-center mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-brand-ochre to-emerald-600" />

          {/* Loading state for VIP token verification */}
          {vipLoading ? (
            <div className="py-12">
              <div className="w-12 h-12 border-4 border-brand-ochre border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-brand-charcoal/70">
                Vérification de votre lien d'invitation VIP...
              </p>
            </div>
          ) : isVipLocked ? (
            /* Expired or already used VIP token */
            <div className="py-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Lock className="w-9 h-9" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                Invitation VIP à usage unique expirée
              </span>

              <h1 className="font-display text-3xl sm:text-4xl text-brand-charcoal mb-4">
                Ce lien VIP a déjà été utilisé
              </h1>

              <p className="text-brand-charcoal/70 text-base max-w-xl mx-auto leading-relaxed mb-6">
                Pour garantir la sécurité et éviter tout partage non autorisé, chaque invitation VIP est strictement à <strong className="font-semibold text-brand-charcoal">usage unique</strong>.
              </p>

              <div className="p-4 bg-brand-bg rounded-2xl border border-brand-ochre/15 max-w-md mx-auto mb-8 text-xs text-brand-charcoal/70">
                <p className="mb-2">
                  Si vous êtes le destinataire légitime de cette invitation ou si vous pensez qu'il s'agit d'une erreur, écrivez-nous :
                </p>
                <a 
                  href="mailto:contact@discipledejesus.com" 
                  className="font-bold text-brand-ochre hover:underline"
                >
                  contact@discipledejesus.com
                </a>
              </div>

              <div className="flex justify-center gap-3">
                <Link
                  to="/"
                  className="px-6 py-3 bg-brand-charcoal hover:bg-brand-ochre text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Retourner à l'accueil
                </Link>
              </div>
            </div>
          ) : (
            /* Normal or Active VIP View */
            <>
              <div className={`w-16 h-16 ${vipParam ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                {vipParam ? <Gift className="w-9 h-9" /> : <CheckCircle className="w-9 h-9" />}
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${vipParam ? 'bg-amber-100/80 text-amber-900' : 'bg-emerald-100/70 text-emerald-800'} text-xs font-semibold rounded-full uppercase tracking-wider mb-4`}>
                {vipParam ? '✨ Accès Privilège VIP • Offert gracieusement' : 'Paiement validé • Accès immédiat'}
              </span>

              <h1 className="font-display text-3xl sm:text-4xl text-brand-charcoal mb-4">
                {vipParam 
                  ? `Bienvenue, ${participantName || 'Invité VIP'} !` 
                  : 'Merci pour votre commande !'}
              </h1>

              <p className="text-brand-charcoal/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-6">
                Votre <strong className="text-brand-charcoal font-semibold">Dossier d'approfondissement personnel & Guide de travail sur soi (35 pages)</strong> est généré en temps réel, sur mesure avec vos résultats.
              </p>

              {vipParam && (
                <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl max-w-lg mx-auto text-left flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-amber-950">
                    <span className="font-bold text-amber-900 block mb-0.5">💡 Vous n'avez pas encore passé le test ?</span>
                    <span>Passez le test en 3 minutes pour obtenir vos vrais scores personnels :</span>
                  </div>
                  <Link
                    to={`/test?vip=${vipParam}`}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm whitespace-nowrap"
                  >
                    Faire le test (3 min) →
                  </Link>
                </div>
              )}

              {/* Personalization Summary Box */}
              <div className="bg-brand-bg/80 border border-brand-ochre/15 rounded-2xl p-4 sm:p-5 max-w-lg mx-auto mb-8 text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-brand-ochre uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Personnalisation de votre dossier
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className="text-xs text-brand-charcoal/70 hover:text-brand-ochre font-medium flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isCustomizing ? 'Masquer' : 'Ajuster le prénom / profil'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-xl border border-brand-ochre/10">
                    <span className="text-xs text-brand-charcoal/50 block">Participant :</span>
                    <span className="font-semibold text-brand-charcoal">{participantName || 'Disciple'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-brand-ochre/10">
                    <span className="text-xs text-brand-charcoal/50 block">Profil dominant :</span>
                    <span className="font-semibold text-brand-charcoal">{activeArchetype.name} ({activeArchetype.title})</span>
                  </div>
                </div>

                {/* Inline Customizer */}
                {isCustomizing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-brand-ochre/15 space-y-3"
                  >
                    <div>
                      <label className="text-xs font-bold text-brand-charcoal/70 block mb-1">
                        Prénom ou nom complet (affiché sur la couverture et l'attestation) :
                      </label>
                      <input
                        type="text"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        placeholder="Ex: Marc, Sophie..."
                        className="w-full bg-white border border-brand-ochre/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-ochre"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-brand-charcoal/70 block mb-1">
                        Personnage biblique référent :
                      </label>
                      <select
                        value={selectedArchetypeKey}
                        onChange={(e) => setSelectedArchetypeKey(e.target.value)}
                        className="w-full bg-white border border-brand-ochre/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-ochre"
                      >
                        {Object.values(ARCHETYPES).map(arch => (
                          <option key={arch.key} value={arch.key}>
                            {arch.name} — {arch.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </div>

              {sessionId && !vipParam && (
                <div className="inline-block bg-brand-bg px-4 py-1.5 rounded-xl text-xs text-brand-charcoal/60 mb-6 font-mono">
                  Réf. commande : {sessionId.slice(0, 18)}...
                </div>
              )}

              {/* Download Action */}
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleDownloadGuide}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-brand-ochre hover:bg-brand-ochre/90 text-white rounded-2xl font-medium text-base shadow-lg shadow-brand-ochre/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Génération de vos 35 pages personnalisées...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Télécharger mon guide complet (35 pages PDF)</span>
                    </>
                  )}
                </button>

                {downloadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Téléchargement des 35 pages démarré avec succès !</span>
                  </motion.div>
                )}

                <p className="text-xs text-brand-charcoal/50 mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {vipParam 
                    ? 'Accès VIP vérifié • Usage unique scellé' 
                    : 'Document vectoriel haute définition • Généré pour vous'}
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Content of the 35-page Guide Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 border border-brand-ochre/15 shadow-sm mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand-bg text-brand-ochre rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-brand-charcoal">Structure détaillée de vos 35 pages</h2>
              <p className="text-sm text-brand-charcoal/60">4 modules d'analyse approfondie et un plan d'action quotidien sur 30 jours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-ochre uppercase tracking-wider">Module 1 (Pages 5 à 10)</span>
                <span className="text-xs text-brand-charcoal/50">6 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Anatomie de votre profil dominant</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Portrait historique, 4 moteurs profonds, vos forces, angles morts, dynamiques en équipe et polarité miroir.
              </p>
            </div>

            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-ochre uppercase tracking-wider">Module 2 (Pages 11 à 20)</span>
                <span className="text-xs text-brand-charcoal/50">10 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Analyse chirurgicale des 5 dimensions</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                2 pages dédiées pour chacun des 5 axes : jauges graphiques de vos pourcentages, interprétation et exercices de rééquilibrage.
              </p>
            </div>

            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-ochre uppercase tracking-wider">Module 3 (Pages 21 à 26)</span>
                <span className="text-xs text-brand-charcoal/50">6 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Matrice d'interaction & Combinaison</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Croisement unique de vos axes, apport de votre binôme secondaire, boussole de stress, stades de maturité et 7 tentations.
              </p>
            </div>

            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-ochre uppercase tracking-wider">Module 4 (Pages 27 à 32)</span>
                <span className="text-xs text-brand-charcoal/50">6 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Guide pratique & Plan 30 jours</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Protocole quotidien d'alignement (matin, midi, soir), 4 semaines de défis avec cases à cocher et grille d'évaluation.
              </p>
            </div>

            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10 md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-ochre uppercase tracking-wider">Annexes & Outils (Pages 33 à 35)</span>
                <span className="text-xs text-brand-charcoal/50">3 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Fiche mémo 1 page, lectures & Attestation nominative</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Votre fiche mémo détachable résumée en une page, sélection de lectures bibliques et psychologiques ciblées, et votre attestation d'évaluation officielle certifiée à votre nom.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Support & Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-brand-bg rounded-2xl border border-brand-ochre/15 text-sm text-brand-charcoal/70">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-ochre" />
            <span>Une question sur votre commande ? Écrivez-nous à <span className="font-medium text-brand-charcoal">contact@discipledejesus.com</span></span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/personnages"
              className="text-brand-charcoal hover:text-brand-ochre font-medium transition-colors"
            >
              Les 36 personnages
            </Link>
            <span>•</span>
            <Link 
              to="/"
              className="text-brand-ochre hover:underline font-medium flex items-center gap-1"
            >
              <span>Accueil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
