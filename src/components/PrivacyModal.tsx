import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Cookie, Lock, Mail, CheckCircle } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 border border-brand-ochre/20 z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-brand-ochre/15">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-bg rounded-xl text-brand-terracotta">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-brand-charcoal">
                    Protection des données & vie privée
                  </h3>
                  <p className="text-xs text-brand-charcoal/60 mt-0.5">
                    Conformité RGPD et respect absolu de votre liberté
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-brand-charcoal/50 hover:text-brand-charcoal hover:bg-brand-bg rounded-xl transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6 pt-6 text-sm text-brand-charcoal/80 leading-relaxed font-medium">
              {/* Point 1 : Pas de cookies publicitaires */}
              <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-brand-ochre/15">
                <div className="flex items-center gap-2.5 mb-2 font-display text-base text-brand-charcoal">
                  <Cookie className="w-5 h-5 text-brand-ochre" />
                  <h4>Pourquoi n'y a-t-il aucun bandeau de cookies ?</h4>
                </div>
                <p className="text-xs sm:text-sm text-brand-charcoal/75 leading-relaxed">
                  Ce site n'utilise <strong>aucun cookie publicitaire, aucun traceur tiers et aucun pixel de pistage</strong> (aucun suivi publicitaire Facebook, TikTok ou Google Ads). 
                  Nous utilisons uniquement la mémoire technique de votre propre navigateur web afin de conserver temporairement l'état de vos réponses en cas d'interruption du test, sans jamais déposer de fichiers mouchards sur votre appareil.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Conforme aux recommandations CNIL & RGPD : aucun bandeau intrusif requis.</span>
                </div>
              </div>

              {/* Point 2 : Utilisation de l'email */}
              <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-brand-ochre/15">
                <div className="flex items-center gap-2.5 mb-2 font-display text-base text-brand-charcoal">
                  <Mail className="w-5 h-5 text-brand-sage" />
                  <h4>Collecte de votre adresse e-mail</h4>
                </div>
                <p className="text-xs sm:text-sm text-brand-charcoal/75 mb-3">
                  Si vous choisissez de renseigner votre e-mail pour recevoir votre profil détaillé ou sauvegarder vos résultats :
                </p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-terracotta mt-2 shrink-0" />
                    <span><strong>Usage exclusif :</strong> Votre e-mail sert uniquement à vous faire parvenir votre synthèse de profil et des pistes d'analyse et de travail sur soi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-terracotta mt-2 shrink-0" />
                    <span><strong>Jamais revendu ni cédé :</strong> Vos coordonnées restent strictement confidentielles et ne sont jamais transmises à aucun tiers commercial.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-terracotta mt-2 shrink-0" />
                    <span><strong>Désinscription libre en 1 clic :</strong> Chaque email envoyé contient un lien de désabonnement instantané et sans condition.</span>
                  </li>
                </ul>
              </div>

              {/* Point 3 : Vos droits RGPD */}
              <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-brand-ochre/15">
                <div className="flex items-center gap-2.5 mb-2 font-display text-base text-brand-charcoal">
                  <Lock className="w-5 h-5 text-brand-terracotta" />
                  <h4>Vos droits sur vos données personnelles</h4>
                </div>
                <p className="text-xs sm:text-sm text-brand-charcoal/75">
                  Conformément au Règlement Général sur la Protection des Données (RGPD 2016/679), vous disposez à tout moment d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données personnelles. Vous pouvez exercer ce droit à tout moment par simple message à l'équipe responsable du projet.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-brand-ochre/15 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                J'ai compris
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
