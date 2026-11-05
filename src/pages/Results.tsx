import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTest } from '../contexts/TestContext';
import { ARCHETYPES } from '../data/archetypes';
import { BiblicalSilhouette } from '../components/BiblicalSilhouette';
import { 
  performFullCalculation, 
  FullTestCalculation,
  computeDimensionResults
} from '../services/calculation';
import { 
  Download, 
  Share2, 
  RefreshCw, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Mail, 
  MessageCircle, 
  Compass, 
  Lock, 
  CheckCircle, 
  X,
  Users,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { EmailCaptureCard } from '../components/EmailCaptureCard';
import { PrivacyModal } from '../components/PrivacyModal';
import { generateCompleteGuidePdf } from '../services/completeGuidePdfGenerator';
import { generateFreeSynthesisPdf } from '../services/freeSynthesisPdfGenerator';
import { triggerHaptic } from '../lib/haptics';
import { verifyVipToken, redeemVipToken } from '../services/vipService';

// Lien de paiement configurable pour le dossier d'approfondissement personnel
// Priorise la variable d'environnement VITE_STRIPE_PAYMENT_URL ou le stockage local
export const COMPLETE_GUIDE_PAYMENT_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PAYMENT_URL) || 
  "https://buy.stripe.com/7sY8wP6Xj2ta06oexaeIw00";

