import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  Download, 
  ShieldCheck, 
  BookOpen, 
  Gift, 
  Lock, 
  ArrowRight,
  Layers,
  Compass,
  Sliders,
  Users,
  Calendar,
  Award
} from 'lucide-react';
import { ARCHETYPES } from '../data/archetypes';
import { computeDimensionResults } from '../services/calculation';
import { generateCompleteGuidePdf } from '../services/completeGuidePdfGenerator';
import { triggerHaptic } from '../lib/haptics';
import { verifyVipToken, redeemVipToken, VipTokenData } from '../services/vipService';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id') || searchParams.get('order_id');
  const queryName = searchParams.get('nom');
  const queryArchetype = searchParams.get('archetype') || searchParams.get('disciple');
  const queryScores = searchParams.get('scores');
  const queryAff = searchParams.get('aff') || searchParams.get('score');
  const vipParam = searchParams.get('vip') || searchParams.get('token');

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Participant & Archetype identity (retrieved strictly from test results)
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string>('jean');
  const [storedData, setStoredData] = useState<any>(null);

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

    // 2. Try to load recent test results from localStorage or location state
    try {
      const stateData = (location.state as any)?.userData;
      if (stateData?.name) {
        setParticipantName(stateData.name);
      } else if (stateData?.firstName || stateData?.lastName) {
        const full = `${stateData.firstName || ''} ${stateData.lastName || ''}`.trim();
        if (full) setParticipantName(full);
      }

      const raw = localStorage.getItem('disciple_latest_result');
      if (raw) {
        const parsed = JSON.parse(raw);
        setStoredData(parsed);
        if (!stateData) {
          if (parsed.userData?.name) {
            setParticipantName(parsed.userData.name);
          } else if (parsed.userData?.firstName || parsed.userData?.lastName) {
            const full = `${parsed.userData.firstName || ''} ${parsed.userData.lastName || ''}`.trim();
            if (full) setParticipantName(full);
          }
        }
        if (parsed.archetypeKey && ARCHETYPES[parsed.archetypeKey]) {
          setSelectedArchetypeKey(parsed.archetypeKey);
        }
      }
    } catch (e) {
      console.warn("Erreur lecture localStorage :", e);
    }

    // 3. Query parameters take precedence if provided
    const queryFullName = queryName || searchParams.get('name') || searchParams.get('client');
    const queryFirstName = searchParams.get('prenom') || searchParams.get('firstname');
    const queryLastName = searchParams.get('nom_famille') || searchParams.get('lastname');

    if (queryFullName) {
      setParticipantName(decodeURIComponent(queryFullName));
    } else if (queryFirstName || queryLastName) {
      const full = `${queryFirstName || ''} ${queryLastName || ''}`.trim();
      if (full) setParticipantName(full);
    }
    if (queryArchetype && ARCHETYPES[queryArchetype.toLowerCase()]) {
      setSelectedArchetypeKey(queryArchetype.toLowerCase());
    }
  }, [vipParam, queryName, queryArchetype]);

  const activeArchetype = ARCHETYPES[selectedArchetypeKey] || ARCHETYPES.jean;

  // Compute or reuse dimensions and scores
  const getCalculationParams = () => {
    // 1. Check if storedData in browser has the exact test calculation
    if (storedData?.calculation && storedData.archetypeKey === selectedArchetypeKey) {
      return {
        dimensions: storedData.calculation.dimensions,
        rawScores: storedData.calculation.rawScores,
        affinity: storedData.calculation.primaryMatch?.affinity || 94,
        secondaryMatches: storedData.calculation.secondaryMatches || [],
        genderEquivalentMatch: storedData.calculation.genderEquivalentMatch
      };
    }

    // 2. Check if URL carries encoded rawScores (?scores=-6,4,8,-2,5)
    if (queryScores) {
      const parts = queryScores.split(',').map(Number);
      if (parts.length === 5 && parts.every(n => !isNaN(n))) {
        const rawScores = {
          I_A: parts[0],
          S_E: parts[1],
          V_G: parts[2],
          L_F: parts[3],
          R_M: parts[4]
        };
        const dimensions = computeDimensionResults(rawScores);
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
          affinity: queryAff ? parseInt(queryAff, 10) : 94,
          secondaryMatches: allMatches.slice(0, 3),
          genderEquivalentMatch: allMatches.find(m => m.archetype.gender !== activeArchetype.gender)
        };
      }
    }

    // 3. Fallback: Synthesize based on archetype coordinates
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

  // Generates and downloads the official 36-page self-work guide document
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

      // Generate the 36-page customized document
      const doc = await generateCompleteGuidePdf({
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
      doc.save(`Dossier_Approfondissement_36_Pages_${activeArchetype.name}_${safeName}.pdf`);
      setDownloading(false);
      setDownloadSuccess(true);
      triggerHaptic('success');
    } catch (err) {
      console.error("Erreur de génération du guide 36 pages :", err);
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
          {/* Brand-consistent accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-terracotta via-brand-ochre to-brand-terracotta" />

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
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-200">
                <Lock className="w-9 h-9" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                Invitation VIP à usage unique expirée
              </span>

              <h1 className="font-display text-3xl sm:text-4xl text-brand-charcoal mb-4">
                Ce lien VIP a déjà été utilisé
              </h1>

              <p className="text-brand-charcoal/70 text-base max-w-xl mx-auto leading-relaxed mb-8">
                Pour garantir la sécurité et préserver la confidentialité, chaque invitation VIP est strictement à <strong className="font-semibold text-brand-charcoal">usage unique</strong> et a déjà été validée.
              </p>

              <div className="flex justify-center gap-3">
                <Link
                  to="/"
                  className="px-6 py-3 bg-brand-charcoal hover:bg-brand-terracotta text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Retourner à l'accueil
                </Link>
              </div>
            </div>
          ) : (
            /* Normal or Active VIP View */
            <>
              {/* Brand warm icon badge */}
              <div className="w-16 h-16 bg-[#fbf7f2] text-brand-terracotta rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-ochre/25">
                {vipParam ? <Gift className="w-9 h-9 text-brand-ochre" /> : <CheckCircle className="w-9 h-9 text-brand-terracotta" />}
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ochre/15 text-brand-charcoal text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                {vipParam ? '✨ Accès Privilège VIP • Offert gracieusement' : 'Paiement validé • Accès immédiat'}
              </span>

              <h1 className="font-display text-3xl sm:text-4xl text-brand-charcoal mb-3">
                {vipParam 
                  ? `Bienvenue, ${participantName || 'Invité VIP'} !` 
                  : 'Merci pour votre commande !'}
              </h1>

              {/* Exact 1st paragraph requested */}
              <p className="text-brand-charcoal/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-6 font-serif">
                Votre Dossier d'approfondissement personnel &amp; Guide de travail sur soi est prêt !
              </p>

              {vipParam && (
                <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl max-w-lg mx-auto text-left flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-amber-950">
                    <span className="font-bold text-amber-900 block mb-0.5">💡 Vous n'avez pas encore passé le test ?</span>
                    <span>Passez le test en 3 minutes pour obtenir vos scores personnels :</span>
                  </div>
                  <Link
                    to={`/test?vip=${vipParam}`}
                    className="px-4 py-2 bg-brand-terracotta hover:bg-[#a0522f] text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm whitespace-nowrap"
                  >
                    Faire le test (3 min) →
                  </Link>
                </div>
              )}

              {sessionId && !vipParam && (
                <div className="inline-block bg-brand-bg px-4 py-1.5 rounded-xl text-xs text-brand-charcoal/60 mb-6 font-mono">
                  Réf. commande : {sessionId.slice(0, 18)}...
                </div>
              )}

              {/* Download Action with Harmonized Brand Terracotta Color */}
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleDownloadGuide}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-brand-terracotta hover:bg-[#a0522f] text-white rounded-2xl font-medium text-base shadow-lg shadow-brand-terracotta/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Génération de vos 36 pages...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Télécharger mon guide complet (36 pages PDF)</span>
                    </>
                  )}
                </button>

                {downloadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-emerald-200"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Téléchargement de vos 36 pages démarré avec succès !</span>
                  </motion.div>
                )}

                {/* Subtitle explicitly set as requested */}
                <p className="text-xs text-brand-charcoal/55 mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-terracotta" />
                  <span>Document PDF haute définition</span>
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Detailed Structure of all 36 Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 border border-brand-ochre/15 shadow-sm mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand-bg text-brand-terracotta rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-brand-charcoal">Structure détaillée de vos 36 pages</h2>
              <p className="text-sm text-brand-charcoal/60">L'intégralité du parcours méthodologique, des 4 modules d'analyse et du plan 30 jours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pages 1 à 4 */}
            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-terracotta uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Pages 1 à 4
                </span>
                <span className="text-xs text-brand-charcoal/50">4 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Introduction, Sommaire &amp; Roue des 8 énergies</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Page 1 : Couverture officielle • Page 2 : Sommaire détaillé &amp; repères de lecture • Page 3 : Empreinte multidimensionnelle • Page 4 : Roue des composantes (Diagramme polaire des 8 énergies).
              </p>
            </div>

            {/* Module 1: Pages 5 à 13 */}
            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-terracotta uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Module 1 (Pages 5 à 13)
                </span>
                <span className="text-xs text-brand-charcoal/50">9 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Anatomie du profil &amp; Cartographie 2D</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Portrait historique, 4 moteurs profonds, forces d'ancrage, cadrans relationnels, besoins psychologiques fondamentaux et réflexes sous stress.
              </p>
            </div>

            {/* Module 2: Pages 14 à 20 */}
            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-terracotta uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Module 2 (Pages 14 à 20)
                </span>
                <span className="text-xs text-brand-charcoal/50">7 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Analyse chirurgicale des 5 dimensions</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Fiches détaillées pour chaque polarité, jauges graphiques de vos scores, analyse comparative globale et grille de régulation spirituelle.
              </p>
            </div>

            {/* Module 3: Pages 21 à 26 */}
            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-terracotta uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Module 3 (Pages 21 à 26)
                </span>
                <span className="text-xs text-brand-charcoal/50">6 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Dynamiques relationnelles &amp; Alliances</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Archétypes secondaires proches, pendant de l'autre genre, matrice d'alliance fraternelle, désamorçage des conflits et 4 saisons de développement.
              </p>
            </div>

            {/* Module 4: Pages 27 à 32 */}
            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-terracotta uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Module 4 (Pages 27 à 32)
                </span>
                <span className="text-xs text-brand-charcoal/50">6 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Guide pratique &amp; Plan 30 jours</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Protocoles quotidiens (matin, midi, soir), 4 semaines d'exercices guidés avec cases de suivi et carnet d'auto-coaching.
              </p>
            </div>

            {/* Pages 33 à 36 */}
            <div className="p-5 bg-brand-bg/60 rounded-2xl border border-brand-ochre/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-terracotta uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Pages 33 à 36
                </span>
                <span className="text-xs text-brand-charcoal/50">4 pages</span>
              </div>
              <h3 className="font-display font-medium text-brand-charcoal text-base mb-2">Annexes, Grand récapitulatif &amp; Attestation</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Page 33 : Fiche mémo détachable • Page 34 : Ressources &amp; lectures ciblées • Page 35 : Grand récapitulatif visuel 2D • Page 36 : Attestation officielle nominative.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Clean Navigation (Strict No-Reply model without customer service prompts) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-brand-bg rounded-2xl border border-brand-ochre/15 text-sm text-brand-charcoal/70">
          <p className="font-serif italic text-brand-charcoal/80 text-xs sm:text-sm text-center sm:text-left">
            « Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit. » (Jean 15:5)
          </p>

          <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
            <Link 
              to="/personnages"
              className="text-brand-charcoal hover:text-brand-terracotta transition-colors"
            >
              Les 36 personnages
            </Link>
            <span className="text-brand-ochre/40">•</span>
            <Link 
              to="/methodologie"
              className="text-brand-charcoal hover:text-brand-terracotta transition-colors"
            >
              Méthodologie
            </Link>
            <span className="text-brand-ochre/40">•</span>
            <Link 
              to="/"
              className="text-brand-terracotta hover:underline font-medium flex items-center gap-1"
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
