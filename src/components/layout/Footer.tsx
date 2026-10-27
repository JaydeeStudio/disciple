import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cookie } from 'lucide-react';
import { PrivacyModal } from '../PrivacyModal';

export const Footer: React.FC = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="py-14 bg-brand-charcoal text-brand-bg/70 text-center border-t border-brand-ochre/20">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Main Navigation in Footer */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs font-semibold mb-6 text-brand-bg/90">
            <Link to="/test" className="hover:text-white transition-colors">Faire le test</Link>
            <Link to="/personnages" className="hover:text-white transition-colors">Les 36 personnages</Link>
            <Link to="/methodologie" className="hover:text-white transition-colors">Méthodologie de calcul</Link>
            <button
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-terracotta" />
              <span>Vie privée & RGPD</span>
            </button>
          </div>

          <div className="mb-4">
            <p className="font-display text-xl text-white tracking-wide">Quel disciple suis-je ?</p>
            <p className="text-xs text-brand-bg/60 max-w-md mx-auto mt-1 leading-relaxed">
              Une exploration scripturaire des tempéraments spirituels pour encourager la croissance personnelle et l'édification mutuelle.
            </p>
          </div>

          {/* Privacy badge and Zero Cookie notice */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-brand-bg/60 mb-6">
            <Cookie className="w-3 h-3 text-amber-400" />
            <span>Site sans cookie publicitaire ni traceur commercial</span>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-brand-bg/50">
            <p>© {new Date().getFullYear()} — Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-brand-bg transition-colors cursor-pointer underline"
              >
                Mentions légales & Protection des données
              </button>
            </div>
          </div>
        </div>
      </footer>

      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
};
