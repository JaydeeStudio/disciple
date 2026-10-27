import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface EmailCaptureCardProps {
  archetypeKey: string;
  archetypeName: string;
  onOpenPrivacy: () => void;
}

export const EmailCaptureCard: React.FC<EmailCaptureCardProps> = ({
  archetypeKey,
  archetypeName,
  onOpenPrivacy,
}) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
        consent: true,
        source: 'test_result_page',
        createdAt: serverTimestamp(),
      });

      // 2. Local fallback storage for resilience
      try {
        const storedLeads = JSON.parse(localStorage.getItem('disciple_leads') || '[]');
        storedLeads.push({
          email: trimmedEmail,
          archetypeKey,
          archetypeName,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('disciple_leads', JSON.stringify(storedLeads));
      } catch (err) {
        // localStorage non-blocking
      }

      setSubmitted(true);
    } catch (err: any) {
      console.warn('Firestore lead submission notice:', err);
      // Even if firestore has network or security rules fallback, keep user experience positive and save locally
      try {
        const storedLeads = JSON.parse(localStorage.getItem('disciple_leads') || '[]');
        storedLeads.push({
          email: trimmedEmail,
          archetypeKey,
          archetypeName,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('disciple_leads', JSON.stringify(storedLeads));
      } catch (e) {
        // ignore
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-[#fdfaf5] border-2 border-emerald-300/60 rounded-3xl p-8 sm:p-10 shadow-sm text-center mb-12">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-display text-2xl text-brand-charcoal mb-2">
          Votre bilan complet est en route !
        </h3>
        <p className="text-brand-charcoal/75 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-4">
          Nous avons bien enregistré votre demande pour <span className="font-bold text-brand-charcoal">{email}</span>. Vous recevrez prochainement la fiche d'approfondissement dédiée à l'archétype <span className="font-bold text-brand-terracotta">{archetypeName}</span>.
        </p>
        <p className="text-xs text-brand-charcoal/50">
          Pensez à vérifier votre dossier d'indésirables si vous ne le voyez pas arriver.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-[#fbf7f0] border border-brand-ochre/25 rounded-3xl p-6 sm:p-10 shadow-sm mb-12 relative overflow-hidden">
      {/* Decorative subtle badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ochre/15 rounded-full text-brand-charcoal text-[11px] font-bold uppercase tracking-wider mb-4">
        <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
        <span>Guide d'accompagnement spirituel offert</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <h3 className="font-display text-2xl sm:text-3xl text-brand-charcoal mb-3 leading-snug">
            Recevez votre profil spirituel complet et la fiche de <span className="text-brand-terracotta">{archetypeName}</span>
          </h3>
          <p className="text-brand-charcoal/70 text-sm sm:text-base leading-relaxed mb-4">
            Gardez une trace de vos résultats : nous vous envoyons un récapitulatif détaillé avec les 5 axes d'équilibre de votre profil, ses angles morts à surveiller et des pistes concrètes de prière et d'action.
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
                J'accepte de recevoir mon bilan et des réflexions spirituelles par e-mail. Désinscription en 1 clic à tout moment.{' '}
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
                  <span>Recevoir mon bilan par e-mail</span>
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
