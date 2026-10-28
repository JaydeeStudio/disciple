import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Loader2, Download } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface EmailCaptureCardProps {
  archetypeKey: string;
  archetypeName: string;
  affinity?: number;
  onOpenPrivacy: () => void;
  onDownloadPDF?: () => void;
}

export const EmailCaptureCard: React.FC<EmailCaptureCardProps> = ({
  archetypeKey,
  archetypeName,
  affinity = 94,
  onOpenPrivacy,
  onDownloadPDF,
}) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<'sent' | 'pending_key' | 'saved'>('saved');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMsg('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    if (!consent) {
      setErrorMsg('Veuillez cocher la case de consentement pour recevoir votre bilan.');
      return;
    }

    setLoading(true);

    try {
      // 1. Save to Firestore leads collection
      await addDoc(collection(db, 'leads'), {
        email: trimmedEmail,
        archetypeKey: archetypeKey,
        archetypeName: archetypeName,
        affinity,
        consent: true,
        source: 'test_result_page',
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('Firestore lead notice:', err);
    }

    // 2. Local fallback storage for resilience
    try {
      const storedLeads = JSON.parse(localStorage.getItem('disciple_leads') || '[]');
      storedLeads.push({
        email: trimmedEmail,
        archetypeKey,
        archetypeName,
        affinity,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('disciple_leads', JSON.stringify(storedLeads));
    } catch (err) {
      // ignore
    }

    // 3. Trigger Resend API via Netlify Serverless Function
    try {
      const response = await fetch('/api/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          archetypeKey,
          archetypeName,
          affinity,
          siteUrl: window.location.origin
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmailSentStatus('sent');
        } else if (data.warning === 'RESEND_API_KEY_MANQUANTE') {
          setEmailSentStatus('pending_key');
        } else {
          setEmailSentStatus('saved');
        }
      } else {
        // Fallback directly to /.netlify/functions/send-result if rewrite wasn't active
        const fallbackRes = await fetch('/.netlify/functions/send-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            archetypeKey,
            archetypeName,
            affinity,
            siteUrl: window.location.origin
          })
        });
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          setEmailSentStatus(fbData.success ? 'sent' : 'pending_key');
        } else {
          setEmailSentStatus('saved');
        }
      }
    } catch (sendErr) {
      console.warn('Email dispatch notice:', sendErr);
      setEmailSentStatus('saved');
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-white to-[#fdfaf5] border-2 border-emerald-300/60 rounded-3xl p-8 sm:p-10 shadow-sm text-center mb-12">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-display text-2xl text-brand-charcoal mb-2">
          {emailSentStatus === 'sent' 
            ? 'Synthèse de profil envoyée avec succès !' 
            : 'Votre demande a été bien enregistrée !'}
        </h3>
        
        <p className="text-brand-charcoal/75 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-6">
          {emailSentStatus === 'sent' ? (
            <>
              Votre synthèse récapitulative a été transmise à <span className="font-bold text-brand-charcoal">{email}</span>. Pensez à vérifier vos courriers indésirables / spams si vous ne la voyez pas d'ici quelques instants.
            </>
          ) : emailSentStatus === 'pending_key' ? (
            <>
              Votre adresse <span className="font-bold text-brand-charcoal">{email}</span> est sauvegardée. Pour activer l'envoi d'e-mails automatique en production, pensez à renseigner votre clé <code className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-xs">RESEND_API_KEY</code> sur votre tableau de bord Netlify.
            </>
          ) : (
            <>
              Votre inscription pour <span className="font-bold text-brand-charcoal">{email}</span> est validée. Vous pouvez également récupérer directement votre synthèse au format PDF dès maintenant :
            </>
          )}
        </p>

        {onDownloadPDF && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <button
              onClick={onDownloadPDF}
              className="px-6 py-3 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-brand-ochre" />
              <span>Télécharger ma synthèse de profil (PDF)</span>
            </button>
          </div>
        )}

        <p className="text-xs text-brand-charcoal/50">
          Projet indépendant au service de la clarté et de la compréhension de soi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-[#fbf7f0] border border-brand-ochre/25 rounded-3xl p-6 sm:p-10 shadow-sm mb-12 relative overflow-hidden">
      {/* Decorative subtle badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ochre/15 rounded-full text-brand-charcoal text-[11px] font-bold uppercase tracking-wider mb-4">
        <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
        <span>Synthèse de profil offerte</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <h3 className="font-display text-2xl sm:text-3xl text-brand-charcoal mb-3 leading-snug">
            Recevez votre synthèse de profil et la fiche repère de <span className="text-brand-terracotta">{archetypeName}</span>
          </h3>
          <p className="text-brand-charcoal/70 text-sm sm:text-base leading-relaxed mb-4">
            Gardez une trace de vos résultats : nous vous envoyons un récapitulatif avec vos 5 axes d'équilibre, vos points de vigilance et des repères pratiques de travail sur soi.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-brand-charcoal/65 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              100 % gratuit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Zéro spam & désinscription en 1 clic
            </span>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="flex items-center gap-1 text-brand-terracotta hover:underline cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Vie privée & RGPD</span>
            </button>
          </div>
        </div>

        {/* Input form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-brand-ochre/20 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="lead-email" className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                Votre adresse e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="lead-email"
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-bg/50 border border-brand-ochre/30 rounded-xl text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/40 focus:border-brand-terracotta transition-all"
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-brand-terracotta rounded border-brand-ochre/40 focus:ring-brand-terracotta cursor-pointer"
              />
              <label htmlFor="consent-checkbox" className="text-[11px] text-brand-charcoal/70 leading-snug cursor-pointer select-none">
                J'accepte de recevoir ma synthèse de profil et des réflexions pour le travail sur soi par e-mail. Désinscription en 1 clic à tout moment.{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-brand-terracotta underline font-semibold hover:text-brand-charcoal"
                >
                  Détails RGPD
                </button>
                .
              </label>
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-charcoal hover:bg-brand-terracotta disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <span>Recevoir ma synthèse gratuite par e-mail</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
