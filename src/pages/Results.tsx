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
  MessageCircle
} from 'lucide-react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { EmailCaptureCard } from '../components/EmailCaptureCard';
import { PrivacyModal } from '../components/PrivacyModal';

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
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;

      const lowerId = id.toLowerCase();

      // Check if location state already passed the calculation
      if (location.state?.calculation) {
        setCalculation(location.state.calculation);
        setResult({
          archetypeKey: location.state.calculation.primaryMatch.archetype.key,
          name: location.state.userData?.name || contextUserData?.name || 'Disciple',
          affinity: location.state.calculation.primaryMatch.affinity,
          isTemp: true
        });
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

        setCalculation({
          primaryMatch: { archetype: arch, affinity: 95, distance: 0 },
          secondaryMatches: closeMatches.slice(0, 3),
          genderEquivalentMatch: closeMatches.find(m => m.archetype.gender !== arch.gender),
          dimensions: syntheticDimensions,
          rawScores: arch.coordinates,
          summaryExplanation: `Profil de référence du disciple ${arch.name} (${arch.title.toLowerCase()}). Les scores ci-dessous illustrent ses équilibres spirituels majeurs dans les Écritures.`
        });

        setResult({
          archetypeKey: lowerId,
          name: contextUserData?.name || 'Disciple',
          affinity: 95,
          isTemp: true
        });
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
  }, [id, location.state, contextUserData]);

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
    pdf.save(`Resultat_Disciple_${archetype?.name}.pdf`);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Quel disciple suis-je ?',
        text: `Mon tempérament biblique correspond à ${archetype?.name} (${archetype?.title}) avec ${affinityScore}% de ressemblance ! Fais le test pour découvrir le tien :`,
        url: window.location.href,
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

  const archetype = ARCHETYPES[result?.archetypeKey];

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

  const affinityScore = result?.affinity || calculation?.primaryMatch.affinity || 92;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `J'ai fait le test « Quel disciple suis-je ? » et mon profil correspond à ${archetype.name} (${archetype.title}) avec ${affinityScore}% d'affinité ! Découvre aussi quel personnage biblique te ressemble :`;

  // Social share URLs
  const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const shareX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
  const shareMail = `mailto:?subject=${encodeURIComponent(`Mon profil biblique : ${archetype.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`;

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        
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
              className="px-3.5 py-2 bg-white border border-brand-ochre/20 rounded-xl text-brand-charcoal font-semibold hover:bg-brand-bg transition-all text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-brand-terracotta" />
              <span>Partager</span>
            </button>
            <button 
              onClick={downloadPDF}
              className="px-4 py-2 bg-brand-charcoal text-white rounded-xl font-semibold hover:bg-brand-terracotta transition-all text-xs flex items-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le PDF</span>
            </button>
          </div>
        </div>

        {/* MAIN RESULT CARD */}
        <div ref={resultRef} className="rounded-3xl overflow-hidden shadow-xl bg-white border border-brand-ochre/15 flex flex-col md:flex-row min-h-[560px] mb-10">
          
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
                <span>{affinityScore}% de ressemblance spirituelle</span>
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
                    Forces naturelles et rayonnement
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
                    Invitations de croissance spirituelle
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

        {/* EMAIL CAPTURE SECTION - Free spiritual guide & profile breakdown */}
        <EmailCaptureCard
          archetypeKey={archetype.key}
          archetypeName={archetype.name}
          onOpenPrivacy={() => setPrivacyOpen(true)}
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

        {/* GDPR Privacy Modal */}
        <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />

      </div>
    </div>
  );
};

export default Results;