const Results: React.FC = () => {
  const { id } = useParams(); // Can be resultId or archetypeKey
  const location = useLocation();
  const { userData: contextUserData } = useTest();
  const [result, setResult] = useState<any>(null);
  const [calculation, setCalculation] = useState<FullTestCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [customPaymentUrl, setCustomPaymentUrl] = useState(() => {
    return localStorage.getItem('disciple_stripe_payment_url') || COMPLETE_GUIDE_PAYMENT_URL;
  });
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingGuide, setDownloadingGuide] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // VIP Pass state
  const [activeVip, setActiveVip] = useState<{ token: string; recipientName: string } | null>(null);
  const [downloadingVip, setDownloadingVip] = useState(false);
  const [vipDownloaded, setVipDownloaded] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [manualVipCode, setManualVipCode] = useState('');
  const [manualVipError, setManualVipError] = useState('');
  const [manualVipLoading, setManualVipLoading] = useState(false);

  // Calibration safeguard state: prevent payment if scores are not calibrated
  const [isCalibrated, setIsCalibrated] = useState<boolean>(true);
  const [showMissingCalibrationModal, setShowMissingCalibrationModal] = useState<boolean>(false);

  // Read possible query parameters from shared link (e.g. ?score=94&nom=David&scores=-6,4,8,-2,5)
  const searchParams = new URLSearchParams(location.search);
  const queryScore = searchParams.get('score') || searchParams.get('aff');
  const queryName = searchParams.get('nom');
  const queryScores = searchParams.get('scores');
  const queryCommander = searchParams.get('commander');
  const parsedScore = queryScore ? parseInt(queryScore, 10) : null;
  const isSharedLink = !location.state?.calculation && (Boolean(queryScore) || Boolean(queryName));

  useEffect(() => {
    // Check for active VIP token stored from link or previous step
    try {
      const rawVip = localStorage.getItem('disciple_active_vip');
      if (rawVip) {
        const parsed = JSON.parse(rawVip);
        if (parsed.token) {
          verifyVipToken(parsed.token).then(res => {
            if (res.valid && !res.used) {
              setActiveVip(parsed);
            } else {
              localStorage.removeItem('disciple_active_vip');
            }
          });
        }
      }
    } catch (e) {
      console.warn("Erreur lecture VIP :", e);
    }

    const fetchResult = async () => {
      if (!id) return;

      const lowerId = id.toLowerCase();

      // Check if location state already passed the calculation
      if (location.state?.calculation) {
        const calc = location.state.calculation;
        const userName = location.state.userData?.name || contextUserData?.name || 'Disciple';
        const archKey = calc.primaryMatch.archetype.key;

        setCalculation(calc);
        setIsCalibrated(true);
        setResult({
          archetypeKey: archKey,
          name: userName,
          affinity: calc.primaryMatch.affinity,
          isTemp: true
        });

        try {
          localStorage.setItem('disciple_latest_result', JSON.stringify({
            archetypeKey: archKey,
            userData: { name: userName, gender: location.state.userData?.gender || 'M', age: location.state.userData?.age || '' },
            calculation: calc,
            isCalibrated: true,
            savedAt: new Date().toISOString()
          }));
        } catch (e) {
          console.warn("Erreur sauvegarde localStorage :", e);
        }

        setLoading(false);
        return;
      }

      // Check if ID is a direct archetype key from URL (e.g. /resultats/jean)
      if (ARCHETYPES[lowerId]) {
        const arch = ARCHETYPES[lowerId];
        
        // Check if user previously completed the test on this device and saved results
        if (!queryScores) {
          try {
            const rawStored = localStorage.getItem('disciple_latest_result');
            if (rawStored) {
              const parsedStored = JSON.parse(rawStored);
              if (parsedStored && parsedStored.archetypeKey === lowerId && parsedStored.calculation) {
                setCalculation(parsedStored.calculation);
                const storedCalibration = parsedStored.isCalibrated !== false;
                setIsCalibrated(storedCalibration);
                setResult({
                  archetypeKey: lowerId,
                  name: parsedStored.userData?.name || 'Disciple',
                  affinity: parsedStored.calculation.primaryMatch?.affinity || 94,
                  isTemp: true
                });
                setLoading(false);

                if (queryCommander === '1') {
                  setTimeout(() => {
                    const el = document.getElementById('purchase-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 400);
                }
                return;
              }
            }
          } catch (e) {
            console.warn("Erreur réhydratation localStorage :", e);
          }
        }

        // Check if exact personalized scores are provided in the URL
        let effectiveScores = arch.coordinates;
        let hasValidQueryScores = false;
        if (queryScores) {
          const parts = queryScores.split(',').map(Number);
          if (parts.length === 5 && parts.every(n => !isNaN(n))) {
            effectiveScores = {
              I_A: parts[0],
              S_E: parts[1],
              V_G: parts[2],
              L_F: parts[3],
              R_M: parts[4]
            };
            hasValidQueryScores = true;
          }
        }

        setIsCalibrated(hasValidQueryScores);

        const effectiveDimensions = computeDimensionResults(effectiveScores);
        
        // Find other close characters using effectiveScores
        const closeMatches = Object.values(ARCHETYPES)
          .filter(a => a.key !== arch.key)
          .map(a => {
            const d = Math.sqrt(
              Math.pow(effectiveScores.I_A - a.coordinates.I_A, 2) +
              Math.pow(effectiveScores.S_E - a.coordinates.S_E, 2) +
              Math.pow(effectiveScores.V_G - a.coordinates.V_G, 2) +
              Math.pow(effectiveScores.L_F - a.coordinates.L_F, 2) +
              Math.pow(effectiveScores.R_M - a.coordinates.R_M, 2)
            );
            return {
              archetype: a,
              affinity: Math.max(30, Math.min(96, Math.round(100 - (d / 42) * 80))),
              distance: d
            };
          })
          .sort((a, b) => b.affinity - a.affinity);

        const initialAffinity = (parsedScore && !isNaN(parsedScore) && parsedScore > 0 && parsedScore <= 100)
          ? parsedScore
          : 94;

        const effectiveCalc: FullTestCalculation = {
          primaryMatch: { archetype: arch, affinity: initialAffinity, distance: 0 },
          secondaryMatches: closeMatches.slice(0, 3),
          genderEquivalentMatch: closeMatches.find(m => m.archetype.gender !== arch.gender),
          dimensions: effectiveDimensions,
          rawScores: effectiveScores,
          summaryExplanation: `Profil de ${arch.name} (${arch.title.toLowerCase()}).`
        };

        setCalculation(effectiveCalc);

        const visitorName = queryName ? decodeURIComponent(queryName) : (contextUserData?.name || 'Disciple');
        setResult({
          archetypeKey: lowerId,
          name: visitorName,
          affinity: initialAffinity,
          isTemp: true
        });

        try {
          localStorage.setItem('disciple_latest_result', JSON.stringify({
            archetypeKey: lowerId,
            userData: { name: visitorName },
            calculation: effectiveCalc,
            isCalibrated: hasValidQueryScores,
            savedAt: new Date().toISOString()
          }));
        } catch (e) {
          console.warn("Erreur sauvegarde localStorage :", e);
        }

        setLoading(false);

        // Auto-scroll to purchase card if requested from PDF
        if (queryCommander === '1') {
          setTimeout(() => {
            const el = document.getElementById('purchase-card');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        }
        return;
      }

      // Otherwise fetch from Firestore by document ID
      try {
        const docSnap = await getDoc(doc(db, 'testResults', id));
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setResult(docData);
          setIsCalibrated(Boolean(docData.answers));

          if (docData.answers) {
            const calc = performFullCalculation(docData.answers, docData.userData?.gender);
            setCalculation(calc);
          }
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, location.state, contextUserData, queryScore, queryName, parsedScore]);

  const archetype = ARCHETYPES[result?.archetypeKey];

  const affinityScore = result?.affinity || (parsedScore && !isNaN(parsedScore) ? parsedScore : calculation?.primaryMatch.affinity) || 94;
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://discipledejesus.netlify.app';
  const scoresQuery = calculation?.rawScores
    ? `&scores=${calculation.rawScores.I_A},${calculation.rawScores.S_E},${calculation.rawScores.V_G},${calculation.rawScores.L_F},${calculation.rawScores.R_M}`
    : '';
  const personalizedShareUrl = archetype 
    ? `${originUrl}/resultats/${archetype.key}?score=${affinityScore}${result?.name && result.name !== 'Disciple' ? `&nom=${encodeURIComponent(result.name)}` : ''}${scoresQuery}`
    : originUrl;

  const downloadPDF = async () => {
    triggerHaptic('medium');
    setDownloadingPdf(true);

    try {
      const targetArch = archetype || ARCHETYPES.jean;
      const targetName = (result?.name && result.name !== 'Disciple') 
        ? result.name 
        : (contextUserData?.fullName || (contextUserData?.firstName ? `${contextUserData.firstName} ${contextUserData.lastName || ''}`.trim() : 'Jean'));

      const dims = calculation?.dimensions ? {
        interiorite: calculation.dimensions.interiorite?.score ?? 75,
        soumission: calculation.dimensions.soumission?.score ?? 65,
        verite: calculation.dimensions.verite?.score ?? 80,
        lettre: calculation.dimensions.lettre?.score ?? 40,
        reforme: calculation.dimensions.reforme?.score ?? 60,
      } : {
        interiorite: 75,
        soumission: 65,
        verite: 80,
        lettre: 40,
        reforme: 60,
      };

      await generateFreeSynthesisPdf({
        archetype: targetArch,
        participantName: targetName,
        affinity: affinityScore,
        dimensions: dims,
        rawScores: calculation?.rawScores,
        paymentUrl: customPaymentUrl
      });

      triggerHaptic('success');
    } catch (err) {
      console.error("Erreur génération synthèse PDF :", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadFullGuide = async () => {
    setDownloadingGuide(true);
    triggerHaptic('medium');

    try {
      const targetArch = archetype || ARCHETYPES.jean;
      const calcToUse = calculation || {
        primaryMatch: { archetype: targetArch, affinity: affinityScore, distance: 0 },
        secondaryMatches: [],
        dimensions: computeDimensionResults(targetArch.coordinates),
        rawScores: targetArch.coordinates,
        summaryExplanation: ''
      };

      const finalName = (result?.name && result.name !== 'Disciple') 
        ? result.name 
        : (contextUserData?.fullName || (contextUserData?.firstName ? `${contextUserData.firstName} ${contextUserData.lastName || ''}`.trim() : 'Jean Dupont'));

      const doc = await generateCompleteGuidePdf({
        userName: finalName,
        archetype: targetArch,
        affinity: affinityScore,
        dimensions: calcToUse.dimensions,
        rawScores: calcToUse.rawScores,
        secondaryMatches: calcToUse.secondaryMatches,
        genderEquivalentMatch: calcToUse.genderEquivalentMatch
      });

      const safeName = finalName.replace(/\s+/g, '_');
      doc.save(`Dossier_Approfondissement_36_Pages_${targetArch.name}_${safeName}.pdf`);
      triggerHaptic('success');
    } catch (err) {
      console.error("Erreur génération guide complet :", err);
    } finally {
      setDownloadingGuide(false);
    }
  };

  const handlePaymentClick = (e: React.MouseEvent) => {
    triggerHaptic('medium');
    if (!isCalibrated) {
      e.preventDefault();
      setShowMissingCalibrationModal(true);
    }
  };

  const handleDownloadVipGuide = async () => {
    if (!activeVip) return;
    setDownloadingVip(true);
    triggerHaptic('medium');

    try {
      // 1. Redeem token in Firestore to seal single-use
      await redeemVipToken(activeVip.token);
      localStorage.removeItem('disciple_active_vip');

      // 2. Generate 36-page PDF using calculated scores
      const targetArch = archetype || ARCHETYPES.jean;
      const calcToUse = calculation || {
        primaryMatch: { archetype: targetArch, affinity: affinityScore, distance: 0 },
        secondaryMatches: [],
        dimensions: computeDimensionResults(targetArch.coordinates),
        rawScores: targetArch.coordinates,
        summaryExplanation: ''
      };

      const finalName = (result?.name && result.name !== 'Disciple') 
        ? result.name 
        : activeVip.recipientName;

      const doc = await generateCompleteGuidePdf({
        userName: finalName,
        archetype: targetArch,
        affinity: affinityScore,
        dimensions: calcToUse.dimensions,
        rawScores: calcToUse.rawScores,
        secondaryMatches: calcToUse.secondaryMatches,
        genderEquivalentMatch: calcToUse.genderEquivalentMatch
      });

      const safeName = finalName.replace(/\s+/g, '_');
      doc.save(`Dossier_Approfondissement_36_Pages_${targetArch.name}_${safeName}.pdf`);
      setVipDownloaded(true);
      triggerHaptic('success');
    } catch (err) {
      console.error("Erreur téléchargement guide VIP :", err);
    } finally {
      setDownloadingVip(false);
    }
  };

  const handleValidateManualVip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVipCode.trim()) return;

    setManualVipLoading(true);
    setManualVipError('');
    triggerHaptic('medium');

    const res = await verifyVipToken(manualVipCode.trim());
    setManualVipLoading(false);

    if (res.valid && !res.used && res.data) {
      const vipObj = {
        token: res.data.token,
        recipientName: res.data.recipientName,
        archetypeKey: res.data.archetypeKey || null
      };
      setActiveVip(vipObj);
      try {
        localStorage.setItem('disciple_active_vip', JSON.stringify(vipObj));
      } catch (e) {}
      setShowVipModal(false);
      triggerHaptic('success');
    } else if (res.used) {
      setManualVipError('Ce lien/code VIP a déjà été utilisé.');
      triggerHaptic('warning');
    } else {
      setManualVipError('Code VIP introuvable ou invalide.');
      triggerHaptic('warning');
    }
  };

  const copyShareLink = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(personalizedShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareNative = () => {
    triggerHaptic('medium');
    if (navigator.share) {
      navigator.share({
        title: 'Quel disciple suis-je ?',
        text: `Mon tempérament biblique correspond à ${archetype?.name} (${archetype?.title}) avec ${affinityScore}% de ressemblance ! Fais le test pour découvrir le tien :`,
        url: personalizedShareUrl,
      }).catch(() => {});
    } else {
      copyShareLink();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-sage font-medium text-sm">Analyse des 5 dimensions en cours...</p>
      </div>
    </div>
  );

  if (!archetype) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-brand-bg">
      <div>
        <h2 className="text-2xl font-display text-brand-charcoal mb-4">Archétype non trouvé</h2>
        <Link to="/personnages" className="text-brand-terracotta font-bold hover:underline">
          Consulter la galerie des 36 personnages
        </Link>
      </div>
    </div>
  );

  const shareText = `J'ai fait le test « Quel disciple suis-je ? » et mon profil correspond à ${archetype.name} (${archetype.title}) avec ${affinityScore}% d'affinité ! Découvre aussi quel personnage biblique te ressemble :`;

  // Social share URLs
  const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${personalizedShareUrl}`)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(personalizedShareUrl)}`;
  const shareX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(personalizedShareUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(personalizedShareUrl)}`;
  const shareMail = `mailto:?subject=${encodeURIComponent(`Mon profil biblique : ${archetype.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${personalizedShareUrl}`)}`;

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Banner if visiting from a friend's shared link */}
        {isSharedLink && (
          <div className="bg-gradient-to-r from-brand-ochre/20 via-[#fdfaf5] to-brand-terracotta/10 border border-brand-ochre/30 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-terracotta text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-terracotta">
                  Résultat partagé par un proche
                </p>
                <p className="text-sm sm:text-base font-semibold text-brand-charcoal">
                  {queryName ? <span className="font-bold">{decodeURIComponent(queryName)}</span> : 'Votre ami(e)'} a obtenu <span className="text-brand-terracotta font-bold">{affinityScore}% d'affinité</span> avec {archetype.name} !
                </p>
              </div>
            </div>
            <Link
              to="/test"
              className="px-4 py-2.5 bg-brand-charcoal hover:bg-brand-terracotta text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Compass className="w-4 h-4 text-brand-ochre" />
              <span>Faire le test à mon tour</span>
            </Link>
          </div>
        )}

        {/* Top Actions Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <Link to="/test" className="flex items-center gap-2 text-brand-charcoal/70 hover:text-brand-charcoal transition-colors font-semibold text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>Refaire le test</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/personnages"
              className="px-3.5 py-2 bg-white border border-brand-ochre/20 rounded-xl text-brand-charcoal font-semibold hover:bg-brand-bg transition-all text-xs flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-ochre" />
              <span>36 personnages</span>
            </Link>
            <button 
              onClick={shareNative}
              className="px-3.5 py-2 bg-white border border-brand-ochre/20 rounded-xl text-brand-charcoal font-semibold hover:bg-brand-bg transition-all text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-brand-terracotta" />
              <span>Partager</span>
            </button>
            <button 
              onClick={downloadPDF}
              disabled={downloadingPdf}
              className="px-3.5 py-2 bg-white border border-brand-ochre/25 hover:border-brand-terracotta text-brand-charcoal rounded-xl font-semibold transition-all text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
              title="Télécharger la synthèse offerte de 3 pages en PDF"
            >
              {downloadingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-brand-ochre/40 border-t-brand-ochre rounded-full animate-spin" />
                  <span>Génération synthèse...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-brand-terracotta" />
                  <span>Synthèse offerte (PDF)</span>
                </>
              )}
            </button>
            <button 
              onClick={handleDownloadFullGuide}
              disabled={downloadingGuide}
              className="px-4 py-2 bg-brand-charcoal hover:bg-brand-terracotta text-white rounded-xl font-semibold transition-all text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
              title="Générer et télécharger le livret complet d'accompagnement de 36 pages"
            >
              {downloadingGuide ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-brand-ochre/40 border-t-brand-ochre rounded-full animate-spin" />
                  <span>Génération 36 pages...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-brand-ochre" />
                  <span>Dossier complet (36 pages PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* BLOC 1 : CARTE RÉSULTAT ÉPURÉE (Capturée pour l'export PDF synthèse) */}
        <div ref={resultRef} className="rounded-3xl overflow-hidden shadow-xl bg-white border border-brand-ochre/15 mb-10">
          <div className="flex flex-col md:flex-row min-h-[500px]">
            {/* Colonne visuelle / Silhouette */}
            <div className="md:w-1/2 bg-[#fdfaf5] p-8 md:p-12 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-brand-ochre/15">
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full text-center"
              >
                {/* Badge d'affinité */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-terracotta/10 text-brand-terracotta font-bold text-xs uppercase tracking-wider mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {`${affinityScore}% d'affinité avec ce tempérament`}
                  </span>
                </div>

                <div className="relative mb-8 group flex justify-center">
                  <div className="absolute inset-0 bg-brand-ochre/10 rounded-full blur-3xl group-hover:bg-brand-ochre/20 transition-all max-w-[280px] mx-auto" />
                  <BiblicalSilhouette
                    characterKey={archetype.key}
                    dimension={archetype.dimension}
                    gender={archetype.gender}
                    name={archetype.name}
                    size="hero"
                    className="relative z-10 transition-transform group-hover:scale-[1.02] duration-300"
                  />
                </div>
                
                <span className="text-brand-terracotta font-bold tracking-[0.2em] uppercase text-xs mb-2 block">
                  {result?.userData?.name || result?.name ? `Profil de ${result?.userData?.name || result?.name}` : 'Votre archétype biblique'}
                </span>
                <h1 className="font-display text-4xl md:text-5xl mb-2 text-brand-charcoal">{archetype.name}</h1>
                <p className="text-xl text-brand-sage italic font-light font-display mb-6">{archetype.title}</p>
                
                <div className="pt-6 border-t border-brand-ochre/15 max-w-sm mx-auto">
                  <blockquote className="text-brand-charcoal/80 font-serif italic text-base leading-relaxed">
                    « {archetype.biblicalVerse} »
                  </blockquote>
                </div>
              </motion.div>
            </div>

            {/* Colonne descriptive */}
            <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display text-brand-charcoal">Analyse de tempérament</h2>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-brand-bg text-brand-charcoal/70 uppercase">
                    {archetype.testament === 'NT' ? 'Nouveau Testament' : 'Ancien Testament'}
                  </span>
                </div>

                <p className="text-brand-charcoal/85 text-base sm:text-lg leading-relaxed mb-6 font-serif">
                  {archetype.description}
                </p>

                <div className="p-5 bg-brand-bg/50 rounded-2xl border border-brand-ochre/15">
                  <p className="text-xs text-brand-charcoal/70 leading-relaxed italic">
                    « Votre personnalité possède des dons, sensibilités et angles morts propres. Le dossier d'approfondissement personnel ci-dessous détaille vos 5 équilibres intérieurs et votre plan d'action personnalisé. »
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* BLOC 2 : EMAIL CAPTURE SECTION - Synthèse de profil & fiche repère offerte */}
        <div className="mb-12">
          <EmailCaptureCard
            archetypeKey={archetype.key}
            archetypeName={archetype.name}
            archetypeTitle={archetype.title}
            biblicalVerse={archetype.biblicalVerse}
            userName={result?.userData?.name || result?.name}
            affinity={affinityScore}
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onDownloadPDF={downloadPDF}
            isDownloadingPDF={downloadingPdf}
          />
        </div>

        {/* BLOC 3 : DOSSIER D'APPROFONDISSEMENT PERSONNEL (36 PAGES) */}
        <section className="bg-gradient-to-br from-[#1e1c1a] via-[#2a2622] to-[#1e1c1a] text-white rounded-3xl p-8 sm:p-12 mb-12 shadow-xl relative overflow-hidden border border-brand-ochre/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-terracotta/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-ochre/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3.5 py-1 rounded-full bg-brand-terracotta/20 text-brand-ochre border border-brand-ochre/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-ochre" />
                <span>Outil de compréhension et de travail sur soi</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-semibold">
                Dossier complet • 36 pages
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4 leading-tight">
              Passez à la vitesse supérieure : votre dossier d'approfondissement personnel
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
              Le test vous a offert un aperçu de vos équilibres. Ce guide individuel complet (36 pages) a été structuré comme un manuel pratique de travail sur soi : il analyse vos réflexes, vous aide à fluidifier vos relations et vous propose une grille concrète d'évolution.
            </p>

            {/* 4 Detailed Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-ochre/20 text-brand-ochre flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h4 className="font-bold text-sm text-white">Analyse approfondie de vos 5 dimensions</h4>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Décodage de vos tensions intérieures, de ce qui nourrit votre élan et des contextes qui provoquent chez vous une fatigue psychologique ou relationnelle.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-terracotta/20 text-brand-terracotta flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h4 className="font-bold text-sm text-white">Dynamiques relationnelles & communication</h4>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Comment interagir et travailler sans heurt avec vos profils complémentaires. Clés pour formuler vos besoins avec tact et désamorcer les incompréhensions.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h4 className="font-bold text-sm text-white">Détection des angles morts & réflexes sous stress</h4>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Vos mécanismes d'évitement inconscients face au conflit ou à la surcharge, et les exercices pratiques pour désamorcer les réflexes défensifs.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    04
                  </div>
                  <h4 className="font-bold text-sm text-white">Plan d'action et auto-coaching sur 30 jours</h4>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Une grille d'observation hebdomadaire, 10 questions d'introspection ciblées et des repères d'alignement pour progresser au quotidien.
                </p>
              </div>
            </div>

            {/* Aperçu visuel des vraies planches intérieures du livret */}
            <div className="mb-10 bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
              <div className="text-center mb-5">
                <span className="text-[11px] font-bold text-brand-ochre uppercase tracking-wider block">
                  Aperçu authentique de vos 36 pages
                </span>
                <p className="text-xs text-white/70 mt-1">
                  Des schémas analytiques haute précision conçus pour le discernement et l'introspection
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
                <div className="text-center group">
                  <div className="rounded-xl overflow-hidden border border-brand-ochre/30 shadow-lg group-hover:scale-105 transition-all bg-white">
                    <img src="/images/guide-preview/couverture.jpg" alt="Couverture" className="w-full h-auto object-cover" />
                  </div>
                  <span className="text-xs text-white/90 font-bold mt-2.5 block">Couverture</span>
                  <span className="text-[10px] text-white/50">Dossier relié (Page 1)</span>
                </div>
                <div className="text-center group">
                  <div className="rounded-xl overflow-hidden border border-brand-ochre/30 shadow-lg group-hover:scale-105 transition-all bg-white">
                    <img src="/images/guide-preview/page-radar.jpg" alt="Roue polaire" className="w-full h-auto object-cover" />
                  </div>
                  <span className="text-xs text-white/90 font-bold mt-2.5 block">Roue Polaire</span>
                  <span className="text-[10px] text-white/50">8 énergies (Page 4)</span>
                </div>
                <div className="text-center group">
                  <div className="rounded-xl overflow-hidden border border-brand-ochre/30 shadow-lg group-hover:scale-105 transition-all bg-white">
                    <img src="/images/guide-preview/page-synthese.jpg" alt="Cartographie 2D" className="w-full h-auto object-cover" />
                  </div>
                  <span className="text-xs text-white/90 font-bold mt-2.5 block">Cartographie 2D</span>
                  <span className="text-[10px] text-white/50">Planche bilan (Page 35)</span>
                </div>
              </div>
            </div>

            {/* Pricing and Payment Link CTA Card (OR VIP Free Download Card) */}
            {activeVip ? (
              <div className="bg-gradient-to-r from-amber-500/20 via-brand-ochre/20 to-amber-500/20 border-2 border-brand-ochre/40 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ochre text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Accès Privilège VIP Détecté</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display text-white mb-2">
                    Votre dossier de 36 pages vous est offert
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                    Bienvenue <strong>{activeVip.recipientName}</strong> ! Grâce à votre invitation VIP à usage unique, votre Dossier d'approfondissement personnel (36 pages) est calculé avec vos résultats ci-dessus et disponible sans aucun paiement.
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-end w-full md:w-auto gap-3 shrink-0">
                  <button
                    onClick={handleDownloadVipGuide}
                    disabled={downloadingVip}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-ochre hover:bg-brand-ochre/90 text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-brand-ochre/30 flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {downloadingVip ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Génération de votre guide personnalisé...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Télécharger mon dossier (36 pages offert)</span>
                      </>
                    )}
                  </button>

                  {vipDownloaded && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Téléchargement initié ! Votre invitation a été validée.
                    </span>
                  )}

                  <span className="text-[11px] text-white/60">
                    Usage unique • Document personnel haute définition
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white text-brand-charcoal rounded-2xl p-6 sm:p-8 border border-brand-ochre/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase mb-2">
                    Offre de lancement • Accès immédiat
                  </div>
                  <div className="flex items-baseline justify-center md:justify-start gap-3">
                    <span className="text-4xl font-display font-bold text-brand-charcoal">19 €</span>
                    <span className="text-sm line-through text-brand-charcoal/40 font-medium">29 €</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Économisez 10 €
                    </span>
                  </div>
                  <p className="text-xs text-brand-charcoal/70 mt-1">
                    Paiement unique sécurisé sans abonnement ni frais récurrents.
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-end w-full md:w-auto gap-3">
                  <a
                    href={customPaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handlePaymentClick}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-terracotta hover:bg-[#a0522f] text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Obtenir mon dossier complet (19 €)</span>
                  </a>

                  {!isCalibrated && (
                    <button
                      type="button"
                      onClick={() => setShowMissingCalibrationModal(true)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold max-w-md text-left transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Étalonnage requis pour commander • Cliquez pour voir comment débloquer votre dossier</span>
                    </button>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-brand-charcoal/60 font-medium">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Paiement sécurisé SSL
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Téléchargement PDF immédiat
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Garantie 14 jours
                    </span>
                  </div>

                  {/* Direct preview & VIP link */}
                  <div className="pt-1 flex flex-wrap items-center justify-center md:justify-end gap-3 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowVipModal(true)}
                      className="text-brand-ochre hover:underline font-semibold cursor-pointer"
                    >
                      ✨ Code ou lien VIP reçu ?
                    </button>
                    <span className="text-brand-charcoal/30">•</span>
                    <button
                      type="button"
                      onClick={handleDownloadFullGuide}
                      disabled={downloadingGuide}
                      className="text-brand-charcoal/80 hover:text-brand-terracotta font-semibold cursor-pointer flex items-center gap-1 disabled:opacity-60"
                      title="Générer directement le livret complet de 36 pages"
                    >
                      {downloadingGuide ? (
                        <>
                          <div className="w-2.5 h-2.5 border-2 border-brand-ochre border-t-transparent rounded-full animate-spin" />
                          <span>Génération 36 pages...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-brand-ochre" />
                          <span>Aperçu direct (36 pages PDF)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* BLOC 4 : PARTAGE VIRAL & DÉFI AMICAL */}
        <div className="bg-white rounded-3xl border border-brand-ochre/20 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Inviter vos proches</span>
              </span>
              <h3 className="font-display text-xl sm:text-2xl text-brand-charcoal mb-1">
                Quel disciple sont vos amis ou votre conjoint ?
              </h3>
              <p className="text-xs sm:text-sm text-brand-charcoal/70 max-w-xl">
                Partagez votre résultat avec <strong className="text-brand-charcoal font-semibold">{archetype.name} ({affinityScore}%)</strong> et invitez votre entourage à faire le test pour comparer vos tempéraments.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <a
                href={shareWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs sm:text-sm font-bold transition-transform hover:scale-105 flex items-center gap-2 shadow-sm"
                title="Partager sur WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Partager sur WhatsApp</span>
              </a>
              <button
                onClick={copyShareLink}
                className="px-4 py-2.5 bg-brand-bg hover:bg-brand-ochre/20 text-brand-charcoal rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border border-brand-ochre/25 shadow-sm cursor-pointer"
                title="Copier le message et le lien"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Message copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-brand-terracotta" />
                    <span>Copier le texte & lien</span>
                  </>
                )}
              </button>
              <a
                href={shareFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 bg-[#1877F2] hover:bg-[#1466d6] text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 flex items-center gap-1.5 shadow-sm"
                title="Partager sur Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* BANDEAU : KIT D'ANIMATION POUR GROUPES & PAROISSES */}
        <div className="bg-gradient-to-r from-[#fdfaf5] via-white to-brand-ochre/10 rounded-3xl border border-brand-ochre/30 p-6 sm:p-7 mb-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-charcoal text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-6 h-6 text-brand-ochre" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta block mb-0.5">
                Pour animateurs, pasteurs & responsables de jeunes
              </span>
              <h4 className="font-display text-lg sm:text-xl text-brand-charcoal">
                Vous animez un groupe de prière ou une église&nbsp;?
              </h4>
              <p className="text-xs text-brand-charcoal/70 mt-0.5">
                Accédez à notre déroulé complet de 45 minutes et à la fiche de partage offerte pour faire vivre cette expérience à votre groupe.
              </p>
            </div>
          </div>
          <Link
            to="/kit-communaute"
            className="px-4 py-2.5 bg-brand-charcoal hover:bg-brand-terracotta text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-sm"
          >
            <span>Kit d'animation offert</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-ochre" />
          </Link>
        </div>

        {/* BLOC 5 : CITATION ET CONCLUSION INSPIRANTE */}
        <div className="text-center bg-white border border-brand-ochre/15 p-10 md:p-12 rounded-[2rem] shadow-sm mb-12">
          <h2 className="text-2xl sm:text-3xl font-display mb-4 italic text-brand-charcoal">
            « Vous n'avez pas besoin d'être une copie d'un autre. »
          </h2>
          <p className="text-brand-charcoal/70 max-w-2xl mx-auto mb-8 leading-relaxed font-medium text-sm md:text-base">
            Ce résultat n'est qu'un point de départ. Dieu veut sanctifier ce que vous êtes, pas remplacer votre identité. Embrassez votre singularité dans le Corps de Christ.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              to="/personnages" 
              className="px-5 py-2.5 bg-brand-bg hover:bg-brand-ochre/20 text-brand-charcoal font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 border border-brand-ochre/20"
            >
              <BookOpen className="w-4 h-4 text-brand-ochre" />
              <span>Explorer les 36 personnages</span>
            </Link>
            <Link 
              to="/test" 
              className="px-5 py-2.5 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refaire le test</span>
            </Link>
          </div>
        </div>

        {/* VIP Token Activation Modal */}
        {showVipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-brand-ochre/20">
              <div className="flex items-center justify-between pb-4 border-b border-brand-ochre/15 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="font-display text-lg text-brand-charcoal">Activer mon invitation VIP</h3>
                </div>
                <button
                  onClick={() => setShowVipModal(false)}
                  className="p-1 text-brand-charcoal/40 hover:text-brand-charcoal rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-brand-charcoal/70 mb-4 leading-relaxed">
                Entrez le code ou l'identifiant de votre invitation VIP pour débloquer votre guide complet de 36 pages calculé avec vos résultats.
              </p>

              <form onSubmit={handleValidateManualVip} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={manualVipCode}
                    onChange={(e) => setManualVipCode(e.target.value)}
                    placeholder="Ex: vip_thomas_8f2a..."
                    className="w-full px-4 py-3 bg-brand-bg border border-brand-ochre/30 rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-ochre font-mono text-center"
                    required
                  />
                </div>

                {manualVipError && (
                  <p className="text-xs text-red-600 font-medium text-center">
                    {manualVipError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVipModal(false)}
                    className="px-4 py-2 text-xs font-bold text-brand-charcoal/60 hover:text-brand-charcoal cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={manualVipLoading || !manualVipCode.trim()}
                    className="px-5 py-2.5 bg-brand-ochre hover:bg-brand-ochre/90 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {manualVipLoading ? 'Vérification...' : 'Valider mon pass'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Missing Calibration Modal */}
        {showMissingCalibrationModal && (
          <div className="fixed inset-0 z-50 bg-brand-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-brand-ochre/30 shadow-2xl relative space-y-5 animate-fadeIn">
              <button
                onClick={() => setShowMissingCalibrationModal(false)}
                className="absolute top-4 right-4 p-2 text-brand-charcoal/50 hover:text-brand-charcoal rounded-full hover:bg-brand-bg transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
                    Étalonnage personnalisé requis
                  </span>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-brand-charcoal">
                    Vos scores de test ne sont pas détectés
                  </h3>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-brand-charcoal/80 space-y-3 leading-relaxed">
                <p>
                  Pour éditer votre <strong>Dossier d'approfondissement de 36 pages 100% sur mesure</strong> (avec votre roue polaire des 8 énergies, votre dynamique relationnelle et vos 3 binômes fraternels), notre moteur a impérativement besoin de vos réponses réelles.
                </p>
                <p className="p-3 bg-brand-bg rounded-xl border border-brand-ochre/20 text-xs text-brand-charcoal/70">
                  Vous consultez actuellement une fiche archétype générale sans les coordonnées mathématiques de votre test.
                </p>

                <div className="space-y-2 pt-1">
                  <p className="font-bold text-brand-charcoal text-xs uppercase tracking-wide">
                    Comment débloquer votre dossier sur mesure :
                  </p>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-ochre/25 text-brand-charcoal font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <span><strong>Depuis votre synthèse PDF gratuite :</strong> Cliquez sur le bouton « Commander le dossier complet » ou sur le lien en fin de document (vos 5 coordonnées mathématiques y sont déjà encodées).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-ochre/25 text-brand-charcoal font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span><strong>Depuis votre appareil initial :</strong> Si vous avez changé de téléphone ou d'ordinateur, reconnectez-vous depuis le navigateur avec lequel vous avez complété le test.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-ochre/25 text-brand-charcoal font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span><strong>Sinon, passez le test gratuit :</strong> En seulement 5 minutes (30 questions rapides), vos résultats précis seront immédiatement calculés et sauvegardés.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-brand-ochre/15">
                <button
                  type="button"
                  onClick={() => setShowMissingCalibrationModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-brand-charcoal/70 hover:text-brand-charcoal cursor-pointer"
                >
                  Fermer
                </button>
                <Link
                  to="/test"
                  onClick={() => setShowMissingCalibrationModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-brand-terracotta hover:bg-[#a0522f] text-white font-bold text-xs rounded-xl shadow-sm text-center transition-all cursor-pointer"
                >
                  Passer le test gratuit (5 min)
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* GDPR Privacy Modal */}
        <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />

      </div>
    </div>
  );
};

export default Results;
