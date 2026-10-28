import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTest } from '../contexts/TestContext';
import { ARCHETYPES } from '../data/archetypes';
import { BiblicalSilhouette } from '../components/BiblicalSilhouette';
import { DIMENSIONS_INFO, Dimension } from '../data/questions';
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
  Target, 
  Zap, 
  Heart, 
  ArrowRight,
  Sparkles,
  Info,
  Users,
  CheckCircle2,
  Sliders,
  Calculator,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Compass,
  Lock,
  CreditCard,
  FileText,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Award,
  X
} from 'lucide-react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { EmailCaptureCard } from '../components/EmailCaptureCard';
import { PrivacyModal } from '../components/PrivacyModal';
import { generateCompleteGuidePdf } from '../services/completeGuidePdfGenerator';
import { triggerHaptic } from '../lib/haptics';
import { verifyVipToken, redeemVipToken } from '../services/vipService';

// Lien de paiement configurable pour le dossier d'approfondissement personnel
// Priorise la variable d'environnement VITE_STRIPE_PAYMENT_URL ou le stockage local
export const COMPLETE_GUIDE_PAYMENT_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PAYMENT_URL) || 
  "https://buy.stripe.com/7sY8wP6Xj2ta06oexaeIw00";

const DetailCard: React.FC<{ icon: React.ReactNode; title: string; description: string; items: string[] }> = ({ icon, title, description, items }) => (
  <div className="bg-white p-8 rounded-3xl border border-brand-ochre/15 shadow-sm">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-brand-bg rounded-xl">
        {icon}
      </div>
      <h3 className="font-display text-xl text-brand-charcoal">{title}</h3>
    </div>
    <p className="text-brand-charcoal/60 text-sm mb-6 leading-relaxed">{description}</p>
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-brand-charcoal/80 text-sm font-medium">
          <div className="w-1.5 h-1.5 bg-brand-ochre rounded-full mt-2 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

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
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // VIP Pass state
  const [activeVip, setActiveVip] = useState<{ token: string; recipientName: string } | null>(null);
  const [downloadingVip, setDownloadingVip] = useState(false);
  const [vipDownloaded, setVipDownloaded] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [manualVipCode, setManualVipCode] = useState('');
  const [manualVipError, setManualVipError] = useState('');
  const [manualVipLoading, setManualVipLoading] = useState(false);

  // Read possible query parameters from shared link (e.g. ?score=94&nom=David)
  const searchParams = new URLSearchParams(location.search);
  const queryScore = searchParams.get('score');
  const queryName = searchParams.get('nom');
  const parsedScore = queryScore ? parseInt(queryScore, 10) : null;
  const isSharedLink = !location.state?.calculation && (Boolean(queryScore) || Boolean(queryName));
  const isReferenceView = !location.state?.calculation && !isSharedLink && Boolean(ARCHETYPES[id?.toLowerCase() || '']);

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
        // Generate synthetic calculation matching this archetype's coordinates
        const syntheticDimensions = computeDimensionResults(arch.coordinates);
        
        // Find other close characters
        const closeMatches = Object.values(ARCHETYPES)
          .filter(a => a.key !== arch.key)
          .map(a => {
            const d = Math.sqrt(
              Math.pow(arch.coordinates.I_A - a.coordinates.I_A, 2) +
              Math.pow(arch.coordinates.S_E - a.coordinates.S_E, 2) +
              Math.pow(arch.coordinates.V_G - a.coordinates.V_G, 2) +
              Math.pow(arch.coordinates.L_F - a.coordinates.L_F, 2) +
              Math.pow(arch.coordinates.R_M - a.coordinates.R_M, 2)
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

        const syntheticCalc = {
          primaryMatch: { archetype: arch, affinity: initialAffinity, distance: 0 },
          secondaryMatches: closeMatches.slice(0, 3),
          genderEquivalentMatch: closeMatches.find(m => m.archetype.gender !== arch.gender),
          dimensions: syntheticDimensions,
          rawScores: arch.coordinates,
          summaryExplanation: `Profil de référence du disciple ${arch.name} (${arch.title.toLowerCase()}). Les scores ci-dessous illustrent ses équilibres spirituels majeurs dans les Écritures.`
        };

        setCalculation(syntheticCalc);

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
            userData: { name: visitorName, gender: 'M', age: '' },
            calculation: syntheticCalc,
            savedAt: new Date().toISOString()
          }));
        } catch (e) {
          console.warn("Erreur sauvegarde localStorage :", e);
        }

        setLoading(false);
        return;
      }

      // Otherwise fetch from Firestore by document ID
      try {
        const docSnap = await getDoc(doc(db, 'testResults', id));
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setResult(docData);

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
  const personalizedShareUrl = archetype 
    ? `${originUrl}/resultats/${archetype.key}?score=${affinityScore}${result?.name && result.name !== 'Disciple' ? `&nom=${encodeURIComponent(result.name)}` : ''}`
    : originUrl;

  const downloadPDF = async () => {
    if (!resultRef.current) return;
    
    const canvas = await html2canvas(resultRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Interactive clickable link at the bottom of the PDF
    try {
      if (typeof (pdf as any).textWithLink === 'function') {
        (pdf as any).textWithLink(
          '→ Commander le dossier complet d\'approfondissement personnel (19 €) : ' + customPaymentUrl,
          10,
          Math.min(pdfHeight - 6, 285),
          { url: customPaymentUrl }
        );
      }
    } catch (e) {
      console.warn('PDF link addition error:', e);
    }

    pdf.save(`Synthese_Disciple_${archetype?.name}.pdf`);
  };

  const [downloadingSample, setDownloadingSample] = useState(false);

  const handleDownloadSampleGuide = () => {
    triggerHaptic('medium');
    setDownloadingSample(true);
    try {
      const sampleArch = archetype || ARCHETYPES.jean;
      const sampleCalc = calculation || {
        dimensions: computeDimensionResults(sampleArch.coordinates),
        rawScores: sampleArch.coordinates,
        affinity: affinityScore,
        secondaryMatches: [],
        genderEquivalentMatch: undefined
      };

      const doc = generateCompleteGuidePdf({
        userName: (result?.name && result.name !== 'Disciple') ? result.name : 'Marc Dupont (Exemple)',
        archetype: sampleArch,
        affinity: affinityScore,
        dimensions: sampleCalc.dimensions,
        rawScores: sampleCalc.rawScores,
        secondaryMatches: sampleCalc.secondaryMatches,
        genderEquivalentMatch: sampleCalc.genderEquivalentMatch
      });

      doc.save(`Exemple_Dossier_35_Pages_${sampleArch.name}.pdf`);
      triggerHaptic('success');
    } catch (err) {
      console.error("Erreur génération PDF exemple :", err);
    } finally {
      setDownloadingSample(false);
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

      // 2. Generate 35-page PDF using calculated scores
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

      const doc = generateCompleteGuidePdf({
        userName: finalName,
        archetype: targetArch,
        affinity: affinityScore,
        dimensions: calcToUse.dimensions,
        rawScores: calcToUse.rawScores,
        secondaryMatches: calcToUse.secondaryMatches,
        genderEquivalentMatch: calcToUse.genderEquivalentMatch
      });

      const safeName = finalName.replace(/\s+/g, '_');
      doc.save(`Dossier_Approfondissement_35_Pages_${targetArch.name}_${safeName}.pdf`);
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

        {/* Banner if visiting reference archetype directly without taking the test */}
        {isReferenceView && (
          <div className="bg-[#fcfaf7] border border-brand-ochre/30 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-charcoal text-white flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen className="w-5 h-5 text-brand-ochre" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-terracotta">
                  Fiche de référence du personnage biblique
                </p>
                <p className="text-sm sm:text-base font-semibold text-brand-charcoal">
                  Vous consultez la fiche repère de <span className="font-bold">{archetype.name}</span>. Pour mesurer votre propre affinité sur les 5 dimensions, faites le test gratuit.
                </p>
              </div>
            </div>
            <Link
              to="/test"
              className="px-5 py-2.5 bg-brand-charcoal hover:bg-brand-terracotta text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Compass className="w-4 h-4 text-brand-ochre" />
              <span>Faire le test gratuit (3 min)</span>
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
              className="px-4 py-2 bg-brand-charcoal text-white rounded-xl font-semibold hover:bg-brand-terracotta transition-all text-xs flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le PDF</span>
            </button>
          </div>
        </div>

        {/* MAIN RESULT CARD (Captured for PDF export) */}
        <div ref={resultRef} className="rounded-3xl overflow-hidden shadow-xl bg-white border border-brand-ochre/15 mb-10">
          
          <div className="flex flex-col md:flex-row min-h-[560px]">
            {/* Header / Visual Section */}
            <div className="md:w-1/2 bg-[#fdfaf5] p-8 md:p-12 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-brand-ochre/15">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full text-center"
              >
                {/* Affinity Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-terracotta/10 text-brand-terracotta font-bold text-xs uppercase tracking-wider mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isReferenceView 
                      ? "Fiche repère du profil biblique" 
                      : `${affinityScore}% d'affinité avec ce tempérament`}
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
                  {isReferenceView
                    ? "Archétype biblique de référence"
                    : (result?.userData?.name || result?.name ? `Profil de ${result?.userData?.name || result?.name}` : 'Votre archétype biblique')}
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

            {/* Content Section */}
            <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-between">
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

                <p className="text-brand-charcoal/80 text-base leading-relaxed mb-8">
                  {archetype.description}
                </p>

                <div className="space-y-8">
                  <div>
                    <h3 className="flex items-center gap-2.5 font-bold text-brand-charcoal text-sm mb-4 pb-2 border-b border-brand-ochre/10">
                      <Zap className="w-4 h-4 text-brand-ochre" />
                      Forces motrices et rayonnement
                    </h3>
                    <ul className="grid grid-cols-1 gap-2.5">
                      {archetype.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-brand-charcoal/80 bg-brand-bg/50 p-3 rounded-xl border border-brand-ochre/10">
                          <CheckCircle2 className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                          <span className="font-medium text-xs leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="flex items-center gap-2.5 font-bold text-brand-charcoal text-sm mb-4 pb-2 border-b border-brand-ochre/10">
                      <Info className="w-4 h-4 text-brand-terracotta" />
                      Axes de vigilance et de travail sur soi
                    </h3>
                    <ul className="space-y-3">
                      {archetype.spiritualInvitations.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-brand-charcoal/75 text-xs">
                          <ArrowRight className="w-3.5 h-3.5 text-brand-terracotta shrink-0 mt-0.5" />
                          <span className="font-medium leading-relaxed">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Printable Callout Footer included in the PDF export */}
          <div className="bg-[#fdfaf5] border-t border-brand-ochre/20 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta block mb-1">
                Aller plus loin • Outil de compréhension et de travail sur soi
              </span>
              <p className="text-xs sm:text-sm font-bold text-brand-charcoal">
                Dossier d'approfondissement personnel (guide complet de 35 pages)
              </p>
              <p className="text-[11px] text-brand-charcoal/70 mt-1 leading-relaxed">
                Cartographie des 5 dimensions, décodage des réflexes sous stress, communication avec les profils complémentaires et plan d'action sur 30 jours.
              </p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <span className="text-xs font-bold text-brand-terracotta block mb-1">
                19 € • Accès et téléchargement immédiat
              </span>
              <a
                href={customPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[11px] font-semibold text-brand-charcoal hover:text-brand-terracotta underline"
              >
                Commander sur : {customPaymentUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
        </div>

        {/* EMAIL CAPTURE SECTION - Free spiritual guide & profile breakdown */}
        <EmailCaptureCard
          archetypeKey={archetype.key}
          archetypeName={archetype.name}
          affinity={affinityScore}
          onOpenPrivacy={() => setPrivacyOpen(true)}
          onDownloadPDF={downloadPDF}
        />

        {/* SOCIAL SHARING SECTION - High relevance for French-speaking community */}
        <section className="bg-white rounded-3xl border border-brand-ochre/15 p-6 md:p-8 mb-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-brand-terracotta font-bold tracking-[0.2em] uppercase text-xs mb-1 block">
                Partager la découverte
              </span>
              <h3 className="font-display text-2xl text-brand-charcoal mb-1">
                Partagez votre profil avec vos proches
              </h3>
              <p className="text-brand-charcoal/70 text-xs md:text-sm">
                Invitez vos amis, votre groupe de partage ou votre communauté à découvrir leur disciple.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {/* WhatsApp */}
              <a
                href={shareWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 flex items-center gap-2 shadow-sm"
                title="Partager sur WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={shareFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#1877F2] hover:bg-[#1466d6] text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 flex items-center gap-2 shadow-sm"
                title="Partager sur Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>

              {/* X / Twitter */}
              <a
                href={shareX}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 flex items-center gap-2 shadow-sm"
                title="Partager sur X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X</span>
              </a>

              {/* LinkedIn */}
              <a
                href={shareLinkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 flex items-center gap-2 shadow-sm"
                title="Partager sur LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* Email */}
              <a
                href={shareMail}
                className="px-4 py-2.5 bg-brand-bg hover:bg-brand-ochre/20 text-brand-charcoal rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-brand-ochre/20 shadow-sm"
                title="Envoyer par email"
              >
                <Mail className="w-4 h-4 text-brand-sage" />
                <span>Email</span>
              </a>

              {/* Copy Link */}
              <button
                onClick={copyShareLink}
                className="px-4 py-2.5 bg-white hover:bg-brand-bg text-brand-charcoal rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-brand-ochre/25 shadow-sm"
                title="Copier le lien"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-brand-terracotta" />
                    <span>Copier le lien</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* DETAILED CALCULATION BREAKDOWN SECTION */}
        {calculation && (
          <section className="bg-white rounded-3xl border border-brand-ochre/15 p-8 md:p-12 shadow-sm mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-ochre/15">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Calculator className="w-5 h-5 text-brand-terracotta" />
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
                    Transparence du calcul
                  </span>
                </div>
                <h2 className="font-display text-3xl text-brand-charcoal">
                  Comment votre résultat a-t-il été calculé ?
                </h2>
              </div>
              <Link
                to="/methodologie"
                className="text-xs font-bold text-brand-charcoal/70 hover:text-brand-terracotta flex items-center gap-1.5 transition-colors self-start md:self-auto"
              >
                Découvrir la méthode complète
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Explanation Summary Paragraph */}
            <div className="p-6 bg-[#fcfaf7] rounded-2xl border border-brand-ochre/20 mb-10">
              <p className="text-brand-charcoal/85 leading-relaxed text-sm md:text-base font-medium">
                {calculation.summaryExplanation}
              </p>
            </div>

            {/* 5 Dimensional Gauges */}
            <div className="mb-10">
              <h3 className="font-display text-xl text-brand-charcoal mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-sage" />
                Votre équilibre sur les 5 dimensions spirituelles
              </h3>

              <div className="space-y-6">
                {(Object.keys(calculation.dimensions) as Dimension[]).map((dimKey) => {
                  const dim = calculation.dimensions[dimKey];
                  return (
                    <div key={dimKey} className="bg-brand-bg/60 p-5 rounded-2xl border border-brand-ochre/10">
                      <div className="flex flex-wrap justify-between items-center text-xs font-bold mb-3">
                        <span className="text-brand-charcoal uppercase tracking-wider">{dim.label}</span>
                        <span className="text-brand-sage">
                          Dominante : <span className="font-bold text-brand-charcoal">{dim.dominantLabel}</span>
                        </span>
                      </div>

                      {/* Bar Gauge */}
                      <div className="relative mb-3">
                        <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${dim.leftPercent}%` }} 
                            className="bg-brand-terracotta transition-all duration-1000"
                          />
                          <div 
                            style={{ width: `${dim.rightPercent}%` }} 
                            className="bg-brand-sage transition-all duration-1000"
                          />
                        </div>
                        {/* Center marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/70" />
                      </div>

                      {/* Gauge Labels */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="text-left max-w-[45%]">
                          <span className="font-bold text-brand-terracotta">{dim.leftPercent}%</span>
                          <span className="text-brand-charcoal/70 ml-1.5 block sm:inline font-medium">{dim.leftLabel}</span>
                        </div>
                        <div className="text-right max-w-[45%]">
                          <span className="text-brand-charcoal/70 mr-1.5 block sm:inline font-medium">{dim.rightLabel}</span>
                          <span className="font-bold text-brand-sage">{dim.rightPercent}%</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-brand-charcoal/60 mt-2.5 border-t border-brand-ochre/10 pt-2 leading-relaxed">
                        {dim.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secondary Matches & Counterpart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-brand-ochre/15">
              {/* Secondary Archetypes */}
              <div>
                <h4 className="font-display text-lg text-brand-charcoal mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-ochre" />
                  Vos archétypes secondaires proches
                </h4>
                <div className="space-y-3">
                  {calculation.secondaryMatches.map((m) => (
                    <Link
                      key={m.archetype.key}
                      to={`/resultats/${m.archetype.key}`}
                      className="p-3.5 bg-brand-bg/70 hover:bg-white border border-brand-ochre/10 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div>
                        <div className="font-bold text-sm text-brand-charcoal group-hover:text-brand-terracotta transition-colors">
                          {m.archetype.name}
                        </div>
                        <div className="text-xs text-brand-sage italic">
                          {m.archetype.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-charcoal/80 bg-white px-2.5 py-1 rounded-full border border-brand-ochre/15">
                          {m.affinity}% affinité
                        </span>
                        <ArrowRight className="w-4 h-4 text-brand-charcoal/40 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Gender Equivalent */}
              {calculation.genderEquivalentMatch && (
                <div>
                  <h4 className="font-display text-lg text-brand-charcoal mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-brand-terracotta" />
                    Votre pendant biblique {calculation.genderEquivalentMatch.archetype.gender === 'F' ? 'féminin' : 'masculin'}
                  </h4>
                  <div className="p-5 bg-[#fdfaf5] border border-brand-ochre/20 rounded-2xl flex flex-col justify-between h-[calc(100%-2rem)]">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-terracotta/10 text-brand-terracotta">
                          {calculation.genderEquivalentMatch.affinity}% d'affinité
                        </span>
                        <span className="text-xs text-brand-charcoal/60">
                          {calculation.genderEquivalentMatch.archetype.testament === 'NT' ? 'Nouveau Testament' : 'Ancien Testament'}
                        </span>
                      </div>
                      <h5 className="font-display text-xl text-brand-charcoal mb-1">
                        {calculation.genderEquivalentMatch.archetype.name}
                      </h5>
                      <p className="text-xs text-brand-sage italic mb-3">
                        {calculation.genderEquivalentMatch.archetype.title}
                      </p>
                      <p className="text-xs text-brand-charcoal/70 leading-relaxed line-clamp-3">
                        {calculation.genderEquivalentMatch.archetype.description}
                      </p>
                    </div>

                    <Link
                      to={`/resultats/${calculation.genderEquivalentMatch.archetype.key}`}
                      className="mt-4 text-xs font-bold text-brand-terracotta hover:underline inline-flex items-center gap-1.5"
                    >
                      Découvrir la fiche de {calculation.genderEquivalentMatch.archetype.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Actionable Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <DetailCard 
            icon={<Target className="w-6 h-6 text-brand-sage" />}
            title="Service et vocation concrète"
            description="Comment votre tempérament peut s'épanouir au sein d'une communauté ou d'un projet."
            items={archetype.missionVocation}
          />
          <DetailCard 
            icon={<Users className="w-6 h-6 text-brand-ochre" />}
            title="Complémentarité fraternelle"
            description="Le Corps de Christ est harmonieux lorsque des disciples différents collaborent."
            items={archetype.compatibility.map(key => ARCHETYPES[key]?.name || key).map(name => `Alliance féconde avec ${name}`)}
          />
        </div>

        {/* PREMIUM UPGRADE SECTION - Complete Personal Guide & Self-Work Dossier */}
        <section className="bg-gradient-to-br from-[#1e1c1a] via-[#2a2622] to-[#1e1c1a] text-white rounded-3xl p-8 sm:p-12 mb-16 shadow-xl relative overflow-hidden border border-brand-ochre/30">
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
                Dossier complet • 35 pages
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4 leading-tight">
              Passez à la vitesse supérieure : votre dossier d'approfondissement personnel
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
              Le test vous a offert un aperçu de vos équilibres. Ce guide individuel complet (35 pages) a été structuré comme un manuel pratique de travail sur soi : il analyse vos réflexes, vous aide à fluidifier vos relations et vous propose une grille concrète d'évolution.
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

            {/* Pricing and Payment Link CTA Card (OR VIP Free Download Card) */}
            {activeVip ? (
              <div className="bg-gradient-to-r from-amber-500/20 via-brand-ochre/20 to-amber-500/20 border-2 border-brand-ochre/40 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ochre text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Accès Privilège VIP Détecté</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display text-white mb-2">
                    Votre dossier de 35 pages vous est offert
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                    Bienvenue <strong>{activeVip.recipientName}</strong> ! Grâce à votre invitation VIP à usage unique, votre Dossier d'approfondissement personnel (35 pages) est calculé avec vos résultats ci-dessus et disponible sans aucun paiement.
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
                        <span>Télécharger mes 35 pages (Offert)</span>
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
                    onClick={() => triggerHaptic('medium')}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-terracotta hover:bg-[#a0522f] text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Obtenir mon dossier complet (19 €)</span>
                    <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                  </a>

                  {/* Instant Sample Preview Button */}
                  <button
                    type="button"
                    onClick={handleDownloadSampleGuide}
                    disabled={downloadingSample}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white/90 hover:bg-white text-brand-charcoal hover:text-brand-terracotta border border-brand-ochre/30 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {downloadingSample ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-brand-terracotta/40 border-t-brand-terracotta rounded-full animate-spin" />
                        <span>Génération de l'exemple...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-brand-terracotta" />
                        <span>Télécharger un exemple du dossier (PDF 35 pages)</span>
                      </>
                    )}
                  </button>

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

                  {/* Link for entering VIP code */}
                  <div className="pt-1 text-center md:text-right">
                    <button
                      type="button"
                      onClick={() => setShowVipModal(true)}
                      className="text-[11px] text-brand-ochre hover:underline font-semibold cursor-pointer"
                    >
                      ✨ Vous avez reçu un code ou lien VIP ? Cliquez ici
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin helper to customize Stripe link if needed */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowPaymentLinkModal(true)}
                className="text-[11px] text-white/50 hover:text-white/80 underline cursor-pointer"
              >
                ⚙️ Personnaliser ou tester le lien de paiement
              </button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center bg-white border border-brand-ochre/15 p-12 rounded-[2rem] shadow-sm">
          <h2 className="text-3xl font-display mb-4 italic text-brand-charcoal">« Vous n'avez pas besoin d'être une copie d'un autre. »</h2>
          <p className="text-brand-charcoal/70 max-w-2xl mx-auto mb-8 leading-relaxed font-medium text-sm md:text-base">
            Ce résultat n'est qu'un point de départ. Dieu veut sanctifier ce que vous êtes, pas remplacer votre identité. Embrassez votre singularité dans le Corps de Christ.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/personnages" 
              className="px-6 py-3 bg-brand-bg hover:bg-brand-ochre/20 text-brand-charcoal font-bold rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorer les 36 personnages</span>
            </Link>
            <Link 
              to="/methodologie" 
              className="px-6 py-3 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>Comprendre la méthode de calcul</span>
            </Link>
          </div>
        </div>

        {/* Payment Link Configuration Modal */}
        {showPaymentLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-brand-ochre/20">
              <div className="flex items-center justify-between pb-4 border-b border-brand-ochre/15 mb-4">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-brand-terracotta" />
                  <h3 className="font-display text-xl text-brand-charcoal">Lien de paiement Stripe</h3>
                </div>
                <button
                  onClick={() => setShowPaymentLinkModal(false)}
                  className="p-1.5 text-brand-charcoal/50 hover:text-brand-charcoal rounded-lg cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-brand-charcoal/70 mb-4 leading-relaxed">
                Renseignez ici votre lien de paiement (Stripe Payment Link, Lemon Squeezy ou Gumroad). Ce lien est appliqué au bouton sur la page ainsi qu'au lien cliquable généré dans le PDF gratuit.
              </p>

              <div className="space-y-2 mb-6">
                <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                  URL de paiement Stripe :
                </label>
                <input
                  type="url"
                  value={customPaymentUrl}
                  onChange={(e) => {
                    setCustomPaymentUrl(e.target.value);
                    localStorage.setItem('disciple_stripe_payment_url', e.target.value);
                  }}
                  placeholder="https://buy.stripe.com/..."
                  className="w-full px-4 py-2.5 bg-brand-bg/60 border border-brand-ochre/30 rounded-xl text-xs text-brand-charcoal font-mono focus:outline-none focus:border-brand-terracotta"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('disciple_stripe_payment_url', customPaymentUrl);
                    setShowPaymentLinkModal(false);
                  }}
                  className="px-5 py-2.5 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}

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
                Entrez le code ou l'identifiant de votre invitation VIP pour débloquer votre guide complet de 35 pages calculé avec vos résultats.
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

        {/* GDPR Privacy Modal */}
        <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />

      </div>
    </div>
  );
};

export default Results;
